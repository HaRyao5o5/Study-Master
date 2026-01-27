// src/hooks/useAppData.ts
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase.ts";
import { loadFromCloud, saveToCloud } from "../utils/cloudSync";
import { normalizeData } from '../utils/helpers';
import { INITIAL_DATA } from '../data/initialData.ts';
import { User, UserStats, Course, UserGoals, MasteredQuestions, Profile } from '../types';
import { useToast } from '../context/ToastContext.tsx';

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
  updateProfile: (p: Profile) => Promise<void>;
  isProfileLoading: boolean;
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
}

export function useAppData(): AppData {
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(true); // 初期認証中はtrue
  const [isLoading, setIsLoading] = useState<boolean>(true); // データ読込中はtrue
  
  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_DATA.userStats);
  const [wrongHistory, setWrongHistory] = useState<string[]>([]);
  
  // Refs for dirty check and preventing loop
  const isDirty = useRef<boolean>(false);
  const lastSavedTime = useRef<number>(0);
  const lastCloudUpdateTime = useRef<number>(0);
  const isSaving = useRef<boolean>(false);

  const { showError } = useToast();

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
            if (cloudData.courses) setCourses(normalizeData(cloudData.courses));
            if (cloudData.userStats) setUserStats(cloudData.userStats);
            if (cloudData.wrongHistory) setWrongHistory(cloudData.wrongHistory);
            if (cloudData.goals) setGoals(cloudData.goals);
            if (cloudData.masteredQuestions) setMasteredQuestions(cloudData.masteredQuestions);
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
  useEffect(() => {
    if (!user?.uid) {
        setProfile(null);
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
    }, (error) => {
        console.error("Profile sync error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // 4. Save Function
  const saveData = async (newData: Partial<AppData> = {}, _force = false) => {
    // Update local state if provided
    if (newData.courses) setCourses(newData.courses);
    if (newData.userStats) setUserStats(newData.userStats);
    if (newData.wrongHistory) setWrongHistory(newData.wrongHistory);
    if (newData.goals) setGoals(newData.goals);
    if (newData.masteredQuestions) setMasteredQuestions(newData.masteredQuestions);

    isDirty.current = true;

    // Wait for debounce or force save
    // For simplicity in this migration, we just call save logic directly if forced or rely on effect?
    // Actually, the original code might have had a debounce or just direct save.
    // Let's implement direct save here for simplicity as per previous `saveToCloud` usage.
    

    // Use a local isSaving flag for this closure if needed, but the ref is better
    if (isSaving.current) return;
    isSaving.current = true;

    try {
        if (user && user.uid) {
             console.log("Saving data to cloud...", Object.keys(newData)); // Debug log
             
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
             };
             
             const dataToSave = removeUndefined(rawDataToSave);

             const now = new Date();
             await saveToCloud(user.uid, dataToSave, now);
             console.log("Save successful!");
             
             lastSavedTime.current = now.getTime();
             isDirty.current = false;
        } else {
            console.log("Guest mode: Saving data to localStorage...");
            const currentData = {
                courses: courses,
                userStats: userStats,
                wrongHistory: wrongHistory,
                goals: goals,
                masteredQuestions: masteredQuestions,
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
    } catch (error) {
        console.error("Save Error:", error);
        setSaveError(error);
    } finally {
        isSaving.current = false;
    }
  };
  
  // Note: In a real app, you might want a `useInterval` or `useEffect` to auto-save periodically if dirty.
  // Here we expose `saveData` to be called manually or by actions.

  const [masteredQuestions, setMasteredQuestions] = useState<MasteredQuestions>({});
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [errorStats, setErrorStats] = useState<any>({}); // Define ErrorStats type if possible
  const [profile, setProfile] = useState<Profile | null>(null); // Define Profile
  const [saveError, setSaveError] = useState<any>(null);

  // Helper for profile (mock or real implementation needed)
  const updateProfile = async (newProfile: Profile) => {
    // Implement profile update logic
    setProfile(newProfile);
    // Sync to cloud...
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
    hasProfile: !!profile,
    updateProfile,
    isProfileLoading: isLoading, // Re-use isLoading or separate
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
    setErrorStats
  };
}
