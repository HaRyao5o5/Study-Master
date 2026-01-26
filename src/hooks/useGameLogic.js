import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateId, checkAnswer } from '../utils/helpers';
import { getLevelInfo } from '../utils/gamification';
import { useToast } from '../context/ToastContext';

export const useGameLogic = ({
  courses,
  setCourses,
  userStats,
  setUserStats,
  wrongHistory,
  setWrongHistory,
  masteredQuestions,
  setMasteredQuestions,
  goals,
  setGoals
}) => {
  const navigate = useNavigate();
  const { showSuccess, showConfirm } = useToast();
  
  const [gameSettings, setGameSettings] = useState({ 
    randomize: false, 
    shuffleOptions: true, 
    immediateFeedback: false 
  });
  
  const [resultData, setResultData] = useState(null);

  const handleCreateQuiz = (courseId) => navigate(`/course/${courseId}/create-quiz`);

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

  const handleDeleteQuiz = async (quizId, courseId) => {
    const confirmed = await showConfirm('この問題セットを削除しますか？', { type: 'danger' });
    if (!confirmed) return;
    const courseIndex = courses.findIndex(c => c.id === courseId);
    const newCourses = [...courses];
    newCourses[courseIndex].quizzes = newCourses[courseIndex].quizzes.filter(q => q.id !== quizId);
    setCourses(newCourses);
  };

  const handleImportQuiz = (newQuizData, courseId) => {
    const quizWithId = { ...newQuizData, id: `quiz-${generateId()}` };
    const newCourses = courses.map(course => {
      if (course.id === courseId) {
        return { ...course, quizzes: [...course.quizzes, quizWithId] };
      }
      return course;
    });
    setCourses(newCourses);
  };

  const finishQuiz = (userAnswers, totalTime, courseId, quizId) => {
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

    // 回答配列をマップに変換
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

    // 復習モード: 正解した問題をマスター済みに追加
    if (isReviewMode && results && Array.isArray(results)) {
      const newMastered = { ...masteredQuestions };
      const currentCourseId = window.location.pathname.split('/')[2] || 'all'; // フォールバック追加
      
      if (!newMastered[currentCourseId]) {
        newMastered[currentCourseId] = {};
      }

      results.forEach(result => {
        if (result && result.isCorrect && result.question && result.question.id) {
          newMastered[currentCourseId][result.question.id] = true;
        }
      });

      setMasteredQuestions(newMastered);
    } else if (!isReviewMode && results && Array.isArray(results)) {
      // 通常モード: 間違えた問題をwrongHistoryに追加
      const wrongQuestionIds = results.filter(r => r && !r.isCorrect && r.question && r.question.id).map(r => r.question.id);
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
        
        if (achievedToday) {
          setTimeout(() => showSuccess('🎯 今日の目標達成！おめでとう！'), 500);
        }
        if (achievedThisWeek) {
          setTimeout(() => showSuccess('🏆 今週の目標達成！素晴らしい！'), 800);
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
        showSuccess(`🎉 レベル${newLevel}にアップ！`);
      }
    }

    // 結果画面へ遷移
    navigate(`/course/${courseId}/quiz/${quizId}/result`, { 
      state: { resultData: calculatedResult, isReviewMode } 
    });
  };

  const clearHistory = async () => {
    const confirmed = await showConfirm('復習リストをリセットしますか？');
    if (confirmed) { setWrongHistory([]); navigate('/'); }
  };

  const handleResetStats = async () => {
    const confirmed = await showConfirm("【デバッグ用】ステータスを初期化しますか？");
    if (confirmed) {
      setUserStats({ totalXp: 0, level: 1, streak: 0, lastLogin: '' });
      showSuccess("ステータスをリセットしました。");
    }
  };

  const handleDebugYesterday = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const confirmed = await showConfirm('【デバッグ用】最終ログインを昨日に設定しますか？');
    if (confirmed) {
      setUserStats(prev => ({ ...prev, streak: 1, lastLogin: yesterday.toDateString() }));
      showSuccess('最終ログイン日時を更新しました。');
    }
  };

  const startQuiz = (courseId, quizId, randomize, shuffleOptions, immediateFeedback) => {
    setGameSettings({ randomize, shuffleOptions, immediateFeedback });
    navigate(`/course/${courseId}/quiz/${quizId}/play`);
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
