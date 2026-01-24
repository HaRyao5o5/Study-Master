```javascript
// src/components/layout/SettingsView.jsx
import React, { useRef, useState } from 'react'; // useState追加
import { ArrowLeft, Sun, Moon, Monitor, Download, Upload, Database, Trash2, LogIn, LogOut, Cloud, User, Clock, Edit2, Check, X } from 'lucide-react'; // アイコン追加
import { CHANGELOG_DATA } from '../../data/changelog';
import { exportToFile, importFromFile } from '../../utils/fileIO';
import { updateUserProfile } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { SUCCESS, ERROR, CONFIRM } from '../../utils/errorMessages';

const APP_VERSION = `Study Master ${CHANGELOG_DATA[0].version}`;

const SettingsView = ({ theme, changeTheme, onBack, courses, onImportData, onResetStats, onDebugYesterday, user, onLogin, onLogout }) => {
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useToast();
  
  // プロフィール編集用ステート
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user, editName);
      setIsEditing(false);
      showSuccess(SUCCESS.PROFILE_UPDATED);
    } catch (error) {
      showError(ERROR.PROFILE_UPDATE_FAILED);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto animate-fade-in mb-20">
      <div className="bg-gray-50 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600 flex items-center">
        <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>
      </div>

      <div className="p-6 space-y-8">
        
        {/* クラウド同期 */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-600 pb-2 flex items-center">
            <Cloud size={20} className="mr-2 text-blue-500" /> クラウド同期
          </h3>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-600 mr-3" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-3">
                        <User size={20} className="text-blue-500" />
                      </div>
                    )}
                    
                    {/* 名前表示エリア (通常時 / 編集時) */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 text-sm font-bold border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-gray-800 dark:text-white truncate">
                          {user.displayName || 'ユーザー'}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* 編集ボタン */}
                  <div className="ml-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                         <button 
                          onClick={handleSaveProfile} 
                          disabled={isSaving}
                          className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => { setIsEditing(false); setEditName(user.displayName || ''); }} 
                          className="p-2 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setIsEditing(true); setEditName(user.displayName || ''); }}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                        title="名前を変更"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-blue-100 dark:border-blue-900/30 pt-4 mt-2">
                   <p className="text-[10px] text-green-600 dark:text-green-400 font-bold flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                      同期有効
                    </p>
                    <button 
                      onClick={onLogout}
                      className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center"
                    >
                      <LogOut size={14} className="mr-2" /> ログアウト
                    </button>
                </div>
              </div>
            ) : (
              <div className="text-center sm:text-left sm:flex items-center justify-between gap-4">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">データをクラウドに保存</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    ログインすると、学習データを安全にバックアップし、複数端末で同期できます。
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
          <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-600 pb-2 flex items-center">
             <Monitor size={20} className="mr-2 text-purple-500" /> 外観設定
          </h3>
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
            <Database size={20} className="mr-2 text-green-500" /> データ管理
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center justify-center p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all font-bold text-gray-600 dark:text-gray-300 group"
            >
              <Download size={20} className="mr-2 group-hover:-translate-y-1 transition-transform" />
              バックアップを保存
            </button>
            <button 
              onClick={handleImportClick}
              className="flex items-center justify-center p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-500 hover:text-green-600 dark:hover:border-green-400 dark:hover:text-green-400 transition-all font-bold text-gray-600 dark:text-gray-300 group"
            >
              <Upload size={20} className="mr-2 group-hover:-translate-y-1 transition-transform" />
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
               <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Developer Zone</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <button 
                  onClick={onDebugYesterday}
                  className="flex items-center justify-center p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-lg text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                >
                  <Clock size={18} className="mr-2" />
                  昨日ログイン状態へ (Time Travel)
                </button>
                 <button 
                  onClick={onResetStats}
                  className="flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 size={18} className="mr-2" />
                  ステータス初期化 (Reset)
                </button>
               </div>
            </div>
          )}
        </div>

        <div className="text-center pt-8 pb-4">
          <p className="text-sm font-mono text-gray-400 dark:text-gray-500">
            {APP_VERSION}
          </p>
          <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
            © 2026 Study Master Project
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;