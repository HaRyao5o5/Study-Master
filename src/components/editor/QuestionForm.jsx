// src/components/editor/QuestionForm.jsx
import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { QuestionTypeSelector } from './QuestionTypeSelector';
import { ImageUploadSection } from './ImageUploadSection';
import { OptionsEditor } from './OptionsEditor';
import { InputAnswersEditor } from './InputAnswersEditor';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useQuestionValidation } from '../../hooks/useQuestionValidation';
import { useToast } from '../../context/ToastContext';

/**
 * 問題編集フォームコンポーネント
 * @param {Object} props
 * @param {Object} props.question - 編集対象の問題
 * @param {Function} props.onSave - 保存時の callback
 * @param {Function} props.onCancel - キャンセル時のコールバック
 */
const QuestionForm = ({ question, onSave, onCancel }) => {
  const [qData, setQData] = useState({
    id: question.id || null,
    text: question.text || '',
    type: question.type || 'select',
    options: question.options || ['', ''],
    correctAnswer: question.correctAnswer || [],
    explanation: question.explanation || ''
  });

  const { image, isUploading, error: imageError, handleFileSelect, handleUrlInput, clearImage, setImage } = useImageUpload();
  const { validateQuestion, hasRequiredFields } = useQuestionValidation();
  const { showError } = useToast();

  // 既存の画像を設定
  React.useEffect(() => {
    if (question.image) {
      setImage(question.image);
    }
  }, [question.image, setImage]);

  // タイプ変更
  const handleTypeChange = (newType) => {
    setQData({
      ...qData,
      type: newType,
      options: newType === 'input' ? [] : (qData.options.length >= 2 ? qData.options : ['', '']),
      correctAnswer: newType === 'input' ? [''] : []
    });
  };

  // 選択肢変更
  const handleOptionChange = (idx, value) => {
    const newOptions = [...qData.options];
    newOptions[idx] = value;
    setQData({ ...qData, options: newOptions });
  };

  // 選択肢追加
  const handleAddOption = () => {
    if (qData.options.length < 6) {
      setQData({ ...qData, options: [...qData.options, ''] });
    }
  };

  // 選択肢削除
  const handleRemoveOption = (idx) => {
    if (qData.options.length <= 2) {
      showError('選択肢は最低2つ必要です');
      return;
    }
    const optionToRemove = qData.options[idx];
    const newOptions = qData.options.filter((_, i) => i !== idx);
    const newCorrect = qData.correctAnswer.filter(ans => ans !== optionToRemove);
    setQData({ ...qData, options: newOptions, correctAnswer: newCorrect });
  };

  // 正解変更（選択式）
  const handleCorrectChange = (option) => {
    let newCorrect;
    if (qData.type === 'select') {
      newCorrect = [option];
    } else {
      if (qData.correctAnswer.includes(option)) {
        newCorrect = qData.correctAnswer.filter(c => c !== option);
      } else {
        newCorrect = [...qData.correctAnswer, option];
      }
    }
    setQData({ ...qData, correctAnswer: newCorrect });
  };

  // 正解変更（記述式）
  const handleAnswerChange = (idx, value) => {
    const newAnswers = [...qData.correctAnswer];
    newAnswers[idx] = value;
    setQData({ ...qData, correctAnswer: newAnswers });
  };

  // 正解追加（記述式）
  const handleAddAnswer = () => {
    setQData({ ...qData, correctAnswer: [...qData.correctAnswer, ''] });
  };

  // 正解削除（記述式）
  const handleRemoveAnswer = (idx) => {
    if (qData.correctAnswer.length <= 1) return;
    const newAnswers = qData.correctAnswer.filter((_, i) => i !== idx);
    setQData({ ...qData, correctAnswer: newAnswers });
  };

  // 保存
  const handleSave = () => {
    const validation = validateQuestion(qData);
    if (!validation.isValid) {
      showError(validation.errors[0]);
     return;
    }

    onSave({
      ...qData,
      image: image || undefined
    });
  };

  const canSave = hasRequiredFields(qData);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <button 
            onClick={onCancel} 
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 flex items-center gap-2"
          >
            <X size={20} />
            キャンセル
          </button>
          <h2 className="font-bold text-lg text-gray-800 dark:text-white">問題の編集</h2>
          <button 
            onClick={handleSave} 
            disabled={!canSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            完了
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 問題タイプ選択 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            出題形式
          </label>
          <QuestionTypeSelector 
            value={qData.type}
            onChange={handleTypeChange}
          />
        </div>

        {/* 問題文 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            問題文
          </label>
          <textarea 
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={qData.text}
            onChange={(e) => setQData({ ...qData, text: e.target.value })}
            placeholder="ここに問題を入力..."
            rows={4}
          />
        </div>

        {/* 画像アップロード */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <ImageUploadSection
            image={image}
            isUploading={isUploading}
            error={imageError}
            onFileSelect={handleFileSelect}
            onUrlInput={handleUrlInput}
            onClear={clearImage}
          />
        </div>

        {/* 選択肢 or 正解 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          {qData.type === 'input' ? (
            <InputAnswersEditor
              answers={qData.correctAnswer}
              onChange={handleAnswerChange}
              onAdd={handleAddAnswer}
              onRemove={handleRemoveAnswer}
            />
          ) : (
            <OptionsEditor
              type={qData.type}
              options={qData.options}
              correctAnswer={qData.correctAnswer}
              onOptionsChange={handleOptionChange}
              onCorrectChange={handleCorrectChange}
              onAddOption={handleAddOption}
              onRemoveOption={handleRemoveOption}
            />
          )}
        </div>

        {/* 解説 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            解説（任意）
          </label>
          <textarea 
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={qData.explanation}
            onChange={(e) => setQData({ ...qData, explanation: e.target.value })}
            placeholder="正解後に表示される解説を入力..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;
