import React from 'react';
import { Flame, Check } from 'lucide-react';
import { UserStats } from '../../types';

interface StreakStatusProps {
  userStats: UserStats;
}

const StreakStatus: React.FC<StreakStatusProps> = ({ userStats }) => {
  // Generate last 7 days
  const today = new Date();
  const days = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // Identify login status
  // userStats.loginHistory contains 'YYYY-MM-DD' strings
  const history = userStats.loginHistory || [];
  
  // Also assume today is logged in if we are showing this component (since we just updated logic)
  // But let's rely on the history for consistency
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl mb-6 animate-fade-in relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="flex items-center mb-8 relative z-10">
        <div className="mr-6">
            <h2 className="text-6xl font-black text-gray-800 dark:text-white leading-none">
              {userStats.streak}
            </h2>
        </div>
        
        <div className="flex flex-col justify-center">
            <div className="bg-orange-500 text-white p-1.5 rounded-lg w-fit mb-1 shadow-md animate-bounce-subtle">
                <Flame size={24} fill="currentColor" />
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                現在の<br/>連続記録
            </span>
        </div>
      </div>

      <div className="flex justify-between items-center relative z-10">
        {days.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          // Determine activity: check history or if it's today (optimistic)
          const isToday = index === 6;
          const active = history.includes(dateStr) || isToday;

          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  active 
                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-110' 
                    : 'bg-transparent border-gray-200 dark:border-gray-700 text-transparent'
                }`}
              >
                {active && <Check size={20} strokeWidth={4} />}
              </div>
              <span className={`text-sm font-bold ${isToday ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
                {weekDays[date.getDay()]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StreakStatus;
