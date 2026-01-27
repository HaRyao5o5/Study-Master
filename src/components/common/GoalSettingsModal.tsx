// src/components/common/GoalSettingsModal.tsx
import React, { useState } from 'react';
import { X, Target, TrendingUp } from 'lucide-react';
import { UserGoals } from '../../types';

interface GoalSettingsModalProps {
  goals: UserGoals;
  onSave: (newGoals: Partial<UserGoals>) => void;
  onClose: () => void;
}

const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({ goals, onSave, onClose }) => {
  const [dailyGoal, setDailyGoal] = useState<number>(goals.dailyXpGoal);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(goals.weeklyXpGoal);

  const handleSave = () => {
    onSave({
      dailyXpGoal: dailyGoal,
      weeklyXpGoal: weeklyGoal
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={28} className="text-white" />
              <h2 className="text-2xl font-bold text-white">学習目標設定</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 日次目標 */}
          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white mb-3">
              <TrendingUp size={20} className="text-blue-500" />
              日次XP目標
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">0 XP</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {dailyGoal} XP
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">500 XP</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              1日に獲得したいXPを設定します。おすすめ: 100-200 XP
            </p>
          </div>

          {/* 週次目標 */}
          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white mb-3">
              <TrendingUp size={20} className="text-purple-500" />
              週次XP目標
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="3500"
                step="50"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">0 XP</span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {weeklyGoal} XP
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">3500 XP</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              1週間に獲得したいXPを設定します。おすすめ: 700-1400 XP
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalSettingsModal;
