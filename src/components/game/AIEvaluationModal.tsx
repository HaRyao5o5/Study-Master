import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, BrainCircuit, GraduationCap, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeMistakeWithAI } from '../../utils/gemini';
import { usePlan } from '../../hooks/usePlan';

interface AIEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  correctAnswer: string;
  userAnswer?: string;
  context?: string;
}

const AIEvaluationModal: React.FC<AIEvaluationModalProps> = ({ 
  isOpen, 
  onClose, 
  question, 
  correctAnswer, 
  userAnswer,
  context 
}) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { canUseAI } = usePlan();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && !analysis && !loading && canUseAI) {
      handleAnalyze();
    }
  }, [isOpen, canUseAI]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeMistakeWithAI(question, correctAnswer, userAnswer, context);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || '解析に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // 簡易的なマークダウン風パース
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // 見出し (## または ###)
      if (line.startsWith('###') || line.startsWith('##')) {
        return <h4 key={i} className="text-lg font-black text-blue-600 dark:text-blue-400 mt-6 mb-2 flex items-center">
          {line.replace(/^#+\s*/, '')}
        </h4>;
      }
      // 太字 (**text**)
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="mb-2">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-indigo-600 dark:text-indigo-400 font-black">{part}</strong> : part)}
          </p>
        );
      }
      // リスト (- または *)
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 mb-1 list-disc text-gray-700 dark:text-gray-300">{line.replace(/^[-*]\s*/, '')}</li>;
      }
      // 空行
      if (!line.trim()) return <div key={i} className="h-2" />;
      
      return <p key={i} className="mb-2 text-gray-700 dark:text-gray-300 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh] animate-pop-in">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">AI 徹底解剖センター</h3>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Powered by Gemini 2.0</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {!canUseAI ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
              <div className="mb-6 p-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-[2.5rem] shadow-2xl ring-8 ring-orange-50 dark:ring-orange-900/20 transform -rotate-3">
                <Lock size={48} />
              </div>
              <h4 className="text-2xl font-black text-gray-800 dark:text-white mb-3">AI 徹底解剖は PRO 限定です</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-8 max-w-md leading-relaxed">
                この機能は PRO プランをご利用の方のみお使いいただけます。<br/>
                AI による徹底的な問題分析と、あなた専用の記憶術のアドバイスを受け取ることができます。
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <div className="text-blue-600 dark:text-blue-400 font-black text-lg mb-1">本質</div>
                  <div className="text-[10px] text-gray-500 font-bold">問題の核心を解説</div>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                  <div className="text-indigo-600 dark:text-indigo-400 font-black text-lg mb-1">記憶</div>
                  <div className="text-[10px] text-gray-500 font-bold">一生忘れない記憶術</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate('/pricing');
                }}
                className="w-full max-w-xs py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
              >
                PRO プランをチェック
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-pulse flex items-center justify-center">
                  <Loader2 size={40} className="text-blue-600 animate-spin" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles size={24} className="text-yellow-500" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">AIが解説を構成中...</h4>
                <p className="text-sm text-gray-500 font-medium">
                  問題の意図を読み解き、あなたに最適なアドバイスを生成しています
                </p>
              </div>
              <div className="w-full max-w-xs h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-loading-bar" style={{ width: '40%' }}></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center">
              <p className="text-red-600 dark:text-red-400 font-bold mb-4">{error}</p>
              <button onClick={handleAnalyze} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold">
                再試行する
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Question Context */}
              <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <GraduationCap size={14} />
                  <span>分析対象の問題</span>
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{question}</p>
              </div>

              {/* Analysis Text */}
              <div className="prose dark:prose-invert max-w-none">
                {analysis && formatText(analysis)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gray-800 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>理解した</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIEvaluationModal;
