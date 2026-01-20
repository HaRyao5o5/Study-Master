import React, { useState, useMemo } from 'react';
import { Layers, Target, Brain, RotateCcw, Plus, FileText, Trash2, ChevronRight } from 'lucide-react';

const QuizListView = ({ course, onSelectQuiz, wrongHistory, onSelectReview, onCreateQuiz, onDeleteQuiz }) => {
  const [mockCount, setMockCount] = useState(10);
  const allQuestions = useMemo(() => course.quizzes.flatMap(quiz => quiz.questions), [course]);
  const totalQ = allQuestions.length;
  const wrongQuestions = allQuestions.filter(q => wrongHistory.includes(q.id));

  const createAllQuestionsQuiz = () => ({
    id: 'all-questions',
    title: '全範囲 総合テスト',
    description: `全${course.quizzes.length}回・計${totalQ}問から全て出題します。`,
    questions: allQuestions,
    isMock: false
  });

  const createMockExamQuiz = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(mockCount, totalQ));
    return {
      id: 'mock-exam',
      title: `実力診断模試 (${selected.length}問)`,
      description: `全範囲からランダムに${selected.length}問を出題します。`,
      questions: selected,
      isMock: true
    };
  };

  return (
    <div className="space-y-8">
      {totalQ > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <Layers className="mr-2 text-blue-600 dark:text-blue-400" /> 総合演習メニュー
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border dark:border-gray-600 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors border-blue-100 dark:border-blue-900" onClick={() => onSelectQuiz(createAllQuestionsQuiz())}>
              <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-1">全範囲一括テスト</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">収録された全{totalQ}問を順番に解きます。</p>
            </div>
            <div className="border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-700 dark:text-gray-200">実力診断模試</h4>
                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300">ランダム</span>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <input 
                  type="range" 
                  min="1" max={totalQ} step="1" 
                  value={mockCount} 
                  onChange={(e) => setMockCount(parseInt(e.target.value))}
                  className="flex-grow h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{mockCount}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/{totalQ}</span>
                </div>
              </div>
              <button 
                onClick={() => onSelectQuiz(createMockExamQuiz())}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors flex items-center justify-center"
              >
                <Target size={16} className="mr-2" /> 模試を開始
              </button>
            </div>
          </div>
        </div>
      )}

      {wrongHistory.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 shadow-sm border border-red-100 dark:border-red-900/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300 flex items-center">
              <Brain className="mr-2" /> 弱点克服
            </h3>
            <span className="bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100 text-xs font-bold px-2 py-1 rounded-full">
              {wrongHistory.length}問
            </span>
          </div>
          <button 
            onClick={() => onSelectReview({
              id: 'review-mode',
              title: '弱点克服リスト',
              description: '過去に間違えた問題を重点的に復習します。',
              questions: wrongQuestions,
              isMock: false
            })}
            className="w-full bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 font-bold py-3 px-6 rounded-lg shadow-sm transition-colors flex items-center justify-center"
          >
            <RotateCcw size={18} className="mr-2" /> 間違えた問題を解き直す
          </button>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">問題セット一覧</h3>
          <button onClick={onCreateQuiz} className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center hover:underline">
            <Plus size={16} className="mr-1" /> 新規作成
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {course.quizzes.map((quiz, index) => (
            <div 
              key={`${quiz.id}-${index}`}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer flex items-center justify-between transition-all group"
              onClick={() => onSelectQuiz(quiz)}
            >
              <div className="flex items-center overflow-hidden">
                <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-lg mr-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate">{quiz.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{quiz.description} ({quiz.questions.length}問)</p>
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteQuiz(quiz.id); }}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
              </div>
            </div>
          ))}
          {course.quizzes.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              まだ問題セットがありません。<br/>「新規作成」から追加してください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizListView;