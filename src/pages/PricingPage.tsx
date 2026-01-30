import React, { useState } from 'react';
import { Check, Sparkles, Zap, Bot, BrainCircuit, PenTool, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const PricingPage: React.FC = () => {
  const { isPro, upgradeToPro, downgradeToFree, forceUpgradeToPro, resetStripeConnection, isAdmin } = usePlan();
  const { user } = useApp();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleUpgradeClick = async () => {
    if (!user) {
        showError('アップグレードにはログインが必要です');
        return;
    }
    
    setLoading(true);
    setShowReset(false);
    try {
      // 実際のリダイレクト処理
      await upgradeToPro();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      
      if (msg.includes('No such price')) {
        showError('設定されている価格IDが無効です。Stripeダッシュボードで作成した商品の価格IDを .env の VITE_STRIPE_PRICE_ID に設定してください。');
      } else {
        showError(msg || '決済の準備中にエラーが発生しました。');
      }
      
      // 特定のエラー（顧客ID不整合など）の場合にリセットボタンを表示
      if (msg.includes('No such customer') || msg.includes('customer')) {
          setShowReset(true);
      }
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
        await resetStripeConnection();
        showSuccess('Stripe 接続をリセットしました。もう一度お試しください。');
        setShowReset(false);
    } catch (err) {
        showError('リセットに失敗しました。');
    } finally {
        setLoading(false);
    }
  };

  const freeFeatures = [
    { text: '基本的なクイズ作成', available: true },
    { text: '学習データの同期', available: true },
    { text: '復習リマインダー (SRS)', available: true },
    { text: 'AI クイズ生成', available: false },
    { text: 'AI 学習アドバイザー', available: false },
    { text: 'AI 徹底解剖（深掘り解説）', available: false },
  ];

  const proFeatures = [
    { text: 'AI クイズ生成', icon: <PenTool size={18} /> },
    { text: 'AI 学習アドバイザー', icon: <Bot size={18} /> },
    { text: 'AI 徹底解剖（深掘り解説）', icon: <BrainCircuit size={18} /> },
    { text: '広告の非表示（予定）', icon: <ShieldCheck size={18} /> },
    { text: '早期アクセス機能', icon: <Zap size={18} /> },
    { text: 'コミュニティ・サポート', icon: <Heart size={18} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white mb-6">
          学習効率を、<span className="text-gradient">次の次元へ</span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
          Study Master PRO は、AI の力をフルに活用して、<br/>
          あなたの学習を徹底的にパーソナライズします。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {/* FREE PLAN */}
        <div className="glass p-8 rounded-[2.5rem] border-2 border-transparent transition-all flex flex-col">
          <div className="mb-8">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-4 py-1.5 rounded-full">Free</span>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-gray-800 dark:text-white">¥0</span>
              <span className="ml-1 text-gray-400 font-bold">/ 月</span>
            </div>
            <p className="mt-2 text-sm text-gray-500 font-bold">基本的な学習機能をすべて無料で。</p>
          </div>

          <div className="flex-1 space-y-4 mb-10">
            {freeFeatures.map((f, i) => (
              <div key={i} className={`flex items-center gap-3 ${f.available ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                {f.available ? <Check size={18} className="text-green-500 flex-shrink-0" /> : <div className="w-[18px]" />}
                <span className="text-sm font-bold">{f.text}</span>
              </div>
            ))}
          </div>

          <button 
            disabled 
            className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold cursor-not-allowed"
          >
            {isPro ? '現在のプラン' : '加入済み'}
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="glass p-8 rounded-[2.5rem] border-2 border-blue-500/50 shadow-2xl shadow-blue-500/10 relative flex flex-col transform hover:scale-[1.02] transition-all">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
            <Sparkles size={12} /> RECOMMENDED
          </div>

          <div className="mb-8">
            <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full">Pro</span>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-gray-800 dark:text-white">¥1,000</span>
              <span className="ml-1 text-gray-400 font-bold">/ 月</span>
            </div>
            <p className="mt-2 text-sm text-gray-500 font-bold">AIアシスタントによる無限の可能性。</p>
          </div>

          <div className="flex-1 space-y-4 mb-10">
            {proFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm font-bold">{f.text}</span>
              </div>
            ))}
          </div>

          {!isPro ? (
            <div className="space-y-4">
              <button 
                onClick={handleUpgradeClick}
                disabled={loading}
                className={`w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {loading ? (
                  <>決済準備中...</>
                ) : (
                  <>PROにアップグレード <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

              {showReset && (
                <div className="text-center animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] text-red-500 font-bold mb-2">
                    Stripe 接続エラーが発生しました。接続情報をリセットして再試行してください。
                  </p>
                  <button 
                    onClick={handleReset}
                    disabled={loading}
                    className="text-xs font-black text-gray-500 hover:text-blue-500 underline decoration-dotted transition-colors"
                  >
                    Stripe 接続をリセットする
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-full py-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black border border-blue-100 dark:border-blue-800">
                PROプラン 加入中
              </div>
            </div>
          )}

          {/* 管理者用コントロール（isAdmin の場合のみ表示） */}
          {isAdmin && (
            <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-blue-100 dark:border-blue-900/50">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Admin Mode</span>
              <div className="flex gap-4">
                <button onClick={downgradeToFree} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors uppercase font-bold">
                  FREEに戻す
                </button>
                <button onClick={forceUpgradeToPro} className="text-[10px] text-gray-400 hover:text-blue-500 transition-colors uppercase font-bold">
                  強制的にPROにする
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trust Badges / Footer */}
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 text-center">
            <h3 className="font-black text-gray-800 dark:text-white mb-4">なぜ PRO なのか？</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Study Master PRO の売上は、Gemini API の利用料金の維持と、より高度な学習ツールの開発に充てられます。<br/>
            皆様のサポートが、このアプリをより賢く、より使いやすく進化させます。
            </p>
        </div>
        
        <div className="text-center">
            <button 
                onClick={() => navigate('/legal')}
                className="text-xs text-gray-400 hover:text-blue-500 underline underline-offset-4 transition-colors font-bold"
            >
                特定商取引法に基づく表記
            </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
