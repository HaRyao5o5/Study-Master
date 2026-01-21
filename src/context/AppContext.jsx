// src/context/AppContext.jsx
import React, { createContext, useContext } from 'react';
// さっき作ったフックをここで使う
import { useAppData } from '../hooks/useAppData';

// これが「通信チャンネル」だ
const AppContext = createContext();

// これが「基地局（プロバイダー）」だ。アプリ全体を包み込む。
export function AppProvider({ children }) {
  // ここでデータを一括管理する
  const appData = useAppData();

  return (
    <AppContext.Provider value={appData}>
      {children}
    </AppContext.Provider>
  );
}

// 各コンポーネントがこれを使えば、どこからでもデータにアクセスできる（カスタムフック）
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};