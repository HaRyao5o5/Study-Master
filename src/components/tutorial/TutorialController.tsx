// src/components/tutorial/TutorialController.tsx
import React, { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { HelpCircle } from 'lucide-react';

const TutorialController: React.FC = () => {
  // driver.js の型が不明なため any を使用
  const driverObj = useRef<any>(null);

  useEffect(() => {
    const width = window.innerWidth;
    const isMobileNav = width < 768; // md breakpoint in Tailwind
    const isLevelVisible = width >= 640; // sm breakpoint in Tailwind

    const steps = [
      { 
        element: '#tutorial-home-btn', 
        popover: { 
          title: 'ようこそ！', 
          description: 'Study Masterへようこそ。ここでは自作のクイズで楽しく学習できます。',
          side: 'bottom' as const, 
          align: 'start' as const 
        } 
      },
      { 
        element: '#tutorial-profile-area', 
        popover: { 
          title: 'プロフィール', 
          description: 'ここからログインやプロフィールの確認ができます。Googleアカウントでログインしてデータを保存しましょう。',
          side: 'bottom' as const, 
          align: 'end' as const 
        } 
      }
    ];

    if (isLevelVisible) {
      steps.push({ 
        element: '#tutorial-level-display', 
        popover: { 
          title: 'レベル & ストリーク', 
          description: '学習するとXPが貯まりレベルアップ！毎日続けてストリークを伸ばしましょう。',
          side: 'bottom' as const, 
          align: 'end' as const 
        } 
      });
    }

    if (!isMobileNav) {
      steps.push(
        { 
          element: '#tutorial-stats-btn', 
          popover: { 
            title: '統計データ', 
            description: 'あなたの学習履歴や正答率などの詳細なデータを確認できます。',
            side: 'bottom' as const,
            align: 'start' as const 
          } 
        },
        { 
          element: '#tutorial-goal-btn', 
          popover: { 
            title: '学習目標', 
            description: '毎日の目標XPを設定して、モチベーションを維持しましょう。',
            side: 'bottom' as const,
            align: 'start' as const 
          } 
        },
        { 
          element: '#tutorial-review-btn', 
          popover: { 
            title: '復習モード', 
            description: '間違えた問題はここに溜まります。定期的に復習して苦手を克服しましょう！',
            side: 'bottom' as const,
            align: 'start' as const 
          } 
        },
        { 
          element: '#tutorial-ranking-btn', 
          popover: { 
            title: 'ランキング', 
            description: '他のユーザーとレベルやストリークを競い合いましょう。',
            side: 'bottom' as const,
            align: 'start' as const 
          } 
        },
        { 
          element: '#tutorial-changelog-btn', 
          popover: { 
            title: 'お知らせ', 
            description: 'アプリの更新情報や新機能のお知らせはここから確認できます。',
            side: 'bottom' as const,
            align: 'start' as const 
          } 
        },
        { 
          element: '#tutorial-settings-btn', 
          popover: { 
            title: '設定', 
            description: 'テーマの変更やデータ管理などの設定はこちら。',
            side: 'bottom' as const,
            align: 'end' as const 
          } 
        }
      );
    } else {
      steps.push({ 
        element: '#tutorial-menu-btn', 
        popover: { 
          title: 'メニュー', 
          description: '統計、目標設定、復習、ランキング、設定などの機能はここからアクセスできます。',
          side: 'bottom' as const,
          align: 'end' as const
        } 
      });
    }

    driverObj.current = driver({
      showProgress: true,
      animate: true,
      doneBtnText: '完了',
      nextBtnText: '次へ',
      prevBtnText: '戻る',
      steps: steps
    });

    // Check if tutorial has been seen
    const hasSeenTutorial = localStorage.getItem('tutorial_seen');
    if (!hasSeenTutorial) {
      setTimeout(() => {
        driverObj.current?.drive();
        localStorage.setItem('tutorial_seen', 'true');
      }, 1500); // Wait for animations to settle
    }
  }, []);

  const handleStartTutorial = () => {
    if (driverObj.current) {
      driverObj.current.drive();
    }
  };

  return (
    <button
      onClick={handleStartTutorial}
      className="fixed bottom-4 left-4 z-40 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform border border-blue-100 dark:border-gray-700"
      title="チュートリアルを見る"
    >
      <HelpCircle size={24} />
    </button>
  );
};

export default TutorialController;
