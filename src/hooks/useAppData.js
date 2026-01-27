// src/hooks/useAppData.js
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { loadFromCloud, saveToCloud } from "../utils/cloudSync";
import { normalizeData } from '../utils/helpers';
import { INITIAL_DATA } from '../data/initialData';

export function useAppData() {
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true); // 初期認証中はtrue
  const [authChecked, setAuthChecked] = useState(false); // 認証状態が確定したか
  const [saveError, setSaveError] = useState(null); // 保存エラー状態

  // 初期ステートは空データから開始（localStorageは読み込まない）
  const [userStats, setUserStats] = useState({ totalXp: 0, level: 1, streak: 0, lastLogin: '' });
  const [courses, setCourses] = useState(() => normalizeData(INITIAL_DATA));
  const [wrongHistory, setWrongHistory] = useState([]);
  const [masteredQuestions, setMasteredQuestions] = useState({});
  const [goals, setGoals] = useState({
    dailyXpGoal: 100,
    weeklyXpGoal: 700,
    dailyProgress: 0,
    weeklyProgress: 0,
    lastResetDate: new Date().toDateString(),
    lastWeekResetDate: new Date().toDateString(),
    achievedToday: false,
    achievedThisWeek: false
  });
  const [errorStats, setErrorStats] = useState({});

  // Real-time Sync Controls
  const lastWriteTime = useRef(0);
  const ignoreNextSave = useRef(false);

  // ローカルストレージへの保存（ゲストモードのみ、認証確定後のみ）
  // ... (Keep existing local storage effects)
  useEffect(() => {
    if (!authChecked) return; 
    if (!user) {
      localStorage.setItem('study-master-data', JSON.stringify(courses));
    }
  }, [courses, user, authChecked]);
  
  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      localStorage.setItem('study-master-wrong-history', JSON.stringify(wrongHistory));
    }
  }, [wrongHistory, user, authChecked]);
  
  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      localStorage.setItem('study-master-error-stats', JSON.stringify(errorStats));
    }
  }, [errorStats, user, authChecked]);
  
  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      localStorage.setItem('study-master-stats', JSON.stringify(userStats));
    }
  }, [userStats, user, authChecked]);
  
  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      localStorage.setItem('study-master-mastered', JSON.stringify(masteredQuestions));
    }
  }, [masteredQuestions, user, authChecked]);
  
  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      localStorage.setItem('study-master-goals', JSON.stringify(goals));
    }
  }, [goals, user, authChecked]);

  // データ読み込みヘルパー
  const fetchAndSetData = async (uid) => {
    setIsSyncing(true);
    try {
      const cloudData = await loadFromCloud(uid);
      if (!cloudData) {
        console.log('No Firebase data found, using initial data');
        setCourses(normalizeData(INITIAL_DATA));
        setUserStats({ totalXp: 0, level: 1, streak: 0, lastLogin: '' });
        setWrongHistory([]);
        setMasteredQuestions({});
        setGoals({
          dailyXpGoal: 100,
          weeklyXpGoal: 700,
          dailyProgress: 0,
          weeklyProgress: 0,
          lastResetDate: new Date().toDateString(),
          lastWeekResetDate: new Date().toDateString(),
          achievedToday: false,
          achievedThisWeek: false
        });
        setErrorStats({});
      } else {
        if (cloudData.courses) setCourses(normalizeData(cloudData.courses));
        if (cloudData.userStats) setUserStats(cloudData.userStats);
        if (cloudData.wrongHistory) setWrongHistory(cloudData.wrongHistory);
        if (cloudData.masteredQuestions) setMasteredQuestions(cloudData.masteredQuestions);
        if (cloudData.goals) setGoals(cloudData.goals);
        if (cloudData.errorStats) setErrorStats(cloudData.errorStats);
        console.log('Data loaded from Firebase');
      }
      
      // localStorageをクリア
      localStorage.removeItem('study-master-data');
      localStorage.removeItem('study-master-wrong-history');
      localStorage.removeItem('study-master-mastered');
      localStorage.removeItem('study-master-goals');
      localStorage.removeItem('study-master-error-stats');
      localStorage.removeItem('study-master-stats');
      
      loadProfile(uid);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setIsSyncing(false);
      setAuthChecked(true);
    }
  };

  // 認証とクラウド同期
  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Cleanup previous snapshot listener if exists
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (currentUser) {
        // Initial Load
        await fetchAndSetData(currentUser.uid);

        // Setup Real-time Listener
        const userDocRef = doc(db, "users", currentUser.uid);
        unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (!docSnap.exists()) return;
          
          const data = docSnap.data();
          const remoteTime = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : 0;
          
          // Check if this update is from us (allow 2s buffer)
          if (Math.abs(remoteTime - lastWriteTime.current) < 2000) {
            return;
          }

          console.log("Remote update detected, reloading data...");
          ignoreNextSave.current = true; // Prevent the following state update from saving back to cloud
          fetchAndSetData(currentUser.uid); // Background reload
        }, (error) => {
          console.error("Snapshot listener error:", error);
        });

      } else {
        // Guest Mode
        console.log('Guest mode or logged out, loading from localStorage');
        try {
          const savedCourses = localStorage.getItem('study-master-data');
          const savedStats = localStorage.getItem('study-master-stats');
          const savedWrong = localStorage.getItem('study-master-wrong-history');
          const savedMastered = localStorage.getItem('study-master-mastered');
          const savedGoals = localStorage.getItem('study-master-goals');
          const savedErrors = localStorage.getItem('study-master-error-stats');
          
          setCourses(savedCourses ? normalizeData(JSON.parse(savedCourses)) : normalizeData(INITIAL_DATA));
          setUserStats(savedStats ? JSON.parse(savedStats) : { totalXp: 0, level: 1, streak: 0, lastLogin: '' });
          setWrongHistory(savedWrong ? JSON.parse(savedWrong) : []);
          setMasteredQuestions(savedMastered ? JSON.parse(savedMastered) : {});
          setGoals(savedGoals ? JSON.parse(savedGoals) : {
            dailyXpGoal: 100,
            weeklyXpGoal: 700,
            dailyProgress: 0,
            weeklyProgress: 0,
            lastResetDate: new Date().toDateString(),
            lastWeekResetDate: new Date().toDateString(),
            achievedToday: false,
            achievedThisWeek: false
          });
          setErrorStats(savedErrors ? JSON.parse(savedErrors) : {});
        } catch (e) {
          console.error('Failed to load from localStorage:', e);
          setCourses(normalizeData(INITIAL_DATA));
        } finally {
          setIsSyncing(false);
          setAuthChecked(true);
        }
      }
    });
    
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // 自動保存 (Debounce with Ignore Logic)
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (!user) return;
    
    // If this update was caused by a remote fetch, ignore saving
    if (ignoreNextSave.current) {
      console.log('Skipping save due to remote update');
      ignoreNextSave.current = false;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      setSaveError(null);
      try {
        const now = new Date();
        lastWriteTime.current = now.getTime(); // Record local write time
        
        await saveToCloud(user.uid, { 
          courses, 
          userStats, 
          wrongHistory, 
          masteredQuestions, 
          goals, 
          errorStats 
        }, now);
        
        console.log('Auto-save successful');
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveError({
          message: 'データの保存に失敗しました',
          details: err.message,
          timestamp: new Date().toISOString()
        });
      } finally {
        setIsSyncing(false);
      }
    }, 3000);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [courses, userStats, wrongHistory, masteredQuestions, goals, errorStats, user]);

  // プロフィール状態
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // プロフィール取得
  const loadProfile = async (uid) => {
    setIsProfileLoading(true);
    try {
      const { getProfile } = await import('../lib/firebaseProfile');
      const profileData = await getProfile(uid);
      if (profileData) {
        setProfile(profileData);
        setHasProfile(true);
      } else {
        setProfile(null);
        setHasProfile(false);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
      setHasProfile(false);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // プロフィール更新
  const updateProfile = async (profileData) => {
    if (!user) return;
    
    try {
      const { updateProfile: updateFirebaseProfile } = await import('../lib/firebaseProfile');
      await updateFirebaseProfile(user.uid, profileData);
      setProfile(profileData);
      setHasProfile(true);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return {
    user,
    isSyncing,
    saveError,
    courses, setCourses,
    userStats, setUserStats,
    wrongHistory, setWrongHistory,
    masteredQuestions, setMasteredQuestions,
    goals, setGoals,
    errorStats, setErrorStats,
    profile,
    isProfileLoading,
    hasProfile,
    updateProfile,
    loadProfile
  };
}