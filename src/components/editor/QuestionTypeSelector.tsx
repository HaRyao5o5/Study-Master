// src/components/editor/QuestionTypeSelector.tsx
import React from 'react';
import { List, CheckSquare, Type, LucideIcon } from 'lucide-react';
import { QuestionType } from '../../types';

interface QuestionTypeSelectorProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
}

interface TypeOption {
  id: QuestionType;
  label: string;
  icon: LucideIcon;
  color: string;
}

/**
 * 問題タイプ選択コンポーネント
 */
export const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({ value, onChange }) => {
  const types: TypeOption[] = [
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
};
