// src/components/profile/AvatarSelector.tsx
import React from 'react';
import { AVATARS } from '../../constants/avatars';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (id: string) => void;
}

/**
 * アバター選択コンポーネント
 */
const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedAvatar, onSelect }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
        アバターを選択
      </label>
      
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`
              relative aspect-square rounded-xl flex items-center justify-center text-3xl
              transition-all transform hover:scale-110
              ${selectedAvatar === avatar.id
                ? 'ring-4 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/30 scale-105'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {avatar.emoji}
            {selectedAvatar === avatar.id && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
