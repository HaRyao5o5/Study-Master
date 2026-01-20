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
  
  // 基礎点: 正解数 × 10XP
  let xp = correctCount * 10;

  // ★ パーフェクトボーナス調整: 「問題数 × 2XP」に変更 (おまけ程度)
  if (correctCount === totalCount && totalCount > 0) {
    xp += totalCount * 2;
  }

  return xp;
};

export const TITLES = [
  { id: 'novice', name: '駆け出しの学習者', condition: (stats) => stats.totalXp >= 0 },
  { id: 'apprentice', name: '見習いマスター', condition: (stats) => stats.level >= 5 },
  { id: 'expert', name: '知識の探求者', condition: (stats) => stats.level >= 10 },
  { id: 'master', name: 'スタディ・マスター', condition: (stats) => stats.level >= 20 },
  { id: 'legend', name: '生ける伝説', condition: (stats) => stats.level >= 50 },
  { id: 'streak_7', name: '継続の達人', condition: (stats) => stats.streak >= 7 },
  { id: 'streak_30', name: '不屈の魂', condition: (stats) => stats.streak >= 30 },
];

export const getUnlockedTitles = (stats) => {
  return TITLES.filter(t => t.condition(stats));
};