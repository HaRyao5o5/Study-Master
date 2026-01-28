import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Course, MasteredQuestions } from '../../types';

interface MasteryBarChartProps {
  courses: Course[];
  masteredQuestions: MasteredQuestions;
}

const MasteryBarChart: React.FC<MasteryBarChartProps> = ({ courses, masteredQuestions }) => {
  const data = useMemo(() => {
    return courses.map(course => {
      const totalQuestions = course.quizzes.reduce((acc, q) => acc + q.questions.length, 0);
      const masteredCount = Object.keys(masteredQuestions[course.id] || {}).length;
      const percentage = totalQuestions > 0 ? Math.round((masteredCount / totalQuestions) * 100) : 0;
      
      return {
        name: course.title,
        percentage,
        color: course.color || '#3b82f6',
        full: 100
      };
    }).filter(d => d.percentage > 0 || courses.length < 6); // Don't show too many 0s if we have many courses
  }, [courses, masteredQuestions]);

  if (data.length === 0) return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm font-bold">
          学習データがまだありません
      </div>
  );

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }}
            width={80}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'マスター度']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
          />
          <Bar dataKey="percentage" radius={[0, 10, 10, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MasteryBarChart;
