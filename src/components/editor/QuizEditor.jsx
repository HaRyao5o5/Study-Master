import React, { useState } from 'react';
import { Plus, Edit3, Trash2, ImageIcon } from 'lucide-react';
import QuestionEditor from './QuestionEditor';
import { generateId } from '../../utils/helpers';

const QuizEditor = ({ quiz, onSave, onCancel }) => {
  const [title, setTitle] = useState(quiz ? quiz.title : '');
  const [desc, setDesc] = useState(quiz ? quiz.description : '');
  const [questions, setQuestions] = useState(quiz ? quiz.questions : []);
  const [editingQ, setEditingQ] = useState(null);

  const addQuestion = () => {
    setEditingQ({
      id: generateId(),
      text: '',
      type: 'multiple',
      options: ['', '', '', ''],
      correctAnswer: [],
      image: null
    });
  };

  const saveQuestion = (q) => {
    if (questions.find(Existing => Existing.id === q.id)) {
      setQuestions(questions.map(Existing => Existing.id === q.id ? q : Existing));
    } else {
      setQuestions([...questions, q]);
    }
    setEditingQ(null);
  };

  const deleteQuestion = (id) => {
    if(confirm('この問題を削除しますか？')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  if (editingQ) {
    return <QuestionEditor question={editingQ} onSave={saveQuestion} onCancel={() => setEditingQ(null)} />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen pb-20">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
          キャンセル
        </button>
        <h2 className="font-bold text-gray-800 dark:text-white">問題セットの編集</h2>
        <button onClick={() => onSave({ title, description: desc, questions })} className="text-blue-600 font-bold">
          保存
        </button>
      </div>
      
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">タイトル</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 第1章 確認テスト"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">説明</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 dark:text-gray-300">問題一覧 ({questions.length})</h3>
            <button onClick={addQuestion} className="flex items-center text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-bold">
              <Plus size={16} className="mr-1" /> 追加
            </button>
          </div>
          
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 border rounded-lg dark:border-gray-600 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span className="font-bold mr-2">Q{idx + 1}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase mr-2 ${q.type === 'input' ? 'bg-purple-100 text-purple-600' : q.type === 'multi-select' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                      {q.type === 'input' ? '記述' : q.type === 'multi-select' ? '複数選択' : '単一選択'}
                    </span>
                    {q.image && <ImageIcon size={12} className="ml-1" />}
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{q.text}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingQ(q)} className="p-2 text-gray-400 hover:text-blue-500">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => deleteQuestion(q.id)} className="p-2 text-gray-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {questions.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">問題がまだありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;