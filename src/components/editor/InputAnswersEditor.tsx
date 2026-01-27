// src/components/editor/InputAnswersEditor.tsx
import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface InputAnswersEditorProps {
  answers: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

/**
 * 記述式問題の正解編集コンポーネント
 */
export const InputAnswersEditor: React.FC<InputAnswersEditorProps> = ({ answers, onChange, onAdd, onRemove }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          正解のキーワード（別解も登録可能）
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="text-xs flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
        >
          <PlusCircle size={14} />
          別解を追加
        </button>
      </div>

      <div className="space-y-2">
        {answers.map((ans, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium w-8 text-center">
              {idx + 1}.
            </span>
            <input
              type="text"
              value={ans}
              onChange={(e) => onChange(idx, e.target.value)}
              className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              placeholder="正解を入力"
            />
            {answers.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="削除"
              >
                <MinusCircle size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        ※ユーザーが入力した値と完全一致した場合に正解となります
      </p>
    </div>
  );
};
