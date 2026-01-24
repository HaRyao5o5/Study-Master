// src/components/course/CreateCourseModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Lock, Globe, Link as LinkIcon, FolderPlus } from 'lucide-react';

const CreateCourseModal = ({ onClose, onSave, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [visibility, setVisibility] = useState(initialData?.visibility || 'private');

  // モーダルが開いた瞬間のアニメーション用
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setIsVisible(true); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title, description, visibility);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>

      {/* モーダル本体: glassクラス適用 */}
      <div
        className={`glass w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー: グラデーションテキストとアイコン */}
        <div className="p-6 border-b border-gray-100/50 dark:border-gray-700/50 flex justify-between items-center bg-white/40 dark:bg-gray-800/40">
          <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center">
            {initialData ? (
              <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3 text-blue-600 dark:text-blue-400">
                <Save size={20} />
              </span>
            ) : (
              <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3 text-blue-600 dark:text-blue-400">
                <FolderPlus size={20} />
              </span>
            )}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              {initialData ? 'コース編集' : '新しいコース'}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white/20 dark:bg-gray-900/20">
          {/* タイトル入力 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">コース名</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:outline-none transition-all dark:text-white font-bold shadow-sm placeholder-gray-400"
              placeholder="例: 情報処理入門"
              autoFocus
            />
          </div>

          {/* 説明入力 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:outline-none transition-all dark:text-white h-24 resize-none shadow-sm placeholder-gray-400"
              placeholder="このコースの内容を入力してください"
            />
          </div>

          {/* 公開設定 (ラジオボタン風カード) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">公開範囲</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'private', label: 'プライベート', icon: Lock, desc: '自分だけ閲覧可能', color: 'text-gray-600 dark:text-gray-300' },
                { id: 'unlisted', label: '限定公開', icon: LinkIcon, desc: 'リンクを知っている人のみ', color: 'text-yellow-600 dark:text-yellow-400' },
                { id: 'public', label: '公開', icon: Globe, desc: '誰でも検索・閲覧可能', color: 'text-green-600 dark:text-green-400' }
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => setVisibility(option.id)}
                  className={`
                    flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${visibility === option.id
                      ? 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-500 shadow-md'
                      : 'bg-white/40 dark:bg-gray-800/40 border-transparent hover:bg-white/60 dark:hover:bg-gray-800/60'
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg mr-3 ${visibility === option.id ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <option.icon size={18} className={option.color} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${visibility === option.id ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.label}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      {option.desc}
                    </div>
                  </div>
                  {visibility === option.id && (
                    <div className="ml-auto w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ボタンエリア */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center"
            >
              <Save size={18} className="mr-2" />
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;