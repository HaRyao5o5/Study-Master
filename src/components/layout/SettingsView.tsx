// src/components/layout/SettingsView.tsx
import React, { useRef, useState } from 'react';
import { ArrowLeft, Sun, Moon, Monitor, Download, Upload, Database, Trash2, LogIn, LogOut, User as UserIcon, Clock, Edit2, Check, X, ChevronRight, LucideIcon } from 'lucide-react';
import { CHANGELOG_DATA } from '../../data/changelog';
import { exportToFile, importFromFile } from '../../utils/fileIO';
import { updateUserProfile } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { SUCCESS, ERROR } from '../../utils/errorMessages';
import { Course, User } from '../../types';

const APP_VERSION = `Study Master ${CHANGELOG_DATA[0].version}`;

interface SettingsSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  color?: "blue" | "purple" | "red" | "gray" | "orange";
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon: Icon, children, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-500",
    purple: "text-purple-500",
    red: "text-red-500",
    gray: "text-gray-500",
    orange: "text-orange-500"
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 flex items-center">
        {Icon && <Icon size={16} className={`mr-2 ${colorClasses[color]}`} />}
        {title}
      </h3>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
        {children}
      </div>
    </div>
  );
};

interface SettingsItemProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  onClick?: () => void;
  action?: React.ReactNode;
  isDestructive?: boolean;
  rightElement?: React.ReactNode;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon: Icon, label, description, onClick, action, isDestructive, rightElement }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group ${
      isDestructive ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-700 dark:text-gray-200'
    }`}
  >
    <div className="flex items-center space-x-3.5">
      {Icon && (
        <div className={`p-2 rounded-lg ${
          isDestructive 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400'
        } transition-colors`}>
          <Icon size={20} />
        </div>
      )}
      <div>
        <div className="font-bold text-base">{label}</div>
        {description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>}
      </div>
    </div>
    <div className="flex items-center text-gray-400">
      {action || rightElement}
      {!action && !rightElement && <ChevronRight size={18} />}
    </div>
  </button>
);

interface SettingsViewProps {
  theme: string;
  changeTheme: (value: string) => void;
  onBack: () => void;
  courses: Course[];
  onImportData: (data: any) => void;
  onResetStats: () => void;
  onDebugYesterday: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onEditProfile?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  theme, 
  changeTheme, 
  onBack, 
  courses, 
  onImportData, 
  onResetStats, 
  onDebugYesterday, 
  user, 
  onLogin, 
  onLogout 
  // onEditProfile is unused in implementation
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showConfirm } = useToast();
  
  // プロフィール編集用ステート
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleExport = () => {
    exportToFile(courses, 'backup', 'study-master-backup');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importFromFile(e.target.files[0], 'backup', (data) => {
        onImportData(data);
      });
      e.target.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user, editName.trim());
      showSuccess(SUCCESS.PROFILE_UPDATED);
      setIsEditing(false);
    } catch (error) {
      showError(ERROR.PROFILE_UPDATE_FAILED);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutClick = async () => {
    const confirmed = await showConfirm('ログアウトしますか？');
    if (confirmed) onLogout();
  };

  const handleResetClick = async () => {
    onResetStats();
  };

  const ThemeRadio = ({ value, label, icon: Icon }: { value: string, label: string, icon: LucideIcon }) => (
    <button
      onClick={() => changeTheme(value)}
      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
        theme === value
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
          : 'border-transparent bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      <Icon size={24} className="mb-1" />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto animate-slide-up pb-20">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack} 
          className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="戻る"
        >
          <ArrowLeft size={24} className="text-gray-700 dark:text-white" />
        </button>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">設定</h2>
      </div>

      <div className="space-y-8">
        
        {/* アカウント設定 */}
        <SettingsSection title="アカウント" icon={UserIcon} color="blue">
          {user ? (
            <>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-600 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                      <UserIcon size={20} className="text-white" />
                    </div>
                  )}
                  <div>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                          autoFocus
                        />
                        <button onClick={handleSaveProfile} disabled={isSaving} className="p-1 bg-green-500 text-white rounded hover:bg-green-600"><Check size={16} /></button>
                        <button onClick={() => setIsEditing(false)} className="p-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center group cursor-pointer" onClick={() => setIsEditing(true)}>
                        <h3 className="font-bold text-gray-800 dark:text-white mr-2">{user.displayName || 'No Name'}</h3>
                        <Edit2 size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                  同期中
                </div>
              </div>
              
              <SettingsItem 
                icon={LogOut} 
                label="ログアウト" 
                onClick={handleLogoutClick} 
                isDestructive
              />
            </>
          ) : (
            <div className="p-6 text-center">
              <div className="mb-4">
                <p className="font-bold text-gray-800 dark:text-white">学習データを保存しよう</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ログインすると複数の端末でデータを同期できます。</p>
              </div>
              <button 
                onClick={onLogin}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-[1.02] flex items-center justify-center"
              >
                <LogIn size={20} className="mr-2" />
                Googleでログイン
              </button>
            </div>
          )}
        </SettingsSection>

        {/* 外観設定 */}
        <SettingsSection title="外観" icon={Monitor} color="purple">
          <div className="p-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
               <ThemeRadio value="light" icon={Sun} label="ライト" />
               <ThemeRadio value="dark" icon={Moon} label="ダーク" />
               <ThemeRadio value="auto" icon={Monitor} label="自動" />
            </div>
          </div>
        </SettingsSection>

        {/* データ管理 */}
        <SettingsSection title="データ管理" icon={Database} color="gray">
          <SettingsItem 
            icon={Download} 
            label="バックアップを作成" 
            description="現在の学習データをファイルに書き出します" 
            onClick={handleExport} 
          />
          <SettingsItem 
            icon={Upload} 
            label="バックアップから復元" 
            description="ファイルから学習データを読み込みます" 
            onClick={handleImportClick} 
          />
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
        </SettingsSection>

        {/* 危険な操作 */}
        <SettingsSection title="リセット操作" icon={Trash2} color="red">
          <SettingsItem 
            icon={Trash2} 
            label="統計データをリセット" 
            description="これまでの学習履歴がすべて消去されます" 
            onClick={handleResetClick} 
            isDestructive 
          />
        </SettingsSection>

        {/* デバッグ機能 (開発用) */}
        {process.env.NODE_ENV === 'development' && (
          <SettingsSection title="デバッグ" icon={Clock} color="orange">
            <SettingsItem 
              icon={Clock} 
              label="昨日ログインしたことにする" 
              onClick={onDebugYesterday} 
            />
          </SettingsSection>
        )}

        {/* バージョン情報 */}
        <div className="text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{APP_VERSION}</p>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
