// src/components/layout/RankingView.tsx
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Crown, Medal, User as UserIcon, Flame, Lock, Shield } from 'lucide-react';
import { getLeaderboard, LeaderboardUser } from '../../lib/firebase';
import LoadingScreen from '../common/LoadingScreen';
import { User } from '../../types';

interface RankingViewProps {
  onBack: () => void;
  currentUser: User | null;
}

const RankingView: React.FC<RankingViewProps> = ({ onBack, currentUser }) => {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {


      try {
        setError(null);
        const data = await getLeaderboard();
        setLeaders(data);
      } catch (err: any) {
        console.error(err);
        setError(`ランキングの読み込みに失敗しました。\nCode: ${err.code || 'Unknown'}\nMsg: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []); // ★ 依存配列を空に戻す（初回ロード時に即取得）

  if (loading) return <LoadingScreen />;

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return { icon: <Crown size={24} className="text-yellow-500 fill-current" />, bg: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700", text: "text-yellow-600 dark:text-yellow-400" };
      case 1: return { icon: <Medal size={24} className="text-gray-400 fill-current" />, bg: "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600", text: "text-gray-600 dark:text-gray-300" };
      case 2: return { icon: <Medal size={24} className="text-orange-400 fill-current" />, bg: "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700", text: "text-orange-600 dark:text-orange-400" };
      default: return { icon: <span className="text-lg font-black text-gray-400 w-6 text-center">{index + 1}</span>, bg: "glass hover:bg-white/80 dark:hover:bg-gray-800/80", text: "text-gray-500" };
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-fade-in">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 glass border-b border-gray-200 dark:border-gray-700 px-4 py-4 mb-6 flex items-center justify-between">
        <div className="flex items-center">
            <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
            <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center">
                <Trophy size={28} className="mr-2 text-yellow-500" />
                Leaderboard
            </h2>
        </div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Top 50
        </div>
      </div>

      <div className="px-4 space-y-3">
        {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm whitespace-pre-wrap break-all">
                <p className="font-bold flex items-center mb-2"><Lock size={16} className="mr-2"/> アクセスエラー</p>
                {error}
                <p className="mt-2 text-xs text-red-500 opacity-80">※ FirebaseコンソールのRulesで "allow read: if true;" になっていますか？</p>
            </div>
        )}

        {leaders.map((user, index) => {
          const style = getRankStyle(index);
          const isMe = currentUser && currentUser.uid === user.id;

          return (
            <div 
              key={user.id}
              className={`relative flex items-center p-4 rounded-2xl border transition-all ${style.bg} ${isMe ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02] z-10' : ''}`}
            >
              <div className="flex-shrink-0 w-12 flex justify-center">
                {style.icon}
              </div>

              <div className="flex-shrink-0 mr-4">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-600 shadow-sm" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                    <UserIcon size={24} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-bold truncate text-gray-800 dark:text-white ${index < 3 ? 'text-lg' : ''}`}>
                  {user.displayName}
                  {isMe && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">YOU</span>}
                </p>
                <div className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded mr-2">
                        Lv.{user.level}
                    </span>
                    {user.streak > 0 && (
                        <span className="flex items-center text-orange-500">
                            <Flame size={12} className="mr-1 fill-current" />
                            {user.streak} Days
                        </span>
                    )}
                </div>
              </div>

              <div className="text-right pl-4">
                <div className="text-lg font-black text-gray-800 dark:text-white">
                    {user.totalXp.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">Total XP</div>
              </div>
            </div>
          );
        })}
        
        {leaders.length === 0 && !error && (
            <div className="text-center py-20 text-gray-400">
                <Shield size={48} className="mx-auto mb-4 opacity-50" />
                <p>ランキングデータがありません</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default RankingView;
