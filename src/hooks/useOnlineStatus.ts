// src/hooks/useOnlineStatus.ts

import { useState, useEffect, useCallback } from 'react';

/**
 * ブラウザのオンライン/オフライン状態を監視するカスタムフック
 * 
 * @returns {object} オンライン状態情報
 * - isOnline: 現在オンラインかどうか
 * - wasOffline: 直前までオフラインだったか（再接続検出用）
 * 
 * @example
 * ```typescript
 * const { isOnline, wasOffline } = useOnlineStatus();
 * 
 * useEffect(() => {
 *   if (isOnline && wasOffline) {
 *     // オフラインから復帰した際の処理
 *     syncPendingData();
 *   }
 * }, [isOnline, wasOffline]);
 * ```
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // SSRセーフ
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [wasOffline, setWasOffline] = useState<boolean>(false);

  const handleOnline = useCallback(() => {
    // オフラインからオンラインへ復帰
    if (!isOnline) {
      setWasOffline(true);
    }
    setIsOnline(true);
  }, [isOnline]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(false);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // wasOfflineフラグを一定時間後にリセット（連続的な再接続検出を防ぐ）
  useEffect(() => {
    if (wasOffline && isOnline) {
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 5000); // 5秒後にリセット
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  return { isOnline, wasOffline };
}

/**
 * オンライン状態をグローバルに取得（フック外で使用）
 */
export function getOnlineStatus(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}
