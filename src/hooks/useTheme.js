// src/hooks/useTheme.js
import { useState, useEffect } from 'react';

/**
 * テーマ管理用カスタムフック
 * ダークモード、ライトモード、システム設定追従を管理
 * 
 * @returns {Object} テーマの状態と変更関数
 * @property {string} theme - 現在のテーマ ('light' | 'dark' | 'system')
 * @property {Function} setTheme - テーマを変更する関数
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('study-master-theme') || 'system';
    }
    return 'system';
  });

  // テーマ変更時にDOM classとlocalStorageを更新
  useEffect(() => {
    localStorage.setItem('study-master-theme', theme);
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system設定の場合はOSの設定に従う
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // system設定の場合、OSのテーマ変更を監視
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return {
    theme,
    setTheme
  };
}
