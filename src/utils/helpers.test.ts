import { describe, it, expect } from 'vitest';
import { checkAnswer } from './helpers';
import { Question } from '../types';

describe('Quiz Helpers (checkAnswer)', () => {
  
  it('単一選択 (select) の正解判定ができること', () => {
    const q: Partial<Question> = { type: 'select', correctAnswer: 'A' };
    expect(checkAnswer(q as Question, 'A')).toBe(true);
    expect(checkAnswer(q as Question, 'B')).toBe(false);
  });

  it('単一選択で正解が配列に入っている場合も正解判定ができること', () => {
    const q: Partial<Question> = { type: 'select', correctAnswer: ['A'] };
    expect(checkAnswer(q as Question, 'A')).toBe(true);
  });

  it('○×クイズ (true-false) の正解判定ができること', () => {
    const q: Partial<Question> = { type: 'true-false', correctAnswer: 'True' };
    expect(checkAnswer(q as Question, 'True')).toBe(true);
    expect(checkAnswer(q as Question, 'False')).toBe(false);
  });

  describe('記述式 (input) の判定', () => {
    it('余分な空白を無視して判定できること', () => {
      const q: Partial<Question> = { type: 'input', correctAnswer: 'Tokyo' };
      expect(checkAnswer(q as Question, ' Tokyo ')).toBe(true);
    });

    it('複数の正解候補のうち、いずれかに一致すれば正解となること', () => {
      const q: Partial<Question> = { type: 'input', correctAnswer: ['Tokyo', '東京'] };
      expect(checkAnswer(q as Question, '東京')).toBe(true);
      expect(checkAnswer(q as Question, 'Tokyo')).toBe(true);
      expect(checkAnswer(q as Question, 'Osaka')).toBe(false);
    });

    it('数字と文字列の型の違いを吸収して判定できること', () => {
      const q: Partial<Question> = { type: 'input', correctAnswer: '100' };
      // @ts-ignore
      expect(checkAnswer(q as Question, 100)).toBe(true);
    });
  });

  describe('複数選択 (multi-select) の判定', () => {
    it('順不同で、すべての正解を選んでいる場合に正解となること', () => {
      const q: Partial<Question> = { type: 'multi-select', correctAnswer: ['A', 'B'] };
      expect(checkAnswer(q as Question, ['A', 'B'])).toBe(true);
      expect(checkAnswer(q as Question, ['B', 'A'])).toBe(true);
    });

    it('不足している場合に不正解となること', () => {
      const q: Partial<Question> = { type: 'multi-select', correctAnswer: ['A', 'B'] };
      expect(checkAnswer(q as Question, ['A'])).toBe(false);
    });

    it('余計な選択肢が含まれている場合に不正解となること', () => {
      const q: Partial<Question> = { type: 'multi-select', correctAnswer: ['A', 'B'] };
      expect(checkAnswer(q as Question, ['A', 'B', 'C'])).toBe(false);
    });

    it('選択肢の各要素がプロパティなし（undefined）などの場合もクラッシュしないこと', () => {
        const q: Partial<Question> = { type: 'multi-select', correctAnswer: ['A'] };
        // @ts-ignore
        expect(checkAnswer(q as Question, [null])).toBe(false);
    });
  });

  it('存在しない問題形式やデータ不備に対して false を返すこと', () => {
    // @ts-ignore
    expect(checkAnswer(null, 'A')).toBe(false);
    // @ts-ignore
    expect(checkAnswer({ type: 'select' }, null)).toBe(false);
  });
});
