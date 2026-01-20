// src/utils/gamification.js

// レベルアップに必要なXPの計算式
export const getLevelInfo = (totalXp) => {
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
export const calculateXpGain = (resultData) => {
  const correctCount = resultData.answers.filter(a => a.isCorrect).length;
  const totalCount = resultData.answers.length;
  
  let xp = correctCount * 10;

  if (correctCount === totalCount && totalCount > 0) {
    xp += totalCount * 2;
  }

  return xp;
};

// 称号リスト (requirement を追加！)
export const TITLES = [
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

export const getUnlockedTitles = (stats) => {
  return TITLES.filter(t => t.condition(stats));
};