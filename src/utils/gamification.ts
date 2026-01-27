// src/utils/gamification.ts
import { UserStats } from "../types";

export interface LevelInfo {
    level: number;
    currentXp: number;
    xpForNextLevel: number;
}

export interface Title {
    id: string;
    name: string;
    requirement: string;
    condition: (stats: UserStats) => boolean;
}

// レベルアップに必要なXPの計算式
export const getLevelInfo = (totalXp: number): LevelInfo => {
  let level = 1;
  let xpForNextLevel = 200; 
  let currentXp = totalXp;

  while (currentXp >= xpForNextLevel) {
    currentXp -= xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(200 * Math.pow(1.2, level - 1));
  }

  return { level, currentXp, xpForNextLevel };
};

// クイズ結果から獲得XPを計算する関数
// resultDataの型定義が必要だが、一旦anyで受け取るか簡易定義する
// useGameLogicでの定義と合わせるべき
export const calculateXpGain = (resultData: any): number => {
  if (!resultData || !resultData.answers) return 0;
  
  const correctCount = resultData.answers.filter((a: any) => a.isCorrect).length;
  const totalCount = resultData.answers.length;
  
  let xp = correctCount * 10;

  if (correctCount === totalCount && totalCount > 0) {
    xp += totalCount * 2;
  }

  return xp;
};

// 称号リスト
export const TITLES: Title[] = [
  { 
    id: 'novice', 
    name: '駆け出しの学習者', 
    requirement: '学習を開始する',
    condition: (stats) => stats.totalXp >= 0 
  },
  { 
    id: 'apprentice', 
    name: '見習いマスター', 
    requirement: 'レベル5に到達する',
    condition: (stats) => stats.level >= 5 
  },
  { 
    id: 'expert', 
    name: '知識の探求者', 
    requirement: 'レベル10に到達する',
    condition: (stats) => stats.level >= 10 
  },
  { 
    id: 'master', 
    name: 'スタディ・マスター', 
    requirement: 'レベル20に到達する',
    condition: (stats) => stats.level >= 20 
  },
  { 
    id: 'legend', 
    name: '生ける伝説', 
    requirement: 'レベル50に到達する',
    condition: (stats) => stats.level >= 50 
  },
  { 
    id: 'streak_7', 
    name: '継続の達人', 
    requirement: '7日連続で学習する',
    condition: (stats) => stats.streak >= 7 
  },
  { 
    id: 'streak_30', 
    name: '不屈の魂', 
    requirement: '30日連続で学習する',
    condition: (stats) => stats.streak >= 30 
  },
];

import { toLocalISOString } from './helpers';

export const getUnlockedTitles = (stats: UserStats): Title[] => {
  return TITLES.filter(t => t.condition(stats));
};

/**
 * 表示用の有効なストリークを計算する
 * 最終ログインが昨日または今日でない場合、表示上は0とする
 */
export const getEffectiveStreak = (userStats: UserStats): number => {
    if (!userStats.lastLogin) return 0;
    
    // lastLogin could be full ISOString or YYYY-MM-DD
    // Normalize to YYYY-MM-DD
    let lastLoginDateStr = userStats.lastLogin;
    if (userStats.lastLogin.includes('T')) {
         const d = new Date(userStats.lastLogin);
         if (!isNaN(d.getTime())) {
             lastLoginDateStr = toLocalISOString(d);
         } else {
             lastLoginDateStr = userStats.lastLogin.split('T')[0];
         }
    }

    const today = new Date();
    const todayStr = toLocalISOString(today);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalISOString(yesterday);

    if (lastLoginDateStr === todayStr || lastLoginDateStr === yesterdayStr) {
        return userStats.streak;
    }

    return 0; // Streak is broken
};
