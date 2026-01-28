import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, X, Send, User, Sparkles, Loader2, Minimize2, Maximize2, Lock } from 'lucide-react';
import { chatWithAI } from '../../utils/gemini';
import { usePlan } from '../../hooks/usePlan';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AIAdvisorProps {
  context?: {
    courseTitle?: string;
    description?: string;
    currentQuestion?: string;
  };
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'こんにちは！あなたの学習アドバイザーです。分からないことや、もっと深く知りたいことがあれば何でも聞いてくださいね。応援しています！' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { canUseAI } = usePlan();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !canUseAI) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const firstUserIndex = messages.findIndex(m => m.role === 'user');
      const history = (firstUserIndex === -1 ? [] : messages.slice(firstUserIndex))
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

      const response = await chatWithAI(userMessage, history, context);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'model', content: `申し訳ありません。エラーが発生しました: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 group border-4 border-white dark:border-gray-800"
      >
        <Bot size={28} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white dark:border-gray-800"></span>
        </span>
        <div className="absolute right-16 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-1.5 rounded-xl shadow-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-100 dark:border-gray-700">
          アドバイザーに聞く
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'h-14 w-64' : 'h-[500px] w-[350px] sm:w-[400px]'}`}>
      <div className="glass h-full w-full rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-500/20 dark:to-indigo-500/20 border-b border-white/20 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-xl text-white">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800 dark:text-white">学習アドバイザー</h3>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-gray-500"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-gray-400 hover:text-red-500"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/30 dark:bg-gray-900/30">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                      {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-center bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <Loader2 size={14} className="animate-spin text-blue-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">思考中...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input / Limit Overlay */}
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 border-t border-white/20 dark:border-gray-700 relative">
              {!canUseAI ? (
                <div className="absolute inset-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                  <div className="mb-3 p-3 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl shadow-lg ring-4 ring-white dark:ring-gray-800">
                    <Lock size={24} />
                  </div>
                  <h4 className="text-sm font-black text-gray-800 dark:text-white mb-1">PRO 限定機能</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-4 leading-relaxed">
                    AIアドバイザーはPROプランで利用可能です。<br/>
                    学習を最大限に加速させましょう。
                  </p>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Sparkles size={14} />
                    PROを詳しく見る
                  </button>
                </div>
              ) : null}
              
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="質問を入力してください..."
                  className="w-full bg-white dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none transition-all dark:text-white shadow-inner"
                  disabled={!canUseAI}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim() || !canUseAI}
                  className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-center text-gray-400 font-bold">
                現在の学習状況を考慮して回答します
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;
