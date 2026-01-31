import React, { useState, useEffect } from 'react';
import { X, Target, CheckCircle, Trophy, Flame } from 'lucide-react';
import { UserGoals } from '../../types';

interface GoalDetailModalProps {
  goals: UserGoals;
  onClose: () => void;
}

const GoalDetailModal: React.FC<GoalDetailModalProps> = ({ goals, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setIsVisible(true); }, []);

  const dailyPercent = goals.dailyXpGoal > 0 
    ? Math.min((goals.dailyProgress / goals.dailyXpGoal) * 100, 100)
    : 0;
  
  const weeklyPercent = goals.weeklyXpGoal > 0
    ? Math.min((goals.weeklyProgress / goals.weeklyXpGoal) * 100, 100)
    : 0;

  const dailyAchieved = dailyPercent >= 100;
  const weeklyAchieved = weeklyPercent >= 100;

  return (
    <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
    >
      <div 
        className={`glass w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100/50 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/40">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="text-blue-500" />
            学習目標の進捗
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
            {/* Daily Goal */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Flame className="text-orange-500" size={20} />
                        <span className="font-bold text-gray-700 dark:text-gray-300">今日の目標</span>
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                        {goals.dailyProgress} / {goals.dailyXpGoal} XP
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden mb-2">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                        dailyAchieved 
                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                            : 'bg-gradient-to-r from-blue-400 to-blue-600'
                        }`}
                        style={{ width: `${dailyPercent}%` }}
                    />
                </div>
                {dailyAchieved ? (
                        <p className="text-green-600 dark:text-green-400 font-bold text-sm flex items-center gap-1">
                        <CheckCircle size={16} /> 目標達成！連続記録継続中！
                        </p>
                ) : (
                    <p className="text-gray-500 text-sm">あと {Math.max(0, goals.dailyXpGoal - goals.dailyProgress)} XPで達成</p>
                )}
            </div>

            {/* Weekly Goal */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Trophy className="text-purple-500" size={20} />
                        <span className="font-bold text-gray-700 dark:text-gray-300">今週の目標</span>
                    </div>
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                        {goals.weeklyProgress} / {goals.weeklyXpGoal} XP
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden mb-2">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                        weeklyAchieved
                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                            : 'bg-gradient-to-r from-purple-400 to-purple-600'
                        }`}
                        style={{ width: `${weeklyPercent}%` }}
                    />
                </div>
                {weeklyAchieved ? (
                        <p className="text-green-600 dark:text-green-400 font-bold text-sm flex items-center gap-1">
                        <CheckCircle size={16} /> 週間目標達成！素晴らしい！
                        </p>
                ) : (
                    <p className="text-gray-500 text-sm">あと {Math.max(0, goals.weeklyXpGoal - goals.weeklyProgress)} XPで達成</p>
                )}
            </div>
        </div>

        <div className="pb-6 px-6 text-center text-xs text-gray-400">
            <p>※週間目標は毎週月曜日にリセットされます。</p>
        </div>

      </div>
    </div>
  );
};

export default GoalDetailModal;
