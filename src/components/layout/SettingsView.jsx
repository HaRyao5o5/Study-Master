import React from 'react';
import { ArrowLeft, Sun, Moon, Monitor } from 'lucide-react';

const APP_VERSION = "v2.2.0";

const SettingsView = ({ theme, changeTheme, onBack }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-gray-50 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600 flex items-center">
        <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><ArrowLeft size={24} /></button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">アプリ設定</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="p-4 border rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">外観テーマ</h3>
          <div className="grid grid-cols-3 gap-3">
            {[ { id: 'light', label: 'ライト', icon: Sun }, { id: 'dark', label: 'ダーク', icon: Moon }, { id: 'system', label: 'システム', icon: Monitor } ].map((mode) => (
              <button key={mode.id} onClick={() => changeTheme(mode.id)} className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${theme === mode.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'border-transparent bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'}`}>
                <mode.icon size={24} className="mb-2" />
                <span className="text-xs font-bold">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="text-center text-sm text-gray-400 mt-8">{APP_VERSION} - Creator Edition Pro</div>
      </div>
    </div>
  );
};

export default SettingsView;