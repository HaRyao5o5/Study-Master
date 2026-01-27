// src/components/editor/QuestionList.tsx
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Question } from '../../types';

interface QuestionListProps {
  questions: Question[];
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({ questions, onEdit, onDelete }) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
        問題一覧 ({questions.length}問)
      </h3>
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div 
            key={q.id} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-600 dark:text-blue-400">Q{idx + 1}.</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    q.type === 'select' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    q.type === 'multi-select' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  }`}>
                    {q.type === 'select' ? '単一選択' : q.type === 'multi-select' ? '複数選択' : '記述式'}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{q.text}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onEdit(q)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="編集"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDelete(q.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="削除"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
