// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BookOpen, Settings, Bell, Trophy, Flame, BarChart3, User, LogIn, RefreshCw, Home, Moon, Sun, LogOut, Share2, Target } from 'lucide-react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Firebase imports
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';

const googleProvider = new GoogleAuthProvider();

import { generateId } from './utils/helpers';
import { getLevelInfo, calculateXpGain, getUnlockedTitles } from './utils/gamification';
import { checkAnswer } from './utils/helpers'; // Helperからインポート

import LoadingScreen from './components/common/LoadingScreen';
import FolderListView from './components/course/FolderListView';
import CreateCourseModal from './components/course/CreateCourseModal';
import SettingsView from './components/layout/SettingsView';
import ChangelogModal from './components/layout/ChangelogModal';
import StatsView from './components/layout/StatsView';
import SharedCourseView from './components/course/SharedCourseView';
import RankingView from './components/layout/RankingView';
import ReviewView from './components/layout/ReviewView';
import ProfileEditor from './components/profile/ProfileEditor';
import { getAvatarById } from './constants/avatars';
import InstallPrompt from './components/common/InstallPrompt';
import GoalSettingsModal from './components/common/GoalSettingsModal';
import GoalProgress from './components/common/GoalProgress';

// Page Components
import CoursePage from './pages/CoursePage';
import QuizMenuPage from './pages/QuizMenuPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import EditQuizPage from './pages/EditQuizPage';
import CreateQuizPage from './pages/CreateQuizPage';

// Context & Hooks
import { useApp } from './context/AppContext';
import { useAppData } from './hooks/useAppData';
import { useToast } from './context/ToastContext';
import { useTheme } from './hooks/useTheme';
import { handleError, SUCCESS } from './utils/errorMessages';


// --- メイン App コンポーネント ---
export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showChangelog, setShowChangelog] = useState(false);
  const [gameSettings, setGameSettings] = useState({ randomize: false, shuffleOptions: true, immediateFeedback: false });
  const [resultData, setResultData] = useState(null);

  const { theme, setTheme } = useTheme();

  const {
    user, isSyncing, saveError,
    courses, setCourses,
    userStats, setUserStats,
    wrongHistory, setWrongHistory,
    masteredQuestions, setMasteredQuestions,
    goals, setGoals,
    errorStats, setErrorStats,
    profile, hasProfile, updateProfile, isProfileLoading
  } = useAppData();

  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);

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
    finishQuiz: (userAnswers, totalTime, courseId, quizId) => {
      // 1. クイズデータの取得
      const course = courses.find(c => c.id === courseId);
      let currentQuiz;
      let isReviewMode = false;

      if (quizId === 'review-mode') {
        isReviewMode = true;
        const wrongQuestions = [];
        courses.forEach(c => c.quizzes.forEach(q => q.questions.forEach(ques => {
            if (wrongHistory.includes(ques.id)) wrongQuestions.push(ques);
        })));
        currentQuiz = { id: 'review-mode', title: '弱点克服', questions: wrongQuestions };
      } else {
        currentQuiz = course?.quizzes.find(q => q.id === quizId);
      }

      if (!currentQuiz) return;

      // 回答配列をマップに変換 (GameViewからは配列が渡されるため)
      const answerMap = {};
      if (Array.isArray(userAnswers)) {
        userAnswers.forEach(ans => {
          if (ans.question && ans.question.id) {
            answerMap[ans.question.id] = ans.selectedAnswer;
          }
        });
      } else {
        Object.assign(answerMap, userAnswers);
      }

      // 2. 結果の計算
      const results = currentQuiz.questions.map((q) => ({
        ...q,
        selectedAnswer: answerMap[q.id] || '',
        isCorrect: checkAnswer(q, answerMap[q.id])
      }));

      const score = results.filter(r => r.isCorrect).length;
      const totalQuestions = results.length;
      const percentage = Math.round((score / totalQuestions) * 100);
      const passed = percentage >= 70;

      // 3. XP計算
      let xpGained = 0;
      if (passed) {
        const baseXp = totalQuestions * 10;
        const bonusXp = percentage === 100 ? Math.floor(baseXp * 0.5) : 0;
        xpGained = baseXP + bonusXp; // Note: using variable defined below, wait, simple calc here
        xpGained = Math.round(baseXp + bonusXp);
      }
      
      const resultData = {
        score,
        totalQuestions,
        percentage,
        passed,
        xpGained,
        results,
        totalTime,
        answers: results // ResultView expects 'answers'
      };

      setResultData(resultData);

      // 復習モード: 正解した問題をマスター済みに追加
      if (isReviewMode && results && Array.isArray(results)) {
        const newMastered = { ...masteredQuestions };
        const courseId = window.location.pathname.split('/')[2];
        
        if (!newMastered[courseId]) {
          newMastered[courseId] = {};
        }

        results.forEach(result => {
          if (result && result.isCorrect && result.id) {
            newMastered[courseId][result.id] = true;
          }
        });

        setMasteredQuestions(newMastered);
      } else if (!isReviewMode && results && Array.isArray(results)) {
        // 通常モード: 間違えた問題をwrongHistoryに追加
        const wrongQuestionIds = results.filter(r => r && !r.isCorrect && r.id).map(r => r.id);
        if (wrongQuestionIds.length > 0) {
          const updatedWrongHistory = [...new Set([...wrongHistory, ...wrongQuestionIds])];
          setWrongHistory(updatedWrongHistory);
        }
      }
    

    // XP加算とレベルアップ処理
    if (xpGained > 0) {
      const newTotalXp = userStats.totalXp + xpGained;
      const newLevel = getLevelInfo(newTotalXp).level;
      const leveledUp = newLevel > userStats.level;

      setUserStats(prev => ({
        ...prev,
        totalXp: newTotalXp,
        level: newLevel
      }));

      // 学習目標の進捗更新
      setGoals(prev => {
        const newDailyProgress = prev.dailyProgress + xpGained;
        const newWeeklyProgress = prev.weeklyProgress + xpGained;
        
        const achievedToday = !prev.achievedToday && newDailyProgress >= prev.dailyXpGoal;
        const achievedThisWeek = !prev.achievedThisWeek && newWeeklyProgress >= prev.weeklyXpGoal;
        
        // 目標達成通知
        if (achievedToday) {
          setTimeout(() => showToast('🎯 今日の目標達成！おめでとう！', 'success'), 500);
        }
        if (achievedThisWeek) {
          setTimeout(() => showToast('🏆 今週の目標達成！素晴らしい！', 'success'), 800);
        }
        
        return {
          ...prev,
          dailyProgress: newDailyProgress,
          weeklyProgress: newWeeklyProgress,
          achievedToday: achievedToday || prev.achievedToday,
          achievedThisWeek: achievedThisWeek || prev.achievedThisWeek
        };
      });

      if (leveledUp) {
        showToast(`🎉 レベル${newLevel}にアップ！`, 'success');
      }
      state: { resultData, isReviewMode } 
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

  // 学習目標のリセット（日次・週次）
  useEffect(() => {
    if (!goals) return;
    
    const today = new Date().toDateString();
    const dayOfWeek = new Date().getDay(); // 0=日曜, 1=月曜
    
    let needsUpdate = false;
    const updates = {};
    
    // 日次リセット（日付が変わった場合）
    if (goals.lastResetDate !== today) {
      updates.dailyProgress = 0;
      updates.achievedToday = false;
      updates.lastResetDate = today;
      needsUpdate = true;
    }
    
    // 週次リセット（月曜日の場合）
    if (dayOfWeek === 1 && goals.lastWeekResetDate !== today) {
      updates.weeklyProgress = 0;
      updates.achievedThisWeek = false;
      updates.lastWeekResetDate = today;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      setGoals(prev => ({ ...prev, ...updates }));
    }
  }, [goals, setGoals]);

  // 初回ログイン時にプロフィール設定を促す（1回のみ）
  useEffect(() => {
    if (!user) return;
    
    // ローカルストレージでウェルカム画面表示済みかチェック
    const hasSeenWelcome = localStorage.getItem(`profile_welcome_${user.uid}`);
    
    // プロフィールが存在しない、かつウェルカム未表示の場合のみ
    if (!isProfileLoading && !hasProfile && !hasSeenWelcome) {
      setShowProfileEditor(true);
      // 表示済みフラグを立てる
      localStorage.setItem(`profile_welcome_${user.uid}`, 'true');
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
      console.error("Login failed:", error);
      showError('ログインに失敗しました。');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      showError('ログアウトに失敗しました。');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const confirmed = await showConfirm('このコースを削除しますか？');
    if (confirmed) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
      showSuccess('コースを削除しました。');
    }
  };

  const handleToggleFavorite = (courseId) => {
    setCourses(prev => prev.map(c => 
      c.id === courseId ? { ...c, favorite: !c.favorite } : c
    ));
  };

  const handleEditCourse = (course) => {
    setCourseToEdit(course);
    navigate('/edit-course');
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

            <div className="flex items-center space-x-1">
              <button onClick={() => navigate('/stats')} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="統計">
                <BarChart3 size={20} />
              </button>
              {user && (
                <button 
                  onClick={() => setShowGoalSettings(true)} 
                  className="text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="学習目標"
                >
                  <Target size={20} />
                </button>
              )}
              <button 
                onClick={() => navigate('/review')} 
                className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                title="復習"
              >
                <RefreshCw size={20} />
                {wrongHistory.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wrongHistory.length}
                  </span>
                )}
              </button>
              <button onClick={() => navigate('/ranking')} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="ランキング">
                <Trophy size={20} />
              </button>
              <button onClick={() => setShowChangelog(true)} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="お知らせ">
                <Bell size={20} />
              </button>
              <button onClick={() => navigate('/settings')} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${user ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`} title="設定">
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
            <Route path="/settings" element={<SettingsView theme={theme} changeTheme={setTheme} onBack={() => navigate('/')} courses={courses} onImportData={handleImportBackup} onResetStats={handleResetStats} onDebugYesterday={handleDebugYesterday} user={user} onLogin={handleLogin} onLogout={handleLogout} onEditProfile={() => setShowProfileEditor(true)} />} />
            <Route path="/stats" element={<StatsView userStats={userStats} errorStats={errorStats} courses={courses} onBack={() => navigate('/')} />} />
            <Route path="/share/:targetUid/:courseId" element={<SharedCourseView />} />

            {/* ★ 追加: ランキングページへのルート */}
            <Route path="/ranking" element={<RankingView onBack={() => navigate('/')} />} />
            <Route path="/" element={
              <>
                {user && goals && <GoalProgress goals={goals} />}
                <FolderListView
                  courses={courses}
                  onCreate={handleCreateCourse}
                  onDelete={handleDeleteCourse}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={handleEditCourse}
                />
              </>
            } />
            <Route path="/review" element={
              <ReviewView 
                wrongHistory={wrongHistory}
                masteredQuestions={masteredQuestions}
                courses={courses}
                onBack={() => navigate('/')}
              />
            } />
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
      
      {/* Goal Settings Modal */}
      {showGoalSettings && (
        <GoalSettingsModal
          goals={goals}
          onSave={(newGoals) => {
            setGoals(prev => ({
              ...prev,
              dailyXpGoal: newGoals.dailyXpGoal,
              weeklyXpGoal: newGoals.weeklyXpGoal
            }));
          }}
          onClose={() => setShowGoalSettings(false)}
        />
      )}

      {/* プロフィール編集モーダル */}
      {showProfileEditor && user && (
        <ProfileEditor
          initialProfile={profile}
          onSave={async (profileData) => {
            await updateProfile(profileData);
            setShowProfileEditor(false);
          }}
          onClose={() => setShowProfileEditor(false)}
          isWelcome={!hasProfile}
        />
      )}
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}