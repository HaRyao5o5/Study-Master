// src/components/editor/QuizMetadataForm.tsx
import React from 'react';

interface QuizMetadataFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}

export const QuizMetadataForm: React.FC<QuizMetadataFormProps> = ({ title, setTitle, description, setDescription }) => {
  return (
    <div className="space-y-4 mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          クイズタイトル
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 英単語テスト Level 1"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          説明（任意）
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="このクイズについての説明を入力..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>
    </div>
  );
};
