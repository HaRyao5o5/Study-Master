// src/components/game/ResultView.jsx
import React, { useEffect, useState } from 'react';
import { Trophy, Clock, Target, RotateCcw, Home, CheckCircle, XCircle, Share2, Star } from 'lucide-react';

const ResultView = ({ resultData, onRetry, onBackToMenu }) => {
  const { answers, totalTime, xpGained, currentLevel, isLevelUp, streakInfo } = resultData;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const accuracy = Math.round((correctCount / answers.length) * 100);
  
  // アニメーション用のカウントアップステート
  const [displayXp, setDisplayXp] = useState(0);
  
  useEffect(() => {
    // XPカウントアップアニメーション
    let start = 0;
    const duration = 1500;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = xpGained / steps;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= xpGained) {
        setDisplayXp(xpGained);
        clearInterval(timer);
      } else {
        setDisplayXp(Math.floor(start));
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [xpGained]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      {/* ヘッダーカード: スコアと称号 */}
      <div className="glass p-8 rounded-3xl text-center shadow-xl mb-8 relative overflow-hidden border-t border-white/50">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {/* レベルアップ演出 */}
        {isLevelUp && (
          <div className="absolute top-4 right-4 animate-bounce">
            <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full shadow-lg border border-yellow-200">
              LEVEL UP!
            </span>
          </div>
        )}

        <div className="mb-6 inline-block p-4 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 shadow-inner">
          <Trophy size={64} className="text-yellow-600 drop-shadow-sm" />
        </div>

        <h2 className="text-5xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">
          {accuracy}%
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">
          Accuracy Score
        </p>

        <div className="flex justify-center items-center space-x-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
          <span className="text-lg text-gray-400 mr-1">+</span>
          <span>{displayXp}</span>
          <span className="text-sm font-bold text-gray-500 mt-2">XP</span>
        </div>
        
        {streakInfo && streakInfo.isUpdated && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-bold animate-pulse-slow">
            <Star size={16} className="mr-2 fill-current" />
            {streakInfo.days}日連続学習達成！
          </div>
        )}
      </div>

      {/* スタッツグリッド */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass p-5 rounded-2xl flex items-center space-x-4 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
            <Target size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{correctCount}/{answers.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">正解数</div>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl flex items-center space-x-4 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{Math.round(totalTime)}s</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">タイム</div>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <button 
          onClick={onRetry}
          className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:-translate-y-1 transition-all flex items-center justify-center"
        >
          <RotateCcw size={20} className="mr-2" />
          もう一度挑戦
        </button>
        <button 
          onClick={onBackToMenu}
          className="flex-1 py-4 glass hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:-translate-y-1 transition-all flex items-center justify-center"
        >
          <Home size={20} className="mr-2" />
          コースへ戻る
        </button>
      </div>

      {/* 振り返りリスト */}
      <div className="glass rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="font-bold text-gray-700 dark:text-gray-300">回答の振り返り</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {answers.map((ans, idx) => (
            <div key={idx} className="p-4 flex items-start space-x-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="mt-1">
                {ans.isCorrect ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-white mb-1 line-clamp-2">{ans.question.text}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded ${ans.isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    あなたの回答: {ans.selectedAnswer}
                  </span>
                  {!ans.isCorrect && (
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      正解: {ans.question.correctAnswer}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultView;