import React, { useState } from 'react';
import { X, Sparkles, Loader, AlertCircle } from 'lucide-react';
import { generateFullCourseWithAI } from '../../utils/gemini';
import { generateId } from '../../utils/helpers';
import { Course, Quiz } from '../../types';

interface GenerateCourseModalProps {
  onClose: () => void;
  onSave: (course: Course) => void;
}

const GenerateCourseModal: React.FC<GenerateCourseModalProps> = ({ onClose, onSave }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await generateFullCourseWithAI(topic);
      
      const newCourse: Course = {
        id: `course-${generateId()}`,
        title: data.title,
        description: data.description,
        color: data.color || '#3b82f6',
        icon: data.icon || '📚',
        quizzes: [],
        createdAt: Date.now(),
        visibility: 'private'
      };

      if (data.initialQuiz) {
        const initialQuiz: Quiz = {
          ...data.initialQuiz,
          id: `quiz-${generateId()}`,
          questions: data.initialQuiz.questions.map((q: any, i: number) => ({
            ...q,
            id: `q-${generateId()}-${i}`
          }))
        };
        newCourse.quizzes.push(initialQuiz);
      }

      onSave(newCourse);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "生成に失敗しました。トピックを変えて試してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] m-0 p-4"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-pop-in border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100/50 dark:border-gray-700/50 flex justify-between items-center bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center">
            <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3 text-blue-600 dark:text-blue-400">
              <Sparkles size={20} />
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              AIで新しい科目を作成
            </span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">学びたいトピックを入力</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:outline-none transition-all dark:text-white shadow-sm placeholder-gray-400"
              placeholder="例: 世界の首都、JavaScriptの基礎..."
              autoFocus
            />
            <p className="mt-2 text-[10px] text-gray-400 leading-relaxed font-bold">
              AIが最適なコース名、説明、アイコン、そして最初のクイズを自動作成します。
            </p>
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
              disabled={loading || !topic.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center"
            >
              {loading ? (
                <>
                  <Loader size={18} className="mr-2 animate-spin" />
                  設計中...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  コースを設計
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateCourseModal;
