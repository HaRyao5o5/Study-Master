// src/components/game/ResultView.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Trophy, Clock, Target, RotateCcw, Home, CheckCircle, XCircle, Flame, Rocket, Sparkles, ArrowRight, Zap } from 'lucide-react';
import LoadingScreen from '../common/LoadingScreen';
import { playSound } from '../../utils/sound';
import { ResultData } from '../../types';

interface ResultViewProps {
  resultData: ResultData | null;
  onRetry: () => void;
  onBackToMenu: () => void;
}

// --- StreakCelebration コンポーネント (変更なし) ---
const StreakCelebration = ({ days, type, onComplete }: { days: number, type: string, onComplete: () => void }) => {
  const themes: Record<string, any> = {
    fire: {
      color: "text-orange-500",
      gradient: "from-orange-500 to-red-600",
      glow: "bg-orange-500",
      icon: <Flame size={80} className="fill-current animate-bounce" />,
      title: "Keep the Streak!",
      sub: "情熱の炎が燃え上がる！",
    },
    star: {
      color: "text-purple-500",
      gradient: "from-indigo-400 to-purple-600",
      glow: "bg-purple-500",
      icon: <Sparkles size={80} className="fill-current animate-pulse" />,
      title: "Stellar Performance!",
      sub: "星のように輝く継続力！",
    },
    rocket: {
      color: "text-blue-500",
      gradient: "from-cyan-400 to-blue-600",
      glow: "bg-blue-500",
      icon: <Rocket size={80} className="fill-current animate-pulse" />,
      title: "Sky High!",
      sub: "限界を超えて突き進め！",
    }
  };

  const theme = themes[type] || themes.fire;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl transition-all duration-500"></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${theme.glow} rounded-full blur-[120px] opacity-20 animate-pulse-slow`}></div>
      <div className="relative w-full max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-pop-in">
        <div className={`h-2 w-full bg-gradient-to-r ${theme.gradient}`}></div>
        <div className="p-8 flex flex-col items-center text-center relative z-10">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${theme.gradient} bg-opacity-10 flex items-center justify-center mb-6 shadow-lg shadow-gray-200/50 dark:shadow-none`}>
            <div className="w-28 h-28 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-600 dark:from-white dark:to-gray-300">
              <div className={theme.color}>{theme.icon}</div>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">{theme.title}</h2>
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8">{theme.sub}</p>
          <div className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-2 mb-1">
               <Zap size={16} className={`${theme.color} fill-current`} />
               <span className="text-xs font-bold text-gray-400 uppercase">Current Streak</span>
            </div>
            <div className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.gradient} tracking-tighter`}>{days}</div>
            <div className="text-sm font-bold text-gray-400 mt-1">Days</div>
          </div>
          <button onClick={onComplete} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all flex items-center justify-center bg-gradient-to-r ${theme.gradient}`}>
            CONTINUE <ArrowRight size={20} className="ml-2 animate-bounce-x" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- メインコンポーネント ---
const ResultView: React.FC<ResultViewProps> = ({ resultData, onRetry, onBackToMenu }) => {
  const [isReady, setIsReady] = useState(false);
  const [displayXp, setDisplayXp] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const celebrationType = useMemo(() => {
    const types = ['fire', 'star', 'rocket'];
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  useEffect(() => {
    if (resultData) {
      if (resultData.streakInfo?.isUpdated) {
        setShowCelebration(true);
      }
      
      const timer = setTimeout(() => {
        setIsReady(true);
        // ★ 追加: リザルト表示時に音を鳴らす
        if (resultData.isLevelUp) {
            playSound('levelUp');
        } else if (!resultData.streakInfo?.isUpdated) { 
            // ストリーク演出がない場合のみクリア音（演出がある場合はそっちが目立つので）
            playSound('clear');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [resultData]);

  const answers = resultData?.answers || [];
  const totalTime = resultData?.totalTime || 0;
  const xpGained = resultData?.xpGained || 0;
  const isLevelUp = resultData?.isLevelUp || false;
  const streakInfo = resultData?.streakInfo || null;

  const correctCount = answers.filter((a: any) => a.isCorrect).length;
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

  useEffect(() => {
    if (!isReady || !resultData || showCelebration) return;

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
  }, [xpGained, isReady, resultData, showCelebration]);

  if (!resultData || !isReady) {
    return <LoadingScreen />;
  }

  if (showCelebration && streakInfo) {
    return <StreakCelebration days={streakInfo.days} type={celebrationType} onComplete={() => setShowCelebration(false)} />;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
       <div className="glass p-8 rounded-3xl text-center shadow-xl mb-8 relative overflow-hidden border-t border-white/50">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        {isLevelUp && (
          <div className="absolute top-4 right-4 animate-bounce">
            <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full shadow-lg border border-yellow-200">LEVEL UP!</span>
          </div>
        )}
        <div className="mb-6 inline-block p-4 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 shadow-inner">
          <Trophy size={64} className="text-yellow-600 drop-shadow-sm" />
        </div>
        <h2 className="text-5xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">{accuracy}%</h2>
        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">Accuracy Score</p>
        <div className="flex justify-center items-center space-x-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
          <span className="text-lg text-gray-400 mr-1">+</span><span>{displayXp}</span><span className="text-sm font-bold text-gray-500 mt-2">XP</span>
        </div>
        {streakInfo && streakInfo.isUpdated && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-bold border border-orange-200 dark:border-orange-800">
            <Flame size={16} className="mr-2 fill-current animate-pulse" />{streakInfo.days}日連続達成中！
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass p-5 rounded-2xl flex items-center space-x-4 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl"><Target size={24} /></div>
          <div><div className="text-2xl font-bold text-gray-800 dark:text-white">{correctCount}/{answers.length}</div><div className="text-xs text-gray-500 dark:text-gray-400 font-bold">正解数</div></div>
        </div>
        <div className="glass p-5 rounded-2xl flex items-center space-x-4 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><Clock size={24} /></div>
          <div><div className="text-2xl font-bold text-gray-800 dark:text-white">{Math.round(totalTime)}s</div><div className="text-xs text-gray-500 dark:text-gray-400 font-bold">タイム</div></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <button onClick={onRetry} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:-translate-y-1 transition-all flex items-center justify-center">
          <RotateCcw size={20} className="mr-2" />もう一度挑戦
        </button>
        <button onClick={onBackToMenu} className="flex-1 py-4 glass hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:-translate-y-1 transition-all flex items-center justify-center">
          <Home size={20} className="mr-2" />コースへ戻る
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"><h3 className="font-bold text-gray-700 dark:text-gray-300">回答の振り返り</h3></div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {answers.map((ans: any, idx: number) => (
            <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="mt-1">{ans.isCorrect ? <CheckCircle size={20} className="text-green-500" /> : <XCircle size={20} className="text-red-500" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">{ans.question.text}</p>
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                    <span className={`px-2 py-0.5 rounded ${
                      ans.isCorrect 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      あなたの回答: {Array.isArray(ans.selectedAnswer) 
                        ? ans.selectedAnswer.join(', ') 
                        : ans.selectedAnswer}
                    </span>
                    {!ans.isCorrect && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        正解: {Array.isArray(ans.question.correctAnswer)
                          ? (ans.question.correctAnswer as string[]).join(', ')
                          : ans.question.correctAnswer}
                      </span>
                    )}
                  </div>
                  {/* 解説表示 */}
                  {ans.question.explanation && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-2 border-blue-500">
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">解説</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{ans.question.explanation}</p>
                    </div>
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
