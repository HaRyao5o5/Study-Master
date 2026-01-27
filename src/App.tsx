// src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './lib/firebase.ts';
import { generateId } from './utils/helpers.ts';

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
import StreakStatus from './components/layout/StreakStatus';

// Page Components
import CoursePage from './pages/CoursePage.tsx';
import QuizMenuPage from './pages/QuizMenuPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import EditQuizPage from './pages/EditQuizPage';
import CreateQuizPage from './pages/CreateQuizPage';
import { Trophy, Flame } from 'lucide-react';
import { getLevelInfo, getUnlockedTitles } from './utils/gamification.ts';

// Context & Hooks
import { useApp } from './context/AppContext.tsx';
import { useToast } from './context/ToastContext.tsx';
import { useTheme } from './hooks/useTheme';
import { useGameLogic } from './hooks/useGameLogic';
import { Course, Profile } from './types';

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
    errorStats,
    profile, hasProfile, updateProfile, isProfileLoading,
    saveData
  } = useApp();

  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

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
    goals, setGoals,
    saveData,
    user
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
    const updates: any = {};
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
    if (needsUpdate) setGoals(prev => prev ? ({ ...prev, ...updates }) : null);
  }, [goals, setGoals]);

  // Init goals for guest if null
  useEffect(() => {
    if (!user && !goals) {
        setGoals({
            dailyXpGoal: 100,
            weeklyXpGoal: 700,
            dailyProgress: 0,
            weeklyProgress: 0,
            achievedToday: false,
            achievedThisWeek: false,
            lastResetDate: new Date().toDateString(),
            lastWeekResetDate: new Date().toDateString(),
            streak: 0
        });
    }
  }, [user, goals, setGoals]);

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



  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    navigate('/edit-course');
  };

  const handleCreateCourse = (title: string, desc: string, visibility: string) => {
    const newCourse: Course = { 
        id: `course-${generateId()}`, 
        title, 
        description: desc, 
        visibility: (visibility as 'public' | 'private') || 'private', 
        quizzes: [],
        favorite: false // Ensure required fields
    };
    saveData({ courses: [...courses, newCourse] });
    navigate('/');
  };

  const handleUpdateCourse = (title: string, desc: string, visibility: string) => {
    if (!courseToEdit) return;
    const updatedCourses = courses.map(c => c.id === courseToEdit.id ? { ...c, title, description: desc, visibility: (visibility as 'public' | 'private') || 'private' } : c);
    saveData({ courses: updatedCourses });
    setCourseToEdit(null); navigate('/');
  };

  const handleImportBackup = async (importedData: any) => {
    try {
      if (!Array.isArray(importedData)) { showError('データの形式が正しくありません。'); return; }
      const confirmed = await showConfirm('現在のデータを上書きして、バックアップから復元しますか？');
      if (confirmed) {
        saveData({ courses: importedData });
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
            {user && <StreakStatus userStats={userStats} />}
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white animate-slide-up delay-75">科目の選択</h2>
            
            {goals && <GoalProgress goals={goals} onClick={() => setShowGoalSettings(true)} />}
            
            <FolderListView
              onSelectCourse={(c: Course) => navigate(`/course/${c.id}`)}
              onCreateCourse={() => navigate('/create-course')}
              onEditCourse={handleEditCourse}
            />
          </>
        } />

        <Route path="/create-course" element={<CreateCourseModal onClose={() => navigate('/')} onSave={handleCreateCourse} />} />
        <Route path="/edit-course" element={<CreateCourseModal onClose={() => navigate('/')} onSave={handleUpdateCourse} initialData={courseToEdit ? { ...courseToEdit, description: courseToEdit.description || '', visibility: courseToEdit.visibility || 'private' } as any : null} />} />
        
        <Route path="/settings" element={
          <SettingsView 
            theme={theme} 
            changeTheme={(t) => setTheme(t as any)} 
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
        <Route path="/ranking" element={<RankingView currentUser={user} onBack={() => navigate('/')} />} />
        
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
      
      {showGoalSettings && goals && (
        <GoalSettingsModal
          goals={goals}
          onSave={(newGoals) => {
            saveData({
              goals: {
                ...goals,
                dailyXpGoal: newGoals.dailyXpGoal || 0,
                weeklyXpGoal: newGoals.weeklyXpGoal || 0
              }
            });
          }}
          onClose={() => setShowGoalSettings(false)}
        />
      )}

      {showProfileEditor && user && (
        <ProfileEditor
          initialProfile={profile || undefined} // Handle null vs undefined
          onSave={async (profileData) => {
            const fullProfile: Profile = {
                uid: user.uid,
                name: profileData.name,
                avatarId: profileData.avatarId,
                updatedAt: new Date(),
                // Use existing data or defaults
                bio: profile?.bio,
                title: profile?.title,
                socialLinks: profile?.socialLinks
            };
            await updateProfile(fullProfile);
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
