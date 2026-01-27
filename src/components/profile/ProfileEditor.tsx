// src/components/profile/ProfileEditor.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import AvatarSelector from './AvatarSelector';
import { getAvatarById } from '../../constants/avatars';
import { Profile } from '../../types';

interface ProfileEditorProps {
  initialProfile?: Profile;
  onSave: (data: { name: string; avatarId: string }) => Promise<void>;
  onClose: () => void;
  isWelcome?: boolean;
}

/**
 * プロフィール編集コンポーネント
 */
const ProfileEditor: React.FC<ProfileEditorProps> = ({ initialProfile, onSave, onClose, isWelcome = false }) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(initialProfile?.avatarId || 'avatar-1');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('表示名を入力してください');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        avatarId: selectedAvatar
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const avatar = getAvatarById(selectedAvatar);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {isWelcome ? 'プロフィールを設定' : 'プロフィール編集'}
            </h2>
            {isWelcome && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                あなたの情報を教えてください
              </p>
            )}
          </div>
          {!isWelcome && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* プレビュー */}
          <div className="flex flex-col items-center space-y-3 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <div className="text-6xl">{avatar ? avatar.emoji : '😎'}</div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">プレビュー</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {name || '名前未設定'}
              </p>
            </div>
          </div>

          {/* 表示名入力 */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              表示名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 山田太郎"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {name.length}/20文字
            </p>
          </div>

          {/* アバター選択 */}
          <AvatarSelector
            selectedAvatar={selectedAvatar}
            onSelect={setSelectedAvatar}
          />
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
          >
            {isSaving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
