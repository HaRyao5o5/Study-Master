// src/components/editor/QuestionTypeSelector.jsx
import React from 'react';
import { List, CheckSquare, Type } from 'lucide-react';

/**
 * 問題タイプ選択コンポーネント
 * @param {Object} props
 * @param {string} props.value - 現在選択されているタイプ ('select' | 'multi-select' | 'input')
 * @param {Function} props.onChange - タイプ変更時のコールバック
 */
export function QuestionTypeSelector({ value, onChange }) {
  const types = [
    { id: 'select', label: '単一選択', icon: List, color: 'blue' },
    { id: 'multi-select', label: '複数選択', icon: CheckSquare, color: 'orange' },
    { id: 'input', label: '記述式', icon: Type, color: 'purple' }
  ];

  return (
    <div className="flex gap-2">
      {types.map(type => {
        const Icon = type.icon;
        const isActive = value === type.id;
        
        return (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-medium ${
              isActive
                ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20 text-${type.color}-600 dark:text-${type.color}-400`
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Icon size={18} />
            <span className="text-sm">{type.label}</span>
          </button>
        );
      })}
    </div>
  );
}
