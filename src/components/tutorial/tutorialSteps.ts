// src/components/tutorial/tutorialSteps.ts
// 各ページのチュートリアルステップ定義

import { DriveStep } from 'driver.js';

/**
 * ホーム画面のチュートリアルステップ
 */
export const homePageSteps: DriveStep[] = [
  {
    popover: {
      title: 'Study Master へようこそ！ 📚',
      description: 'このアプリでは自分だけのクイズを作成して効率的に学習できます。基本的な使い方を説明しますね！',
      side: 'over' as const,
      align: 'center' as const
    }
  },
  {
    element: '#tutorial-course-list',
    popover: {
      title: '① 科目一覧',
      description: 'ここに作成した科目が表示されます。クリックすると、その科目のクイズ一覧が開きます。',
      side: 'bottom' as const,
      align: 'start' as const
    }
  },
  {
    element: '#tutorial-create-course-btn',
    popover: {
      title: '② 科目を作成',
      description: 'まずは「新しい科目」ボタンをクリックして、学習したい科目を作成しましょう！',
      side: 'left' as const,
      align: 'start' as const
    }
  },
  {
    element: '#tutorial-ai-create-btn',
    popover: {
      title: '③ AIで自動生成',
      description: 'AIにお任せでクイズを自動生成できます。テーマを入力するだけで問題が作られます！（PRO機能）',
      side: 'top' as const,
      align: 'start' as const
    }
  },
  {
    element: '#tutorial-import-btn',
    popover: {
      title: '④ ファイルから読み込み',
      description: 'JSONファイルから科目をインポートできます。友達が作った科目を読み込むことも可能です！',
      side: 'top' as const,
      align: 'end' as const
    }
  }
];

/**
 * 科目詳細ページのチュートリアルステップ
 */
export const coursePageSteps: DriveStep[] = [
  {
    popover: {
      title: '科目を開きました！ 📖',
      description: 'この画面では、科目内のクイズ（問題セット）を管理できます。',
      side: 'over' as const,
      align: 'center' as const
    }
  },
  {
    element: '#tutorial-quiz-list',
    popover: {
      title: '① クイズ一覧',
      description: 'この科目に含まれるクイズが表示されます。クリックすると学習オプションが開きます。',
      side: 'bottom' as const,
      align: 'start' as const
    }
  },
  {
    element: '#tutorial-create-quiz-btn',
    popover: {
      title: '② クイズを作成',
      description: '「新規追加」ボタンで新しいクイズ（問題セット）を作成できます。',
      side: 'left' as const,
      align: 'start' as const
    }
  },
  {
    element: '#tutorial-review-btn',
    popover: {
      title: '③ 弱点克服モード',
      description: 'この科目で間違えた問題だけを復習できます。苦手を克服しましょう！',
      side: 'top' as const,
      align: 'start' as const
    }
  }
];

/**
 * クイズメニューページのチュートリアルステップ
 */
export const quizMenuPageSteps: DriveStep[] = [
  {
    popover: {
      title: '学習オプション ⚙️',
      description: 'クイズを始める前に、学習方法をカスタマイズできます。',
      side: 'over' as const,
      align: 'center' as const
    }
  },
  {
    element: '#tutorial-quiz-options',
    popover: {
      title: '① 学習オプション',
      description: '問題の順番をランダムにしたり、選択肢をシャッフルしたりできます。',
      side: 'bottom' as const,
      align: 'start' as const
    }
  },
  {
    element: '#tutorial-start-btn',
    popover: {
      title: '② 学習開始',
      description: 'このボタンでクイズを開始！問題に答えて知識を確認しましょう。',
      side: 'top' as const,
      align: 'center' as const
    }
  },
  {
    element: '#tutorial-flashcard-btn',
    popover: {
      title: '③ フラッシュカード',
      description: '暗記カード形式で学習できます。問題をめくって答えを確認するスタイルです。',
      side: 'top' as const,
      align: 'center' as const
    }
  },
  {
    element: '#tutorial-edit-btn',
    popover: {
      title: '④ 編集',
      description: '問題の追加・修正・削除ができます。間違いを見つけたらすぐに直しましょう！',
      side: 'left' as const,
      align: 'start' as const
    }
  }
];

/**
 * 復習リストページのチュートリアルステップ
 */
export const reviewPageSteps: DriveStep[] = [
  {
    popover: {
      title: '復習リスト 🔄',
      description: '効率的な復習で知識を定着させましょう！2種類の復習方法があります。',
      side: 'over' as const,
      align: 'center' as const
    }
  },
  {
    element: '#tutorial-srs-section',
    popover: {
      title: '① 本日の定期復習 (SRS)',
      description: '忘却曲線に基づいて、最適なタイミングで復習問題が出題されます。毎日少しずつ復習すると効果的です！',
      side: 'bottom' as const,
      align: 'center' as const
    }
  },
  {
    element: '#tutorial-weakness-section',
    popover: {
      title: '② 弱点リスト',
      description: '間違えた問題がここに溜まります。「復習開始」ボタンで何度も練習して克服しましょう！',
      side: 'top' as const,
      align: 'center' as const
    }
  }
];

/**
 * 統計画面のチュートリアルステップ
 */
export const statsPageSteps: DriveStep[] = [
  {
    popover: {
      title: '学習分析 📊',
      description: 'あなたの学習状況を詳しく分析できます。データを見て学習計画を立てましょう！',
      side: 'over' as const,
      align: 'center' as const
    }
  },
  {
    element: '#tutorial-level-card',
    popover: {
      title: '① レベル & XP',
      description: '学習するとXP（経験値）が貯まり、レベルアップします。毎日続けてストリークも伸ばしましょう！',
      side: 'bottom' as const,
      align: 'start' as const
    }
  },
  {
    element: '#tutorial-weakness-card',
    popover: {
      title: '② 要復習',
      description: '最も間違えた問題のランキングです。ここに表示される問題を重点的に復習しましょう。',
      side: 'left' as const,
      align: 'start' as const
    }
  },
  {
    element: '#tutorial-title-collection',
    popover: {
      title: '③ 称号コレクション',
      description: '条件を達成すると称号がもらえます。全部集めてみましょう！',
      side: 'top' as const,
      align: 'start' as const
    }
  }
];
