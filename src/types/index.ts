export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  // 追加のユーザー設定やステータス
  stats?: UserStats;
}

export interface UserStats {
  level: number;
  totalXp: number;
  streak: number;
  lastLogin: string;
  loginHistory?: string[]; // 'YYYY-MM-DD'の配列
  // 他の統計情報
}

export type QuestionType = 'select' | 'multi-select' | 'input' | 'true-false';

export interface Question {
  id: string;
  type: QuestionType;
  text: string; // 問題文 (legacy: question)
  image?: string;
  options?: string[];
  correctAnswer: string | string[]; // 単一または複数の正解
  explanation?: string;
  tableData?: any; // テーブルデータ (optional)
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  quizzes: Quiz[];
  isPublic?: boolean;
  visibility?: 'public' | 'private';
  favorite?: boolean;
  createdAt?: any;
}

export interface PublicCourse extends Course {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  tags: string[];
  downloads: number;
  likes: number;
  publishedAt: number;
  updatedAt: number;
  version: number;
}

export interface Settings {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  // その他の設定
}

export interface UserGoals {
  dailyProgress: number;
  weeklyProgress: number;
  dailyXpGoal: number;
  weeklyXpGoal: number;
  achievedToday: boolean;
  achievedThisWeek: boolean;
  lastResetDate: string;
  lastWeekResetDate: string;
  streak?: number;
}



export type MasteredQuestions = Record<string, Record<string, boolean>>; // courseId -> questionId -> true

export interface UserAnswer {
  question: Question;
  selectedAnswer: string | string[];
  isCorrect: boolean;
  timeTaken: number;
}

export interface ResultData {
  answers: UserAnswer[];
  totalTime: number;
  xpGained: number;
  isLevelUp: boolean;
  streakInfo: {
    days: number;
    isUpdated: boolean;
  };
}

export interface Profile {
  uid: string;
  name: string;
  username?: string; // @username
  bio?: string;
  avatarId?: string; // Predefined avatar ID
  customAvatarUrl?: string; // Uploaded image URL
  avatarSettings?: {
    scale: number;
    position: { x: number; y: number };
  };
  title?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface ReviewItem {
  id: string; // Document ID (usually questionId)
  questionId: string;
  courseId: string;
  nextReview: number; // Timestamp
  interval: number;   // Days
  easeFactor: number; // Default 2.5
  streak: number;     // Consecutive correct answers
  createdAt: number;
  updatedAt: number;
}


