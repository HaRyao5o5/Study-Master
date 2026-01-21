// src/components/course/CreateCourseModal.jsx
import React, { useState } from 'react';
import { X, Save, Lock, Globe, Link as LinkIcon } from 'lucide-react';

const CreateCourseModal = ({ onClose, onSave, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  // ★ 追加: 公開設定のステート（デフォルトは 'private'）
  const [visibility, setVisibility] = useState(initialData?.visibility || 'private');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    // ★ 追加: visibility も渡す
    onSave(title, description, visibility);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-800 dark:text-white">
            {initialData ? '科目を編集' : '新しい科目を作成'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">科目名</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-transparent focus:border-blue-500 focus:outline-none transition-colors dark:text-white"
              placeholder="例: 数学I, 英単語..."
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">説明（任意）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-transparent focus:border-blue-500 focus:outline-none transition-colors dark:text-white h-24 resize-none"
              placeholder="この科目の目標やメモ..."
            />
          </div>

          {/* ★ 追加: 公開設定の選択エリア */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">公開設定</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'private', label: '非公開 (自分のみ)', icon: Lock, desc: 'あなただけが見れます' },
                { id: 'unlisted', label: '限定公開 (リンクのみ)', icon: LinkIcon, desc: 'URLを知っている人が見れます' },
                { id: 'public', label: '公開 (誰でも)', icon: Globe, desc: '将来的に検索可能になります' }
              ].map((option) => (
                <div 
                  key={option.id}
                  onClick={() => setVisibility(option.id)}
                  className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    visibility === option.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className={`p-2 rounded-full mr-3 ${
                    visibility === option.id ? 'bg-blue-100 dark:bg-blue-800 text-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>
                    <option.icon size={18} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${visibility === option.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.desc}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      visibility === option.id ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {visibility === option.id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center"
            >
              <Save size={20} className="mr-2" />
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;