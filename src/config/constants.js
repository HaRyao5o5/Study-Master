// src/config/constants.js

/**
 * アプリケーション全体で使用される定数を管理
 */

// 画像関連の定数
export const IMAGE_CONFIG = {
  /** 画像の最大幅（ピクセル） */
  MAX_WIDTH: 800,
  /** 画像の最大高さ（ピクセル） */
  MAX_HEIGHT: 600,
  /** Base64画像の最大サイズ（KB） */
  MAX_SIZE_KB: 500,
  /** JPEGエンコード品質（0.0-1.0） */
  JPEG_QUALITY: 0.9,
};

// ランキング関連の定数
export const RANKING_CONFIG = {
  /** ランキング表示最大件数 */
  MAX_ITEMS: 50,
};

// ゲーム関連の定数
export const GAME_CONFIG = {
  /** 選択肢の最小数 */
  MIN_OPTIONS: 2,
  /** 選択肢の最大数 */
  MAX_OPTIONS: 6,
};

// UI関連の定数
export const UI_CONFIG = {
  /** ローディング画面の最小表示時間（ミリ秒） */
  MIN_LOADING_TIME: 1000,
  /** Toast通知のデフォルト表示時間（ミリ秒） */
  TOAST_DURATION: 5000,
  /** アニメーション遅延（ミリ秒） */
  ANIMATION_DELAY: 75,
};

// データバージョン
export const DATA_VERSION = '2.17.0';

// ローカルストレージのキー
export const STORAGE_KEYS = {
  THEME: 'study-master-theme',
  COURSES: 'study-master-courses',
  USER_STATS: 'study-master-user-stats',
  WRONG_HISTORY: 'study-master-wrong-history',
  ERROR_STATS: 'study-master-error-stats',
};

// データタイプ
export const DATA_TYPES = {
  BACKUP: 'backup',
  COURSE: 'course',
  QUIZ: 'quiz',
};

// 問題タイプ
export const QUESTION_TYPES = {
  SELECT: 'select',
  MULTI_SELECT: 'multi-select',
  INPUT: 'input',
};
