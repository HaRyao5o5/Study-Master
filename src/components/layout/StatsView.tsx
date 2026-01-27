// src/components/layout/StatsView.tsx
import React, { useMemo, useState } from 'react';
import { Trophy, Flame, Star, AlertTriangle, ArrowLeft, Medal, Lock, Zap, X } from 'lucide-react';
import { getLevelInfo, TITLES } from '../../utils/gamification';
import { Course, UserStats } from '../../types';

interface StatsViewProps {
  userStats: UserStats;
  errorStats: Record<string, number>;
  courses: Course[];
  onBack: () => void;
}

interface WeaknessItem {
  id: string;
  count: number;
  text: string;
}

interface TitleInfo {
  id: string;
  name: string;
  condition: (userStats: UserStats) => boolean;
  requirement: string;
  isUnlocked?: boolean;
  isNext?: boolean;
}

const StatsView: React.FC<StatsViewProps> = ({ userStats, errorStats, courses, onBack }) => {
  const { level, currentXp, xpForNextLevel } = getLevelInfo(userStats.totalXp);
  const progressPercent = Math.min(100, Math.round((currentXp / xpForNextLevel) * 100));
  const [selectedTitle, setSelectedTitle] = useState<TitleInfo | null>(null);

  // 弱点分析ロジック
  const topWeaknesses = useMemo<WeaknessItem[]>(() => {
    if (!errorStats || Object.keys(errorStats).length === 0) return [];
    
    // Create a flat map of all questions for easy lookup
    const allQuestionsMap = new Map<string, string>();
    courses.forEach(c => {
      c.quizzes.forEach(q => {
        q.questions.forEach(quest => {
          allQuestionsMap.set(quest.id, quest.text); // Note: Assuming Question type uses 'text'. Previously fixed in ReviewView.
        });
      });
    });

    const sortedErrors = Object.entries(errorStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
      
    return sortedErrors.map(([id, count]) => {
      const text = allQuestionsMap.get(id) || '（削除された問題）';
      return {
        id,
        count,
        text
      };
    });
  }, [errorStats, courses]);

  // 称号のアンロック状況を判定
  const unlockedTitleIds = TITLES.filter(t => t.condition(userStats)).map(t => t.id);

  // 「次に解放可能な称号」のインデックスを探す
  // (リストの上から順に見て、最初に未開放だったものが「次の目標」)
  const nextUnlockIndex = TITLES.findIndex(t => !unlockedTitleIds.includes(t.id));

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in relative">
      {/* ヘッダー */}
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">プレイヤーデータ</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ① メインステータスカード */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Trophy size={140} className="text-yellow-500 transform rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Current Level</div>
            <div className="text-6xl font-black text-gray-800 dark:text-white mb-2 tracking-tighter">
              <span className="text-3xl mr-1 text-gray-400">Lv.</span>{level}
            </div>
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                <span>EXP {currentXp}</span>
                <span>次のレベル {xpForNextLevel}</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center bg-orange-50 dark:bg-orange-900/20 px-3 py-3 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <div className="bg-orange-100 dark:bg-orange-800 p-2 rounded-lg mr-3">
                  <Flame size={20} className="text-orange-500 dark:text-orange-200" />
                </div>
                <div>
                  <div className="text-[10px] text-orange-400 font-bold uppercase">Streak</div>
                  <div className="text-lg font-black text-orange-600 dark:text-orange-400">{userStats.streak} <span className="text-xs">Days</span></div>
                </div>
              </div>
              <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg mr-3">
                  <Zap size={20} className="text-blue-500 dark:text-blue-200" />
                </div>
                <div>
                  <div className="text-[10px] text-blue-400 font-bold uppercase">Total XP</div>
                  <div className="text-lg font-black text-blue-600 dark:text-blue-400">{userStats.totalXp.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ② 弱点分析カード */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mr-3">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-none">弱点分析</h3>
              <p className="text-xs text-gray-400 font-bold">最も間違えた問題 TOP 5</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {topWeaknesses.length > 0 ? (
              <div className="space-y-3">
                {topWeaknesses.map((w, i) => (
                  <div key={i} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700/50 group hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                    <div className="bg-red-500 text-white font-bold w-6 h-6 rounded flex items-center justify-center text-xs mr-3 flex-shrink-0 shadow-sm mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200 line-clamp-2">{w.text}</p>
                      <p className="text-xs text-red-500 font-bold mt-1 flex items-center">
                        <XCircleIcon size={12} className="mr-1" /> {w.count}回 ミス
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                <Star size={48} className="mb-2 opacity-20" />
                <p className="text-sm font-bold">Excellent!</p>
                <p className="text-xs">まだ苦手な問題はありません</p>
              </div>
            )}
          </div>
        </div>

        {/* ③ 称号コレクション */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
              <Medal size={20} className="text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-none">称号コレクション</h3>
              <p className="text-xs text-gray-400 font-bold">獲得済み: {unlockedTitleIds.length} / {TITLES.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {TITLES.map((title, index) => {
              const isUnlocked = unlockedTitleIds.includes(title.id);
              // 次に解放されるべき称号か？
              const isNext = !isUnlocked && (index === nextUnlockIndex);

              return (
                <div
                  key={title.id}
                  onClick={() => setSelectedTitle({ ...title, isUnlocked, isNext })} // クリックで詳細セット
                  className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden cursor-pointer ${isUnlocked
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:scale-105 hover:shadow-md'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60 hover:opacity-80'
                    }`}
                >
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/0 via-white/20 to-white/0 transform rotate-45 translate-x-8 -translate-y-8 animate-[shimmer_3s_infinite]"></div>
                  )}

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-sm ${isUnlocked
                      ? 'bg-white dark:bg-gray-800 text-purple-500 dark:text-purple-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}>
                    {isUnlocked ? <Medal size={20} /> : <Lock size={18} />}
                  </div>
                  <div className={`font-bold text-xs ${isUnlocked ? 'text-purple-900 dark:text-purple-100' : 'text-gray-400'}`}>
                    {/* 未開放は ？？？ 表示 */}
                    {isUnlocked ? title.name : '？？？'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ★ 称号詳細モーダル */}
      {selectedTitle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedTitle(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full relative animate-pop-in border border-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()} // 中身クリックで閉じないように
          >
            <button
              onClick={() => setSelectedTitle(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-md ${selectedTitle.isUnlocked
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}>
                {selectedTitle.isUnlocked ? <Medal size={40} /> : <Lock size={40} />}
              </div>

              <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">
                {selectedTitle.isUnlocked ? selectedTitle.name : '？？？'}
              </h3>

              <div className={`px-3 py-1 rounded-full text-xs font-bold mb-6 ${selectedTitle.isUnlocked
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                {selectedTitle.isUnlocked ? '獲得済み' : '未開放'}
              </div>

              <div className="w-full bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">獲得条件</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {/* 開放済み: 条件を表示
                     未開放(Next): 条件を表示
                     未開放(それ以外): ？？？で隠す
                  */}
                  {selectedTitle.isUnlocked || selectedTitle.isNext
                    ? selectedTitle.requirement
                    : '？？？？？？？？'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// 小さなヘルパーアイコン
const XCircleIcon: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);

export default StatsView;
