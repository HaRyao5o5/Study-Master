// src/components/editor/QuizEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Save, X, Plus, ChevronDown } from 'lucide-react';
import { generateId } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import { CONFIRM } from '../../utils/errorMessages';
import QuestionForm from './QuestionForm';
import { QuizMetadataForm } from './QuizMetadataForm';
import { QuestionList } from './QuestionList';
import { Quiz, Question } from '../../types';

interface QuizEditorProps {
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

/**
 * クイズエディター（メインコンポーネント）
 */
const QuizEditor: React.FC<QuizEditorProps> = ({ quiz, onSave, onCancel }) => {
  const [title, setTitle] = useState(quiz.title || '');
  const [description, setDescription] = useState(quiz.description || '');
  const [questions, setQuestions] = useState<Question[]>(quiz.questions || []);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { showError, showConfirm } = useToast();

  // スクロール位置を監視してボタンの表示/非表示を切り替え
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 一番下から200px以内の場合は非表示
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 200;
      // スクロールが必要なほどコンテンツがある場合のみ表示
      const hasEnoughContent = documentHeight > windowHeight + 300;
      
      setShowScrollButton(hasEnoughContent && !isNearBottom);
    };

    handleScroll(); // 初期チェック
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // 一番下にスクロール
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
  const handleSaveQuestion = (question: Question) => {
    // IDが既存のリストに含まれているかチェック
    const isExisting = questions.some(q => q.id === question.id);

    if (isExisting) {
      // 既存の更新
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
  const handleDeleteQuestion = async (id: string) => {
    if (await showConfirm(CONFIRM.DELETE_QUESTION)) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  // 新規問題追加
  const handleAddQuestion = () => {
    // Cast to Question but with empty fields
    const newQuestion: Question = {
      id: generateId(),
      text: '',
      type: 'select',
      options: ['', ''],
      correctAnswer: [],
      explanation: ''
    } as any; 
    setEditingQuestion(newQuestion);
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
      <QuizMetadataForm 
        title={title} 
        setTitle={setTitle} 
        description={description} 
        setDescription={setDescription} 
      />

      {/* 問題リスト */}
      <QuestionList 
        questions={questions} 
        onEdit={setEditingQuestion} 
        onDelete={handleDeleteQuestion} 
      />

      {/* 問題追加ボタン */}
      <button
        onClick={handleAddQuestion}
        className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 font-medium"
      >
        <Plus size={20} />
        問題を追加
      </button>

      {/* 一番下にスクロールボタン（画面下部中央に固定、スクロール位置に応じて表示） */}
      {showScrollButton && questions.length >= 5 && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-white/20 dark:bg-gray-800/40 backdrop-blur-md border border-white/30 dark:border-gray-600/30 text-gray-700 dark:text-gray-200 rounded-full shadow-lg hover:shadow-xl hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all flex items-center gap-2 z-50"
          title="問題追加ボタンへスクロール"
        >
          <ChevronDown size={20} />
          <span className="text-sm font-medium">下へスクロール</span>
        </button>
      )}
      {/* スクロール用の参照要素 */}
      <div ref={bottomRef} />
    </div>
  );
};

export default QuizEditor;
