// src/hooks/useTutorial.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * ページごとのチュートリアル管理を行うカスタムフック
 * 
 * @param pageKey - ページを識別するキー (例: 'home', 'course', 'quiz-menu')
 * @param steps - driver.js のステップ定義
 * @param options - オプション設定
 */
export function useTutorial(
  pageKey: string,
  steps: DriveStep[],
  options?: {
    autoStart?: boolean;      // 初回訪問時に自動開始 (default: true)
    delay?: number;           // 開始までの遅延 (default: 800ms)
  }
) {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true); // 初期値true で初回レンダリング時のフラッシュを防ぐ
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  
  const storageKey = `tutorial_seen_${pageKey}`;
  const autoStart = options?.autoStart ?? true;
  const delay = options?.delay ?? 800;

  // 初期化: localStorage から既読状態を読み取る
  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    setHasSeenTutorial(seen === 'true');
  }, [storageKey]);

  // driver.js のインスタンスを作成
  useEffect(() => {
    if (steps.length === 0) return;

    driverRef.current = driver({
      showProgress: true,
      animate: true,
      doneBtnText: '完了',
      nextBtnText: '次へ',
      prevBtnText: '戻る',
      steps: steps,
      onDestroyStarted: () => {
        // チュートリアル終了時に既読としてマーク
        localStorage.setItem(storageKey, 'true');
        setHasSeenTutorial(true);
        driverRef.current?.destroy();
      }
    });

    return () => {
      driverRef.current?.destroy();
    };
  }, [steps, storageKey]);

  // 初回訪問時の自動開始
  useEffect(() => {
    if (!autoStart || hasSeenTutorial || steps.length === 0) return;

    const timer = setTimeout(() => {
      // 要素が存在するか確認してから開始
      const firstElement = steps[0]?.element;
      if (firstElement && typeof firstElement === 'string') {
        const el = document.querySelector(firstElement);
        if (el) {
          driverRef.current?.drive();
        }
      } else {
        driverRef.current?.drive();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [autoStart, hasSeenTutorial, steps, delay]);

  // 手動でチュートリアルを開始する関数
  const startTutorial = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.drive();
    }
  }, []);

  // チュートリアルを既読としてマークする関数
  const markAsSeen = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setHasSeenTutorial(true);
  }, [storageKey]);

  // チュートリアルをリセットする関数 (デバッグ用)
  const resetTutorial = useCallback(() => {
    localStorage.removeItem(storageKey);
    setHasSeenTutorial(false);
  }, [storageKey]);

  return {
    hasSeenTutorial,
    startTutorial,
    markAsSeen,
    resetTutorial
  };
}

export default useTutorial;
