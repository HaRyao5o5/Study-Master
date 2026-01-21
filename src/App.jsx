// src/App.jsx
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Settings, Bell, Trophy, Flame, BarChart2
} from 'lucide-react';
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';

// Firebase imports
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./lib/firebase";

import { generateId } from './utils/helpers';
import { getLevelInfo, calculateXpGain, getUnlockedTitles } from './utils/gamification';

import Breadcrumbs from './components/common/Breadcrumbs';
import LoadingScreen from './components/common/LoadingScreen';
import FolderListView from './components/course/FolderListView';
import QuizListView from './components/course/QuizListView';
import CreateCourseModal from './components/course/CreateCourseModal';
import QuizEditor from './components/editor/QuizEditor';
import QuizMenuView from './components/course/QuizMenuView';
import GameView from './components/game/GameView';
import ResultView from './components/game/ResultView';
import SettingsView from './components/layout/SettingsView';
import ChangelogModal from './components/layout/ChangelogModal';
import StatsView from './components/layout/StatsView';
import SharedCourseView from './components/course/SharedCourseView';

// Context
import { useApp } from './context/AppContext';

// --- ルート用コンポーネント ---

const CoursePage = ({ wrongHistory, onCreateQuiz, onDeleteQuiz, onImportQuiz }) => {
  const { courseId } = useParams();
  const { courses } = useApp();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === courseId);
  
  if (!course) return <div className="p-8 text-center">コースが見つかりません</div>;

  return (
    <>
      <div className="mb-6 animate-slide-up">
        <Breadcrumbs path={[{ title: course.title, id: course.id, type: 'course' }]} onNavigate={() => navigate('/')} />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">{course.title}</h2>
        <p className="text-gray-500 dark:text-gray-400">{course.description}</p>
      </div>
      <QuizListView 
        course={course} 
        onSelectQuiz={(q) => navigate(`/course/${course.id}/quiz/${q.id}`)} 
        wrongHistory={wrongHistory} 
        onSelectReview={() => navigate(`/course/${course.id}/quiz/review-mode`)}
        onCreateQuiz={() => onCreateQuiz(course.id)}
        onDeleteQuiz={(qid) => onDeleteQuiz(qid, course.id)}
        onImportQuiz={(q) => onImportQuiz(q, course.id)}
      />
    </>
  );
};

const QuizMenuPage = ({ wrongHistory, onStart, onClearHistory }) => {
  const { courseId, quizId } = useParams();
  const { courses } = useApp();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === courseId);

  if (!course) return <div>コースが見つかりません</div>;
  
  let quiz;
  if (quizId === 'review-mode') {
    const wrongQuestions = [];
    courses.forEach(c => c.quizzes.forEach(q => q.questions.forEach(ques => {
      if (wrongHistory.includes(ques.id)) wrongQuestions.push(ques);
    })));
    quiz = { id: 'review-mode', title: '弱点克服（復習）', description: '間違えた問題のみ出題されます', questions: wrongQuestions };
  } else {
    quiz = course.quizzes.find(q => q.id === quizId);
  }

  if (!quiz) return <div>問題セットが見つかりません</div>;

  const path = [
    { title: course.title, id: course.id, type: 'course' },
    { title: quiz.title, id: quiz.id, type: 'quiz_menu' }
  ];

  return (
    <>
      <Breadcrumbs path={path} onNavigate={(type, id) => { if(type === 'home') navigate('/'); if(type === 'course') navigate(`/course/${courseId}`); }} />
      <QuizMenuView 
        quiz={quiz} 
        onStart={(rand, shuf, imm) => onStart(courseId, quizId, rand, shuf, imm)} 
        isReviewMode={quizId === 'review-mode'} 
        onClearHistory={onClearHistory} 
        onEdit={quizId === 'review-mode' ? null : () => navigate(`/course/${courseId}/quiz/${quizId}/edit`)} 
      />
    </>
  );
};

const GamePage = ({ gameSettings, wrongHistory, onFinish }) => {
  const { courseId, quizId } = useParams();
  const { courses } = useApp();
  const course = courses.find(c => c.id === courseId);
  
  let quiz;
  if (quizId === 'review-mode') {
    const wrongQuestions = [];
    courses.forEach(c => c.quizzes.forEach(q => q.questions.forEach(ques => {
      if (wrongHistory.includes(ques.id)) wrongQuestions.push(ques);
    })));
    quiz = { id: 'review-mode', title: '弱点克服', questions: wrongQuestions };
  } else {
    quiz = course?.quizzes.find(q => q.id === quizId);
  }

  if (!quiz) return <Navigate to="/" />;

  return (
    <GameView 
      quiz={quiz} 
      isRandom={gameSettings.randomize} 
      shuffleOptions={gameSettings.shuffleOptions} 
      immediateFeedback={gameSettings.immediateFeedback} 
      onFinish={(ans, time) => onFinish(ans, time, courseId, quizId)} 
    />
  );
};

const ResultPage = ({ resultData, gameSettings, onRetry }) => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();

  if (!resultData) return <Navigate to={`/course/${courseId}`} />;

  return (
    <ResultView 
      resultData={resultData} 
      onRetry={() => onRetry(courseId, quizId, gameSettings.randomize, gameSettings.shuffleOptions, gameSettings.immediateFeedback)} 
      onBackToMenu={() => navigate(`/course/${courseId}`)} 
    />
  );
};

const EditQuizPage = ({ onSave }) => {
  const { courseId, quizId } = useParams();
  const { courses } = useApp();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === courseId);
  const quiz = course?.quizzes.find(q => q.id === quizId);

  if (!course || !quiz) return <Navigate to="/" />;

  return (
    <QuizEditor 
      quiz={quiz} 
      onSave={(updated) => onSave(updated, courseId)} 
      onCancel={() => navigate(`/course/${courseId}/quiz/${quizId}`)} 
    />
  );
};

const CreateQuizPage = ({ onSave }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const newQuiz = { id: `quiz-${generateId()}`, title: '新規問題セット', description: '', questions: [] };

  return (
    <QuizEditor 
      quiz={newQuiz} 
      onSave={(updated) => onSave(updated, courseId)} 
      onCancel={() => navigate(`/course/${courseId}`)} 
    />
  );
};


// --- メイン App コンポーネント ---

export default function App() {
  const [gameSettings, setGameSettings] = useState({ randomize: false, shuffleOptions: false, immediateFeedback: false });
  const [resultData, setResultData] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('study-master-theme') || 'system';
    return 'system';
  });

  const { 
    user, isSyncing, 
    courses, setCourses, 
    userStats, setUserStats, 
    wrongHistory, setWrongHistory, 
    errorStats, setErrorStats 
  } = useApp();

  const navigate = useNavigate();
  
  // ★ ヘッダーEXPバー計算用の安全なロジック
  const levelInfo = getLevelInfo(userStats.totalXp);
  // 分母が0にならないように保護し、100%を超えないようにclampする
  const xpPercentage = Math.min(100, Math.max(0, (levelInfo.currentXp / (levelInfo.xpForNextLevel || 1)) * 100));

  const titles = getUnlockedTitles(userStats);
  const currentTitle = titles.length > 0 ? titles[titles.length - 1].name : "駆け出しの学習者";

  useEffect(() => {
    if (!isSyncing) {
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [isSyncing]);

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

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (error) { console.error("Login failed:", error); alert("ログインに失敗しました。"); }
  };

  const handleLogout = async () => {
    try { if(confirm("ログアウトしますか？")) { await signOut(auth); alert("ログアウトしました。"); } } 
    catch (error) { console.error("Logout failed:", error); }
  };

  const handleCreateCourse = (title, desc, visibility) => {
    const newCourse = { 
      id: `course-${generateId()}`, 
      title, 
      description: desc, 
      visibility: visibility || 'private',
      quizzes: [] 
    };
    setCourses([...courses, newCourse]);
    navigate('/');
  };

  const handleEditCourseRequest = (course) => { 
    setCourseToEdit(course); 
    navigate('/edit-course');
  };

  const handleUpdateCourse = (title, desc, visibility) => {
    const updatedCourses = courses.map(c => 
      c.id === courseToEdit.id 
        ? { ...c, title, description: desc, visibility: visibility || 'private' } 
        : c
    );
    setCourses(updatedCourses); 
    setCourseToEdit(null); 
    navigate('/');
  };

  const handleImportBackup = (importedData) => {
    try {
      if (!Array.isArray(importedData)) { alert('データの形式が正しくありません。'); return; }
      if (confirm('現在のデータを上書きして、バックアップから復元しますか？')) {
        setCourses(importedData); 
        alert('データの復元が完了しました！'); 
        navigate('/');
      }
    } catch (e) { console.error(e); alert('読み込みに失敗しました。'); }
  };

  const handleImportQuiz = (newQuizData, courseId) => {
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return;
    const updatedCourse = { ...courses[courseIndex], quizzes: [...courses[courseIndex].quizzes, newQuizData] };
    const newCourses = [...courses];
    newCourses[courseIndex] = updatedCourse;
    setCourses(newCourses);
    alert(`問題セット「${newQuizData.title}」を追加しました！`);
  };

  const handleCreateQuiz = (courseId) => {
    navigate(`/course/${courseId}/create-quiz`);
  };

  const handleSaveQuiz = (updatedQuiz, courseId) => {
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return;
    const newCourses = [...courses];
    const quizIndex = newCourses[courseIndex].quizzes.findIndex(q => q.id === updatedQuiz.id);
    
    if (quizIndex > -1) newCourses[courseIndex].quizzes[quizIndex] = updatedQuiz;
    else newCourses[courseIndex].quizzes.push(updatedQuiz);
    
    setCourses(newCourses);
    navigate(`/course/${courseId}`);
  };

  const handleDeleteQuiz = (quizId, courseId) => {
    if (!confirm('この問題セットを削除しますか？')) return;
    const courseIndex = courses.findIndex(c => c.id === courseId);
    const newCourses = [...courses];
    newCourses[courseIndex].quizzes = newCourses[courseIndex].quizzes.filter(q => q.id !== quizId);
    setCourses(newCourses);
  };

  const startQuiz = (courseId, quizId, randomize, shuffleOptions, immediateFeedback) => {
    setGameSettings({ randomize, shuffleOptions, immediateFeedback });
    navigate(`/course/${courseId}/quiz/${quizId}/play`);
  };

  const finishQuiz = (answers, totalTime, courseId, quizId) => {
    const xpGained = calculateXpGain({ answers, totalTime });
    
    const today = new Date().toDateString();
    let newStreak = userStats.streak;
    let isStreakUpdated = false;
    let newLastLogin = userStats.lastLogin;

    if (userStats.lastLogin !== today) {
      if (!userStats.lastLogin) {
        newStreak = 1;
      } else {
        const last = new Date(userStats.lastLogin);
        const current = new Date(today);
        
        const diffTime = Math.abs(current - last);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
            newStreak += 1;
        } else {
            newStreak = 1;
        }
      }
      isStreakUpdated = true;
      newLastLogin = today;
    }

    // ★ 修正ポイント1: 先にリザルトデータを作成して遷移させる
    const resultWithXp = { 
      answers, totalTime, xpGained, 
      currentLevel: levelInfo.level,
      isLevelUp: getLevelInfo(userStats.totalXp + xpGained).level > levelInfo.level,
      streakInfo: isStreakUpdated ? { days: newStreak, isUpdated: true } : null
    };

    setResultData(resultWithXp);
    navigate(`/course/${courseId}/quiz/${quizId}/result`);

    // ★ 修正ポイント2: 画面遷移から少し遅らせてグローバルEXPを更新する（フライング防止）
    // ResultViewのアニメーション準備ができる頃(0.6秒後)にヘッダーを増やす
    setTimeout(() => {
        setUserStats(prev => ({
          ...prev,
          totalXp: prev.totalXp + xpGained,
          streak: isStreakUpdated ? newStreak : prev.streak,
          lastLogin: newLastLogin
        }));
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
  };
  
  const clearHistory = () => {
    if (confirm('復習リストをリセットしますか？')) {
      setWrongHistory([]);
      navigate('/');
    }
  };

  const handleResetStats = () => {
    if(confirm("【デバッグ用】ステータスを初期化しますか？")) {
       setUserStats({ totalXp: 0, level: 1, streak: 0, lastLogin: '' });
       alert("ステータスをリセットしました。");
    }
  };

  const handleDebugYesterday = () => {
    if(confirm("【デバッグ用】最終ログイン日を「昨日」に設定しますか？\n(streakも1に戻ります)")) {
       const yesterday = new Date();
       yesterday.setDate(yesterday.getDate() - 1);
       
       setUserStats(prev => ({
         ...prev,
         streak: 1,
         lastLogin: yesterday.toDateString()
       }));
       alert("最終ログイン日を昨日に変更しました！\nクイズをクリアして連続記録を確認してください。");
    }
  };

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

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
            <div className="hidden sm:flex flex-col items-end mr-2">
              <div className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-200">
                <Trophy size={14} className="text-yellow-500 mr-1" />
                <span>Lv.{levelInfo.level}</span>
                <span className="mx-2 text-gray-300">|</span>
                <Flame size={14} className="text-orange-500 mr-1" />
                <span>{userStats.streak}日連続</span>
              </div>
              <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden relative">
                {/* ★ 修正ポイント3: 安全なパーセンテージ計算結果を使用 */}
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
                <div className="sm:hidden mb-6 glass p-4 rounded-xl shadow-sm flex justify-between items-center animate-slide-up">
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
            
            <Route path="/course/:courseId" element={
              <CoursePage 
                wrongHistory={wrongHistory} 
                onCreateQuiz={handleCreateQuiz} 
                onDeleteQuiz={handleDeleteQuiz} 
                onImportQuiz={handleImportQuiz}
              />
            } />
            
            <Route path="/course/:courseId/quiz/:quizId" element={
              <QuizMenuPage 
                wrongHistory={wrongHistory} 
                onStart={startQuiz} 
                onClearHistory={clearHistory} 
              />
            } />
            
            <Route path="/course/:courseId/quiz/:quizId/play" element={
              <GamePage 
                gameSettings={gameSettings} 
                wrongHistory={wrongHistory} 
                onFinish={finishQuiz} 
              />
            } />
            
            <Route path="/course/:courseId/quiz/:quizId/result" element={
              <ResultPage 
                resultData={resultData} 
                gameSettings={gameSettings} 
                onRetry={startQuiz} 
              />
            } />
            
            <Route path="/course/:courseId/quiz/:quizId/edit" element={
              <EditQuizPage onSave={handleSaveQuiz} />
            } />
            
            <Route path="/course/:courseId/create-quiz" element={
              <CreateQuizPage onSave={handleSaveQuiz} />
            } />

            <Route path="*" element={<div className="text-center p-10">ページが見つかりません (404)</div>} />
          </Routes>
        </div>
      </main>

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );
}