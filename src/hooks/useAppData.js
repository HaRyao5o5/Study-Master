// src/hooks/useAppData.js
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
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
  const [masteredQuestions, setMasteredQuestions] = useState({}); // NEW: 復習完了した問題
  const [errorStats, setErrorStats] = useState({});

  // ローカルストレージへの保存（ゲストモードのみ、認証確定後のみ）
  useEffect(() => {
    if (!authChecked) return; // 認証状態が確定するまで保存しない
    if (!user) {
      // ログインしていない場合のみlocalStorageに保存
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

  // 認証とクラウド同期
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // ✅ ログイン時: localStorageをクリアし、Firebaseから読み込む
        setIsSyncing(true);
        try {
          const cloudData = await loadFromCloud(currentUser.uid);
          if (!cloudData) {
            // ✅ Firebaseにデータがない場合: 初期データを使用（ゲストデータはアップロードしない）
            console.log('No Firebase data found, using initial data');
            setCourses(normalizeData(INITIAL_DATA));
            setUserStats({ totalXp: 0, level: 1, streak: 0, lastLogin: '' });
            setWrongHistory([]);
            setMasteredQuestions({});
            setErrorStats({});
          } else {
            // ✅ Firebaseからデータを読み込み
            if (cloudData.courses) setCourses(normalizeData(cloudData.courses));
            if (cloudData.userStats) setUserStats(cloudData.userStats);
            if (cloudData.wrongHistory) setWrongHistory(cloudData.wrongHistory);
            if (cloudData.masteredQuestions) setMasteredQuestions(cloudData.masteredQuestions);
            if (cloudData.errorStats) setErrorStats(cloudData.errorStats);
            console.log('Data loaded from Firebase');
          }
          
          // ✅ ログイン後はlocalStorageをクリア（データ混在を防ぐ）
          localStorage.removeItem('study-master-data');
          localStorage.removeItem('study-master-wrong-history');
          localStorage.removeItem('study-master-mastered');
          localStorage.removeItem('study-master-error-stats');
          localStorage.removeItem('study-master-stats');
          console.log('localStorage cleared after login');
          
          // プロフィール読み込み
          loadProfile(currentUser.uid);
        } catch (err) {
          console.error("Sync Error:", err);
        } finally {
          setIsSyncing(false);
          setAuthChecked(true);
        }
      } else {
        // ✅ ログアウト時/ゲストモード: localStorageから読み込む
        console.log('Guest mode or logged out, loading from localStorage');
        try {
          const savedCourses = localStorage.getItem('study-master-data');
          const savedStats = localStorage.getItem('study-master-stats');
          const savedWrong = localStorage.getItem('study-master-wrong-history');
          const savedMastered = localStorage.getItem('study-master-mastered');
          const savedErrors = localStorage.getItem('study-master-error-stats');
          
          setCourses(savedCourses ? normalizeData(JSON.parse(savedCourses)) : normalizeData(INITIAL_DATA));
          setUserStats(savedStats ? JSON.parse(savedStats) : { totalXp: 0, level: 1, streak: 0, lastLogin: '' });
          setWrongHistory(savedWrong ? JSON.parse(savedWrong) : []);
          setMasteredQuestions(savedMastered ? JSON.parse(savedMastered) : {});
          setErrorStats(savedErrors ? JSON.parse(savedErrors) : {});
        } catch (e) {
          console.error('Failed to load from localStorage:', e);
          setCourses(normalizeData(INITIAL_DATA));
          setUserStats({ totalXp: 0, level: 1, streak: 0, lastLogin: '' });
          setWrongHistory([]);
          setMasteredQuestions({});
          setErrorStats({});
        } finally {
          setIsSyncing(false);
          setAuthChecked(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 自動保存 (Debounce)
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (!user) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      setSaveError(null); // エラーをクリア
      try {
        await saveToCloud(user.uid, { courses, userStats, wrongHistory, masteredQuestions, errorStats });
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
  }, [courses, userStats, wrongHistory, masteredQuestions, errorStats, user]);

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
    errorStats, setErrorStats,
    // プロフィール関連
    profile,
    isProfileLoading,
    hasProfile,
    updateProfile,
    loadProfile
  };
}