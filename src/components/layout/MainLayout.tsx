// src/components/layout/MainLayout.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Settings, Bell, Trophy, Flame, BarChart3, User as UserIcon, LogIn, RefreshCw, Target, Menu, X, LucideIcon } from 'lucide-react';

import { User } from '../../types';
import { UserProfileData } from '../../lib/firebaseProfile';
import { getEffectiveStreak } from '../../utils/gamification';

interface MainLayoutProps {
  children: React.ReactNode;
  user: User | null;
  userStats: {
    level: number;
    totalXp: number;
    streak: number;
    lastLogin: string;
  };
  levelInfo: {
    level: number;
    currentXp: number;
    xpForNextLevel: number;
  };
  currentTitle: string;
  xpPercentage: number;
  isSyncing: boolean;
  profile: UserProfileData | null;
  isProfileLoading: boolean;
  wrongHistory: string[];
  onLogin: () => void;
  setShowGoalDetail: (show: boolean) => void;
  setShowChangelog: (show: boolean) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  user,
  userStats,
  levelInfo,
  currentTitle,
  xpPercentage,
  isSyncing,
  profile,
  isProfileLoading,
  wrongHistory,
  onLogin,
  setShowGoalDetail,
  setShowChangelog
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const MobileMenuItem = ({ icon: Icon, label, onClick, badge }: { icon: LucideIcon, label: string, onClick: () => void, badge?: number | null }) => (
    <button 
      onClick={() => {
        onClick();
        setIsMenuOpen(false);
      }}
      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-200"
    >
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
        <Icon size={20} />
      </div>
      <span className="font-bold flex-1 text-left">{label}</span>
      {badge && (
        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className={`min-h-screen font-sans text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 pointer-events-none -z-10"></div>

      <header className="sticky top-0 z-50 glass shadow-sm transition-all">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            id="tutorial-home-btn"
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white p-2 rounded-lg shadow-md transform transition-transform group-hover:scale-105 group-hover:rotate-3">
              <BookOpen size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-gradient leading-none">Study Master</h1>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate max-w-[120px]">
                {currentTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div
              id="tutorial-level-display"
              className="hidden sm:flex flex-col items-end mr-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/ranking')}
            >
              <div className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-200">
                <Trophy size={14} className="text-yellow-500 mr-1" />
                <span>Lv.{levelInfo.level}</span>
                <span className="mx-2 text-gray-300">|</span>
                <Flame size={14} className="text-orange-500 mr-1" />
                <span>{getEffectiveStreak(userStats)}日連続</span>
              </div>
              <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
                {isSyncing && (
                  <div className="absolute inset-0 bg-white/50 animate-pulse flex items-center justify-center">
                    <div className="w-full h-full bg-blue-400 blur-sm"></div>
                  </div>
                )}
              </div>
            </div>

              <div className="hidden md:flex items-center space-x-1">
                <button 
                  id="tutorial-stats-btn"
                  onClick={() => navigate('/stats')} 
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" 
                  title="統計"
                >
                  <BarChart3 size={20} />
                </button>
                
                <button 
                  id="tutorial-goal-btn"
                  onClick={() => setShowGoalDetail(true)} 
                  className="text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="学習目標"
                >
                  <Target size={20} />
                </button>
                
                <button 
                  id="tutorial-review-btn"
                  onClick={() => navigate('/review')} 
                  className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                  title="復習"
                >
                  <RefreshCw size={20} />
                  {wrongHistory.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {wrongHistory.length}
                    </span>
                  )}
                </button>
                
                <button 
                  id="tutorial-ranking-btn"
                  onClick={() => navigate('/ranking')} 
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" 
                  title="ランキング"
                >
                  <Trophy size={20} />
                </button>
                
                <button 
                  id="tutorial-changelog-btn"
                  onClick={() => setShowChangelog(true)} 
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" 
                  title="お知らせ"
                >
                  <Bell size={20} />
                </button>
                
                <button 
                  id="tutorial-settings-btn"
                  onClick={() => navigate('/settings')} 
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${user ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`} 
                  title="設定"
                >
                  <Settings size={20} />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button 
                id="tutorial-menu-btn"
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Menu size={24} />
              </button>
              
              {/* ユーザーアカウント表示 */}
              <div id="tutorial-profile-area">
                {user ? (
                  <div 
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {profile && !isProfileLoading ? (
                      <>
                        {profile.customAvatarUrl ? (
                           <div className="w-9 h-9 relative overflow-hidden rounded-full ring-2 ring-blue-100 dark:ring-blue-900">
                              <img 
                                src={profile.customAvatarUrl} 
                                alt={profile.name}
                                className="w-full h-full object-cover"
                              />
                           </div>
                        ) : (
                           <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                             <UserIcon size={20} />
                           </div>
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block max-w-[100px] truncate">
                          {profile.name}
                        </span>
                      </>
                    ) : (
                      <>
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName || 'User'}
                            className="w-8 h-8 rounded-full ring-2 ring-gray-300 dark:ring-gray-600"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                            <UserIcon size={16} className="text-white" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block max-w-[100px] truncate">
                          {isProfileLoading ? '読み込み中...' : (user.displayName || user.email)}
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={onLogin}
                    className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700 flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-md"
                  >
                    <LogIn size={16} />
                    <span className="hidden sm:inline">ログイン</span>
                  </button>
                )}
              </div>
            </div>
          </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-gray-800 shadow-2xl p-6 animate-slide-in-right flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg text-gray-800 dark:text-white">メニュー</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={24} />
                </button>
             </div>

             <div className="space-y-2 flex-1 overflow-y-auto">
                <MobileMenuItem icon={BarChart3} label="統計データ" onClick={() => navigate('/stats')} />
                <MobileMenuItem icon={Target} label="学習目標" onClick={() => setShowGoalDetail(true)} />
                <MobileMenuItem 
                  icon={RefreshCw} 
                  label="復習モード" 
                  onClick={() => navigate('/review')} 
                  badge={wrongHistory.length > 0 ? wrongHistory.length : null}
                />
                <MobileMenuItem icon={Trophy} label="ランキング" onClick={() => navigate('/ranking')} />
                <MobileMenuItem icon={Bell} label="お知らせ" onClick={() => setShowChangelog(true)} />
                <MobileMenuItem icon={Settings} label="設定" onClick={() => navigate('/settings')} />
             </div>

             <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <div 
                  onClick={() => {
                    if (user) {
                        navigate('/profile');
                        setIsMenuOpen(false);
                    }
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 ${user ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
                >
                  {user && profile ? (
                     <>
                      {profile.customAvatarUrl ? (
                           <div className="w-10 h-10 relative overflow-hidden rounded-full ring-2 ring-blue-100 dark:ring-blue-900 flex-shrink-0">
                              <img 
                                src={profile.customAvatarUrl} 
                                alt={profile.name}
                                className="w-full h-full object-cover"
                              />
                           </div>
                        ) : (
                           <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                             <UserIcon size={24} />
                           </div>
                        )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate dark:text-white">{profile.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Lv.{levelInfo.level}</div>
                      </div>
                     </>
                  ) : (
                    <div className="flex-1 text-center">
                      <button 
                        onClick={() => { onLogin(); setIsMenuOpen(false); }}
                        className="text-blue-600 font-bold text-sm"
                      >
                        ログインして保存
                      </button>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 pb-20">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
