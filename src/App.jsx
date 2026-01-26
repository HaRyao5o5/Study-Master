// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { generateId } from './utils/helpers';

// Components
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
import InstallPrompt from './components/common/InstallPrompt';
import GoalSettingsModal from './components/common/GoalSettingsModal';
import GoalProgress from './components/common/GoalProgress';
import TutorialController from './components/tutorial/TutorialController';
import MainLayout from './components/layout/MainLayout';

// Page Components
import CoursePage from './pages/CoursePage';
import QuizMenuPage from './pages/QuizMenuPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import EditQuizPage from './pages/EditQuizPage';
import CreateQuizPage from './pages/CreateQuizPage';
import { Trophy, Flame } from 'lucide-react';
import { getLevelInfo, getUnlockedTitles } from './utils/gamification';

// Context & Hooks
import { useAppData } from './hooks/useAppData';
import { useToast } from './context/ToastContext';
import { useTheme } from './hooks/useTheme';
import { useGameLogic } from './hooks/useGameLogic';

const googleProvider = new GoogleAuthProvider();

export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showChangelog, setShowChangelog] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { showSuccess, showError, showConfirm } = useToast();

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

  // Game Logic Hook
  const {
    gameSettings,
    resultData,
    handleCreateQuiz,
    handleSaveQuiz,
    handleDeleteQuiz,
    handleImportQuiz,
    finishQuiz,
    clearHistory,
    handleResetStats,
    handleDebugYesterday,
    startQuiz
  } = useGameLogic({
    courses, setCourses,
    userStats, setUserStats,
    wrongHistory, setWrongHistory,
    masteredQuestions, setMasteredQuestions,
    goals, setGoals
  });

  // --- Derived State ---
  const levelInfo = getLevelInfo(userStats.totalXp);
  const xpPercentage = Math.min(100, Math.max(0, (levelInfo.currentXp / (levelInfo.xpForNextLevel || 1)) * 100));
  const titles = getUnlockedTitles(userStats);
  const currentTitle = titles.length > 0 ? titles[titles.length - 1].name : "駆け出しの学習者";

  // --- Effects ---
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Goal Reset Logic
  useEffect(() => {
    if (!goals) return;
    const today = new Date().toDateString();
    const dayOfWeek = new Date().getDay();
    let needsUpdate = false;
    const updates = {};
    if (goals.lastResetDate !== today) {
      updates.dailyProgress = 0;
      updates.achievedToday = false;
      updates.lastResetDate = today;
      needsUpdate = true;
    }
    if (dayOfWeek === 1 && goals.lastWeekResetDate !== today) {
      updates.weeklyProgress = 0;
      updates.achievedThisWeek = false;
      updates.lastWeekResetDate = today;
      needsUpdate = true;
    }
    if (needsUpdate) setGoals(prev => ({ ...prev, ...updates }));
  }, [goals, setGoals]);

  // Welcome Profile Check
  useEffect(() => {
    if (!user) return;
    const hasSeenWelcome = localStorage.getItem(`profile_welcome_${user.uid}`);
    if (!isProfileLoading && !hasProfile && !hasSeenWelcome) {
      setShowProfileEditor(true);
      localStorage.setItem(`profile_welcome_${user.uid}`, 'true');
    }
  }, [user, hasProfile, isProfileLoading, setShowProfileEditor]);

  // Error Monitoring
  useEffect(() => {
    if (saveError) {
      showError(saveError.message, {
        duration: 8000,
        action: { label: '詳細', onClick: () => console.error('Save error details:', saveError) }
      });
    }
  }, [saveError, showError]);

  // --- Handlers (Course & Auth) ---
  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (error) { console.error("Login failed:", error); showError('ログインに失敗しました。'); }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } 
    catch (error) { console.error("Logout failed:", error); showError('ログアウトに失敗しました。'); }
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

  if (isInitialLoading) return <LoadingScreen />;

  return (
    <MainLayout
      user={user}
      userStats={userStats}
      levelInfo={levelInfo}
      currentTitle={currentTitle}
      xpPercentage={xpPercentage}
      isSyncing={isSyncing}
      profile={profile}
      isProfileLoading={isProfileLoading}
      wrongHistory={wrongHistory}
      onLogin={handleLogin}
      setShowGoalSettings={setShowGoalSettings}
      setShowChangelog={setShowChangelog}
    >
      <TutorialController />
      
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
            
            {user && goals && <GoalProgress goals={goals} />}
            
            <FolderListView
              onSelectCourse={(c) => navigate(`/course/${c.id}`)}
              onCreateCourse={() => navigate('/create-course')}
              onEditCourse={handleEditCourse}
              courses={courses} // Pass courses explicitly if FolderListView needs them (it uses useApp context usually but let's check)
            />
          </>
        } />

        <Route path="/create-course" element={<CreateCourseModal onClose={() => navigate('/')} onSave={handleCreateCourse} />} />
        <Route path="/edit-course" element={<CreateCourseModal onClose={() => navigate('/')} onSave={handleUpdateCourse} initialData={courseToEdit} />} />
        
        <Route path="/settings" element={
          <SettingsView 
            theme={theme} 
            changeTheme={setTheme} 
            onBack={() => navigate('/')} 
            courses={courses} 
            onImportData={handleImportBackup} 
            onResetStats={handleResetStats} 
            onDebugYesterday={handleDebugYesterday} 
            user={user} 
            onLogin={handleLogin} 
            onLogout={handleLogout} 
            onEditProfile={() => setShowProfileEditor(true)} 
          />
        } />
        
        <Route path="/stats" element={<StatsView userStats={userStats} errorStats={errorStats} courses={courses} onBack={() => navigate('/')} />} />
        <Route path="/share/:targetUid/:courseId" element={<SharedCourseView />} />
        <Route path="/ranking" element={<RankingView onBack={() => navigate('/')} />} />
        
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

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
      
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
      
      <InstallPrompt />
    </MainLayout>
  );
}