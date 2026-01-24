// src/hooks/useQuizHandlers.js
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { generateId } from '../utils/helpers';
import { getLevelInfo, calculateXpGain } from '../utils/gamification';
import { CONFIRM, SUCCESS } from '../utils/errorMessages';

/**
 * クイズ関連の操作ハンドラーをまとめたカスタムフック
 * @returns {Object} クイズ操作用ハンドラー関数群
 */
export function useQuizHandlers() {
  const navigate = useNavigate();
  const { showConfirm, showSuccess } = useToast();
  const {
    courses, setCourses,
    userStats, setUserStats,
    wrongHistory, setWrongHistory,
    errorStats, setErrorStats
  } = useApp();

  const handleCreateQuiz = (courseId) => {
    navigate(`/course/${courseId}/create-quiz`);
  };

  const handleSaveQuiz = (updatedQuiz, courseId) => {
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        const updatedQuizzes = course.quizzes.some(q => q.id === updatedQuiz.id)
          ? course.quizzes.map(q => q.id === updatedQuiz.id ? updatedQuiz : q)
          : [...course.quizzes, updatedQuiz];
        return { ...course, quizzes: updatedQuizzes };
      }
      return course;
    });
    setCourses(updatedCourses);
    navigate(`/course/${courseId}`);
  };

  const handleDeleteQuiz = (quizId, courseId) => {
    const newCourses = courses.map(c =>
      c.id === courseId ? { ...c, quizzes: c.quizzes.filter(q => q.id !== quizId) } : c
    );
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

  const finishQuiz = (answers, totalTime, courseId, quizId, levelInfo, resultData, setResultData) => {
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

    const resultWithXp = {
      answers,
      totalTime,
      xpGained,
      currentLevel: levelInfo.level,
      isLevelUp: getLevelInfo(userStats.totalXp + xpGained).level > levelInfo.level,
      streakInfo: isStreakUpdated ? { days: newStreak, isUpdated: true } : null
    };

    setResultData(resultWithXp);
    navigate(`/course/${courseId}/quiz/${quizId}/result`);

    // 経験値と連続記録の更新
    setTimeout(() => {
      setUserStats(prev => ({
        ...prev,
        totalXp: prev.totalXp + xpGained,
        streak: isStreakUpdated ? newStreak : prev.streak,
        lastLogin: newLastLogin
      }));
    }, 600);

    // 不正解・正解の履歴更新
    const currentWrongs = answers.filter(a => !a.isCorrect).map(a => a.question.id);
    const currentCorrects = answers.filter(a => a.isCorrect).map(a => a.question.id);
    const isReview = quizId === 'review-mode';

    if (currentWrongs.length > 0) {
      setErrorStats(prev => {
        const newStats = { ...prev };
        currentWrongs.forEach(id => {
          newStats[id] = (newStats[id] || 0) + 1;
        });
        return newStats;
      });
    }

    setWrongHistory(prev => {
      let newHistory = [...prev];
      currentWrongs.forEach(id => {
        if (!newHistory.includes(id)) newHistory.push(id);
      });
      if (isReview) {
        newHistory = newHistory.filter(id => !currentCorrects.includes(id));
      }
      return newHistory;
    });
  };

  const clearHistory = async () => {
    const confirmed = await showConfirm('復習リストをリセットしますか？');
    if (confirmed) {
      setWrongHistory([]);
      navigate('/');
    }
  };

  const handleResetStats = async () => {
    const confirmed = await showConfirm("【デバッグ用】ステータスを初期化しますか？");
    if (confirmed) {
      setUserStats({ totalXp: 0, level: 1, streak: 0, lastLogin: '' });
      showSuccess("ステータスをリセットしました。");
    }
  };

  const handleDebugYesterday = async () => {
    const confirmed = await showConfirm(CONFIRM.DEBUG_YESTERDAY);
    if (confirmed) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setUserStats(prev => ({
        ...prev,
        streak: 1,
        lastLogin: yesterday.toDateString()
      }));
      showSuccess(SUCCESS.DEBUG_DATE_UPDATED);
    }
  };

  return {
    handleCreateQuiz,
    handleSaveQuiz,
    handleDeleteQuiz,
    handleImportQuiz,
    finishQuiz,
    clearHistory,
    handleResetStats,
    handleDebugYesterday
  };
}
