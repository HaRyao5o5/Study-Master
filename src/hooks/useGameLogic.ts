// src/hooks/useGameLogic.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { generateId, checkAnswer, toLocalISOString } from '../utils/helpers';
import { getLevelInfo } from '../utils/gamification';
import { logActivity } from '../lib/social';
import { User, Course, Quiz, Question, UserStats, UserGoals, MasteredQuestions, TrashItem } from '../types';
import { AppData } from './useAppData';
import { CONFIRM, SUCCESS } from '../utils/errorMessages';

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
    moveToTrash: (type: TrashItem['type'], data: Course | Quiz, originPath: TrashItem['originPath']) => Promise<TrashItem[]>;
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
    user,
    moveToTrash
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
    const confirmed = await showConfirm(CONFIRM.DELETE_QUIZ, { type: 'danger' });
    if (!confirmed) return;
    
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return;

    // ゴミ箱に移動するクイズを取得
    const quizToDelete = courses[courseIndex].quizzes.find(q => q.id === quizId);
    if (!quizToDelete) return;

    // ゴミ箱に移動
    const newTrash = await moveToTrash('quiz', quizToDelete, {
      courseId: courseId,
      courseTitle: courses[courseIndex].title,
    });

    // courses からクイズを削除
    const newCourses = [...courses];
    newCourses[courseIndex] = {
      ...newCourses[courseIndex],
      quizzes: newCourses[courseIndex].quizzes.filter(q => q.id !== quizId)
    };
    
    await saveData({ courses: newCourses, trash: newTrash } as Partial<AppData>);
    showSuccess(SUCCESS.TRASH_MOVED(quizToDelete.title));
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
    const answerMap: Record<string, any> = {};
    const directResults: Record<string, boolean> = {};

    if (Array.isArray(userAnswers)) {
      userAnswers.forEach((ans: any) => {
        if (ans.question && ans.question.id) {
          answerMap[ans.question.id] = ans.selectedAnswer;
          if (ans.isCorrect !== undefined) {
            directResults[ans.question.id] = ans.isCorrect;
          }
        }
      });
    } else {
      Object.assign(answerMap, userAnswers);
    }

    // 2. 結果の計算
    const results = currentQuiz.questions.map((q) => ({
      question: q,
      selectedAnswer: answerMap[q.id] || '',
      isCorrect: directResults[q.id] !== undefined ? directResults[q.id] : checkAnswer(q, answerMap[q.id])
    }));

    const score = results.filter(r => r.isCorrect).length;
    const totalQuestions = results.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70;

    // 3. XP計算（正解数に応じて常に付与）
    let xpGained = 0;
    const baseXp = score * 10; // 正解1問あたり10XP
    const bonusXp = percentage === 100 ? Math.floor(baseXp * 0.5) : 0;
    xpGained = Math.round(baseXp + bonusXp);
    
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
      // 通常モード: 間違えた問題を追加 + 正解した問題を削除
      const wrongQuestionIds = results.filter(r => r && !r.isCorrect && r.question && r.question.id).map(r => r.question.id);
      const correctQuestionIds = results.filter(r => r && r.isCorrect && r.question && r.question.id).map(r => r.question.id);

      // まず正解した問題を削除し、次に不正解の問題を追加（重複排除）
      let updatedWrongHistory = wrongHistory.filter(id => !correctQuestionIds.includes(id));
      updatedWrongHistory = [...new Set([...updatedWrongHistory, ...wrongQuestionIds])];

      // 変更がある場合のみ更新
      if (updatedWrongHistory.length !== wrongHistory.length ||
          !updatedWrongHistory.every(id => wrongHistory.includes(id))) {
        updates.wrongHistory = updatedWrongHistory;
      }
    }

    // XP加算とレベルアップ処理
    let streakUpdated = false;
    let finalStreak = userStats.streak;

    if (xpGained > 0) {
      let newTotalXp = userStats.totalXp + xpGained;
      let newLevel = getLevelInfo(newTotalXp).level;
      const leveledUp = newLevel > userStats.level;
      
      const today = new Date();
      const todayStr = toLocalISOString(today);
      let newXpHistory = { ...(userStats.xpHistory || {}) };
      newXpHistory[todayStr] = (newXpHistory[todayStr] || 0) + xpGained;

      // --- Streak Logic Start ---
      // Check if user is logged in
      let newStreak = userStats.streak;
      let newLoginHistory = userStats.loginHistory;
      let newLastLogin = userStats.lastLogin;

      if (user) {
          // lastLogin maps to local ISO string now, but careful with legacy data
          // If legacy data has 'T', it might be full ISO. If we change to YYYY-MM-DD, we should handle that.
          // userStats.lastLogin might be "2024-01-01T12:00:00.000Z" OR "2024-01-01". 
          // New logic saves full ISO? No, let's strictly save YYYY-MM-DD for lastLogin or keep full ISO but compare using helper.
          // The current code saves `today.toISOString()` (full) in `lastLogin`.
          
          let lastLoginDateStr = '';
          if (userStats.lastLogin) {
              // Try to parse as date to get local YYYY-MM-DD
              const d = new Date(userStats.lastLogin);
              if (!isNaN(d.getTime())) {
                  lastLoginDateStr = toLocalISOString(d);
              } else {
                  // Fallback if it's already YYYY-MM-DD
                  lastLoginDateStr = userStats.lastLogin.split('T')[0]; 
              }
          }

          newLoginHistory = userStats.loginHistory ? [...userStats.loginHistory] : [];

          // Only update streak if it's a new day (in local time)
          if (todayStr !== lastLoginDateStr) {
              if (lastLoginDateStr) {
                   // Check consecutive days using date objects created from YYYY-MM-DD strings (treated as local midnight)
                   // Actually, simplest is to check if yesterday's YYYY-MM-DD matches lastLoginDateStr.
                   const yesterday = new Date();
                   yesterday.setDate(yesterday.getDate() - 1);
                   const yesterdayStr = toLocalISOString(yesterday);

                   if (lastLoginDateStr === yesterdayStr) {
                      newStreak += 1;
                   } else {
                      // If it's not today and not yesterday, it's a broken streak.
                      // Note: We already checked todayStr !== lastLoginDateStr.
                      newStreak = 1;
                   }
              } else {
                  newStreak = 1; // First time ever
              }
              
              // Update lastLogin to FULL ISO (to keep time info if needed) or just YYYY-MM-DD? 
              // Existing types say `lastLogin: string`. 
              // Let's keep consistency with other parts that might expect a date string.
              // usage in MainLayout doesn't parse it deep.
              newLastLogin = today.toISOString(); // Keep saving full time, but we compare using local YYYY-MM-DD

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
        loginHistory: newLoginHistory,
        xpHistory: newXpHistory
      };
      
      // Notify streak update (Removed Toast for Full Screen Overlay)
      if (newStreak > userStats.streak) {
          streakUpdated = true;
          finalStreak = newStreak;
          // setTimeout(() => showSuccess(`🔥 ${newStreak}日連続学習達成！`), 1200); // Overlay replaces this
      }

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
        // Log level up activity for timeline
        if (user) {
          logActivity(user.uid, 'levelUp', { newLevel }).catch(e => console.error('Failed to log levelUp activity:', e));
        }
      }
      
      // Log streak activity for timeline (only when streak increases)
      if (streakUpdated && user) {
        logActivity(user.uid, 'streak', { streak: finalStreak }).catch(e => console.error('Failed to log streak activity:', e));
      }
    }

    // Save all updates
    if (Object.keys(updates).length > 0) {
        saveData(updates);
    }

    // 結果データをsessionStorageに保存（リロード対策）
    try {
      sessionStorage.setItem('study_master_last_result', JSON.stringify({
        resultData: calculatedResult,
        isReviewMode,
        streakUpdated,
        streak: finalStreak,
        courseId,
        quizId
      }));
    } catch {
      // sessionStorage書き込み失敗は無視
    }

    // 結果画面へ遷移
    navigate(`/course/${courseId}/quiz/${quizId}/result`, { 
      state: { resultData: calculatedResult, isReviewMode, streakUpdated, streak: finalStreak, quizData: currentQuiz } 
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
        userStats: { totalXp: 0, level: 1, streak: 0, lastLogin: '', loginHistory: [], xpHistory: {} } 
    });
      showSuccess("ステータスをリセットしました。");
    }
  };

  const handleDebugYesterday = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const confirmed = await showConfirm('【デバッグ用】最終ログインを昨日に設定しますか？（ストリーク維持テスト用）');
    if (confirmed) {
      saveData({
          userStats: { ...userStats, streak: 1, lastLogin: toLocalISOString(yesterday) }
      });
      showSuccess('昨日のログイン状態に設定しました。今日クイズをするとストリークが2になります。');
    }
  };

  const handleDebugBrokenStreak = async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const twoDaysAgoStr = toLocalISOString(twoDaysAgo);
    const threeDaysAgoStr = toLocalISOString(threeDaysAgo);

    const confirmed = await showConfirm('【デバッグ用】最終ログインを2日前に設定しますか？（3日前・2日前の履歴も作成）');
    if (confirmed) {
      saveData({
          userStats: { 
              ...userStats, 
              streak: 5, 
              lastLogin: twoDaysAgoStr,
              loginHistory: [threeDaysAgoStr, twoDaysAgoStr]
          }
      });
      showSuccess('2日前のログイン状態に設定しました。ホーム画面で履歴の空白を確認できます。');
    }
  };

  const handleDebugResetToday = async () => {
    const todayStr = toLocalISOString(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalISOString(yesterday);

    const confirmed = await showConfirm('【デバッグ用】今日のログイン記録を取り消しますか？（再度ストリーク達成演出を確認できます）');
    if (confirmed) {
        const newHistory = (userStats.loginHistory || []).filter(d => d !== todayStr);
        // lastLoginを昨日に戻し、ストリークを1減らす（0未満にはしない）
        const newStreak = Math.max(0, userStats.streak - 1);

        saveData({
            userStats: { 
                ...userStats, 
                streak: newStreak, 
                lastLogin: yesterdayStr,
                loginHistory: newHistory
            }
        });
        showSuccess('基本のログイン記録を取り消しました。');
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
    handleDebugBrokenStreak,
    handleDebugResetToday,
    startQuiz
  };
};
