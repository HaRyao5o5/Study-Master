// src/components/tutorial/TutorialHelpButton.tsx
import React from 'react';
import { HelpCircle } from 'lucide-react';

interface TutorialHelpButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * 各ページに表示するチュートリアル再表示ボタン
 * クリックでそのページのチュートリアルを再開する
 */
const TutorialHelpButton: React.FC<TutorialHelpButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors ${className}`}
      title="このページの使い方を見る"
    >
      <HelpCircle size={18} />
    </button>
  );
};

export default TutorialHelpButton;
