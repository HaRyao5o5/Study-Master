// src/components/course/GenerateQuizModal.tsx
import React, { useState } from 'react';
import { X, Sparkles, Loader, AlertCircle, Image as ImageIcon, Trash2, FileText, Upload } from 'lucide-react';
import { generateQuizWithAI } from '../../utils/gemini';
import { generateId } from '../../utils/helpers';
import { Quiz } from '../../types';

interface GenerateQuizModalProps {
  onClose: () => void;
  onSave: (quiz: Quiz) => void;
}

const GenerateQuizModal: React.FC<GenerateQuizModalProps> = ({ onClose, onSave }) => {
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [apiKey, setApiKey] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const hasEnvKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages: string[] = [];
      const files = Array.from(e.target.files);
      
      if (images.length + files.length > 10) {
          setError("画像は最大10枚までです");
          return;
      }

      let processed = 0;
      files.forEach(file => {
         const reader = new FileReader();
         reader.onload = (ev) => {
             if (ev.target?.result) {
                 newImages.push(ev.target.result as string);
             }
             processed++;
             if (processed === files.length) {
                 setImages(prev => [...prev, ...newImages]);
             }
         };
         reader.readAsDataURL(file);
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("ファイルサイズは2MB以内にして下さい");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleRemoveImage = (index: number) => {
      setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;

    const keyToUse = hasEnvKey ? undefined : apiKey;
    if (!hasEnvKey && !keyToUse) {
      setError("Gemini APIキーが必要です（設定画面か.envで設定してください）");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedData: any = await generateQuizWithAI(text, count, images, keyToUse);

      const newQuiz: Quiz = {
        ...generatedData,
        id: `quiz-${generateId()}`,
        questions: generatedData.questions.map((q: any, i: number) => ({
          ...q,
          id: `q-${generateId()}-${i}`
        }))
      };

      onSave(newQuiz);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "予期せぬエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ★ 修正: アニメーションクラス(animate-fade-in)を削除し、確実に画面を覆う
    // style={{ margin: 0, top: 0 }} で強制的にリセット
    <div
      className="fixed top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] m-0 p-4"
      style={{ margin: 0, top: 0 }}
      onClick={onClose}
    >
      {/* カード部分にだけアニメーション(animate-pop-in)を適用 */}
      <div
        className="glass w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-pop-in border border-white/20"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-100/50 dark:border-gray-700/50 flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center">
            <span className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3 text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              AIクイズ生成
            </span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {!hasEnvKey && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 text-xs text-yellow-800 dark:text-yellow-200 mb-4">
              <AlertCircle size={14} className="inline mr-1" />
              APIキーが設定されていません。.envファイルを確認するか、以下に入力してください。
              <input
                type="password"
                placeholder="Gemini API Key"
                className="mt-2 w-full p-2 rounded border border-yellow-300 dark:border-yellow-700 bg-white/50 dark:bg-black/20"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          )}

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">元になるテキスト / トピック</label>
              <label className="flex items-center gap-1 text-[10px] font-black text-purple-600 dark:text-purple-400 cursor-pointer hover:underline">
                <Upload size={10} />
                ファイル読込 (.txt, .md)
                <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (fileName) setFileName(null);
              }}
              className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:border-purple-500 focus:outline-none transition-all dark:text-white h-32 resize-none shadow-sm placeholder-gray-400"
              placeholder="ここに教科書の文章や、覚えたい単語リスト、または「日本の歴史について」のようなトピックを入力してください..."
            />
            {fileName && (
              <div className="mt-1 flex items-center text-[10px] font-bold text-gray-400">
                <FileText size={10} className="mr-1" />
                読み込み中: {fileName}
                <button onClick={() => { setText(''); setFileName(null); }} className="ml-2 text-red-400 hover:text-red-500 underline">クリア</button>
              </div>
            )}
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider flex justify-between">
                <span>添付画像 (最大10枚)</span>
                <span>{images.length}/10</span>
             </label>
             
             <div className="flex flex-wrap gap-2 mb-2">
                {images.map((img, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img src={img} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                        <button 
                             onClick={() => handleRemoveImage(idx)}
                             className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                
                {images.length < 10 && (
                    <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                        <ImageIcon size={20} className="text-gray-400" />
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            className="hidden" 
                            onChange={handleImageUpload}
                        />
                    </label>
                )}
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">問題数: {count}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full h-2 bg-purple-200 dark:bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start break-all">
              <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || (!text.trim() && images.length === 0)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 dark:shadow-none transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center"
            >
              {loading ? (
                <>
                  <Loader size={18} className="mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  クイズを生成
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateQuizModal;
