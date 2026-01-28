import React, { useMemo } from 'react';

interface StudyHeatmapProps {
  loginHistory: string[]; // YYYY-MM-DD
}

const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ loginHistory }) => {
  const weeks = useMemo(() => {
    const result = [];
    const today = new Date();
    // 16 weeks back
    const startDate = new Date();
    startDate.setDate(today.getDate() - (15 * 7));
    // Adjust to Monday
    const startDay = startDate.getDay();
    const diff = startDay === 0 ? 6 : startDay - 1; 
    startDate.setDate(startDate.getDate() - diff);

    let currentDate = new Date(startDate);
    
    for (let w = 0; w < 16; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        week.push({
          date: dateStr,
          active: loginHistory.includes(dateStr),
          isToday: dateStr === today.toISOString().split('T')[0]
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      result.push(week);
    }
    return result;
  }, [loginHistory]);

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-2 overflow-x-auto pb-4 custom-scrollbar">
        {/* Day Labels */}
        <div className="flex flex-col gap-1 mt-1 shrink-0">
          <div className="h-3 text-[9px] font-bold text-gray-400 flex items-center">月</div>
          <div className="h-3"></div>
          <div className="h-3 text-[9px] font-bold text-gray-400 flex items-center">水</div>
          <div className="h-3"></div>
          <div className="h-3 text-[9px] font-bold text-gray-400 flex items-center">金</div>
          <div className="h-3"></div>
          <div className="h-3"></div>
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  title={day.date}
                  className={`w-3.5 h-3.5 rounded-[2px] border transition-all duration-300 ${
                    day.active 
                      ? 'bg-blue-500 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]' 
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 shadow-inner'
                  } ${day.isToday ? 'ring-2 ring-blue-400/50 ring-offset-1 dark:ring-offset-gray-900 z-10' : 'hover:scale-110 hover:z-10'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mt-1 px-1">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-blue-200 border border-blue-100 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-blue-500 border border-blue-400 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
        <div className="flex gap-4">
          <span>16週間前</span>
          <span>今日</span>
        </div>
      </div>
    </div>
  );
};

export default StudyHeatmap;
