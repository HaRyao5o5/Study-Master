// src/context/AppContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useAppData, AppData } from '../hooks/useAppData';

const AppContext = createContext<AppData | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const appData = useAppData();

  return (
    <AppContext.Provider value={appData}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = (): AppData => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
