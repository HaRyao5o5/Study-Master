// src/hooks/useQuestionValidation.ts
import { Question } from "../types";

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * 問題データのバリデーションを提供するカスタムフック
 * @returns {Object} バリデーション関数
 */
export function useQuestionValidation() {
  /**
   * 問題データをバリデート
   * @param {Object} question - 問題オブジェクト
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  const validateQuestion = (question: Partial<Question>): ValidationResult => {
    const errors: string[] = [];

    // 問題文チェック
    if (!question.text?.trim()) {
      errors.push('問題文を入力してください');
    }

    // タイプ別バリデーション
    if (question.type === 'input') {
      // 記述式：正解が最低1つ必要
      const correctAnswer = question.correctAnswer;
      const answers = Array.isArray(correctAnswer) ? correctAnswer : (correctAnswer ? [correctAnswer] : []);

      if (!answers || answers.length === 0 || answers.every(a => !a.trim())) {
        errors.push('正解を入力してください');
      }
    } else {
      // 選択式：選択肢が最低2つ必要
      if (!question.options?.length || question.options.length < 2) {
        errors.push('選択肢は最低2つ必要です');
      }
      
      // 選択式：正解が選択されているか
      // correctAnswer could be string or array
      const hasAnswer = Array.isArray(question.correctAnswer) 
         ? question.correctAnswer.length > 0 
         : !!question.correctAnswer;

      if (!hasAnswer) {
        errors.push('正解を選択してください');
      }
      
      // 空の選択肢チェック
      const emptyOptions = question.options?.filter(opt => !opt.trim()).length || 0;
      if (emptyOptions > 0) {
        errors.push('空の選択肢があります');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * 単純な必須フィールドチェック
   */
  const hasRequiredFields = (question: Partial<Question>): boolean => {
    const hasText = !!question.text?.trim();
    const hasAnswer = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer.length > 0 
        : !!question.correctAnswer;
    return hasText && hasAnswer;
  };

  return { 
    validateQuestion,
    hasRequiredFields
  };
}
