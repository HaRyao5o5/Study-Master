// src/components/editor/QuizEditor.jsx
import React, { useState, useRef } from 'react';
import { Save, X, Plus, Trash2, CheckCircle, AlertCircle, FileText, ChevronRight, Image as ImageIcon, Check, Upload } from 'lucide-react';
import { generateId } from '../../utils/helpers';
import { resizeImage, getBase64Size } from '../../utils/imageUtils';
import { useToast } from '../../context/ToastContext';

const QuizEditor = ({ quiz, onSave, onCancel }) => {
  const [title, setTitle] = useState(quiz.title || '');
  const [description, setDescription] = useState(quiz.description || '');
  const [questions, setQuestions] = useState(quiz.questions || []);

  const [editingQuestion, setEditingQuestion] = useState(null);
  const { showError, showConfirm } = useToast();

  const handleSaveQuiz = () => {
    if (!title.trim()) return;
    if (questions.length === 0) {
      showError("少なくとも1つの問題を作成してください。");
      return;
    }

    const updatedQuiz = {
      ...quiz,
      title,
      description,
      questions
    };
    onSave(updatedQuiz);
  };

  const handleAddQuestion = () => {
    setEditingQuestion({
      id: `q-${generateId()}`,
      type: 'select', // デフォルト: 単一選択
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      image: '',
      explanation: ''
    });
  };

  const handleSaveQuestion = (q) => {
    // バリデーション
    if (!q.text.trim()) {
      showError("問題文を入力してください。");
      return;
    }

    if (q.type === 'input') {
      if (!q.correctAnswer) {
        showError("正解を入力してください。");
        return;
      }
    } else {
      const filledOptions = q.options.filter(o => o.trim());
      if (filledOptions.length < 2) {
        showError("最低2つの選択肢を入力してください。");
        return;
      }
      if (!q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)) {
        showError("正解を選択してください。");
        return;
      }
    }

    if (questions.find(existing => existing.id === q.id)) {
      setQuestions(questions.map(existing => existing.id === q.id ? q : existing));
    } else {
      setQuestions([...questions, q]);
    }
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = async (id) => {
    if (await showConfirm(CONFIRM.DELETE_QUESTION)) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  // --- サブコンポーネント: 質問編集フォーム ---
  const QuestionForm = ({ initialData, onSave, onCancel }) => {
    const imageInputRef = useRef(null);
    const [qData, setQData] = useState(initialData);

    const handleOptionChange = (idx, val) => {
      const newOptions = [...qData.options];
      newOptions[idx] = val;

      // 正解が変更された選択肢だった場合、正解も更新
      if (qData.type === 'select' && qData.correctAnswer === qData.options[idx]) {
        setQData({ ...qData, options: newOptions, correctAnswer: val });
      } else if (qData.type === 'multi-select') {
        // 複数選択の場合、正解配列から古い値を削除して新しい値を追加
        const oldVal = qData.options[idx];
        const correctAnswers = Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [];
        const updatedCorrect = correctAnswers.map(ans => ans === oldVal ? val : ans);
        setQData({ ...qData, options: newOptions, correctAnswer: updatedCorrect });
      } else {
        setQData({ ...qData, options: newOptions });
      }
    };

    const handleAddOption = () => {
      setQData({ ...qData, options: [...qData.options, ''] });
    };

    const handleRemoveOption = (idx) => {
      const newOptions = qData.options.filter((_, i) => i !== idx);
      setQData({ ...qData, options: newOptions });
    };

    const toggleMultiSelect = (option) => {
      if (!option.trim()) return;
      const currentAnswers = Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [];
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter(a => a !== option)
        : [...currentAnswers, option];
      setQData({ ...qData, correctAnswer: newAnswers });
    };

    // 画像アップロード処理
    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showError('画像ファイルを選択してください');
        return;
      }

      try {
        const resizedBase64 = await resizeImage(file, 800, 600);
        const size = getBase64Size(resizedBase64);

        if (size > 500) {
          showError(`画像サイズが大きすぎます (${Math.round(size)}KB)。500KB以下の画像を選択してください。`);
          return;
        }

        setQData({ ...qData, image: resizedBase64 });
      } catch (error) {
        console.error(error);
        showError('画像の処理に失敗しました');
      }
    };

    // 記述式の正解を追加
    const handleAddCorrectAnswer = () => {
      const currentAnswers = Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [qData.correctAnswer || ''];
      setQData({ ...qData, correctAnswer: [...currentAnswers, ''] });
    };

    // 記述式の正解を削除
    const handleRemoveCorrectAnswer = (idx) => {
      const currentAnswers = Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [qData.correctAnswer];
      const newAnswers = currentAnswers.filter((_, i) => i !== idx);
      setQData({ ...qData, correctAnswer: newAnswers.length === 1 ? newAnswers[0] : newAnswers });
    };

    // 記述式の正解を変更
    const handleCorrectAnswerChange = (idx, value) => {
      const currentAnswers = Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [qData.correctAnswer || ''];
      const newAnswers = [...currentAnswers];
      newAnswers[idx] = value;
      setQData({ ...qData, correctAnswer: newAnswers.length === 1 ? newAnswers[0] : newAnswers });
    };

    return (
      <div className="space-y-4 animate-slide-up">
        {/* 問題タイプ選択 */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Question Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'select', label: '単一選択' },
              { value: 'multi-select', label: '複数選択' },
              { value: 'input', label: '記述式' }
            ].map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setQData({ ...qData, type: type.value, correctAnswer: type.value === 'multi-select' ? [] : '' })}
                className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${qData.type === type.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 問題文 */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Question Text</label>
          <textarea
            value={qData.text}
            onChange={e => setQData({ ...qData, text: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:outline-none transition-all dark:text-white resize-none h-24 shadow-sm"
            placeholder="問題文を入力..."
            autoFocus
          />
        </div>

        {/* 画像追加 */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase flex items-center">
            <ImageIcon size={14} className="mr-1" /> Image (Optional)
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={qData.image && !qData.image.startsWith('data:') ? qData.image : ''}
              onChange={e => setQData({ ...qData, image: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border-2 border-transparent bg-white/60 dark:bg-gray-800/60 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:outline-none transition-all dark:text-white shadow-sm"
              placeholder="画像URLを入力 または 下のボタンでファイルを選択"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
              >
                <Upload size={16} className="mr-2" />ファイルを選択
              </button>
              {qData.image && (
                <button
                  type="button"
                  onClick={() => setQData({ ...qData, image: '' })}
                  className="py-2 px-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg text-sm font-bold transition-colors"
                >
                  削除
                </button>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {qData.image && (
              <div className="mt-2">
                <img
                  src={qData.image}
                  alt="Preview"
                  className="max-w-full h-auto max-h-48 rounded-lg border border-gray-200 dark:border-gray-700"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {qData.image.startsWith('data:') && (
                  <p className="text-xs text-gray-400 mt-1">
                    サイズ: {Math.round(getBase64Size(qData.image))}KB
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 選択肢 または 記述式の正解 */}
        {qData.type === 'input' ? (
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Correct Answer(s)</label>
            <div className="space-y-2">
              {(Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [qData.correctAnswer || '']).map((answer, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={e => handleCorrectAnswerChange(idx, e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-transparent bg-white/60 dark:bg-gray-800/60 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:outline-none transition-all dark:text-white shadow-sm"
                    placeholder={idx === 0 ? '正解を入力' : `別解 ${idx}`}
                  />
                  {(Array.isArray(qData.correctAnswer) ? qData.correctAnswer.length : 1) > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCorrectAnswer(idx)}
                      className="p-3 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddCorrectAnswer}
                className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-bold"
              >
                + 別解を追加
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">
              Options {qData.type === 'multi-select' && '(Select All Correct Answers)'}
            </label>
            <div className="grid gap-3">
              {qData.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {qData.type === 'select' ? (
                    <button
                      type="button"
                      onClick={() => setQData({ ...qData, correctAnswer: opt })}
                      className={`p-3 rounded-lg border-2 transition-all ${qData.correctAnswer === opt && opt !== ''
                          ? 'bg-green-500 border-green-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 border-transparent text-gray-400 hover:bg-gray-200'
                        }`}
                      disabled={!opt}
                    >
                      <CheckCircle size={20} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleMultiSelect(opt)}
                      className={`p-3 rounded-lg border-2 transition-all ${Array.isArray(qData.correctAnswer) && qData.correctAnswer.includes(opt) && opt !== ''
                          ? 'bg-green-500 border-green-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 border-transparent text-gray-400 hover:bg-gray-200'
                        }`}
                      disabled={!opt}
                    >
                      <Check size={20} />
                    </button>
                  )}
                  <input
                    type="text"
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 border-transparent bg-white/60 dark:bg-gray-800/60 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:outline-none transition-all dark:text-white shadow-sm ${(qData.type === 'select' && qData.correctAnswer === opt && opt !== '') ||
                        (qData.type === 'multi-select' && Array.isArray(qData.correctAnswer) && qData.correctAnswer.includes(opt) && opt !== '')
                        ? 'border-green-500/50' : ''
                      }`}
                    placeholder={`選択肢 ${idx + 1}`}
                  />
                  {qData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-3 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {qData.options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-bold"
              >
                + 選択肢を追加
              </button>
            )}
            {(!qData.correctAnswer || (Array.isArray(qData.correctAnswer) && qData.correctAnswer.length === 0)) && (
              <p className="text-xs text-red-500 mt-2 flex items-center"><AlertCircle size={12} className="mr-1" /> 正解の選択肢のボタンをクリックして選択してください</p>
            )}
          </div>
        )}

        {/* 解説 */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Explanation (Optional)</label>
          <textarea
            value={qData.explanation || ''}
            onChange={e => setQData({ ...qData, explanation: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:outline-none transition-all dark:text-white resize-none h-20 shadow-sm"
            placeholder="解説を入力（任意）..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
          <button
            onClick={() => onSave(qData)}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20 animate-fade-in">
      {/* ヘッダーカード */}
      <div className="glass p-6 rounded-3xl mb-6 flex justify-between items-center shadow-lg border-white/40 dark:border-gray-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex items-center z-10">
          <button onClick={onCancel} className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white">
              {quiz.id.includes('quiz-') ? 'Edit Quiz' : 'New Quiz'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">問題セットの内容を編集</p>
          </div>
        </div>

        <button
          onClick={handleSaveQuiz}
          className="z-10 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1 flex items-center"
        >
          <Save size={20} className="mr-2" /> 保存
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：基本情報 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:outline-none transition-all dark:text-white font-bold mb-4"
              placeholder="Ex: 英単語 第1章"
            />

            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:outline-none transition-all dark:text-white resize-none h-32"
              placeholder="説明を入力..."
            />
          </div>

          <div className="glass p-6 rounded-2xl text-center">
            <p className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-1">{questions.length}</p>
            <p className="text-xs font-bold text-gray-400 uppercase">Questions</p>
          </div>
        </div>

        {/* 右側：質問リスト / 編集フォーム */}
        <div className="lg:col-span-2">
          <div className="glass p-6 rounded-2xl min-h-[500px]">
            {editingQuestion ? (
              <div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-2 text-blue-600"><FileText size={18} /></span>
                  {questions.find(q => q.id === editingQuestion.id) ? 'Edit Question' : 'Add Question'}
                </h3>
                <QuestionForm
                  initialData={editingQuestion}
                  onSave={handleSaveQuestion}
                  onCancel={() => setEditingQuestion(null)}
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200">Questions List</h3>
                  <button
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-sm transition-colors flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add New
                  </button>
                </div>

                <div className="space-y-3">
                  {questions.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      <p className="text-gray-400 font-bold">問題がまだありません</p>
                      <p className="text-xs text-gray-400 mt-1">"Add New" から作成してください</p>
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <div
                        key={q.id}
                        onClick={() => setEditingQuestion(q)}
                        className="group p-4 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 rounded-xl cursor-pointer transition-all flex justify-between items-center"
                      >
                        <div className="flex items-center min-w-0">
                          <span className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-lg mr-3 text-xs flex-shrink-0">
                            Q{idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-700 dark:text-gray-200 truncate pr-4">{q.text}</p>
                            <p className="text-xs text-gray-400">
                              {q.type === 'select' ? '単一選択' : q.type === 'multi-select' ? '複数選択' : '記述式'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                          <ChevronRight size={16} className="text-gray-300" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;