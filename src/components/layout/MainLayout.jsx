import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Settings, Bell, Trophy, Flame, BarChart3, User, LogIn, RefreshCw, Target } from 'lucide-react';
import { getAvatarById } from '../../constants/avatars';

const MainLayout = ({
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
  setShowGoalSettings,
  setShowChangelog
}) => {
  const navigate = useNavigate();

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
                <span>{userStats.streak}日連続</span>
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

            <div className="flex items-center space-x-1">
              <button 
                id="tutorial-stats-btn"
                onClick={() => navigate('/stats')} 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" 
                title="統計"
              >
                <BarChart3 size={20} />
              </button>
              
              {user && (
                <button 
                  id="tutorial-goal-btn"
                  onClick={() => setShowGoalSettings(true)} 
                  className="text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="学習目標"
                >
                  <Target size={20} />
                </button>
              )}
              
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
              
              {/* ユーザーアカウント表示 */}
              <div id="tutorial-profile-area">
                {user ? (
                  <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                    {profile && !isProfileLoading ? (
                      <>
                        <div className="text-3xl">{getAvatarById(profile.avatar).emoji}</div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block max-w-[100px] truncate">
                          {profile.displayName}
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
                            <User size={16} className="text-white" />
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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-20">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
