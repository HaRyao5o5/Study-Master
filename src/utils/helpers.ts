// src/utils/helpers.ts
import { Course, Question } from '../types';

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

// 画像をリサイズ・圧縮してBase64に変換する関数
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // リサイズ設定 (最大幅/高さを800pxに制限)
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // JPEG形式で圧縮 (品質 0.6 = 60%)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            resolve(dataUrl);
        } else {
            reject(new Error('Canvas context not found'));
        }
      };

      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};

export const normalizeData = (rawData: any[]): Course[] => {
  if (!rawData || !Array.isArray(rawData)) return [];
  
  return rawData.map((course: any): Course => ({
    ...course,
    id: course.id || generateId(),
    quizzes: (course.quizzes || []).map((quiz: any) => ({
      ...quiz,
      id: quiz.id || generateId(),
      questions: (quiz.questions || []).map((q: any): Question => {
        let type = q.type || 'multiple';
        let options: string[] = [];
        let correctAnswer: string | string[] = [];

        if (Array.isArray(q.options)) {
          options = q.options;
        } else if (typeof q.options === 'object' && q.options !== null) {
           const keys = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ'];
           options = keys.filter(k => q.options[k]).map(k => q.options[k]);
        }

        if (Array.isArray(q.correctAnswer)) {
          correctAnswer = q.correctAnswer;
        } else {
          if (typeof q.options === 'object' && !Array.isArray(q.options) && q.options !== null) {
             // @ts-ignore
             correctAnswer = [q.options[q.correctAnswer] || q.correctAnswer];
          } else {
             correctAnswer = [q.correctAnswer];
          }
        }

        return {
          ...q,
          id: q.id || generateId(),
          type,
          correctAnswer: correctAnswer,
          options: options,
          image: q.image || undefined,
          tableData: q.tableData || q.table_data || undefined,
          explanation: q.explanation || ''
        };
      })
    }))
  }));
};

/**
 * 回答の正誤判定を行うヘルパー関数
 */
export const checkAnswer = (question: Question, userAnswer: string | string[]): boolean => {
  if (!question || userAnswer === undefined || userAnswer === null) return false;

  const type = question.type || 'select';
  const correct = question.correctAnswer;

  // 文字列化とトリムを行うヘルパー
  const normalize = (val: any) => String(val).trim();

  // 単一選択 / ○×クイズ
  if (type === 'select' || type === 'true-false') {
    if (Array.isArray(correct)) {
        // correctが配列の場合は最初の要素と比較（または何らかのロジックが必要）
        // 現状のロジックでは単一選択の正解も配列に入れている場合があるため考慮
        return normalize(userAnswer) === normalize(correct[0]);
    }
    return normalize(userAnswer) === normalize(correct);
  }

  // 記述式
  if (type === 'input') {
    const correctAnswers = Array.isArray(correct) ? correct : [correct];
    return correctAnswers.some(ans => normalize(ans) === normalize(userAnswer));
  }

  // 複数選択
  if (type === 'multi-select') {
    if (!Array.isArray(userAnswer)) return false;
    const correctAnswers = Array.isArray(correct) ? correct : [String(correct)];
    
    const userSet = new Set(userAnswer.map(normalize));
    const correctSet = new Set(correctAnswers.map(normalize));

    return userSet.size === correctSet.size && 
           [...userSet].every(s => correctSet.has(s));
  }

  // デフォルト
  return normalize(userAnswer) === normalize(correct);
};

/**
 * ユーザーのローカルタイムゾーンに基づいた YYYY-MM-DD 文字列を返す
 */
export const toLocalISOString = (date: Date = new Date()): string => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};
