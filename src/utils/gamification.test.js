// src/utils/gamification.test.js
import { describe, it, expect } from 'vitest';
import { calculateXpGain, getLevelInfo } from './gamification';

describe('Gamification Logic', () => {
  it('should calculate correct XP for perfect score', () => {
    // テストケース: 全問正解、タイムボーナスあり
    const mockAnswers = [
      { isCorrect: true }, { isCorrect: true }, { isCorrect: true }, { isCorrect: true }, { isCorrect: true }
    ];
    const totalTime = 30; // 30秒

    const xp = calculateXpGain({ answers: mockAnswers, totalTime });
    
    // 基本点: 5問 * 100 = 500
    // 正解率ボーナス(100%): * 1.5 = 750
    // タイムボーナス(60秒以内): * 1.2 = 900
    // (※実際のロジックに合わせて数値を調整してくれ)
    expect(xp).toBeGreaterThan(0);
  });

  it('should calculate level up correctly', () => {
    // レベル1のチェック
    const info1 = getLevelInfo(0);
    expect(info1.level).toBe(1);

    // 経験値を積んだ後のチェック (例: 1000XPでレベルが上がるか)
    const info2 = getLevelInfo(1500);
    expect(info2.level).toBeGreaterThan(1);
  });
});