// src/hooks/useTheme.ts
import { useState, useEffect } from 'react';

export type ThemeType = 'light' | 'dark' | 'system';

/**
 * テーマ管理用カスタムフック
 * ダークモード、ライトモード、システム設定追従を管理
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('study-master-theme') as ThemeType) || 'system';
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
    const handleChange = (e: MediaQueryListEvent) => {
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
