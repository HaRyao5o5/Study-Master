// src/components/game/ResultView.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Home, Clock, Trophy, Star, Flame, ArrowUpCircle, Sparkles } from 'lucide-react'; // Sparkles追加

const ResultView = ({ resultData, onRetry, onBackToMenu }) => {
  const { answers, totalTime, xpGained, isLevelUp, currentLevel, streakInfo } = resultData;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalCount = answers.length;
  const percentage = Math.round((correctCount / totalCount) * 100) || 0;

  const [showStreakAnim, setShowStreakAnim] = useState(false);

  useEffect(() => {
    if (streakInfo && streakInfo.isUpdated) {
      setShowStreakAnim(true);
    }
  }, [streakInfo]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 relative">
      
      {/* ★ ストリーク達成アニメーション (豪華版) */}
      {showStreakAnim && streakInfo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in cursor-pointer overflow-hidden" 
          onClick={() => setShowStreakAnim(false)}
        >
          {/* 背景の回転する光 (サンバースト) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-[800px] h-[800px] bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0 animate-[spin_10s_linear_infinite]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 50%, 100% 100%, 0% 100%, 50% 50%)' }}></div>
            <div className="absolute w-[600px] h-[600px] bg-gradient-to-b from-red-500/0 via-red-500/30 to-red-500/0 animate-[spin_8s_linear_infinite_reverse]"></div>
          </div>

          {/* 舞い散るパーティクル (簡易的な表現) */}
          {[...Array(12)].map((_, i) => (
             <div 
               key={i}
               className="absolute w-2 h-2 rounded-full bg-yellow-400 animate-pulse"
               style={{
                 top: `${Math.random() * 100}%`,
                 left: `${Math.random() * 100}%`,
                 animation: `bounce ${2 + Math.random()}s infinite`,
                 opacity: Math.random()
               }}
             />
          ))}

          <div className="text-center transform transition-all animate-bounce-in p-8 relative z-10">
            {/* メインアイコン周辺 */}
            <div className="relative inline-block mb-6 group">
              {/* 後ろのボヤッとした光 */}
              <div className="absolute inset-0 bg-orange-500 blur-[60px] opacity-80 animate-pulse rounded-full"></div>
              <div className="absolute inset-0 bg-red-500 blur-[40px] opacity-60 animate-ping rounded-full" style={{ animationDuration: '2s' }}></div>
              
              {/* アイコン本体 */}
              <div className="relative transform transition-transform group-hover:scale-110 duration-300">
                <Flame size={140} className="text-orange-500 drop-shadow-[0_0_25px_rgba(255,69,0,1)] filter brightness-125 animate-[bounce_1s_infinite]" />
                <Sparkles size={60} className="text-yellow-300 absolute -top-4 -right-4 animate-spin-slow" />
                <Sparkles size={40} className="text-yellow-300 absolute -bottom-2 -left-4 animate-pulse" />
              </div>
            </div>

            {/* テキスト */}
            <h2 className="text-4xl font-black text-white mb-2 tracking-widest uppercase italic transform -skew-x-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              Daily Streak!
            </h2>
            
            <div className="text-8xl font-black text-white tracking-tighter mb-6 drop-shadow-[0_5px_15px_rgba(255,69,0,0.5)] scale-110">
              {streakInfo.days}<span className="text-3xl ml-2 font-bold text-orange-200">days</span>
            </div>
            
            <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2">
               <p className="text-orange-100 font-bold animate-pulse text-sm">画面をタップして閉じる</p>
            </div>
          </div>
        </div>
      )}

      {/* 結果カード */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden text-center p-8 relative">
        <h2 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">Result</h2>
        
        <div className="flex justify-center items-baseline space-x-2 mb-8">
          <span className="text-7xl font-black text-gray-800 dark:text-white tracking-tighter">{percentage}</span>
          <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">%</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex flex-col items-center justify-center">
            <CheckCircle size={20} className="text-green-500 mb-1" />
            <div className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1">{correctCount}/{totalCount}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Correct</div>
          </div>
          
          {/* XP表示カード */}
          <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1 opacity-20">
               <Trophy size={40} className="text-yellow-500 transform rotate-12" />
            </div>
            
            {isLevelUp ? (
              <div className="animate-bounce-in relative z-10">
                <div className="flex items-center justify-center text-orange-500 font-black text-xs mb-1 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow-sm">
                  <ArrowUpCircle size={12} className="mr-1" /> LEVEL UP!
                </div>
                <div className="text-xl font-black text-orange-600 dark:text-orange-400 leading-none">Lv.{currentLevel}</div>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="text-xl font-black text-yellow-600 dark:text-yellow-400 leading-none mb-1">+{xpGained}</div>
                <div className="text-[10px] text-yellow-600/70 dark:text-yellow-400/70 font-bold uppercase">XP Gained</div>
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex flex-col items-center justify-center">
            <Clock size={20} className="text-blue-500 mb-1" />
            <div className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1">{formatTime(totalTime)}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Time</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onRetry}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RotateCcw size={18} className="mr-2" /> 再挑戦
          </button>
          <button 
            onClick={onBackToMenu}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all transform active:scale-95"
          >
            <Home size={18} className="mr-2" /> メニュー
          </button>
        </div>
      </div>

      {/* 詳細レポート */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 px-2">詳細レポート</h3>
        <div className="space-y-3">
          {answers.map((a, i) => (
            <div key={i} className={`bg-white dark:bg-gray-800 p-4 rounded-xl border-l-4 shadow-sm ${a.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Q.{i + 1}</span>
                {a.isCorrect ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
              </div>
              
              <div className="mb-3">
                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{a.question.text}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">あなたの解答</div>
                  <div className={`font-bold ${a.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    {Array.isArray(a.selectedAnswer) ? a.selectedAnswer.join(', ') : a.selectedAnswer || '(未回答)'}
                  </div>
                </div>
                {!a.isCorrect && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-xs text-blue-400 mb-1">正解</div>
                    <div className="font-bold text-blue-600 dark:text-blue-300">
                      {Array.isArray(a.question.correctAnswer) ? a.question.correctAnswer.join(', ') : a.question.correctAnswer}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultView;