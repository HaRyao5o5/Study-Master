// src/components/layout/SettingsView.jsx
import React, { useRef } from 'react';
import { ArrowLeft, Sun, Moon, Monitor, Download, Upload, Database } from 'lucide-react';
import { CHANGELOG_DATA } from '../../data/changelog';
import { exportToFile, importFromFile } from '../../utils/fileIO';

const APP_VERSION = `Study Master ${CHANGELOG_DATA[0].version} - Creator Edition Pro`;

const SettingsView = ({ theme, changeTheme, onBack, courses, onImportData }) => {
  const fileInputRef = useRef(null);

  // バックアップ保存 (Utilityを使用)
  const handleExport = () => {
    exportToFile(courses, 'backup', 'study-master-backup');
  };

  // バックアップ復元 (Utilityを使用)
  const handleFileChange = (e) => {
    importFromFile(e.target.files[0], 'backup', (data) => {
      onImportData(data);
    });
    e.target.value = '';
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-gray-50 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600 flex items-center">
        <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">アプリ設定</h2>
      </div>

      <div className="p-6 space-y-8">
        {/* テーマ設定 */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-600 pb-2">外観テーマ</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'ライト', icon: Sun },
              { id: 'dark', label: 'ダーク', icon: Moon },
              { id: 'system', label: 'システム', icon: Monitor }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => changeTheme(mode.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  theme === mode.id 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                }`}
              >
                <mode.icon size={24} className="mb-2" />
                <span className="text-xs font-bold">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* データ管理 (バックアップ) */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-600 pb-2 flex items-center">
            <Database size={20} className="mr-2" /> データ管理
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200 mb-4">
            作成した問題データをファイルとして保存したり、友達から送られてきたデータを読み込んだりできます。
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center justify-center p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all font-bold text-gray-600 dark:text-gray-300"
            >
              <Download size={20} className="mr-2" />
              バックアップを保存
            </button>
            <button 
              onClick={handleImportClick}
              className="flex items-center justify-center p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-500 hover:text-green-600 dark:hover:border-green-400 dark:hover:text-green-400 transition-all font-bold text-gray-600 dark:text-gray-300"
            >
              <Upload size={20} className="mr-2" />
              データを復元
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 mt-8">
          {APP_VERSION}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;