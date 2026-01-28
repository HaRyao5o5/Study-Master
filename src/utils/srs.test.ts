import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateNextReview, INITIAL_EASE_FACTOR } from './srs';
import { ReviewItem } from '../types';

describe('SRS Logic (calculateNextReview)', () => {
  const MOCK_NOW = 1700000000000; // 2023-11-15 approx
  const ONE_DAY = 24 * 60 * 60 * 1000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MOCK_NOW));
  });

  it('新規アイテムの初回正解時に間隔が1日になること', () => {
    const result = calculateNextReview(null, true);
    expect(result.interval).toBe(1);
    expect(result.streak).toBe(1);
    expect(result.nextReview).toBe(MOCK_NOW + ONE_DAY);
  });

  it('新規アイテムの初回不正解時に間隔が1日、ストリークが0になること', () => {
    const result = calculateNextReview(null, false);
    expect(result.interval).toBe(1);
    expect(result.streak).toBe(0);
    expect(result.nextReview).toBe(MOCK_NOW + ONE_DAY);
  });

  it('ストリーク1の状態で正解した時に間隔が6日になること', () => {
    const currentItem: ReviewItem = {
      id: 'q1',
      questionId: 'q1',
      courseId: 'c1',
      nextReview: MOCK_NOW,
      interval: 1,
      easeFactor: INITIAL_EASE_FACTOR,
      streak: 1,
      createdAt: MOCK_NOW - ONE_DAY,
      updatedAt: MOCK_NOW - ONE_DAY
    };

    const result = calculateNextReview(currentItem, true);
    expect(result.interval).toBe(6);
    expect(result.streak).toBe(2);
  });

  it('ストリーク2以上の状態で正解した時に Ease Factor に基づいて間隔が増えること', () => {
    const currentItem: ReviewItem = {
      id: 'q1',
      questionId: 'q1',
      courseId: 'c1',
      nextReview: MOCK_NOW,
      interval: 6,
      easeFactor: 2.5,
      streak: 2,
      createdAt: MOCK_NOW - 6 * ONE_DAY,
      updatedAt: MOCK_NOW - 6 * ONE_DAY
    };

    const result = calculateNextReview(currentItem, true);
    // 6 * 2.5 = 15
    expect(result.interval).toBe(15);
    expect(result.streak).toBe(3);
  });

  it('不正解時にストリークがリセットされ間隔が1日になること', () => {
    const currentItem: ReviewItem = {
      id: 'q1',
      questionId: 'q1',
      courseId: 'c1',
      nextReview: MOCK_NOW,
      interval: 15,
      easeFactor: 2.5,
      streak: 5,
      createdAt: MOCK_NOW - 15 * ONE_DAY,
      updatedAt: MOCK_NOW - 15 * ONE_DAY
    };

    const result = calculateNextReview(currentItem, false);
    expect(result.interval).toBe(1);
    expect(result.streak).toBe(0);
    // Ease Factor もペナルティで下がるはず
    expect(result.easeFactor).toBeLessThan(2.5);
  });

  it('予定より早い復習（Early Review）かつ正解時に、ストリークや間隔が維持されること', () => {
    const futureReview = MOCK_NOW + 5 * ONE_DAY;
    const currentItem: ReviewItem = {
      id: 'q1',
      questionId: 'q1',
      courseId: 'c1',
      nextReview: futureReview,
      interval: 10,
      easeFactor: 2.5,
      streak: 3,
      createdAt: MOCK_NOW - 5 * ONE_DAY,
      updatedAt: MOCK_NOW - 5 * ONE_DAY
    };

    const result = calculateNextReview(currentItem, true, true);
    expect(result.interval).toBe(10);
    expect(result.streak).toBe(3);
    // タイマーだけが現在時刻から10日後にリセットされる
    expect(result.nextReview).toBe(MOCK_NOW + 10 * ONE_DAY);
  });

  it('allowLevelUp が false の場合に正解してもレベルアップしないこと', () => {
    const currentItem: ReviewItem = {
        id: 'q1',
        questionId: 'q1',
        courseId: 'c1',
        nextReview: MOCK_NOW,
        interval: 1,
        easeFactor: INITIAL_EASE_FACTOR,
        streak: 1,
        createdAt: MOCK_NOW - ONE_DAY,
        updatedAt: MOCK_NOW - ONE_DAY
      };
  
      const result = calculateNextReview(currentItem, true, false);
      expect(result.interval).toBe(1);
      expect(result.streak).toBe(1);
  });
});
