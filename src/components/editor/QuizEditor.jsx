// src/components/editor/QuizEditor.jsx (簡素化版)
import React, { useState } from 'react';
import { Save, X, Plus, Trash2, Edit2 } from 'lucide-react';
import { generateId } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import { CONFIRM } from '../../utils/errorMessages';
import QuestionForm from './QuestionForm';

/**
 * クイズエディター（メインコンポーネント）
 * @param {Object} props
 * @param {Object} props.quiz - 編集対象のクイズ
 * @param {Function} props.onSave - 保存時のコールバック
 * @param {Function} props.onCancel - キャンセル時のコールバック
 */
const QuizEditor = ({ quiz, onSave, onCancel }) => {
  const [title, setTitle] = useState(quiz.title || '');
  const [description, setDescription] = useState(quiz.description || '');
  const [questions, setQuestions] = useState(quiz.questions || []);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  const { showError, showConfirm } = useToast();

  // クイズ保存
  const handleSave = () => {
    if (!title.trim()) {
      showError('クイズタイトルを入力してください');
      return;
    }
    if (questions.length === 0) {
      showError('最低1つの問題を追加してください');
      return;
    }

    onSave({
      ...quiz,
      title: title.trim(),
      description: description.trim(),
      questions
    });
  };

  // 問題の保存（新規追加 or 編集）
  const handleSaveQuestion = (question) => {
    if (editingQuestion && editingQuestion.id) {
      // 編集モード
      setQuestions(questions.map(q => 
        q.id === question.id ? question : q
      ));
    } else {
      // 新規追加
      setQuestions([...questions, { ...question, id: question.id || generateId() }]);
    }
    setEditingQuestion(null);
  };

  // 問題の削除
  const handleDeleteQuestion = async (id) => {
    if (await showConfirm(CONFIRM.DELETE_QUESTION)) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  // 新規問題追加
  const handleAddQuestion = () => {
    setEditingQuestion({ 
      text: '', 
      type: 'select', 
      options: ['', ''], 
      correctAnswer: [],
      explanation: ''
    });
  };

  // 編集中の場合はQuestionFormを表示
  if (editingQuestion !== null) {
    return (
      <QuestionForm
        question={editingQuestion}
        onSave={handleSaveQuestion}
        onCancel={() => setEditingQuestion(null)}
      />
    );
  }

  // メインのクイズ編集画面
  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">クイズ編集</h2>
        <div className="flex gap-2">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <X size={20} />
            キャンセル
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <Save size={20} />
            保存
          </button>
        </div>
      </div>

      {/* タイトル・説明 */}
      <div className="space-y-4 mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            クイズタイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 英単語テスト Level 1"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            説明（任意）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このクイズについての説明を入力..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      </div>

      {/* 問題リスト */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
          問題一覧 ({questions.length}問)
        </h3>
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div 
              key={q.id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-blue-600 dark:text-blue-400">Q{idx + 1}.</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      q.type === 'select' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      q.type === 'multi-select' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    }`}>
                      {q.type === 'select' ? '単一選択' : q.type === 'multi-select' ? '複数選択' : '記述式'}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{q.text}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditingQuestion(q)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="編集"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 問題追加ボタン */}
      <button
        onClick={handleAddQuestion}
        className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 font-medium"
      >
        <Plus size={20} />
        問題を追加
      </button>
    </div>
  );
};

export default QuizEditor;