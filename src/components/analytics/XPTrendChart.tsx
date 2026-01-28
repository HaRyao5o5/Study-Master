import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface XPTrendChartProps {
  xpHistory: Record<string, number>;
  days?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl">
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <p className="text-sm font-black text-gray-800 dark:text-white">
            {payload[0].value} <span className="text-xs font-bold text-gray-500">XP</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const XPTrendChart: React.FC<XPTrendChartProps> = ({ xpHistory, days = 14 }) => {
  const data = useMemo(() => {
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      result.push({
        date: dateStr.split('-').slice(1).join('/'), // MM/DD
        xp: xpHistory[dateStr] || 0
      });
    }
    return result;
  }, [xpHistory, days]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="xp" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorXp)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default XPTrendChart;
