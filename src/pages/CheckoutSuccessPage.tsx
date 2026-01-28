// src/pages/CheckoutSuccessPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const CheckoutSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
                <ShieldCheck size={48} />
            </div>
            <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-4">決済が完了しました！</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-bold mb-10 max-w-md">
                おめでとうございます！今日からあなたは PRO MEMBER です。<br/>
                全ての AI 機能とプレミアムサービスをお楽しみください。
            </p>
            <button
                onClick={() => navigate('/')}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all"
            >
                ホームに戻る
            </button>
        </div>
    );
};

export default CheckoutSuccessPage;
