// src/components/layout/SettingsView.jsx
import React, { useRef } from 'react';
import { ArrowLeft, Sun, Moon, Monitor, Download, Upload, Database, Trash2, LogIn, LogOut, Cloud, User, Shield, Github } from 'lucide-react';
import { CHANGELOG_DATA } from '../../data/changelog';
import { exportToFile, importFromFile } from '../../utils/fileIO';

const APP_VERSION = `Study Master ${CHANGELOG_DATA[0].version}`;

const SettingsView = ({ theme, changeTheme, onBack, courses, onImportData, onResetStats, user, onLogin, onLogout }) => {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    exportToFile(courses, 'backup', 'study-master-backup');
  };

  const handleFileChange = (e) => {
    if (!e.target.files.length) return;
    importFromFile(e.target.files[0], 'backup', (data) => {
      onImportData(data);
    });
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-20">
      {/* ヘッダー部分 */}
      <div className="flex items-center mb-8 pt-4">
        <button 
          onClick={onBack} 
          className="p-3 mr-4 rounded-full glass hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all hover:-translate-x-1 group"
        >
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300 group-hover:text-blue-500" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">アプリの設定とデータ管理</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* 1. アカウント設定 (一番上に配置) */}
        <section className="glass p-6 rounded-3xl border-white/40 dark:border-gray-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <User size={120} />
          </div>
          
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
            <Cloud size={20} className="mr-2 text-blue-500" /> Cloud Sync
          </h3>

          <div className="relative z-10">
            {user ? (
              <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-white/20 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-12 h-12 rounded-full border-2 border-blue-500" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white text-lg">{user.displayName || 'Guest User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl font-bold text-sm transition-colors flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  ログインすると、学習データをクラウドに保存し、<br/>複数のデバイスで同期できます。
                </p>
                <button 
                  onClick={onLogin}
                  className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center mx-auto border border-gray-100 dark:border-gray-600"
                >
                  <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5 mr-3" />
                  Sign in with Google
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 2. テーマ設定 */}
        <section className="glass p-6 rounded-3xl border-white/40 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
            <Monitor size={20} className="mr-2 text-purple-500" /> Appearance
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', icon: Sun, label: 'Light' },
              { id: 'dark', icon: Moon, label: 'Dark' },
              { id: 'system', icon: Monitor, label: 'System' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => changeTheme(option.id)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200
                  ${theme === option.id 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }
                `}
              >
                <option.icon size={24} className="mb-2" />
                <span className="text-xs font-bold">{option.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. データ管理 */}
        <section className="glass p-6 rounded-3xl border-white/40 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
            <Database size={20} className="mr-2 text-green-500" /> Data Management
          </h3>
          <div className="space-y-3">
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-xl border border-white/20 dark:border-gray-700 transition-all group"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-800 dark:text-white">バックアップを保存</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">学習データをファイルとしてダウンロード</div>
                </div>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-xl border border-white/20 dark:border-gray-700 transition-all group"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-800 dark:text-white">バックアップを復元</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">保存したファイルからデータを読み込み</div>
                </div>
              </div>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileChange} 
            />

            {import.meta.env.DEV && (
              <button 
                onClick={onResetStats}
                className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl border border-white/20 dark:border-gray-700 transition-all group mt-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg mr-3 group-hover:rotate-12 transition-transform">
                    <Trash2 size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-red-600 dark:text-red-400">学習データをリセット</div>
                    <div className="text-xs text-red-400 dark:text-red-500/70">レベルや経験値を初期化 (注意)</div>
                  </div>
                </div>
              </button>
            )}
          </div>
        </section>

        <div className="text-center pt-8 text-gray-400 dark:text-gray-600 text-xs font-mono">
          <p>{APP_VERSION}</p>
          <p className="mt-2 flex justify-center items-center gap-2">
            Made with <span className="animate-pulse">❤️</span> by Gemini & You
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;