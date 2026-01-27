// src/hooks/useGameLogic.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { generateId, checkAnswer } from '../utils/helpers';
import { getLevelInfo } from '../utils/gamification';
import { User, Course, Quiz, Question, UserStats, UserGoals, MasteredQuestions } from '../types';
import { AppData } from './useAppData'; // Import AppData type if needed, or just define subset

// Define props to match what is passed from App.tsx + saveData
export interface GameLogicProps {
    user?: User | null;
    courses: Course[];
    setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
    userStats: UserStats;
    setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
    wrongHistory: string[];
    setWrongHistory: React.Dispatch<React.SetStateAction<string[]>>;
    masteredQuestions: MasteredQuestions;
    setMasteredQuestions: React.Dispatch<React.SetStateAction<MasteredQuestions>>;
    goals: UserGoals | null;
    setGoals: React.Dispatch<React.SetStateAction<UserGoals | null>>;
    saveData: (newData: Partial<AppData>) => Promise<void>; // Added saveData
}

export function useGameLogic({
    courses,
    // Setters are still kept in props but used less/not at all locally if we use saveData for everything.
    // They are available if needed for local-only updates, but here we want persistence.
    userStats,
    wrongHistory,
    masteredQuestions,
    goals,
    saveData,
    user
}: GameLogicProps) {
  const navigate = useNavigate();
  const { showSuccess, showConfirm } = useToast();

  const [gameSettings, setGameSettings] = useState({ 
    randomize: false, 
    shuffleOptions: true, 
    immediateFeedback: false 
  });
  
  const [resultData, setResultData] = useState<any>(null);

  const handleCreateQuiz = (courseId: string) => navigate(`/course/${courseId}/create-quiz`);

  const handleSaveQuiz = (updatedQuiz: Quiz, courseId: string) => {
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return;

    const newCourses = [...courses];
    const quizIndex = newCourses[courseIndex].quizzes.findIndex(q => q.id === updatedQuiz.id);

    if (quizIndex > -1) {
      newCourses[courseIndex].quizzes[quizIndex] = updatedQuiz;
    } else {
      newCourses[courseIndex].quizzes.push(updatedQuiz);
    }
    
    // Use saveData for persistence
    saveData({ courses: newCourses });
    navigate(`/course/${courseId}`);
  };

  const handleDeleteQuiz = async (quizId: string, courseId: string) => {
    const confirmed = await showConfirm('この問題セットを削除しますか？', { type: 'danger' });
    if (!confirmed) return;
    
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return;

    const newCourses = [...courses];
    newCourses[courseIndex].quizzes = newCourses[courseIndex].quizzes.filter(q => q.id !== quizId);
    
    saveData({ courses: newCourses });
  };

  const handleImportQuiz = (newQuizData: any, courseId: string) => {
    const quizWithId = { ...newQuizData, id: `quiz-${generateId()}` };
    const newCourses = courses.map(course => {
      if (course.id === courseId) {
        return { ...course, quizzes: [...course.quizzes, quizWithId] };
      }
      return course;
    });
    
    saveData({ courses: newCourses });
  };

  const finishQuiz = (userAnswers: any, totalTime: number, courseId: string, quizId: string, quizData?: Quiz) => {
    // 1. クイズデータの取得
    const course = courses.find(c => c.id === courseId);
    let currentQuiz: Quiz | undefined = quizData;
    let isReviewMode = false;

    if (!currentQuiz) {
        if (quizId === 'review-mode') {
        isReviewMode = true;
        const wrongQuestions: Question[] = [];
        // If courseId is available (and not generic 'all' or similar if handled), filter by it.
        // Assuming courseId is always valid here as it comes from params.
        const targetCourses = courses.filter(c => c.id === courseId);
        // Fallback to all courses only if courseId not found (though unlikley in this flow)
        const coursesToSearch = targetCourses.length > 0 ? targetCourses : courses;

        coursesToSearch.forEach(c => c.quizzes.forEach(q => q.questions.forEach(ques => {
            if (wrongHistory.includes(ques.id)) wrongQuestions.push(ques);
        })));
        currentQuiz = { id: 'review-mode', title: '弱点克服', questions: wrongQuestions };
        } else {
        currentQuiz = course?.quizzes.find(q => q.id === quizId);
        }
    } else {
       // If quizData provided, check if it is review mode by ID just in case
       if (currentQuiz.id === 'review-mode') isReviewMode = true;
    }

    if (!currentQuiz) return;

    // 回答配列をマップに変換
    const answerMap: Record<string, string> = {};
    if (Array.isArray(userAnswers)) {
      userAnswers.forEach((ans: any) => {
        if (ans.question && ans.question.id) {
          answerMap[ans.question.id] = ans.selectedAnswer;
        }
      });
    } else {
      Object.assign(answerMap, userAnswers);
    }

    // 2. 結果の計算
    const results = currentQuiz.questions.map((q) => ({
      question: q,
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
      xpGained = Math.round(baseXp + bonusXp);
    }
    
    const calculatedResult = {
      score,
      totalQuestions,
      percentage,
      passed,
      xpGained,
      results,
      totalTime,
      answers: results
    };

    setResultData(calculatedResult);

    // Prepare updates
    const updates: Partial<AppData> = {};

    // 復習モード: 正解した問題をマスター済みに追加 & 復習リストから削除
    if (isReviewMode && results && Array.isArray(results)) {
      const newMastered = { ...masteredQuestions };
      const currentCourseId = window.location.pathname.split('/')[2] || 'all'; // フォールバック追加
      
      if (!newMastered[currentCourseId]) {
        newMastered[currentCourseId] = {};
      }

      // 正解した問題IDを収集
      const solvedQuestionIds: string[] = [];

      results.forEach(result => {
        if (result && result.isCorrect && result.question && result.question.id) {
          newMastered[currentCourseId][result.question.id] = true;
          solvedQuestionIds.push(result.question.id);
        }
      });

      updates.masteredQuestions = newMastered;

      // wrongHistoryから正解した問題を削除
      if (solvedQuestionIds.length > 0) {
          const updatedWrongHistory = wrongHistory.filter(id => !solvedQuestionIds.includes(id));
          updates.wrongHistory = updatedWrongHistory;
      }

    } else if (!isReviewMode && results && Array.isArray(results)) {
      // 通常モード: 間違えた問題をwrongHistoryに追加
      const wrongQuestionIds = results.filter(r => r && !r.isCorrect && r.question && r.question.id).map(r => r.question.id);
      if (wrongQuestionIds.length > 0) {
        const updatedWrongHistory = [...new Set([...wrongHistory, ...wrongQuestionIds])];
        updates.wrongHistory = updatedWrongHistory;
      }
    }

    // XP加算とレベルアップ処理
    if (xpGained > 0) {
      let newTotalXp = userStats.totalXp + xpGained;
      let newLevel = getLevelInfo(newTotalXp).level;
      const leveledUp = newLevel > userStats.level;
      
      // --- Streak Logic Start ---
      // Check if user is logged in
      let newStreak = userStats.streak;
      let newLoginHistory = userStats.loginHistory;
      let newLastLogin = userStats.lastLogin;

      if (user) {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          const lastLoginStr = userStats.lastLogin ? userStats.lastLogin.split('T')[0] : '';
          
          newLoginHistory = userStats.loginHistory ? [...userStats.loginHistory] : [];

          // Only update streak if it's a new day
          if (todayStr !== lastLoginStr) {
              if (lastLoginStr) {
                  const lastActivityDate = new Date(lastLoginStr);
                  const timeDiff = today.getTime() - lastActivityDate.getTime();
                  const dayDiff = timeDiff / (1000 * 3600 * 24);
                  
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  const yesterdayStr = yesterday.toISOString().split('T')[0];

                  if (lastLoginStr === yesterdayStr) {
                      newStreak += 1;
                  } else if (dayDiff >= 2) {
                      newStreak = 1; // Reset if gap
                  } else {
                      if (newStreak === 0) newStreak = 1;
                  }
              } else {
                  newStreak = 1; // First time ever
              }

              newLastLogin = today.toISOString();
              if (!newLoginHistory.includes(todayStr)) {
                  newLoginHistory.push(todayStr);
              }
              if (newLoginHistory.length > 365) newLoginHistory.shift();
          }
      }
      // --- Streak Logic End ---

      updates.userStats = {
        ...userStats,
        totalXp: newTotalXp,
        level: newLevel,
        streak: newStreak,
        lastLogin: newLastLogin || userStats.lastLogin,
        loginHistory: newLoginHistory
      };

      // 学習目標の進捗更新
      if (goals) {
          const newDailyProgress = goals.dailyProgress + xpGained;
          const newWeeklyProgress = goals.weeklyProgress + xpGained;
          
          const achievedToday = !goals.achievedToday && newDailyProgress >= goals.dailyXpGoal;
          const achievedThisWeek = !goals.achievedThisWeek && newWeeklyProgress >= goals.weeklyXpGoal;
          
          if (achievedToday) {
            setTimeout(() => showSuccess('🎯 今日の目標達成！おめでとう！'), 500);
          }
          if (achievedThisWeek) {
            setTimeout(() => showSuccess('🏆 今週の目標達成！素晴らしい！'), 800);
          }
          
          updates.goals = {
            ...goals,
            dailyProgress: newDailyProgress,
            weeklyProgress: newWeeklyProgress,
            achievedToday: achievedToday || goals.achievedToday,
            achievedThisWeek: achievedThisWeek || goals.achievedThisWeek
          };
      }

      if (leveledUp) {
        showSuccess(`🎉 レベル${newLevel}にアップ！`);
      }
    }

    // Save all updates
    if (Object.keys(updates).length > 0) {
        saveData(updates);
    }

    // 結果画面へ遷移
    navigate(`/course/${courseId}/quiz/${quizId}/result`, { 
      state: { resultData: calculatedResult, isReviewMode } 
    });
  };

  const clearHistory = async () => {
    const confirmed = await showConfirm('復習リストをリセットしますか？');
    if (confirmed) { 
        saveData({ wrongHistory: [] });
        navigate('/'); 
    }
  };

  const handleResetStats = async () => {
    const confirmed = await showConfirm("【デバッグ用】ステータスを初期化しますか？");
    if (confirmed) {
      saveData({ 
          userStats: { totalXp: 0, level: 1, streak: 0, lastLogin: '' } 
      });
      showSuccess("ステータスをリセットしました。");
    }
  };

  const handleDebugYesterday = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const confirmed = await showConfirm('【デバッグ用】最終ログインを昨日に設定しますか？');
    if (confirmed) {
      saveData({
          userStats: { ...userStats, streak: 1, lastLogin: yesterday.toDateString() }
      });
      showSuccess('最終ログイン日時を更新しました。');
    }
  };

  const startQuiz = (courseId: string, quizId: string, randomize: boolean, shuffleOptions: boolean, immediateFeedback: boolean, quizData?: Quiz) => {
    setGameSettings({ randomize, shuffleOptions, immediateFeedback });
    navigate(`/course/${courseId}/quiz/${quizId}/play`, { state: { quiz: quizData } });
  };

  return {
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
  };
};
