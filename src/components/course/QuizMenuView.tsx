// src/components/course/QuizMenuView.tsx
import React, { useState } from 'react';
import { Settings, Shuffle, ImageIcon, Type, CheckSquare, Play, Trash2, Edit3, Lock, Zap, CreditCard as Cards } from 'lucide-react';
import { Quiz } from '../../types';

interface QuizMenuViewProps {
  quiz: Quiz;
  onStart: (randomize: boolean, shuffleOptions: boolean, immediateFeedback: boolean) => void;
  isReviewMode?: boolean;
  onClearHistory?: () => void;
  onEdit?: () => void;
  onStartFlashcards?: () => void;
}

const QuizMenuView: React.FC<QuizMenuViewProps> = ({ quiz, onStart, isReviewMode = false, onClearHistory, onEdit, onStartFlashcards }) => {
  const [randomize, setRandomize] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [immediateFeedback, setImmediateFeedback] = useState(false);
  const isMock = (quiz as any).isMock; // Assuming isMock might be added dynamically or missing from base interface

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600 flex justify-between items-start">
        <div><h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{quiz.title}</h2><p className="text-gray-600 dark:text-gray-300">{quiz.description}</p></div>
        {!isMock && !isReviewMode && onEdit && (<button onClick={onEdit} className="p-2 bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-200 rounded border hover:bg-gray-50 shadow-sm"><Edit3 size={20} /></button>)}
      </div>
      <div className="p-6">
        {!isMock && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center"><Settings size={18} className="mr-2" /> 設定</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input type="checkbox" checked={randomize} onChange={(e) => setRandomize(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                <span className="text-gray-700 dark:text-gray-200">出題順をランダムにする</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input type="checkbox" checked={shuffleOptions} onChange={(e) => setShuffleOptions(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                <span className="text-gray-700 dark:text-gray-200 flex items-center"><Shuffle size={16} className="mr-2" /> 選択肢をシャッフルする</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input type="checkbox" checked={immediateFeedback} onChange={(e) => setImmediateFeedback(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                <span className="text-gray-700 dark:text-gray-200 flex items-center"><Zap size={16} className="mr-2" /> 1問ごとに答え合わせする (即時判定)</span>
              </label>
            </div>
          </div>
        )}
        {!isMock ? (
          <div className="mb-8">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">収録されている問題 ({quiz.questions.length}問)</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {quiz.questions.map((q, idx) => (
                <div key={q.id} className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300 flex justify-between">
                  <div className="truncate flex-1"><span className="font-bold text-blue-500 dark:text-blue-400 mr-2">Q{idx + 1}.</span>{q.text}</div>
                  <div className="flex gap-2 ml-2">{q.image && <ImageIcon size={16} />}{q.type === 'input' && <Type size={16} />}{q.type === 'multi-select' && <CheckSquare size={16} />}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-gray-100 dark:bg-gray-700 p-8 rounded-xl border border-gray-200 dark:border-gray-600 text-center flex flex-col items-center justify-center">
            <Lock size={48} className="text-gray-400 dark:text-gray-500 mb-3" />
            <h3 className="font-bold text-gray-600 dark:text-gray-300 text-lg">Question List Hidden</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">本番形式の模試のため、問題内容は開始するまで表示されません。<br/>出題順序は自動的にシャッフルされます。</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button onClick={() => onStart(isMock ? false : randomize, isMock ? true : shuffleOptions, isMock ? false : immediateFeedback)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-transform transform active:scale-95 flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={quiz.questions.length === 0}>
            <Play size={24} className="mr-2 fill-current" />
            {quiz.questions.length > 0 ? "テストを開始する" : "問題がありません"}
          </button>
          
          {quiz.questions.length > 0 && onStartFlashcards && (
            <button 
              onClick={onStartFlashcards}
              className="w-full bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 font-bold py-4 rounded-xl shadow-sm transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95 flex items-center justify-center text-lg"
            >
              <Cards size={24} className="mr-2" />
              フラッシュカードで暗記
            </button>
          )}

          {isReviewMode && <button onClick={onClearHistory} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 font-bold py-3 rounded-xl transition-colors flex items-center justify-center text-sm"><Trash2 size={16} className="mr-2" /> 履歴をリセット（全て覚えた）</button>}
        </div>
      </div>
    </div>
  );
};

export default QuizMenuView;
