// src/components/common/GoalProgress.jsx
import React from 'react';
import { Target, TrendingUp, CheckCircle } from 'lucide-react';

const GoalProgress = ({ goals }) => {
  const dailyPercent = goals.dailyXpGoal > 0 
    ? Math.min((goals.dailyProgress / goals.dailyXpGoal) * 100, 100)
    : 0;
  
  const weeklyPercent = goals.weeklyXpGoal > 0
    ? Math.min((goals.weeklyProgress / goals.weeklyXpGoal) * 100, 100)
    : 0;

  const dailyAchieved = dailyPercent >= 100;
  const weeklyAchieved = weeklyPercent >= 100;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-6 border border-blue-200 dark:border-gray-600">
      <div className="flex items-center gap-2 mb-4">
        <Target size={24} className="text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">学習目標</h3>
      </div>

      {/* 日次目標 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" />
            <span className="font-bold text-gray-700 dark:text-gray-300">今日の目標</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {goals.dailyProgress}/{goals.dailyXpGoal} XP
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({Math.round(dailyPercent)}%)
            </span>
            {dailyAchieved && (
              <CheckCircle size={20} className="text-green-500" />
            )}
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              dailyAchieved 
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : 'bg-gradient-to-r from-blue-400 to-blue-600'
            }`}
            style={{ width: `${dailyPercent}%` }}
          />
        </div>
      </div>

      {/* 週次目標 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-500" />
            <span className="font-bold text-gray-700 dark:text-gray-300">今週の目標</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {goals.weeklyProgress}/{goals.weeklyXpGoal} XP
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({Math.round(weeklyPercent)}%)
            </span>
            {weeklyAchieved && (
              <CheckCircle size={20} className="text-green-500" />
            )}
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              weeklyAchieved
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : 'bg-gradient-to-r from-purple-400 to-purple-600'
            }`}
            style={{ width: `${weeklyPercent}%` }}
          />
        </div>
      </div>

      {/* 達成メッセージ */}
      {(dailyAchieved || weeklyAchieved) && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-gray-600">
          {dailyAchieved && !weeklyAchieved && (
            <p className="text-green-600 dark:text-green-400 font-bold text-center">
              🎯 今日の目標達成！素晴らしい！
            </p>
          )}
          {weeklyAchieved && (
            <p className="text-green-600 dark:text-green-400 font-bold text-center">
              🏆 今週の目標達成！完璧です！
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalProgress;
