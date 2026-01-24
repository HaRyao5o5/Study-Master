// src/components/editor/OptionsEditor.jsx
import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

/**
 * 選択肢編集コンポーネント（単一/複数選択用）
 * @param {Object} props
 * @param {string} props.type - 問題タイプ ('select' | 'multi-select')
 * @param {string[]} props.options - 選択肢リスト
 * @param {string[]} props.correctAnswer - 正解リスト
 * @param {Function} props.onOptionsChange - 選択肢変更コールバック
 * @param {Function} props.onCorrectChange - 正解変更コールバック
 * @param {Function} props.onAddOption - 選択肢追加コールバック
 * @param {Function} props.onRemoveOption - 選択肢削除コールバック
 */
export function OptionsEditor({ 
  type, 
  options, 
  correctAnswer, 
  onOptionsChange,
  onCorrectChange,
  onAddOption,
  onRemoveOption 
}) {
  const isMultiple = type === 'multi-select';
  const inputType = isMultiple ? 'checkbox' : 'radio';

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          選択肢 ({isMultiple ? '正解を全て選択' : '正解を1つ選択'})
        </label>
        <button
          type="button"
          onClick={onAddOption}
          className="text-xs flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
        >
          <PlusCircle size={14} />
          追加
        </button>
      </div>

      <div className="space-y-2">
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type={inputType}
              name={isMultiple ? undefined : 'correct-answer'}
              checked={correctAnswer.includes(opt) && opt !== ''}
              onChange={() => onCorrectChange(opt)}
              className="w-5 h-5 text-blue-600 cursor-pointer"
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => onOptionsChange(idx, e.target.value)}
              className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              placeholder={`選択肢 ${idx + 1}`}
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => onRemoveOption(idx)}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="削除"
              >
                <MinusCircle size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < 6 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          最大6つまで選択肢を追加できます
        </p>
      )}
    </div>
  );
}
