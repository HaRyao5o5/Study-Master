// src/hooks/useAppData.js
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { loadFromCloud, saveToCloud } from "../utils/cloudSync";
import { normalizeData } from '../utils/helpers';
import { INITIAL_DATA } from '../data/initialData';

export function useAppData() {
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 初期ステートの設定（ローカルストレージから読み込み）
  const [userStats, setUserStats] = useState(() => {
    try {
      const saved = localStorage.getItem('study-master-stats');
      return saved ? JSON.parse(saved) : { totalXp: 0, level: 1, streak: 0, lastLogin: '' };
    } catch (e) { return { totalXp: 0, level: 1, streak: 0, lastLogin: '' }; }
  });

  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('study-master-data');
      return saved ? normalizeData(JSON.parse(saved)) : normalizeData(INITIAL_DATA);
    } catch (e) { return normalizeData(INITIAL_DATA); }
  });

  const [wrongHistory, setWrongHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('study-master-wrong-history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [errorStats, setErrorStats] = useState(() => {
    try {
      const saved = localStorage.getItem('study-master-error-stats');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  // ローカルストレージへの保存（副作用）
  useEffect(() => { localStorage.setItem('study-master-data', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('study-master-wrong-history', JSON.stringify(wrongHistory)); }, [wrongHistory]);
  useEffect(() => { localStorage.setItem('study-master-error-stats', JSON.stringify(errorStats)); }, [errorStats]);
  useEffect(() => { localStorage.setItem('study-master-stats', JSON.stringify(userStats)); }, [userStats]);

  // 認証とクラウド同期
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsSyncing(true);
        try {
          const cloudData = await loadFromCloud(currentUser.uid);
          if (!cloudData) {
            await saveToCloud(currentUser.uid, { courses, userStats, wrongHistory, errorStats });
          } else {
            if (cloudData.courses) setCourses(normalizeData(cloudData.courses));
            if (cloudData.userStats) setUserStats(cloudData.userStats);
            if (cloudData.wrongHistory) setWrongHistory(cloudData.wrongHistory);
            if (cloudData.errorStats) setErrorStats(cloudData.errorStats);
          }
        } catch (err) {
          console.error("Sync Error:", err);
        } finally {
          setIsSyncing(false);
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