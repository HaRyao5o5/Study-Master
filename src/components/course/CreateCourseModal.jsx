import React, { useState } from 'react';

const CreateCourseModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">フォルダの作成</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">フォルダ名</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 数学I, 英単語"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">説明（任意）</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="例: 2学期中間テスト用"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-bold">キャンセル</button>
          <button 
            onClick={() => { if(title) onSave(title, desc); }} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50"
            disabled={!title}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseModal;