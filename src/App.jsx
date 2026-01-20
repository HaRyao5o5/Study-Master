import React, { useState, useEffect } from 'react';
import { 
  Folder, FileText, ChevronRight, Play, Settings, Clock, 
  CheckCircle, XCircle, RotateCcw, Home, ArrowLeft, Layers, 
  Brain, Target, Trash2, Lock, Shuffle, Moon, Sun, Monitor, 
  GraduationCap, Plus, Edit3, Image as ImageIcon, X, Save, Type, List,
  BookOpen, Zap, CheckSquare, MinusCircle, PlusCircle, Bell, Info
} from 'lucide-react';

import { normalizeData, generateId } from './utils/helpers';
import { INITIAL_DATA } from './data/initialData';

import Breadcrumbs from './components/common/Breadcrumbs';
import FolderListView from './components/course/FolderListView';
import QuizListView from './components/course/QuizListView';
import CreateCourseModal from './components/course/CreateCourseModal';
import QuizEditor from './components/editor/QuizEditor';
import QuizMenuView from './components/course/QuizMenuView';
import GameView from './components/game/GameView';
import ResultView from './components/game/ResultView';
import SettingsView from './components/layout/SettingsView';

// Changelog Modal
const ChangelogModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center"><Info size={24} className="mr-2 text-blue-600" /> 更新情報</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500 dark:text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center mb-2"><span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mr-2">Latest</span><h3 className="font-bold text-lg text-gray-800 dark:text-white">v2.1.0 - 多機能化アップデート</h3></div>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-1">
              <li>複数選択（チェックボックス）形式の問題に対応しました。</li>
              <li>選択肢の数を自由に設定できるようになりました（2つ以上）。</li>
              <li>記述式問題で複数の正解（別解）を設定できるようになりました。</li>
              <li>既存のデータ構造を新形式へ自動変換する機能を追加しました。</li>
              <li>UIの微調整（フォルダ名の表示崩れ修正など）を行いました。</li>
            </ul>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h3 className="font-bold text-md text-gray-700 dark:text-gray-200 mb-2">v2.0.0 - クリエイター機能実装</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-1">
              <li>自分でフォルダや問題セットを作成・編集できる機能を追加しました。</li>
              <li>画像付き問題の作成に対応しました。</li>
              <li>ダークモード/ライトモードの手動・システム切り替えに対応しました。</li>
            </ul>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h3 className="font-bold text-md text-gray-700 dark:text-gray-200 mb-2">v1.2.0 - 学習機能強化</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-1">
              <li>実力診断模試（ランダム出題）機能を追加しました。</li>
              <li>間違えた問題を復習できる「弱点克服モード」を追加しました。</li>
              <li>学習履歴の保存機能を追加しました。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [gameSettings, setGameSettings] = useState({ randomize: false, shuffleOptions: false });
  const [resultData, setResultData] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);

  // Define nav functions BEFORE return and before other components might need them
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

  const handleCreateCourse = (title, desc) => {
    const newCourse = { id: `course-${generateId()}`, title, description: desc, quizzes: [] };
    setCourses([...courses, newCourse]);
    setView('home');
  };

  const handleDeleteCourse = (id) => {
    if (confirm('このフォルダを削除しますか？中の問題もすべて消えます。')) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const handleCreateQuiz = () => {
    const newQuiz = { id: `quiz-${generateId()}`, title: '新規問題セット', description: '', questions: [] };
    setSelectedQuiz(newQuiz);
    setView('edit_quiz');
  };

  const handleSaveQuiz = (updatedQuiz) => {
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex === -1) return;
    const newCourses = [...courses];
    const quizIndex = newCourses[courseIndex].quizzes.findIndex(q => q.id === updatedQuiz.id);
    if (quizIndex > -1) newCourses[courseIndex].quizzes[quizIndex] = updatedQuiz;
    else newCourses[courseIndex].quizzes.push(updatedQuiz);
    setCourses(newCourses);
    setSelectedCourse(newCourses[courseIndex]);
    setView('course');
    setSelectedQuiz(null);
  };

  const handleDeleteQuiz = (quizId) => {
    if (!confirm('この問題セットを削除しますか？')) return;
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    const newCourses = [...courses];
    newCourses[courseIndex].quizzes = newCourses[courseIndex].quizzes.filter(q => q.id !== quizId);
    setCourses(newCourses);
    setSelectedCourse(newCourses[courseIndex]);
  };

  const startQuiz = (randomize, shuffleOptions) => {
    setGameSettings({ randomize, shuffleOptions });
    setView('quiz_play');
  };

  const finishQuiz = (answers, totalTime) => {
    setResultData({ answers, totalTime });
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

  return (
    <div className={`min-h-screen font-sans text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 transition-colors duration-200`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={goHome}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white p-2 rounded-lg shadow-md transform transition-transform hover:scale-105">
              <BookOpen size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none">Study Master</h1>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Professional</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowChangelog(true)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="更新情報"><Bell size={20} /></button>
            <button onClick={() => setView('settings')} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="設定"><Settings size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {view !== 'home' && view !== 'settings' && view !== 'create_course' && (
          <Breadcrumbs path={getPath()} onNavigate={handleBreadcrumbNavigate} />
        )}

        <div className="animate-fade-in">
          {view === 'home' && <><h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">科目の選択</h2><FolderListView courses={courses} onSelectCourse={(c) => { setSelectedCourse(c); setView('course'); }} onCreateCourse={() => setView('create_course')} onDeleteCourse={handleDeleteCourse} /></>}
          {view === 'settings' && <SettingsView theme={theme} changeTheme={setTheme} onBack={goHome} />}
          {view === 'create_course' && <CreateCourseModal onClose={goHome} onSave={handleCreateCourse} />}
          {view === 'course' && selectedCourse && <><div className="mb-6"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedCourse.title}</h2><p className="text-gray-500 dark:text-gray-400">{selectedCourse.description}</p></div><QuizListView course={selectedCourse} onSelectQuiz={(q) => { setSelectedQuiz(q); setView('quiz_menu'); }} wrongHistory={wrongHistory} onSelectReview={(q) => { setSelectedQuiz(q); setView('quiz_menu'); }} onCreateQuiz={handleCreateQuiz} onDeleteQuiz={handleDeleteQuiz} /></>}
          {view === 'edit_quiz' && <QuizEditor quiz={selectedQuiz} onSave={handleSaveQuiz} onCancel={() => { setView('course'); setSelectedQuiz(null); }} />}
          {view === 'quiz_menu' && selectedQuiz && <QuizMenuView quiz={selectedQuiz} onStart={startQuiz} isReviewMode={selectedQuiz.id === 'review-mode'} onClearHistory={clearHistory} onEdit={selectedQuiz.isMock || selectedQuiz.id === 'review-mode' ? null : () => setView('edit_quiz')} />}
          {view === 'quiz_play' && selectedQuiz && <GameView quiz={selectedQuiz} isRandom={gameSettings.randomize} shuffleOptions={gameSettings.shuffleOptions} onFinish={finishQuiz} />}
          {view === 'result' && resultData && <ResultView resultData={resultData} onRetry={() => startQuiz(gameSettings.randomize, gameSettings.shuffleOptions)} onBackToMenu={() => setView('course')} />}
        </div>
      </main>
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );
}