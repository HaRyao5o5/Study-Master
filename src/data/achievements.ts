import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  // XP Milestones
  {
    id: 'xp_beginner',
    name: '学習の始まり',
    description: '合計 1,000 XP を獲得する',
    icon: 'Sparkles',
    category: 'xp',
    requirement: 1000,
    rarity: 'common'
  },
  {
    id: 'xp_intermediate',
    name: '熱心な学習者',
    description: '合計 10,000 XP を獲得する',
    icon: 'Zap',
    category: 'xp',
    requirement: 10000,
    rarity: 'rare'
  },
  {
    id: 'xp_expert',
    name: '知識の探求者',
    description: '合計 50,000 XP を獲得する',
    icon: 'Trophy',
    category: 'xp',
    requirement: 50000,
    rarity: 'epic'
  },
  {
    id: 'xp_master',
    name: 'スタディ・マスター',
    description: '合計 100,000 XP を獲得する',
    icon: 'Crown',
    category: 'xp',
    requirement: 100000,
    rarity: 'legendary'
  },

  // Streak Milestones
  {
    id: 'streak_3',
    name: '三日坊主卒業',
    description: '3日連続で学習する',
    icon: 'Flame',
    category: 'streak',
    requirement: 3,
    rarity: 'common'
  },
  {
    id: 'streak_7',
    name: '継続の力',
    description: '7日連続で学習する',
    icon: 'FlameKindle',
    category: 'streak',
    requirement: 7,
    rarity: 'rare'
  },
  {
    id: 'streak_30',
    name: '不屈の精神',
    description: '30日連続で学習する',
    icon: 'Timer',
    category: 'streak',
    requirement: 30,
    rarity: 'epic'
  },

  // Course Milestones
  {
    id: 'course_creator',
    name: '学びの設計者',
    description: 'コースを1つ作成する',
    icon: 'BookOpen',
    category: 'course',
    requirement: 1,
    rarity: 'common'
  },
  {
    id: 'course_expert',
    name: 'カリキュラム・マスター',
    description: 'コースを5つ作成する',
    icon: 'Library',
    category: 'course',
    requirement: 5,
    rarity: 'rare'
  },

  // Social Milestones
  {
    id: 'social_publish',
    name: '知の共有者',
    description: 'コースをマーケットプレイスに公開する',
    icon: 'Globe',
    category: 'social',
    requirement: 1,
    rarity: 'rare'
  },
  {
    id: 'social_download',
    name: '他者から学ぶ',
    description: '他のユーザーのコースをダウンロードする',
    icon: 'Download',
    category: 'social',
    requirement: 1,
    rarity: 'common'
  }
];
