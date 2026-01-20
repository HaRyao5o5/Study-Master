// src/App.jsx
import React, { useState, useEffect } from 'react';
import { 
  Folder, FileText, ChevronRight, Play, Settings, Clock, 
  CheckCircle, XCircle, RotateCcw, Home, ArrowLeft, Layers, 
  Brain, Target, Trash2, Lock, Shuffle, Moon, Sun, Monitor, 
  GraduationCap, Plus, Edit3, Image as ImageIcon, X, Save, Type, List,
  BookOpen, Zap, CheckSquare, MinusCircle, PlusCircle, Bell, Info,
  Trophy, Star, Flame // ← アイコン追加
} from 'lucide-react';

import { normalizeData, generateId } from './utils/helpers';
import { INITIAL_DATA } from './data/initialData';
import { getLevelInfo, calculateXpGain, getUnlockedTitles } from './utils/gamification'; // ← インポート追加

import Breadcrumbs from './components/common/Breadcrumbs';
import FolderListView from './components/course/FolderListView';
import QuizListView from './components/course/QuizListView';
import CreateCourseModal from './components/course/CreateCourseModal';
import QuizEditor from './components/editor/QuizEditor';
import QuizMenuView from './components/course/QuizMenuView';
import GameView from './components/game/GameView';
import ResultView from './components/game/ResultView';
import SettingsView from './components/layout/SettingsView';
import ChangelogModal from './components/layout/ChangelogModal';

export default function App() {
  const [view, setView] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [gameSettings, setGameSettings] = useState({ randomize: false, shuffleOptions: false, immediateFeedback: false });
  const [resultData, setResultData] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);

  // ★ ユーザーのゲーミフィケーション・ステータス (NEW)
  const [userStats, setUserStats] = useState(() => {
    try {
      const saved = localStorage.getItem('study-master-stats');
      return saved ? JSON.parse(saved) : { totalXp: 0, level: 1, streak: 1, lastLogin: new Date().toDateString() };
    } catch (e) { return { totalXp: 0, level: 1, streak: 1, lastLogin: new Date().toDateString() }; }
  });

  // レベル情報の計算
  const levelInfo = getLevelInfo(userStats.totalXp);

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

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('study-master-theme') || 'system';
    return 'system';
  });

  useEffect(() => { localStorage.setItem('study-master-data', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('study-master-wrong-history', JSON.stringify(wrongHistory)); }, [wrongHistory]);
  useEffect(() => { localStorage.setItem('study-master-error-stats', JSON.stringify(errorStats)); }, [errorStats]);
  useEffect(() => { localStorage.setItem('study-master-stats', JSON.stringify(userStats)); }, [userStats]); // ← ステータス保存

  // ★ ログインボーナス (ストリーク) 判定
  useEffect(() => {
    const today = new Date().toDateString();
    if (userStats.lastLogin !== today) {
      const last = new Date(userStats.lastLogin);
      const now = new Date();
      const diffTime = Math.abs(now - last);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      let newStreak = userStats.streak;
      if (diffDays === 1) {
        newStreak += 1; // 連続ログイン
      } else if (diffDays > 1) {
        newStreak = 1; // 途切れた
      }

      setUserStats(prev => ({ ...prev, streak: newStreak, lastLogin: today }));
    }
  }, []); // 初回起動時のみチェック

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

  // ... (コース作成・インポート系の関数は変更なし) ...
  const handleCreateCourse = (title, desc) => {
    const newCourse = { id: `course-${generateId()}`, title, description: desc, quizzes: [] };
    setCourses([...courses, newCourse]);
    setView('home');
  };

  const handleImportBackup = (importedData) => {
    try {
      if (!Array.isArray(importedData)) { alert('データの形式が正しくありません。'); return; }
      const normalized = normalizeData(importedData);
      if (confirm('現在のデータを上書きして、バックアップから復元しますか？\n（現在のデータは消えます！）')) {
        setCourses(normalized); alert('データの復元が完了しました！'); goHome();
      }
    } catch (e) { console.error(e); alert('読み込みに失敗しました。'); }
  };

  const handleImportCourse = (newCourseData) => { setCourses([...courses, newCourseData]); alert(`科目フォルダ「${newCourseData.title}」を追加しました！`); };

  const handleImportQuiz = (newQuizData) => {
    if (!selectedCourse) return;
    const updatedCourse = { ...selectedCourse, quizzes: [...selectedCourse.quizzes, newQuizData] };
    const newCourses = courses.map(c => c.id === selectedCourse.id ? updatedCourse : c);
    setCourses(newCourses); setSelectedCourse(updatedCourse);
    alert(`問題セット「${newQuizData.title}」を追加しました！`);
  };

  const handleEditCourseRequest = (course) => { setCourseToEdit(course); setView('edit_course'); };

  const handleUpdateCourse = (title, desc) => {
    const updatedCourses = courses.map(c => c.id === courseToEdit.id ? { ...c, title, description: desc } : c);
    setCourses(updatedCourses); setCourseToEdit(null); setView('home');
  };

  const handleDeleteCourse = (id) => {
    if (confirm('このフォルダを削除しますか？中の問題もすべて消えます。')) {
      setCourses(courses.filter(c => c.id !== id));
    }
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

  // ★ クイズ終了時の処理 (XP加算ロジック追加)
  const finishQuiz = (answers, totalTime) => {
    // 1. まずXPを計算
    const xpGained = calculateXpGain({ answers, totalTime });
    
    // 2. ステータス更新
    setUserStats(prev => ({
      ...prev,
      totalXp: prev.totalXp + xpGained
    }));

    // 3. 結果データにXP情報を含める (ResultViewで表示するため)
    const resultWithXp = { 
      answers, 
      totalTime,
      xpGained, 
      currentLevel: levelInfo.level,
      // クイズ終了直後の合計XPで次のレベル判定をするため、ここで計算
      isLevelUp: getLevelInfo(userStats.totalXp + xpGained).level > levelInfo.level 
    };

    setResultData(resultWithXp);
    setView('result');
    
    // 以下、復習リストの更新ロジック (既存)
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

  // 現在の称号を取得 (一番いい称号を表示用)
  const titles = getUnlockedTitles(userStats);
  const currentTitle = titles.length > 0 ? titles[titles.length - 1].name : "駆け出しの学習者";

  return (
    <div className={`min-h-screen font-sans text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 transition-colors duration-200`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* 左側: ロゴと称号 */}
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

          {/* 右側: ステータスバーとアイコン */}
          <div className="flex items-center space-x-4">
            
            {/* ★ ゲーミフィケーション表示エリア (PCのみ) */}
            <div className="hidden sm:flex flex-col items-end mr-2">
              <div className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-200">
                <Trophy size={14} className="text-yellow-500 mr-1" />
                <span>Lv.{levelInfo.level}</span>
                <span className="mx-2 text-gray-300">|</span>
                <Flame size={14} className="text-orange-500 mr-1" />
                <span>{userStats.streak}日連続</span>
              </div>
              {/* XPバー */}
              <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500" 
                  style={{ width: `${(levelInfo.currentXp / levelInfo.xpForNextLevel) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button onClick={() => setShowChangelog(true)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="更新情報"><Bell size={20} /></button>
              <button onClick={() => setView('settings')} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="設定"><Settings size={20} /></button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {view !== 'home' && view !== 'settings' && view !== 'create_course' && view !== 'edit_course' && (
          <Breadcrumbs path={getPath()} onNavigate={handleBreadcrumbNavigate} />
        )}

        <div className="animate-fade-in">
          {view === 'home' && (
            <>
              {/* スマホ用ステータス表示 (ヘッダーに入りきらないためここに表示) */}
              <div className="sm:hidden mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
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

              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">科目の選択</h2>
              <FolderListView 
                courses={courses} 
                onSelectCourse={(c) => { setSelectedCourse(c); setView('course'); }} 
                onCreateCourse={() => setView('create_course')} 
                onDeleteCourse={handleDeleteCourse}
                onEditCourse={handleEditCourseRequest}
                onImportCourse={handleImportCourse}
              />
            </>
          )}
          {view === 'settings' && <SettingsView theme={theme} changeTheme={setTheme} onBack={goHome} courses={courses} onImportData={handleImportBackup} />}
          
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
              <div className="mb-6"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedCourse.title}</h2><p className="text-gray-500 dark:text-gray-400">{selectedCourse.description}</p></div>
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
          
          {/* ★ 結果画面にXP情報を渡す */}
          {view === 'result' && resultData && <ResultView resultData={resultData} onRetry={() => startQuiz(gameSettings.randomize, gameSettings.shuffleOptions, gameSettings.immediateFeedback)} onBackToMenu={() => setView('course')} />}
        </div>
      </main>
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );
}