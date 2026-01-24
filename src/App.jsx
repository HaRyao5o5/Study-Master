// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  BookOpen, Settings, Bell, Trophy, Flame, BarChart2, User, LogIn
} from 'lucide-react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Firebase imports
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./lib/firebase";

import { generateId } from './utils/helpers';
import { getLevelInfo, calculateXpGain, getUnlockedTitles } from './utils/gamification';

import LoadingScreen from './components/common/LoadingScreen';
import FolderListView from './components/course/FolderListView';
import CreateCourseModal from './components/course/CreateCourseModal';
import SettingsView from './components/layout/SettingsView';
import ChangelogModal from './components/layout/ChangelogModal';
import StatsView from './components/layout/StatsView';
import SharedCourseView from './components/course/SharedCourseView';
import RankingView from './components/layout/RankingView';

// Page Components
import CoursePage from './pages/CoursePage';
import QuizMenuPage from './pages/QuizMenuPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import EditQuizPage from './pages/EditQuizPage';
import CreateQuizPage from './pages/CreateQuizPage';

// Context & Hooks
import { useApp } from './context/AppContext';
import { useToast } from './context/ToastContext';
import { useTheme } from './hooks/useTheme';
import { handleError, SUCCESS } from './utils/errorMessages';


// --- メイン App コンポーネント ---
export default function App() {
  const [gameSettings, setGameSettings] = useState({ randomize: false, shuffleOptions: false, immediateFeedback: false });
  const [resultData, setResultData] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { theme, setTheme } = useTheme();

  const {
    user, isSyncing, saveError,
    courses, setCourses,
    userStats, setUserStats,
    wrongHistory, setWrongHistory,
    errorStats, setErrorStats,
    profile, hasProfile, updateProfile, isProfileLoading
  } = useApp();

  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError, showConfirm } = useToast();

  // Quiz handlers from custom hook
  const quizHandlers = {
    handleCreateQuiz: (courseId) => navigate(`/course/${courseId}/create-quiz`),
    handleSaveQuiz: (updatedQuiz, courseId) => {
      const courseIndex = courses.findIndex(c => c.id === courseId);
      if (courseIndex === -1) return;
      const newCourses = [...courses];
      const quizIndex = newCourses[courseIndex].quizzes.findIndex(q => q.id === updatedQuiz.id);
      if (quizIndex > -1) newCourses[courseIndex].quizzes[quizIndex] = updatedQuiz;
      else newCourses[courseIndex].quizzes.push(updatedQuiz);
      setCourses(newCourses);
      navigate(`/course/${courseId}`);
    },
    handleDeleteQuiz: async (quizId, courseId) => {
      const confirmed = await showConfirm('この問題セットを削除しますか？', { type: 'danger' });
      if (!confirmed) return;
      const courseIndex = courses.findIndex(c => c.id === courseId);
      const newCourses = [...courses];
      newCourses[courseIndex].quizzes = newCourses[courseIndex].quizzes.filter(q => q.id !== quizId);
      setCourses(newCourses);
    },
    handleImportQuiz: (newQuizData, courseId) => {
      const quizWithId = { ...newQuizData, id: `quiz-${generateId()}` };
      const newCourses = courses.map(course => {
        if (course.id === courseId) {
          return { ...course, quizzes: [...course.quizzes, quizWithId] };
        }
        return course;
      });
      setCourses(newCourses);
    },
    finishQuiz: (answers, totalTime, courseId, quizId) => {
      const levelInfo = getLevelInfo(userStats.totalXp);
      const xpGained = calculateXpGain({ answers, totalTime });
      const today = new Date().toDateString();
      let newStreak = userStats.streak;
      let isStreakUpdated = false;
      let newLastLogin = userStats.lastLogin;

      if (userStats.lastLogin !== today) {
        if (!userStats.lastLogin) { newStreak = 1; }
        else {
          const last = new Date(userStats.lastLogin);
          const current = new Date(today);
          const diffTime = Math.abs(current - last);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) { newStreak += 1; } else { newStreak = 1; }
        }
        isStreakUpdated = true;
        newLastLogin = today;
      }

      const resultWithXp = {
        answers, totalTime, xpGained,
        currentLevel: levelInfo.level,
        isLevelUp: getLevelInfo(userStats.totalXp + xpGained).level > levelInfo.level,
        streakInfo: isStreakUpdated ? { days: newStreak, isUpdated: true } : null
      };

      setResultData(resultWithXp);
      navigate(`/course/${courseId}/quiz/${quizId}/result`);

      setTimeout(() => {
        setUserStats(prev => ({ ...prev, totalXp: prev.totalXp + xpGained, streak: isStreakUpdated ? newStreak : prev.streak, lastLogin: newLastLogin }));
      }, 600);

      const currentWrongs = answers.filter(a => !a.isCorrect).map(a => a.question.id);
      const currentCorrects = answers.filter(a => a.isCorrect).map(a => a.question.id);
      const isReview = quizId === 'review-mode';

      if (currentWrongs.length > 0) {
        setErrorStats(prev => {
          const newStats = { ...prev };
          currentWrongs.forEach(id => { newStats[id] = (newStats[id] || 0) + 1; });
          return newStats;
        });
      }

      setWrongHistory(prev => {
        let newHistory = [...prev];
        currentWrongs.forEach(id => { if (!newHistory.includes(id)) newHistory.push(id); });
        if (isReview) newHistory = newHistory.filter(id => !currentCorrects.includes(id));
        return newHistory;
      });
    },
    clearHistory: async () => {
      const confirmed = await showConfirm('復習リストをリセットしますか？');
      if (confirmed) { setWrongHistory([]); navigate('/'); }
    },
    handleResetStats: async () => {
      const confirmed = await showConfirm("【デバッグ用】ステータスを初期化しますか？");
      if (confirmed) {
        setUserStats({ totalXp: 0, level: 1, streak: 0, lastLogin: '' });
        showSuccess("ステータスをリセットしました。");
      }
    },
    handleDebugYesterday: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const confirmed = await showConfirm('【デバッグ用】最終ログインを昨日に設定しますか？');
      if (confirmed) {
        setUserStats(prev => ({ ...prev, streak: 1, lastLogin: yesterday.toDateString() }));
        showSuccess('最終ログイン日時を更新しました。');
      }
    }
  };

  const { handleCreateQuiz, handleSaveQuiz, handleDeleteQuiz, handleImportQuiz, finishQuiz, clearHistory, handleResetStats, handleDebugYesterday } = quizHandlers;

  const levelInfo = getLevelInfo(userStats.totalXp);
  const xpPercentage = Math.min(100, Math.max(0, (levelInfo.currentXp / (levelInfo.xpForNextLevel || 1)) * 100));
  const titles = getUnlockedTitles(userStats);
  const currentTitle = titles.length > 0 ? titles[titles.length - 1].name : "駆け出しの学習者";

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // 初回ログイン時にプロフィール設定を促す
  useEffect(() => {
    if (user && !isProfileLoading && !hasProfile) {
      setShowProfileEditor(true);
    }
  }, [user, hasProfile, isProfileLoading]);

  // 保存エラーの監視とToast表示
  useEffect(() => {
    if (saveError) {
      showError(saveError.message, {
        duration: 8000, // 8秒間表示
        action: {
          label: '詳細',
          onClick: () => console.error('Save error details:', saveError)
        }
      });
    }
  }, [saveError, showError]);

  // --- イベントハンドラー ---
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const message = handleError(error, 'Login');
      showError(message);
    }
  };

  const handleLogout = async () => {
    try {
      const confirmed = await showConfirm(CONFIRM.LOGOUT);
      if (confirmed) {
        await signOut(auth);
        showSuccess(SUCCESS.LOGOUT_SUCCESS);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCreateCourse = (title, desc, visibility) => {
    const newCourse = { id: `course-${generateId()}`, title, description: desc, visibility: visibility || 'private', quizzes: [] };
    setCourses([...courses, newCourse]);
    navigate('/');
  };

  const handleEditCourseRequest = (course) => { setCourseToEdit(course); navigate('/edit-course'); };

  const handleUpdateCourse = (title, desc, visibility) => {
    const updatedCourses = courses.map(c => c.id === courseToEdit.id ? { ...c, title, description: desc, visibility: visibility || 'private' } : c);
    setCourses(updatedCourses); setCourseToEdit(null); navigate('/');
  };

  const handleImportBackup = async (importedData) => {
    try {
      if (!Array.isArray(importedData)) { showError('データの形式が正しくありません。'); return; }
      const confirmed = await showConfirm('現在のデータを上書きして、バックアップから復元しますか？');
      if (confirmed) {
        setCourses(importedData);
        showSuccess('データの復元が完了しました！');
        navigate('/');
      }
    } catch (e) { 
      console.error(e); 
      showError('読み込みに失敗しました。'); 
    }
  };

  const startQuiz = (courseId, quizId, randomize, shuffleOptions, immediateFeedback) => {
    setGameSettings({ randomize, shuffleOptions, immediateFeedback });
    navigate(`/course/${courseId}/quiz/${quizId}/play`);
  };

  if (isInitialLoading) return <LoadingScreen />;

  return (
    <div className={`min-h-screen font-sans text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 pointer-events-none -z-10"></div>

      <header className="sticky top-0 z-50 glass shadow-sm transition-all">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white p-2 rounded-lg shadow-md transform transition-transform group-hover:scale-105 group-hover:rotate-3">
              <BookOpen size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-gradient leading-none">Study Master</h1>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate max-w-[120px]">
                {currentTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* ★ 変更: クリックでランキングへ飛ぶように cursor-pointer と onClick を追加 */}
            <div
              className="hidden sm:flex flex-col items-end mr-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/ranking')}
            >
              <div className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-200">
                <Trophy size={14} className="text-yellow-500 mr-1" />
                <span>Lv.{levelInfo.level}</span>
                <span className="mx-2 text-gray-300">|</span>
                <Flame size={14} className="text-orange-500 mr-1" />
                <span>{userStats.streak}日連続</span>
              </div>
              <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
                {isSyncing && (
                  <div className="absolute inset-0 bg-white/50 animate-pulse flex items-center justify-center">
                    <div className="w-full h-full bg-blue-400 blur-sm"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button onClick={() => navigate('/stats')} className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                <BarChart2 size={20} />
              </button>
              <button onClick={() => setShowChangelog(true)} className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                <Bell size={20} />
              </button>
              <button onClick={() => navigate('/settings')} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${user ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                <Settings size={20} />
              </button>
              
              {/* ユーザーアカウント表示 */}
              {user ? (
                <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                  {profile && !isProfileLoading ? (
                    // カスタムプロフィール表示
                    <>
                      <div className="text-3xl">{getAvatarById(profile.avatar).emoji}</div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block max-w-[100px] truncate">
                        {profile.displayName}
                      </span>
                    </>
                  ) : (
                    // プロフィール読み込み中またはGoogle情報表示
                    <>
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'}
                          className="w-8 h-8 rounded-full ring-2 ring-gray-300 dark:ring-gray-600"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block max-w-[100px] truncate">
                        {isProfileLoading ? '読み込み中...' : (user.displayName || user.email)}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700 flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-md"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">ログイン</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-20">
        <div className="animate-fade-in">
          <Routes>
            <Route path="/" element={
              <>
                <div
                  className="sm:hidden mb-6 glass p-4 rounded-xl shadow-sm flex justify-between items-center animate-slide-up cursor-pointer hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors"
                  onClick={() => navigate('/ranking')}
                >
                  <div className="flex items-center">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg mr-3 text-yellow-600 dark:text-yellow-400"><Trophy size={20} /></div>
                    <div><div className="text-xs text-gray-500 dark:text-gray-400 font-bold">現在のレベル</div><div className="text-lg font-black text-gray-800 dark:text-white">Lv.{levelInfo.level}</div></div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-3"><div className="text-xs text-gray-500 dark:text-gray-400 font-bold">連続学習</div><div className="text-lg font-black text-gray-800 dark:text-white">{userStats.streak}日</div></div>
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400"><Flame size={20} /></div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white animate-slide-up delay-75">科目の選択</h2>
                <FolderListView
                  onSelectCourse={(c) => navigate(`/course/${c.id}`)}
                  onCreateCourse={() => navigate('/create-course')}
                  onEditCourse={handleEditCourseRequest}
                />
              </>
            } />

            <Route path="/create-course" element={<CreateCourseModal onClose={() => navigate('/')} onSave={handleCreateCourse} />} />
            <Route path="/edit-course" element={<CreateCourseModal onClose={() => navigate('/')} onSave={handleUpdateCourse} initialData={courseToEdit} />} />
            <Route path="/settings" element={<SettingsView theme={theme} changeTheme={setTheme} onBack={() => navigate('/')} courses={courses} onImportData={handleImportBackup} onResetStats={handleResetStats} onDebugYesterday={handleDebugYesterday} user={user} onLogin={handleLogin} onLogout={handleLogout} />} />
            <Route path="/stats" element={<StatsView userStats={userStats} errorStats={errorStats} courses={courses} onBack={() => navigate('/')} />} />
            <Route path="/share/:targetUid/:courseId" element={<SharedCourseView />} />

            {/* ★ 追加: ランキングページへのルート */}
            <Route path="/ranking" element={<RankingView onBack={() => navigate('/')} currentUser={user} />} />

            <Route path="/course/:courseId" element={<CoursePage wrongHistory={wrongHistory} onCreateQuiz={handleCreateQuiz} onDeleteQuiz={handleDeleteQuiz} onImportQuiz={handleImportQuiz} />} />
            <Route path="/course/:courseId/quiz/:quizId" element={<QuizMenuPage wrongHistory={wrongHistory} onStart={startQuiz} onClearHistory={clearHistory} />} />
            <Route path="/course/:courseId/quiz/:quizId/play" element={<GamePage gameSettings={gameSettings} wrongHistory={wrongHistory} onFinish={finishQuiz} />} />
            <Route path="/course/:courseId/quiz/:quizId/result" element={<ResultPage resultData={resultData} gameSettings={gameSettings} onRetry={startQuiz} />} />
            <Route path="/course/:courseId/quiz/:quizId/edit" element={<EditQuizPage onSave={handleSaveQuiz} />} />
            <Route path="/course/:courseId/create-quiz" element={<CreateQuizPage onSave={handleSaveQuiz} />} />

            <Route path="*" element={<div className="text-center p-10">ページが見つかりません (404)</div>} />
          </Routes>
        </div>
      </main>

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );
}