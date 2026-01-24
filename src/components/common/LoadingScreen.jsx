// src/components/common/LoadingScreen.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse-slow"></div>
        <Loader2 size={64} className="text-blue-600 dark:text-blue-400 animate-spin relative z-10" />
      </div>
      <h2 className="mt-8 text-2xl font-black text-gray-800 dark:text-white tracking-tight animate-pulse">
        Study Master
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-bold">
        読み込んでいます...
      </p>
    </div>
  );
};

export default LoadingScreen;