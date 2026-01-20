// src/components/course/CreateCourseModal.jsx
import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Save } from 'lucide-react';

// initialData が渡されたら「編集モード」として動くようにする
const CreateCourseModal = ({ onClose, onSave, initialData = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 編集モードなら、初期値をフォームに入れる
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title, description);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            {initialData ? <Save className="mr-2" /> : <FolderPlus className="mr-2" />}
            {initialData ? 'フォルダを編集' : '新しいフォルダを作成'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              フォルダ名 <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors bg-gray-50 dark:bg-gray-700 dark:text-white font-bold"
              placeholder="例: 数学I・A" 
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              説明 (任意)
            </label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors bg-gray-50 dark:bg-gray-700 dark:text-white h-24 resize-none"
              placeholder="このフォルダの説明を入力..." 
            />
          </div>
          
          <div className="flex justify-end pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 mr-3 transition-colors"
            >
              キャンセル
            </button>
            <button 
              type="submit" 
              disabled={!title.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transform transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initialData ? '更新する' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;