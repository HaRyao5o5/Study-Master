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

  // 初期ステートは空データから開始（localStorageは読み込まない）
  const [userStats, setUserStats] = useState({ totalXp: 0, level: 1, streak: 0, lastLogin: '' });
  const [courses, setCourses] = useState(() => normalizeData(INITIAL_DATA));
  const [wrongHistory, setWrongHistory] = useState([]);
  const [errorStats, setErrorStats] = useState({});

  // ローカルストレージへの保存（ゲストモードのみ）
  useEffect(() => {
    if (!user) {
      // ログインしていない場合のみlocalStorageに保存
      localStorage.setItem('study-master-data', JSON.stringify(courses));
    }
  }, [courses, user]);
  
  useEffect(() => {
    if (!user) {
      localStorage.setItem('study-master-wrong-history', JSON.stringify(wrongHistory));
    }
  }, [wrongHistory, user]);
  
  useEffect(() => {
    if (!user) {
      localStorage.setItem('study-master-error-stats', JSON.stringify(errorStats));
    }
  }, [errorStats, user]);
  
  useEffect(() => {
    if (!user) {
      localStorage.setItem('study-master-stats', JSON.stringify(userStats));
    }
  }, [userStats, user]);

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
            setErrorStats({});
          } else {
            // ✅ Firebaseからデータを読み込み
            if (cloudData.courses) setCourses(normalizeData(cloudData.courses));
            if (cloudData.userStats) setUserStats(cloudData.userStats);
            if (cloudData.wrongHistory) setWrongHistory(cloudData.wrongHistory);
            if (cloudData.errorStats) setErrorStats(cloudData.errorStats);
            console.log('Data loaded from Firebase');
          }
          
          // ✅ ログイン後はlocalStorageをクリア（データ混在を防ぐ）
          // ただし、ゲストデータはそのまま保持（ログアウト時に復元可能）
          localStorage.removeItem('study-master-data');
          localStorage.removeItem('study-master-wrong-history');
          localStorage.removeItem('study-master-error-stats');
          localStorage.removeItem('study-master-stats');
          console.log('localStorage cleared after login (guest data preserved in browser)');
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
          const savedErrors = localStorage.getItem('study-master-error-stats');
          
          setCourses(savedCourses ? normalizeData(JSON.parse(savedCourses)) : normalizeData(INITIAL_DATA));
          setUserStats(savedStats ? JSON.parse(savedStats) : { totalXp: 0, level: 1, streak: 0, lastLogin: '' });
          setWrongHistory(savedWrong ? JSON.parse(savedWrong) : []);
          setErrorStats(savedErrors ? JSON.parse(savedErrors) : {});
        } catch (e) {
          console.error('Failed to load from localStorage:', e);
          setCourses(normalizeData(INITIAL_DATA));
          setUserStats({ totalXp: 0, level: 1, streak: 0, lastLogin: '' });
          setWrongHistory([]);
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
      try {
        await saveToCloud(user.uid, { courses, userStats, wrongHistory, errorStats });
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setIsSyncing(false);
      }
    }, 3000);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [courses, userStats, wrongHistory, errorStats, user]);

  return {
    user,
    isSyncing,
    courses, setCourses,
    userStats, setUserStats,
    wrongHistory, setWrongHistory,
    errorStats, setErrorStats
  };
}