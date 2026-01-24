// src/constants/avatars.js

/**
 * アバター定義
 * 各アバターはemoji、name、colorを持つ
 */
export const AVATARS = [
  // 動物系
  { id: 'avatar-1', emoji: '🐶', name: '犬', color: '#F59E0B' },
  { id: 'avatar-2', emoji: '🐱', name: '猫', color: '#EF4444' },
  { id: 'avatar-3', emoji: '🐼', name: 'パンダ', color: '#6B7280' },
  { id: 'avatar-4', emoji: '🦊', name: 'キツネ', color: '#F97316' },
  
  // 表情系
  { id: 'avatar-5', emoji: '😊', name: '笑顔', color: '#FCD34D' },
  { id: 'avatar-6', emoji: '😎', name: 'クール', color: '#3B82F6' },
  { id: 'avatar-7', emoji: '🤓', name: 'メガネ', color: '#8B5CF6' },
  { id: 'avatar-8', emoji: '🥳', name: 'パーティー', color: '#EC4899' },
  
  // その他
  { id: 'avatar-9', emoji: '🌟', name: '星', color: '#FBBF24' },
  { id: 'avatar-10', emoji: '💎', name: '宝石', color: '#06B6D4' },
  { id: 'avatar-11', emoji: '🎯', name: 'ターゲット', color: '#EF4444' },
  { id: 'avatar-12', emoji: '🎨', name: 'パレット', color: '#A855F7' },
];

/**
 * アバターIDから適のアバター情報を取得
 */
export const getAvatarById = (avatarId) => {
  return AVATARS.find(a => a.id === avatarId) || AVATARS[0];
};
