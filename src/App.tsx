// src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './lib/firebase.ts';
import { updateProfile as updateFirebaseProfile, uploadAvatar } from './lib/firebaseProfile';
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
import GoalDetailModal from './components/common/GoalDetailModal';
import GoalProgress from './components/common/GoalProgress';
import TutorialController from './components/tutorial/TutorialController';
import MainLayout from './components/layout/MainLayout';
import StreakStatus from './components/layout/StreakStatus';

// Page Components
import CoursePage from './pages/CoursePage.tsx';
import QuizMenuPage from './pages/QuizMenuPage';
import GamePage from './pages/GamePage';
import FlashcardPage from './pages/FlashcardPage';
import ResultPage from './pages/ResultPage';
import ProfilePage from './pages/ProfilePage';
import EditQuizPage from './pages/EditQuizPage';
import CreateQuizPage from './pages/CreateQuizPage';
import MarketplacePage from './pages/MarketplacePage';
import PricingPage from './pages/PricingPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import LegalNoticePage from './pages/LegalNoticePage';


import { getLevelInfo, getUnlockedTitles } from './utils/gamification.ts';

// Context & Hooks
import { useApp } from './context/AppContext.tsx';
import { useToast } from './context/ToastContext.tsx';
import { useTheme } from './hooks/useTheme';
import { useGameLogic } from './hooks/useGameLogic';
import { Course } from './types';

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
    profile, hasProfile, isProfileInitialized, isProfileLoading,
    reviews,
    saveData, publishCourse
  } = useApp();

  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showGoalDetail, setShowGoalDetail] = useState(false);
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
    handleDebugBrokenStreak,
    handleDebugResetToday,
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
  // Init or Upgrade goals
  useEffect(() => {
    if (!goals) {
        saveData({
            goals: {
                dailyXpGoal: 300,
                weeklyXpGoal: 1500,
                dailyProgress: 0,
                weeklyProgress: 0,
                achievedToday: false,
                achievedThisWeek: false,
                lastResetDate: new Date().toDateString(),
                lastWeekResetDate: new Date().toDateString(),
                streak: 0
            }
        });
    } else if (goals.dailyXpGoal === 100 && goals.weeklyXpGoal === 700) {
        // Upgrade defaults to new higher values
        saveData({
            goals: {
                ...goals,
                dailyXpGoal: 300,
                weeklyXpGoal: 1500
            }
        });
    }
  }, [goals, saveData]);

  // Welcome Profile Check
  useEffect(() => {
    if (!user) return;
    const hasSeenWelcome = localStorage.getItem(`profile_welcome_${user.uid}`);
    if (isProfileInitialized && !hasProfile && !hasSeenWelcome) {
      setShowProfileEditor(true);
      localStorage.setItem(`profile_welcome_${user.uid}`, 'true');
    }
  }, [user, hasProfile, isProfileInitialized, setShowProfileEditor]);

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

  const handleCreateCourse = async (title: string, desc: string, visibility: string) => {
    const newCourseId = `course-${generateId()}`;
    const newCourse: Course = { 
        id: newCourseId, 
        title, 
        description: desc, 
        visibility: (visibility as 'public' | 'private') || 'private', 
        isPublic: visibility === 'public',
        quizzes: [],
        favorite: false 
    };
    await saveData({ courses: [...courses, newCourse] });

    if (visibility === 'public') {
        // Auto publish if created as public
        await publishCourse(newCourseId);
    }
    navigate('/');
  };

  const handleUpdateCourse = async (title: string, desc: string, visibility: string) => {
    if (!courseToEdit) return;
    const isPublic = visibility === 'public';
    const updatedCourses = courses.map(c => c.id === courseToEdit.id ? { ...c, title, description: desc, visibility: (visibility as 'public' | 'private') || 'private', isPublic } : c);
    await saveData({ courses: updatedCourses });
    
    if (isPublic) {
        await publishCourse(courseToEdit.id);
    }
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

  // Common Props for MainLayout
  const mainLayoutProps = {
    user,
    userStats,
    levelInfo,
    currentTitle,
    xpPercentage,
    isSyncing,
    profile,
    isProfileLoading,
    wrongHistory,
    onLogin: handleLogin,
    setShowGoalDetail,
    setShowChangelog
  };

  if (isInitialLoading) return <LoadingScreen />;

  return (
    <MainLayout {...mainLayoutProps}>
      <TutorialController />
      
      <Routes>
        <Route path="/" element={
          <>
            <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up">
                {user && <StreakStatus userStats={userStats} />}
                {goals && <GoalProgress goals={goals} onClick={() => setShowGoalDetail(true)} />}
            </div>

            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-white animate-slide-up delay-75">科目の選択</h2>
            
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
            onDebugBroken={handleDebugBrokenStreak}
            onDebugResetToday={handleDebugResetToday}
            user={user} 
            onLogin={handleLogin} 
            onLogout={handleLogout} 
            onEditProfile={() => setShowProfileEditor(true)} 
          />
        } />
        
        <Route path="/stats" element={
          <StatsView 
            userStats={userStats} 
            errorStats={errorStats} 
            courses={courses} 
            masteredQuestions={masteredQuestions}
            profile={profile}
            goals={goals}
            reviews={reviews}
            onBack={() => navigate('/')} 
          />
        } />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
        <Route path="/legal" element={<LegalNoticePage />} />
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
        
        <Route path="/profile" element={
            <ProfilePage />
        } />
        <Route path="/profile/:uid" element={
            <ProfilePage />
        } />
        
        <Route path="/course/:courseId" element={<CoursePage wrongHistory={wrongHistory} onCreateQuiz={handleCreateQuiz} onDeleteQuiz={handleDeleteQuiz} onImportQuiz={handleImportQuiz} />} />
        <Route path="/course/:courseId/quiz/:quizId" element={<QuizMenuPage wrongHistory={wrongHistory} onStart={startQuiz} onClearHistory={clearHistory} />} />
        <Route path="/course/:courseId/quiz/:quizId/play" element={<GamePage gameSettings={gameSettings} wrongHistory={wrongHistory} onFinish={finishQuiz} />} />
        <Route path="/course/:courseId/quiz/:quizId/flashcards" element={<FlashcardPage onFinish={finishQuiz} />} />
        <Route path="/course/:courseId/quiz/:quizId/result" element={<ResultPage resultData={resultData} gameSettings={gameSettings} onRetry={startQuiz} />} />
        <Route path="/course/:courseId/quiz/:quizId/edit" element={<EditQuizPage onSave={handleSaveQuiz} />} />
        <Route path="/course/:courseId/create-quiz" element={<CreateQuizPage onSave={handleSaveQuiz} />} />

        <Route path="*" element={<div className="text-center p-10">ページが見つかりません (404)</div>} />
      </Routes>


      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
      
      {showGoalDetail && goals && (
        <GoalDetailModal
          goals={goals}
          onClose={() => setShowGoalDetail(false)}
        />
      )}

      {showProfileEditor && user && (
        <ProfileEditor
          initialProfile={profile || undefined} // Handle null vs undefined
          onSave={async (profileData) => {
            try {
                let finalAvatarUrl: string | null | undefined = profile?.customAvatarUrl;
                
                // Handle Avatar Upload or Removal
                if (profileData.mode === 'image' && profileData.customAvatarBlob) {
                     finalAvatarUrl = await uploadAvatar(user.uid, profileData.customAvatarBlob);
                } else if (!profileData.customAvatarUrl && !profileData.customAvatarBlob) {
                     // If no blob and no preview URL, it means it was removed
                     finalAvatarUrl = null;
                }
                // If customAvatarUrl exists and no blob, it means we kept the existing one (no change needed)

                const fullProfile: any = {
                    name: profileData.name,
                    username: profileData.username,
                    avatarId: 'default',
                    customAvatarUrl: finalAvatarUrl,
                    avatarSettings: profileData.avatarSettings,
                    bio: profileData.bio,
                    title: profile?.title,
                    socialLinks: profile?.socialLinks
                };
                
                await updateFirebaseProfile(user.uid, fullProfile, profile?.username);
                setShowProfileEditor(false);
            } catch (e) {
                console.error("Initial profile save failed", e);
                showError("プロフィールの保存に失敗しました。");
            }
          }}
          onClose={() => setShowProfileEditor(false)}
          isWelcome={!hasProfile}
        />
      )}
      
      <InstallPrompt />
    </MainLayout>
  );
}
