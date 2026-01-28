// src/components/layout/ReviewView.tsx
import React, { useState, useMemo } from 'react';

import { ArrowLeft, RefreshCw, Award, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Course, MasteredQuestions, Quiz } from '../../types';
import { useApp } from '../../context/AppContext';
import { isDue } from '../../utils/srs';

interface ReviewViewProps {
  wrongHistory: string[];
  masteredQuestions: MasteredQuestions;
  courses: Course[];
  onBack: () => void;
}

interface ReviewItem {
  courseId: string;
  courseName: string;
  quizId: string;
  quizTitle: string;
  questionId: string;
  questionText: string;
}

interface CourseSummary {
  id: string;
  name: string;
  count: number;
}

interface QuizGroup {
  courseId: string;
  courseName: string;
  quizId: string;
  quizTitle: string;
  questions: ReviewItem[];
}

const ReviewView: React.FC<ReviewViewProps> = ({ wrongHistory, masteredQuestions, courses, onBack }) => {
  const navigate = useNavigate();
  const { reviews, updateReviewStatus, setMasteredQuestions, saveData } = useApp();
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [showDebug, setShowDebug] = useState(false);

  // Valid Question IDs cache (to exclude deleted/orphaned questions)
  const validQuestionIds = useMemo(() => {
      const ids = new Set<string>();
      courses.forEach(c => c.quizzes.forEach(q => q.questions.forEach(ques => ids.add(ques.id))));
      return ids;
  }, [courses]);

  // SRS Due Count
  const dueCount = useMemo(() => {
    return Object.values(reviews).filter(r => isDue(r) && validQuestionIds.has(r.questionId)).length;
  }, [reviews, validQuestionIds]);

  // 復習対象問題の抽出
  const reviewItems = useMemo<ReviewItem[]>(() => {
    const items: ReviewItem[] = [];
    
    // wrongHistoryは配列形式なので、各クイズIDについて処理
    wrongHistory.forEach((quizId) => {
      // マスター済みであっても、wrongHistoryにあるということは再度間違えたということなので表示すべき
      // したがって、isMasteredチェックは削除します

      // クイズIDから該当するコースとクイズを見つける
      courses.forEach((course) => {
        course.quizzes.forEach((quiz) => {
          quiz.questions.forEach((question) => {
            if (question.id === quizId) {
              items.push({
                courseId: course.id,
                courseName: course.title,
                quizId: quiz.id,
                quizTitle: quiz.title,
                questionId: question.id,
                // @ts-ignore: Handle legacy 'question' property if 'text' is missing
                questionText: question.text || question.question || '問題文なし'
              });
            }
          });
        });
      });
    });

    return items;
  }, [wrongHistory, masteredQuestions, courses]);

  // 科目別フィルター
  const filteredItems = useMemo(() => {
    if (selectedCourse === 'all') return reviewItems;
    return reviewItems.filter(item => item.courseId === selectedCourse);
  }, [reviewItems, selectedCourse]);

  // 科目一覧の取得（復習対象がある科目のみ）
  const availableCourses = useMemo<CourseSummary[]>(() => {
    const courseMap = new Map<string, CourseSummary>();
    reviewItems.forEach(item => {
      if (!courseMap.has(item.courseId)) {
        courseMap.set(item.courseId, {
          id: item.courseId,
          name: item.courseName,
          count: 0
        });
      }
      const course = courseMap.get(item.courseId);
      if (course) course.count++;
    });
    return Array.from(courseMap.values());
  }, [reviewItems]);

  // 復習進捗率の計算
  const totalWrong = wrongHistory.length;
  const totalMastered = Object.values(masteredQuestions).reduce(
    (sum, courseQuizzes) => sum + Object.keys(courseQuizzes).length,
    0
  );
  // 分母は「解決済み + 未解決」の合計とする
  const totalItems = totalMastered + totalWrong;
  const progressPercent = totalItems > 0 ? Math.round((totalMastered / totalItems) * 100) : 100;

  // Auto-reset session progress when list is cleared
  React.useEffect(() => {
      if (reviewItems.length === 0 && totalMastered > 0) {
          setMasteredQuestions({});
          saveData({ masteredQuestions: {} });
      }
  }, [reviewItems.length, totalMastered, setMasteredQuestions, saveData]);

  // クイズ別にグループ化
  const groupedByQuiz = useMemo<QuizGroup[]>(() => {
    const grouped: Record<string, QuizGroup> = {};
    filteredItems.forEach(item => {
      const key = `${item.courseId}_${item.quizId}`;
      if (!grouped[key]) {
        grouped[key] = {
          courseId: item.courseId,
          courseName: item.courseName,
          quizId: item.quizId,
          quizTitle: item.quizTitle,
          questions: []
        };
      }
      grouped[key].questions.push(item);
    });
    return Object.values(grouped);
  }, [filteredItems]);

  const handleStartReview = (courseId: string, quizId: string) => {
    // Navigate with quiz data containing ONLY the questions to review
    const course = courses.find(c => c.id === courseId);
    const originalQuiz = course?.quizzes.find(q => q.id === quizId);
    
    if (course && originalQuiz) {
        // Filter questions that are in wrongHistory AND not mastered
        const questionsToReview = originalQuiz.questions.filter(q => {
            // Check if in wrong history
            if (!wrongHistory.includes(q.id)) return false;
            
            // マスター済みチェック削除: wrongHistoryにあるなら復習すべき

            return true;
        });
        
        if (questionsToReview.length > 0) {
            const reviewQuiz: any = { // Using any cast to avoid strict type issues with transient ID or similar
                ...originalQuiz,
                questions: questionsToReview,
                title: `${originalQuiz.title} (復習)`,
                id: 'review-mode', // Critical for useGameLogic to treat as review mode (remove from history)
                description: '間違えた問題のみ出題されます'
            };
            
            navigate(`/course/${courseId}/quiz/${quizId}/play`, { 
                state: { quiz: reviewQuiz } 
            });
            return;
        }
    }

    // Fallback
    navigate(`/course/${courseId}/quiz/${quizId}/play?mode=review`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-4xl mx-auto animate-fade-in mb-20">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="mr-4 text-white hover:text-blue-100">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <RefreshCw size={28} className="mr-2" />
            復習リスト
          </h2>
        </div>

        {/* 進捗バー */}
        {reviewItems.length > 0 && (
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-sm">復習進捗 (克服率)</span>
            <span className="text-white font-bold">{totalMastered}/{totalItems} ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        )}
      </div>

      {/* SRS Dashboard */}
      <div className="p-6 pb-0">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden mb-6">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Calendar size={120} />
             </div>
             <div className="relative z-10">
                 <h3 className="text-xl font-bold mb-2 flex items-center">
                     <Calendar className="mr-2" />
                     本日の定期復習 (SRS)
                 </h3>
                 <div className="text-4xl font-black mb-1">{dueCount} <span className="text-base font-normal opacity-80">問</span></div>
                 <p className="text-indigo-100 mb-6 text-sm">忘却曲線に基づいて計算された、今日やるべき復習です。</p>
                 
                 <button 
                     onClick={() => navigate('/course/global/quiz/srs-mode/play')}
                     disabled={dueCount === 0}
                     className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                 >
                     <RefreshCw size={18} className="mr-2" />
                     学習を開始
                 </button>
             </div>
          </div>
      </div>

      {/* 科目フィルター (アイテムがある場合のみ表示) */}
      {reviewItems.length > 0 && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
            <button
                onClick={() => setSelectedCourse('all')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                selectedCourse === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
                すべて ({reviewItems.length})
            </button>
            {availableCourses.map(course => (
                <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                    selectedCourse === course.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                >
                {course.name} ({course.count})
                </button>
            ))}
            </div>
        </div>
      )}

      {/* 復習リスト */}
      <div className="p-6">
        {reviewItems.length > 0 ? (
            <>
            <div className="space-y-4">
            {groupedByQuiz.map((quiz) => (
                <div
                key={`${quiz.courseId}_${quiz.quizId}`}
                className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-900/30 rounded-xl p-5 hover:shadow-md transition-all"
                >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded">
                        {quiz.courseName}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        {quiz.quizTitle}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <TrendingUp size={16} className="text-orange-500" />
                        <span className="font-bold">{quiz.questions.length}問</span>
                        <span>復習待ち</span>
                    </div>
                    </div>
                    <button
                    onClick={() => handleStartReview(quiz.courseId, quiz.quizId)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                    <RefreshCw size={18} />
                    復習開始
                    </button>
                </div>
                </div>
            ))}
            </div>

            {filteredItems.length === 0 && selectedCourse !== 'all' && (
            <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                この科目には復習する問題がありません。
                </p>
            </div>
            )}
            </>
        ) : (
            <div className="text-center py-12">
              <div className="mb-6">
                <Award size={64} className="mx-auto text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                完璧です！🎉
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                弱点リストは空です。<br/>
                定期復習 (SRS) の学習を進めましょう。
              </p>
            </div>
        )}
      </div>
      
      {/* Debug Toggle */}
      <div className="text-center pb-8">
          <button onClick={() => setShowDebug(!showDebug)} className="text-xs text-gray-400 underline">
              {showDebug ? 'デバッグモードを閉じる' : '開発者用デバッグモード (SRS)'}
          </button>

          {/* Debug Panel */}
          {showDebug && <SRSDebugPanel reviews={reviews} updateReviewStatus={updateReviewStatus} />}
      </div>
    </div>
  );
};

export default ReviewView;

const SRSDebugPanel: React.FC<{ reviews: Record<string, any>, updateReviewStatus: (item: any) => void }> = ({ reviews, updateReviewStatus }) => {
    return (
          <div className="mt-4 bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto font-mono text-xs text-left mx-4 mb-20 animate-fade-in">
              <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 flex justify-between">
                  <span>SRS Debug Console</span>
                  <span className="text-xs font-normal opacity-70">{Object.keys(reviews).length} items</span>
              </h3>
              <table className="w-full whitespace-nowrap">
                  <thead>
                      <tr>
                          <th className="p-2">ID</th>
                          <th className="p-2">Streak</th>
                          <th className="p-2">Interval</th>
                          <th className="p-2">Next Review</th>
                          <th className="p-2">Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      {Object.values(reviews).map(r => (
                          <tr key={r.questionId} className="border-b border-gray-800 hover:bg-gray-800">
                              <td className="p-2">{r.questionId.substring(0, 8)}...</td>
                              <td className="p-2">{r.streak}</td>
                              <td className="p-2">{r.interval}d</td>
                              <td className="p-2">{new Date(r.nextReview).toLocaleString()}</td>
                              <td className="p-2 flex gap-2">
                                  <button 
                                      onClick={() => {
                                          console.log("Force due clicked", r.questionId);
                                          updateReviewStatus({ ...r, nextReview: Date.now() - 60000 }); // 1 min ago
                                      }}
                                      className="bg-blue-900 text-blue-200 px-2 py-1 rounded hover:bg-blue-800"
                                      title="維持したまま復習予定を今にする"
                                  >
                                      Force Due
                                  </button>
                                  <button 
                                      onClick={() => {
                                          if(!confirm('この問題の進捗をリセットしますか？')) return;
                                          updateReviewStatus({ 
                                              ...r, 
                                              streak: 0, 
                                              interval: 0, 
                                              easeFactor: 2.5,
                                              nextReview: Date.now() - 60000 
                                          });
                                      }}
                                      className="bg-red-900 text-red-200 px-2 py-1 rounded hover:bg-red-800"
                                      title="進捗をリセットして最初からにする"
                                  >
                                      Reset
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              {Object.keys(reviews).length === 0 && <div className="p-4 text-gray-500">データがありません。クイズをプレイしてください。</div>}
          </div>
    );
};
