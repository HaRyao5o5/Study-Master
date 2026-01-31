// src/hooks/useAppData.ts
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, collection, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase.ts";
import { loadFromCloud, saveToCloud } from "../utils/cloudSync";
import { normalizeData, generateId } from '../utils/helpers';
import { INITIAL_DATA } from '../data/initialData.ts';
import { User, UserStats, Course, UserGoals, MasteredQuestions, Profile, ReviewItem, PublicCourse, UserAchievement } from '../types';
import { useToast } from '../context/ToastContext.tsx';
import { checkAchievements } from '../utils/achievementSystem';
import { ACHIEVEMENTS } from '../data/achievements';
import { withRetry, isRetryableFirestoreError } from '../utils/retry';
import { getOnlineStatus } from './useOnlineStatus';
import { ERROR, getFirestoreErrorMessage } from '../utils/errorMessages';

export interface AppData {
  user: User | null;
  courses: Course[];
  userStats: UserStats;
  wrongHistory: string[];
  masteredQuestions: MasteredQuestions;
  goals: UserGoals | null;
  errorStats: any;
  profile: Profile | null;
  hasProfile: boolean;
  reviews: Record<string, ReviewItem>;
  updateReviewStatus: (item: ReviewItem) => Promise<void>;
  updateProfile: (p: Profile) => Promise<void>;
  isProfileLoading: boolean;
  isProfileInitialized: boolean;
  saveError: any;
  isLoading: boolean;
  isSyncing: boolean;
  saveData: (newData: Partial<AppData>, force?: boolean) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
  setWrongHistory: React.Dispatch<React.SetStateAction<string[]>>;
  setMasteredQuestions: React.Dispatch<React.SetStateAction<MasteredQuestions>>;
  setGoals: React.Dispatch<React.SetStateAction<UserGoals | null>>;
  setErrorStats: React.Dispatch<React.SetStateAction<any>>;
  publishCourse: (courseId: string) => Promise<void>;
  importCourse: (course: PublicCourse) => Promise<void>;
  plan?: 'free' | 'pro';
  proUntil?: number;
}

export function useAppData(): AppData {
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(true); // 初期認証中はtrue
  const [isLoading, setIsLoading] = useState<boolean>(true); // データ読込中はtrue
  
  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_DATA.userStats);
  const [wrongHistory, setWrongHistory] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Record<string, ReviewItem>>({});
  
  // Refs for dirty check and preventing loop
  const isDirty = useRef<boolean>(false);
  const lastSavedTime = useRef<number>(0);
  const lastCloudUpdateTime = useRef<number>(0);
  const isSaving = useRef<boolean>(false);
  const pendingUpdates = useRef<Partial<AppData> | null>(null); // 保存中に来た更新を保持

  const { showError, showSuccess } = useToast();

  // 1. Auth Listener
  useEffect(() => {
    // @ts-ignore: onAuthStateChanged returns an Unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      // ユーザー情報のセット
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
        
        // クラウドからデータロード
        try {
          setIsSyncing(true);
          const cloudData = await loadFromCloud(firebaseUser.uid);
          
          if (cloudData) {
            // --- Streak Reset Logic ---
            const { getEffectiveStreak } = await import('../utils/gamification');
            if (cloudData.userStats && cloudData.userStats.streak > 0) {
              const effectiveStreak = getEffectiveStreak(cloudData.userStats);
              if (effectiveStreak === 0) {
                console.log("Streak broken detected during load. Resetting to 0...");
                cloudData.userStats.streak = 0;
                // Firestore にも反映（非同期でOK）
                import('firebase/firestore').then(({ doc, updateDoc }) => {
                  import('../lib/firebase').then(({ db }) => {
                    updateDoc(doc(db, "users", firebaseUser.uid), {
                      "userStats.streak": 0
                    }).catch(e => console.error("Failed to sync streak reset:", e));
                  });
                });
              }
            }
            // --------------------------

            if (cloudData.courses) setCourses(normalizeData(cloudData.courses));
            if (cloudData.userStats) setUserStats(cloudData.userStats);
            if (cloudData.wrongHistory) setWrongHistory(cloudData.wrongHistory);
            if (cloudData.goals) setGoals(cloudData.goals);
            if (cloudData.masteredQuestions) setMasteredQuestions(cloudData.masteredQuestions);
            
            // Fallback: プラン情報をプロフィールの初期値としても利用（サブコレクションがまだ読み込まれていない場合）
            if (cloudData.plan) {
              setProfile(prev => prev || {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'ユーザー',
                plan: cloudData.plan,
                proUntil: cloudData.proUntil,
                achievements: []
              } as Profile);
            }
          } else {
            // 新規ユーザー or データなし -> ローカルの初期データを使う
            // そのまま現在のstateでOK
          }
        } catch (error) {
           console.error("Load Error:", error);
           showError("データの読み込みに失敗しました");
        } finally {
          setIsSyncing(false);
          setIsLoading(false);
        }

      } else {
        setUser(null);
        
        // Try to load from localStorage for guest
        const localDataString = localStorage.getItem('study_master_guest_data');
        let loaded = false;

        if (localDataString) {
            try {
                const localData = JSON.parse(localDataString);
                setCourses(localData.courses ? normalizeData(localData.courses) : normalizeData(INITIAL_DATA.courses));
                setUserStats(localData.userStats || INITIAL_DATA.userStats);
                setWrongHistory(localData.wrongHistory || []);
                setGoals(localData.goals || null);
                setMasteredQuestions(localData.masteredQuestions || {});
                setReviews(localData.reviews || {});
                if (localData.profile) setProfile(localData.profile);
                console.log("Guest data loaded from localStorage");
                loaded = true;
            } catch (e) {
                console.error("Failed to parse localStorage data", e);
            }
        }

        if (!loaded) {
            // ログアウト時は初期データに戻す
            setCourses(normalizeData(INITIAL_DATA.courses));
            setUserStats(INITIAL_DATA.userStats);
            setWrongHistory([]);
            setGoals(null);
            setMasteredQuestions({});
            setReviews({});
        }

        setIsSyncing(false);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [showError]);

  // 2. Cloud Real-time Listener (Loop Prevention)
  useEffect(() => {
    if (!user || !user.uid) return;

    const userDocRef = doc(db, "users", user.uid);
    
    // @ts-ignore: onSnapshot returns Unsubscribe
    const unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => {
        if (!docSnapshot.exists()) return;

        const data = docSnapshot.data();
        const serverUpdatedAt = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : 0; // Firestore Timestamp
        
        // Check timestamps
        // If server update is newer than our last save, AND newer than our last load
        // We avoid reloading if WE just saved it (lastSavedTime is close to serverUpdatedAt)
        
        const timeDiff = Math.abs(serverUpdatedAt - lastSavedTime.current);
        const isSelfUpdate = timeDiff < 2000; // 2秒以内の差なら自分の保存とみなす

        if (!isSelfUpdate && serverUpdatedAt > lastCloudUpdateTime.current) {
             console.log("Cloud update detected! Reloading...");
             setIsSyncing(true);
             try {
                // Reload full data
                const cloudData = await loadFromCloud(user.uid);
                if (cloudData) {
                    if (cloudData.courses) setCourses(normalizeData(cloudData.courses));
                    if (cloudData.userStats) setUserStats(cloudData.userStats);
                    if (cloudData.wrongHistory) setWrongHistory(cloudData.wrongHistory);
                    if (cloudData.goals) setGoals(cloudData.goals);
                    if (cloudData.masteredQuestions) setMasteredQuestions(cloudData.masteredQuestions);
                    
                    lastCloudUpdateTime.current = serverUpdatedAt;
                }
             } catch (err) {
                 console.error("Auto-reload failed:", err);
             } finally {
                 setIsSyncing(false);
             }
        }
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Profile Listener
  const [isProfileInitialized, setIsProfileInitialized] = useState(false);

  useEffect(() => {
    setIsProfileInitialized(false); // Reset on user change
    if (!user?.uid) {
        setProfile(null);
        setIsProfileInitialized(true);
        return;
    }
    
    // Profile is stored in subcollection users/{uid}/profile/data
    const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
    
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
        if (docSnap.exists()) {
            setProfile({ uid: user.uid, ...docSnap.data() } as Profile);
        } else {
            setProfile(null);
        }
        setIsProfileInitialized(true);
    }, (error) => {
        console.error("Profile sync error:", error);
        setIsProfileInitialized(true);
    });

    return () => unsubscribe();
  }, [user]);

  // 4. Reviews Listener (SRS)
  useEffect(() => {
    if (!user?.uid) {
        setReviews({});
        return;
    }

    const reviewsRef = collection(db, 'users', user.uid, 'reviews');
    const unsubscribe = onSnapshot(reviewsRef, (snapshot) => {
        const newReviews: Record<string, ReviewItem> = {};
        snapshot.docs.forEach(doc => {
            newReviews[doc.id] = doc.data() as ReviewItem;
        });
        setReviews(newReviews);
    }, (error) => {
        console.error("Reviews sync error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // 5. Review Update Function
  const updateReviewStatus = async (item: ReviewItem) => {
      // 1. Update State & Guest Storage
      setReviews(prev => {
          const newReviews = { ...prev, [item.questionId]: item };
          
          if (!user?.uid) {
              try {
                  const localDataString = localStorage.getItem('study_master_guest_data');
                  const localData = localDataString ? JSON.parse(localDataString) : {};
                  localData.reviews = newReviews;
                  localStorage.setItem('study_master_guest_data', JSON.stringify(localData));
              } catch (e) {
                  console.error("Failed to save guest review", e);
              }
          }
          return newReviews;
      });

      // 2. Update Firestore if logged in
      if (user?.uid) {
          try {
              const reviewRef = doc(db, 'users', user.uid, 'reviews', item.questionId);
              await setDoc(reviewRef, item, { merge: true });
          } catch (e) {
              console.error("Failed to update review status", e);
          }
      }
  };

  // 5. Achievement Logic
  const handleAchievementCheck = async (newStats?: UserStats, newCourses?: Course[]) => {
    if (!user?.uid) return;

    const currentStats = newStats || userStats;
    const currentCourses = newCourses || courses;
    const existingIds = profile?.achievements?.map(a => a.id) || [];

    const newlyUnlocked = checkAchievements({
      stats: currentStats,
      courses: currentCourses,
      existingAchievementIds: existingIds
    });

    if (newlyUnlocked.length > 0) {
      console.log("Newly unlocked achievements:", newlyUnlocked);
      
      const updatedAchievements = [...(profile?.achievements || []), ...newlyUnlocked];
      
      // Update local state
      const updatedProfile = { ...profile, achievements: updatedAchievements } as Profile;
      setProfile(updatedProfile);

      // Update Firestore
      try {
        const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
        await setDoc(profileRef, { achievements: updatedAchievements }, { merge: true });
        
        // Also sync to root users doc for leaderboard
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { achievementsCount: updatedAchievements.length }, { merge: true });

        // Show toasts
        newlyUnlocked.forEach(ua => {
          const achievement = ACHIEVEMENTS.find(a => a.id === ua.id);
          if (achievement) {
            showSuccess(`🎉 実績解除: ${achievement.name}\n${achievement.description}`);
          }
        });
      } catch (e) {
        console.error("Failed to save achievements", e);
      }
    }
  };

  // 6. Save Function
  const saveData = async (newData: Partial<AppData> = {}, _force = false) => {
    // Update local state if provided
    if (newData.courses) setCourses(newData.courses);
    if (newData.userStats) setUserStats(newData.userStats);
    if (newData.wrongHistory) setWrongHistory(newData.wrongHistory);
    if (newData.goals) setGoals(newData.goals);
    if (newData.masteredQuestions) setMasteredQuestions(newData.masteredQuestions);

    isDirty.current = true;

    // If already saving, queue the update for later
    if (isSaving.current) {
      console.log("Save in progress, queuing update...", Object.keys(newData));
      // Merge with existing pending updates
      pendingUpdates.current = {
        ...pendingUpdates.current,
        ...newData,
        // For nested objects like userStats, do a proper merge
        userStats: newData.userStats || pendingUpdates.current?.userStats,
        goals: newData.goals || pendingUpdates.current?.goals,
      };
      return;
    }
    
    isSaving.current = true;

    try {
        if (user && user.uid) {
             console.log("Saving data to cloud...", Object.keys(newData)); // Debug log
             
             // オフラインチェック
             if (!getOnlineStatus()) {
               console.log("Offline detected, saving to localStorage as backup...");
               const backupData = {
                 courses: newData.courses || courses,
                 userStats: newData.userStats || userStats,
                 wrongHistory: newData.wrongHistory || wrongHistory,
                 goals: newData.goals || goals,
                 masteredQuestions: newData.masteredQuestions || masteredQuestions,
               };
               localStorage.setItem('study_master_pending_sync', JSON.stringify({
                 data: backupData,
                 timestamp: Date.now(),
                 uid: user.uid
               }));
               showError(ERROR.OFFLINE_MODE);
               return;
             }
             
             // Helper to recursively remove undefined values which Firebase doesn't support
             const removeUndefined = (obj: any): any => {
                if (Array.isArray(obj)) return obj.map(removeUndefined);
                if (obj !== null && typeof obj === 'object') {
                    return Object.entries(obj).reduce((acc, [key, value]) => {
                        if (value !== undefined) {
                            acc[key] = removeUndefined(value);
                        }
                        return acc;
                    }, {} as any);
                }
                return obj;
             };

             const rawDataToSave = {
                 courses: newData.courses || courses,
                 userStats: newData.userStats || userStats,
                 wrongHistory: newData.wrongHistory || wrongHistory,
                 goals: newData.goals || goals,
                 masteredQuestions: newData.masteredQuestions || masteredQuestions,
                 plan: profile?.plan,
                 proUntil: profile?.proUntil,
             };
             
             const dataToSave = removeUndefined(rawDataToSave);

             const now = new Date();
             
             // 再試行ロジック付きで保存
             await withRetry(
               () => saveToCloud(user.uid, dataToSave, now),
               {
                 maxRetries: 3,
                 delayMs: 1000,
                 backoff: true,
                 shouldRetry: isRetryableFirestoreError,
                 onRetry: (attempt, error) => {
                   console.log(`Save retry attempt ${attempt}:`, error.message);
                 }
               }
             );
             
             console.log("Save successful!");
             
             lastSavedTime.current = now.getTime();
             isDirty.current = false;

             // Check for achievements after a successful cloud save (might have new XP/Streak)
             handleAchievementCheck(dataToSave.userStats, dataToSave.courses);
        } else {
            console.log("Guest mode: Saving data to localStorage...");
            const currentData = {
                courses: courses,
                userStats: userStats,
                wrongHistory: wrongHistory,
                goals: goals,
                masteredQuestions: masteredQuestions,
                reviews: reviews, // Save reviews for guest
                // Add other fields if necessary
            };
            
            // Merge with newData
            const dataToSave = {
                ...currentData,
                ...newData
            };

            try {
                localStorage.setItem('study_master_guest_data', JSON.stringify(dataToSave));
                console.log("Guest data saved to localStorage");
            } catch (e) {
                console.error("Failed to save to localStorage", e);
            }
        }
    } catch (error: any) {
        console.error("Save Error:", error);
        setSaveError(error);
        
        // ユーザーフレンドリーなエラーメッセージを表示
        const friendlyMessage = error?.code 
          ? getFirestoreErrorMessage(error)
          : ERROR.SAVE_RETRY_FAILED;
        showError(friendlyMessage);
    } finally {
        isSaving.current = false;
        
        // Process any pending updates that came in while we were saving
        if (pendingUpdates.current) {
            console.log("Processing pending updates...");
            const pending = pendingUpdates.current;
            pendingUpdates.current = null;
            // Recursively call saveData with the pending updates
            saveData(pending);
        }
    }
  };
  
  // Note: In a real app, you might want a `useInterval` or `useEffect` to auto-save periodically if dirty.
  // Here we expose `saveData` to be called manually or by actions.

  const [masteredQuestions, setMasteredQuestions] = useState<MasteredQuestions>({});
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [errorStats, setErrorStats] = useState<any>({}); // Define ErrorStats type if possible
  const [profile, setProfile] = useState<Profile | null>(null); // Define Profile
  const [saveError, setSaveError] = useState<any>(null);

  // 6. Profile Update Function
  const updateProfile = async (newProfile: Profile) => {
    // 1. Update Local State
    setProfile(newProfile);

    // 2. Persist
    if (user?.uid) {
      try {
        const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
        
        // Remove undefined values
        const cleanProfile = JSON.parse(JSON.stringify(newProfile));
        if (cleanProfile.uid) delete cleanProfile.uid; // uid is the doc id parent or key

        await setDoc(profileRef, cleanProfile, { merge: true });

        // Update root users doc for shared fields if any (e.g., name, username)
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          name: newProfile.name,
          username: newProfile.username,
          avatarUrl: newProfile.customAvatarUrl || newProfile.avatarId,
          plan: newProfile.plan || 'free',
          updatedAt: new Date()
        }, { merge: true });

        console.log("Profile updated in Firestore");
      } catch (e) {
        console.error("Failed to update profile", e);
        throw e;
      }
    } else {
      // Guest mode
      try {
        const localDataString = localStorage.getItem('study_master_guest_data');
        const localData = localDataString ? JSON.parse(localDataString) : {};
        localData.profile = newProfile;
        localStorage.setItem('study_master_guest_data', JSON.stringify(localData));
      } catch (e) {
        console.error("Failed to save guest profile", e);
      }
    }
  };

  // 6. Publish/Import Functions
  const publishCourse = async (courseId: string) => {
    if (!user) {
        showError("公開するにはログインが必要です");
        return;
    }
    
    if (!profile) {
         showError("公開するにはプロフィール設定が必要です");
         return;
    }

    const courseToPublish = courses.find(c => c.id === courseId);
    if (!courseToPublish) return;

    if (courseToPublish.quizzes.length === 0) {
        showError("空のコースは公開できません");
        return;
    }

    try {
        const removeUndefined = (obj: any): any => {
            if (Array.isArray(obj)) return obj.map(removeUndefined);
            if (obj !== null && typeof obj === 'object') {
                return Object.entries(obj).reduce((acc, [key, value]) => {
                    if (value !== undefined) {
                        acc[key] = removeUndefined(value);
                    }
                    return acc;
                }, {} as any);
            }
            return obj;
        };

        const rawPublicData: PublicCourse = {
            ...courseToPublish,
            authorId: user.uid,
            authorName: profile.name || user.displayName || '名無し',
            authorAvatar: profile.customAvatarUrl || profile.avatarId || undefined,
            tags: [],
            downloads: 0,
            likes: 0,
            publishedAt: Date.now(),
            updatedAt: Date.now(),
            version: 1,
            isPublic: true,
            visibility: 'public'
        };
        
        const publicData = removeUndefined(rawPublicData);
        
        await setDoc(doc(db, 'public_courses', courseId), publicData);
        
        const updatedCourses = courses.map(c => c.id === courseId ? { ...c, isPublic: true, visibility: 'public' as const } : c);
        setCourses(updatedCourses);
        saveData({ courses: updatedCourses });
        
        showSuccess("コースを公開しました！");

        // Check for achievements (Social Milestones)
        handleAchievementCheck(undefined, updatedCourses);
    } catch (e) {
        console.error("Publish failed:", e);
        showError("公開に失敗しました");
    }
  };

  const importCourse = async (publicCourse: PublicCourse) => {
      const newId = generateId();
      const newCourse: Course = {
          ...publicCourse, 
          id: newId,
          title: publicCourse.title,
          isPublic: false,
          visibility: 'private',
          favorite: false,
          createdAt: Date.now()
      };
      
      const newCourses = [...courses, newCourse];
      setCourses(newCourses);
      saveData({ courses: newCourses });
      showSuccess("コースをダウンロードしました！");

      // Special check for 'social_download' as it's hard to check from state alone
      const existingIds = profile?.achievements?.map(a => a.id) || [];
      if (!existingIds.includes('social_download')) {
        const manualUnlocked: UserAchievement[] = [{
          id: 'social_download',
          unlockedAt: Date.now()
        }];
        
        const updatedAchievements = [...(profile?.achievements || []), ...manualUnlocked];
        setProfile(prev => ({ ...prev, achievements: updatedAchievements } as Profile));
        
        if (user?.uid) {
          const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
          await setDoc(profileRef, { achievements: updatedAchievements }, { merge: true });
        }
        
        showSuccess(`🎉 実績解除: 他者から学ぶ\n他のユーザーのコースをダウンロードする`);
      }
  };

  return {
    user,
    courses,
    userStats,
    wrongHistory,
    masteredQuestions,
    goals,
    errorStats,
    profile,
    reviews,
    updateReviewStatus,
    hasProfile: !!profile,
    updateProfile,
    isProfileLoading: isLoading, 
    isProfileInitialized,
    saveError,
    isLoading,
    isSyncing,
    saveData,
    setUser,
    setCourses,
    setUserStats,
    setWrongHistory,
    setMasteredQuestions,
    setGoals,
    setErrorStats,
    publishCourse,
    importCourse
  };
}
