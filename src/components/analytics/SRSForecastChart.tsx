import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ReviewItem } from '../../types';

interface SRSForecastChartProps {
  reviews: Record<string, ReviewItem>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl">
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${payload[0].payload.isToday ? 'bg-red-500' : 'bg-blue-500'}`} />
          <p className="text-sm font-black text-gray-800 dark:text-white">
            {payload[0].value} <span className="text-xs font-bold text-gray-500">問</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const SRSForecastChart: React.FC<SRSForecastChartProps> = ({ reviews }) => {
  const data = useMemo(() => {
    const forecast: Record<string, number> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize next 14 days
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
      forecast[dateStr] = 0;
    }

    // Aggregate reviews by due date
    Object.values(reviews).forEach((item) => {
      const dueDate = new Date(item.nextReview);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays < 14) {
        const date = new Date(today);
        date.setDate(today.getDate() + diffDays);
        const dateStr = date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
        forecast[dateStr] = (forecast[dateStr] || 0) + 1;
      } else if (diffDays < 0) {
        // Overdue items go into "today" or a separate category
        const todayStr = today.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
        forecast[todayStr] = (forecast[todayStr] || 0) + 1;
      }
    });

    return Object.entries(forecast).map(([name, count]) => ({
      name,
      count,
      isToday: name === today.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    }));
  }, [reviews]);

  const totalUpcoming = Object.values(reviews).length;

  return (
    <div className="h-[250px] w-full mt-4">
      {totalUpcoming === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
          <p className="text-sm font-bold">復習予定のアイテムがありません</p>
          <p className="text-xs">クイズを完了してアイテムを追加しましょう</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
              interval={1}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={<CustomTooltip />}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={16}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isToday ? '#ef4444' : '#3b82f6'} 
                  fillOpacity={entry.isToday ? 0.9 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SRSForecastChart;
