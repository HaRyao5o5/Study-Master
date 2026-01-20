import React, { useRef } from 'react';
import { ArrowLeft, Sun, Moon, Monitor, Download, Upload, Database, Trash2, LogIn, LogOut, Cloud, User } from 'lucide-react';
import { CHANGELOG_DATA } from '../../data/changelog';
import { exportToFile, importFromFile } from '../../utils/fileIO';

const APP_VERSION = `Study Master ${CHANGELOG_DATA[0].version} - Creator Edition Pro`;

const SettingsView = ({ theme, changeTheme, onBack, courses, onImportData, onResetStats, user, onLogin, onLogout }) => {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    exportToFile(courses, 'backup', 'study-master-backup');
  };

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto animate-fade-in">
      <div className="bg-gray-50 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600 flex items-center">
        <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">アプリ設定</h2>
      </div>

      <div className="p-6 space-y-8">
        
        {/* クラウド同期 / アカウント設定 */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-600 pb-2 flex items-center">
            <Cloud size={20} className="mr-2 text-blue-500" /> クラウド同期
          </h3>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
            {user ? (
              // ログイン済みの場合
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-600 mr-3" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-3">
                      <User size={20} className="text-blue-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{user.displayName || '名無しさん'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-1 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                      クラウド同期有効
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  <LogOut size={16} className="mr-2" /> ログアウト
                </button>
              </div>
            ) : (
              // 未ログインの場合
              <div className="text-center sm:text-left sm:flex items-center justify-between gap-4">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">データをクラウドに保存</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    ログインすると、PCとスマホでデータを共有したり、データの消失を防いだりできます。
                    <br/><span className="font-bold">今のデータは自動的に引き継がれます。</span>
                  </p>
                </div>
                <button 
                  onClick={onLogin}
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-lg shadow-sm border border-gray-300 transition-all flex items-center justify-center"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5 mr-3" />
                  Googleでログイン
                </button>
              </div>
            )}
          </div>
        </div>

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

        {/* データ管理 */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-600 pb-2 flex items-center">
            <Database size={20} className="mr-2" /> ファイル管理
          </h3>
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

          {/* デバッグ用エリア (開発環境のみ表示) */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
               <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">デバッグ・開発者オプション (Dev Only)</h4>
               <button 
                onClick={onResetStats}
                className="w-full flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <Trash2 size={18} className="mr-2" />
                ステータスを初期化 (Lv.1 / Streak 0)
              </button>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-400 mt-8">
          {APP_VERSION}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;