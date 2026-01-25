// src/components/layout/SettingsView.jsx
import React, { useRef, useState } from 'react'; // useState追加
import { ArrowLeft, Sun, Moon, Monitor, Download, Upload, Database, Trash2, LogIn, LogOut, Cloud, User, Clock, Edit2, Check, X } from 'lucide-react'; // アイコン追加
import { CHANGELOG_DATA } from '../../data/changelog';
import { exportToFile, importFromFile } from '../../utils/fileIO';
import { updateUserProfile } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { SUCCESS, ERROR } from '../../utils/errorMessages';

const APP_VERSION = `Study Master ${CHANGELOG_DATA[0].version}`;

const SettingsView = ({ theme, changeTheme, onBack, courses, onImportData, onResetStats, onDebugYesterday, user, onLogin, onLogout, onEditProfile }) => {
  const fileInputRef = useRef(null);
  const { showSuccess, showError, showConfirm } = useToast();
  
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
      await updateUserProfile(user, editName.trim());
      showSuccess(SUCCESS.PROFILE_UPDATE_SUCCESS);
      setIsEditing(false);
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
                    
                    {/* ユーザー情報表示 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-blue-100 dark:border-blue-900/30 pt-4 mt-2">
                   <p className="text-[10px] text-green-600 dark:text-green-400 font-bold flex items-center">
                     <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                     同期有効
                   </p>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => {
                         console.log('Profile button clicked, onEditProfile:', onEditProfile);
                         if (onEditProfile) onEditProfile();
                       }}
                       className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center"
                     >
                       <Edit2 size={14} className="mr-1" /> プロフィール
                     </button>
                     <button 
                       onClick={onLogout}
                       className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center"
                     >
                       <LogOut size={14} className="mr-2" /> ログアウト
                     </button>
                   </div>
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

        {/* テーマ */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-600 pb-2">テーマ</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light', icon: Sun, label: 'ライト' },
              { value: 'dark', icon: Moon, label: 'ダーク' },
              { value: 'auto', icon: Monitor, label: '自動' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => changeTheme(value)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  theme === value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon size={24} />
                <span className="text-sm font-bold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* データ管理 */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-600 pb-2 flex items-center">
            <Database size={20} className="mr-2 text-purple-500" /> データ管理
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={handleExport} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-3 text-green-700 dark:text-green-400 font-bold">
              <Download size={20} />
              エクスポート
            </button>
            <button onClick={handleImportClick} className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors flex items-center justify-center gap-3 text-orange-700 dark:text-orange-400 font-bold">
              <Upload size={20} />
              インポート
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
          </div>
        </div>

        {/* リセット */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-600 pb-2 flex items-center">
            <Trash2 size={20} className="mr-2 text-red-500" /> リセット
          </h3>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              以下の操作は元に戻せません。実行前に必ずバックアップを取ってください。
            </p>
            <button onClick={onResetStats} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors">
              統計データをリセット
            </button>
          </div>
        </div>

        {/* デバッグ機能 (開発用) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-600 pb-2 flex items-center">
              <Clock size={20} className="mr-2 text-gray-500" /> デバッグ
            </h3>
            <button onClick={onDebugYesterday} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              昨日ログインしたことにする
            </button>
          </div>
        )}

        {/* バージョン情報 */}
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm pt-4 border-t border-gray-200 dark:border-gray-700">
          {APP_VERSION}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;