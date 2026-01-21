// src/App.jsx
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Settings, Bell, Trophy, Flame, BarChart2
} from 'lucide-react';

// Firebase imports
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./lib/firebase";

import { generateId } from './utils/helpers';
import { getLevelInfo, calculateXpGain, getUnlockedTitles } from './utils/gamification';

import Breadcrumbs from './components/common/Breadcrumbs';
import FolderListView from './components/course/FolderListView'; // ★ Propsが減ってスッキリ
import QuizListView from './components/course/QuizListView';
import CreateCourseModal from './components/course/CreateCourseModal';
import QuizEditor from './components/editor/QuizEditor';
import QuizMenuView from './components/course/QuizMenuView';
import GameView from './components/game/GameView';
import ResultView from './components/game/ResultView';
import SettingsView from './components/layout/SettingsView';
import ChangelogModal from './components/layout/ChangelogModal';
import StatsView from './components/layout/StatsView';

// ★ Contextフックをインポート (ここが重要)
import { useApp } from './context/AppContext';

export default function App() {
  // --- UIの状態管理 (ここはAppに残る) ---
  const [view, setView] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [gameSettings, setGameSettings] = useState({ randomize: false, shuffleOptions: false, immediateFeedback: false });
  const [resultData, setResultData] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);

  // --- テーマ設定 (UIに関するロジック) ---
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('study-master-theme') || 'system';
    return 'system';
  });

  // --- ★ Contextからデータを取得 ---
  // FolderListViewに渡す必要はなくなったが、App内でのモーダル操作などで使うために取得
  const { 
    user, isSyncing, 
    courses, setCourses, 
    userStats, setUserStats, 
    wrongHistory, setWrongHistory, 
    errorStats, setErrorStats 
  } = useApp();

  const levelInfo = getLevelInfo(userStats.totalXp);
  const titles = getUnlockedTitles(userStats);
  const currentTitle = titles.length > 0 ? titles[titles.length - 1].name : "駆け出しの学習者";

  // --- テーマ反映の副作用 ---
  useEffect(() => {
    localStorage.setItem('study-master-theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'light') root.classList.remove('dark');
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (e.matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // --- 認証ハンドラ ---
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("ログインに失敗しました。");
    }
  };

  const handleLogout = async () => {
    try {
      if(confirm("ログアウトしますか？")) {
        await signOut(auth);
        alert("ログアウトしました。");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --- ナビゲーション ---
  const goHome = () => { setView('home'); setSelectedCourse(null); setSelectedQuiz(null); setResultData(null); };

  const getPath = () => {
    const path = [];
    if (selectedCourse) path.push({ title: selectedCourse.title, id: selectedCourse.id, type: 'course' });
    if (selectedQuiz && view !== 'course' && view !== 'edit_quiz') path.push({ title: selectedQuiz.title, id: selectedQuiz.id, type: 'quiz_menu' });
    return path;
  };
  
  const handleBreadcrumbNavigate = (type, id) => {
    if (type === 'home') goHome();
    if (type === 'course') { setView('course'); setSelectedQuiz(null); }
  };

  // --- コース操作 (Modal用) ---
  // ※ FolderListViewの削除/インポート機能は向こうに移設したので削除した

  const handleCreateCourse = (title, desc) => {
    const newCourse = { id: `course-${generateId()}`, title, description: desc, quizzes: [] };
    setCourses([...courses, newCourse]);
    setView('home');
  };

  const handleEditCourseRequest = (course) => { setCourseToEdit(course); setView('edit_course'); };

  const handleUpdateCourse = (title, desc) => {
    const updatedCourses = courses.map(c => c.id === courseToEdit.id ? { ...c, title, description: desc } : c);
    setCourses(updatedCourses); setCourseToEdit(null); setView('home');
  };

  // --- その他のハンドラ (バックアップ復元など) ---
  const handleImportBackup = (importedData) => {
    try {
      if (!Array.isArray(importedData)) { alert('データの形式が正しくありません。'); return; }
      if (confirm('現在のデータを上書きして、バックアップから復元しますか？\n（現在のデータは消えます！）')) {
        setCourses(importedData); 
        alert('データの復元が完了しました！'); 
        goHome();
      }
    } catch (e) { console.error(e); alert('読み込みに失敗しました。'); }
  };

  const handleImportQuiz = (newQuizData) => {
    if (!selectedCourse) return;
    const updatedCourse = { ...selectedCourse, quizzes: [...selectedCourse.quizzes, newQuizData] };
    const newCourses = courses.map(c => c.id === selectedCourse.id ? updatedCourse : c);
    setCourses(newCourses); setSelectedCourse(updatedCourse);
    alert(`問題セット「${newQuizData.title}」を追加しました！`);
  };

  const handleCreateQuiz = () => {
    const newQuiz = { id: `quiz-${generateId()}`, title: '新規問題セット', description: '', questions: [] };
    setSelectedQuiz(newQuiz); setView('edit_quiz');
  };

  const handleSaveQuiz = (updatedQuiz) => {
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex === -1) return;
    const newCourses = [...courses];
    const quizIndex = newCourses[courseIndex].quizzes.findIndex(q => q.id === updatedQuiz.id);
    if (quizIndex > -1) newCourses[courseIndex].quizzes[quizIndex] = updatedQuiz;
    else newCourses[courseIndex].quizzes.push(updatedQuiz);
    setCourses(newCourses); setSelectedCourse(newCourses[courseIndex]); setView('course'); setSelectedQuiz(null);
  };

  const handleDeleteQuiz = (quizId) => {
    if (!confirm('この問題セットを削除しますか？')) return;
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    const newCourses = [...courses];
    newCourses[courseIndex].quizzes = newCourses[courseIndex].quizzes.filter(q => q.id !== quizId);
    setCourses(newCourses); setSelectedCourse(newCourses[courseIndex]);
  };

  const startQuiz = (randomize, shuffleOptions, immediateFeedback) => {
    setGameSettings({ randomize, shuffleOptions, immediateFeedback });
    setView('quiz_play');
  };

  const finishQuiz = (answers, totalTime) => {
    const xpGained = calculateXpGain({ answers, totalTime });
    
    const today = new Date().toDateString();
    let newStreak = userStats.streak;
    let isStreakUpdated = false;

    if (userStats.lastLogin !== today) {
      if (!userStats.lastLogin) {
        newStreak = 1;
      } else {
        const last = new Date(userStats.lastLogin);
        const now = new Date();
        const diffTime = Math.abs(now - last);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays === 1) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }
      isStreakUpdated = true;
    }

    setUserStats(prev => ({
      ...prev,
      totalXp: prev.totalXp + xpGained,
      streak: isStreakUpdated ? newStreak : prev.streak,
      lastLogin: today
    }));

    const resultWithXp = { 
      answers, 
      totalTime,
      xpGained, 
      currentLevel: levelInfo.level,
      isLevelUp: getLevelInfo(userStats.totalXp + xpGained).level > levelInfo.level,
      streakInfo: isStreakUpdated ? { days: newStreak, isUpdated: true } : null
    };

    setResultData(resultWithXp);
    setView('result');
    
    const currentWrongs = answers.filter(a => !a.isCorrect).map(a => a.question.id);
    const currentCorrects = answers.filter(a => a.isCorrect).map(a => a.question.id);
    const isReview = selectedQuiz?.id === 'review-mode';

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
  };
  
  const clearHistory = () => {
    if (confirm('復習リストをリセットしますか？')) {
      setWrongHistory([]);
      goHome();
    }
  };

  const handleResetStats = () => {
    if(confirm("【デバッグ用】\nステータス（レベル・XP・ストリーク）を初期化しますか？\n（レベル1・ストリーク0に戻ります）")) {
       setUserStats({ totalXp: 0, level: 1, streak: 0, lastLogin: '' });
       alert("ステータスをリセットしました。");
    }
  };

  return (
    <div className={`min-h-screen font-sans text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 transition-colors duration-200`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={goHome}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white p-2 rounded-lg shadow-md transform transition-transform hover:scale-105">
              <BookOpen size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none">Study Master</h1>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest truncate max-w-[120px]">
                {currentTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
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
                  style={{ width: `${(levelInfo.currentXp / levelInfo.xpForNextLevel) * 100}%` }}
                ></div>
                {/* 保存中インジケータ */}
                {isSyncing && (
                   <div className="absolute inset-0 bg-white/50 animate-pulse flex items-center justify-center">
                     <div className="w-full h-full bg-blue-400 blur-sm"></div>
                   </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setView('stats')} 
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                title="プレイヤーデータ"
              >
                <BarChart2 size={20} />
              </button>

              <button onClick={() => setShowChangelog(true)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="更新情報"><Bell size={20} /></button>
              
              <button 
                onClick={() => setView('settings')} 
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  user ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                title="設定"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {view !== 'home' && view !== 'settings' && view !== 'stats' && view !== 'create_course' && view !== 'edit_course' && (
          <Breadcrumbs path={getPath()} onNavigate={handleBreadcrumbNavigate} />
        )}

        <div className="animate-fade-in">
          {view === 'home' && (
            <>
              <div className="sm:hidden mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center animate-slide-up">
                <div className="flex items-center">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg mr-3 text-yellow-600 dark:text-yellow-400">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">現在のレベル</div>
                    <div className="text-lg font-black text-gray-800 dark:text-white">Lv.{levelInfo.level}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">連続学習</div>
                    <div className="text-lg font-black text-gray-800 dark:text-white">{userStats.streak}日</div>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                    <Flame size={20} />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white animate-slide-up delay-75">科目の選択</h2>
              
              {/* ★ ここだ！ Propsが大幅に減ったのがわかるか？ */}
              <FolderListView 
                onSelectCourse={(c) => { setSelectedCourse(c); setView('course'); }} 
                onCreateCourse={() => setView('create_course')} 
                onEditCourse={handleEditCourseRequest}
              />
            </>
          )}

          {view === 'stats' && (
            <StatsView 
              userStats={userStats} 
              errorStats={errorStats} 
              courses={courses} 
              onBack={goHome} 
            />
          )}

          {view === 'settings' && (
            <SettingsView 
              theme={theme} 
              changeTheme={setTheme} 
              onBack={goHome} 
              courses={courses} 
              onImportData={handleImportBackup} 
              onResetStats={handleResetStats}
              user={user}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          )}
          
          {view === 'create_course' && <CreateCourseModal onClose={goHome} onSave={handleCreateCourse} />}
          
          {view === 'edit_course' && (
            <CreateCourseModal 
              onClose={goHome} 
              onSave={handleUpdateCourse} 
              initialData={courseToEdit} 
            />
          )}
          
          {view === 'course' && selectedCourse && (
            <>
              <div className="mb-6 animate-slide-up">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedCourse.title}</h2>
                <p className="text-gray-500 dark:text-gray-400">{selectedCourse.description}</p>
              </div>
              <QuizListView 
                course={selectedCourse} 
                onSelectQuiz={(q) => { setSelectedQuiz(q); setView('quiz_menu'); }} 
                wrongHistory={wrongHistory} 
                onSelectReview={(q) => { setSelectedQuiz(q); setView('quiz_menu'); }} 
                onCreateQuiz={handleCreateQuiz} 
                onDeleteQuiz={handleDeleteQuiz}
                onImportQuiz={handleImportQuiz}
              />
            </>
          )}
          {view === 'edit_quiz' && <QuizEditor quiz={selectedQuiz} onSave={handleSaveQuiz} onCancel={() => { setView('course'); setSelectedQuiz(null); }} />}
          {view === 'quiz_menu' && selectedQuiz && <QuizMenuView quiz={selectedQuiz} onStart={startQuiz} isReviewMode={selectedQuiz.id === 'review-mode'} onClearHistory={clearHistory} onEdit={selectedQuiz.isMock || selectedQuiz.id === 'review-mode' ? null : () => setView('edit_quiz')} />}
          
          {view === 'quiz_play' && selectedQuiz && (
            <GameView 
              quiz={selectedQuiz} 
              isRandom={gameSettings.randomize} 
              shuffleOptions={gameSettings.shuffleOptions} 
              immediateFeedback={gameSettings.immediateFeedback}
              onFinish={finishQuiz} 
            />
          )}
          
          {view === 'result' && resultData && <ResultView resultData={resultData} onRetry={() => startQuiz(gameSettings.randomize, gameSettings.shuffleOptions, gameSettings.immediateFeedback)} onBackToMenu={() => setView('course')} />}
        </div>
      </main>
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );
}