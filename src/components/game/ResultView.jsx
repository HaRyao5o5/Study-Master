// src/components/game/ResultView.jsx
import React from 'react';
import { CheckCircle, XCircle, RotateCcw, Home, Clock, Trophy, Star, ArrowUpCircle } from 'lucide-react';
import SimpleTable from '../common/SimpleTable';

const ResultView = ({ resultData, onRetry, onBackToMenu }) => {
  const { answers, totalTime, xpGained, isLevelUp, currentLevel } = resultData;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalCount = answers.length;
  const percentage = Math.round((correctCount / totalCount) * 100) || 0;

  // 時間フォーマット (秒 -> mm:ss)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-center p-8 relative">
        
        {/* レベルアップ通知 (もしあれば) */}
        {isLevelUp && (
          <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black py-1 shadow-md animate-bounce">
            LEVEL UP! Lv.{currentLevel} になりました！
          </div>
        )}

        <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">結果発表</h2>
        
        <div className="flex justify-center items-end space-x-2 mb-6">
          <span className="text-6xl font-black text-blue-600 dark:text-blue-400">{percentage}</span>
          <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-2">%</span>
        </div>

        {/* スコア・XP・時間 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex justify-center text-green-500 mb-1"><CheckCircle size={24} /></div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{correctCount}/{totalCount}</div>
            <div className="text-xs text-gray-400 font-bold uppercase">Correct</div>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-100 dark:border-yellow-900/50 relative overflow-hidden">
             {/* XP獲得エフェクト装飾 */}
            <div className="absolute -right-2 -top-2 opacity-20">
               <Star size={48} className="text-yellow-500" />
            </div>
            <div className="flex justify-center text-yellow-500 mb-1"><Trophy size={24} /></div>
            <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400">+{xpGained}</div>
            <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70 font-bold uppercase">XP Gained</div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex justify-center text-blue-500 mb-1"><Clock size={24} /></div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{formatTime(totalTime)}</div>
            <div className="text-xs text-gray-400 font-bold uppercase">Time</div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={onRetry}
            className="flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <RotateCcw size={20} className="mr-2" /> もう一度
          </button>
          <button 
            onClick={onBackToMenu}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all transform hover:scale-105"
          >
            <Home size={20} className="mr-2" /> メニューへ戻る
          </button>
        </div>
      </div>

      {/* 詳細テーブル (既存機能) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300">
          詳細レポート
        </div>
        <SimpleTable 
          headers={['#', '問題', 'あなたの解答', '正解', '判定']}
          data={answers.map((a, i) => ({
            '#': i + 1,
            '問題': <div className="max-w-xs truncate" title={a.question.text}>{a.question.text}</div>,
            'あなたの解答': <span className={a.isCorrect ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-500 font-bold'}>{Array.isArray(a.userAnswer) ? a.userAnswer.join(', ') : a.userAnswer}</span>,
            '正解': <span className="text-gray-500 dark:text-gray-400">{Array.isArray(a.question.correctAnswer) ? a.question.correctAnswer.join(', ') : a.question.correctAnswer}</span>,
            '判定': a.isCorrect ? <CheckCircle size={20} className="text-green-500 mx-auto" /> : <XCircle size={20} className="text-red-500 mx-auto" />
          }))}
        />
      </div>
    </div>
  );
};

export default ResultView;