// src/components/editor/QuestionForm.tsx
import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { QuestionTypeSelector } from './QuestionTypeSelector';
import { ImageUploadSection } from './ImageUploadSection';
import { OptionsEditor } from './OptionsEditor';
import { InputAnswersEditor } from './InputAnswersEditor';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useQuestionValidation } from '../../hooks/useQuestionValidation';
import { useToast } from '../../context/ToastContext';
import { Question, QuestionType } from '../../types';

interface QuestionFormProps {
  question: Partial<Question>; // Can be a new question (partial) or existing
  onSave: (question: Question) => void;
  onCancel: () => void;
}

/**
 * 問題編集フォームコンポーネント
 */
const QuestionForm: React.FC<QuestionFormProps> = ({ question, onSave, onCancel }) => {
  const [qData, setQData] = useState<Question>({
    id: question.id || '', // Should generate ID if not present in parent, but here we expect ID or handle it
    text: question.text || '',
    type: question.type || 'select',
    options: question.options || ['', ''],
    correctAnswer: question.correctAnswer || [],
    explanation: question.explanation || '',
    image: question.image || undefined // Ensure proper typing
  } as Question);

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
  const handleTypeChange = (newType: QuestionType) => {
    setQData((prev: Question) => ({
      ...prev,
      type: newType,
      options: newType === 'input' ? [] : (prev.options && prev.options.length >= 2 ? prev.options : ['', '']),
      correctAnswer: newType === 'input' ? [''] : []
    }));
  };

  // 選択肢変更
  const handleOptionChange = (idx: number, value: string) => {
    const newOptions = [...(qData.options || [])];
    newOptions[idx] = value;
    setQData({ ...qData, options: newOptions });
  };

  // 選択肢追加
  const handleAddOption = () => {
    if ((qData.options || []).length < 50) {
      setQData({ ...qData, options: [...(qData.options || []), ''] });
    }
  };

  // 選択肢削除
  const handleRemoveOption = (idx: number) => {
    if ((qData.options || []).length <= 2) {
      showError('選択肢は最低2つ必要です');
      return;
    }
    const optionToRemove = qData.options![idx];
    const newOptions = qData.options!.filter((_, i) => i !== idx);
    const newCorrect = (qData.correctAnswer as string[]).filter(ans => ans !== optionToRemove);
    setQData({ ...qData, options: newOptions, correctAnswer: newCorrect });
  };

  // 正解変更（選択式）
  const handleCorrectChange = (option: string) => {
    let newCorrect: string | string[];
    if (qData.type === 'select') {
      newCorrect = option; // In types.ts, correctAnswer can be string | string[] depending on type logic? 
      // Actually checking types.ts from previous context:
      // "Question" interface: correctAnswer: string | string[];
      // But logic in original code treated it as array for multi-select, and maybe string or array for select?
      // Wait, original `handleCorrectChange` code:
      /*
      if (qData.type === 'select') {
        newCorrect = [option]; 
      }
      */
      // It treated it as array even for select!
      // Let's stick to array to match state initialization `[]`. 
      // However, Question type definition might say string | string[].
      // If `select`, it expects single string usually, but storing as array of 1 element is fine if we convert later or consistency.
      // Let's look at `QuestionEditor` original code again: `setQ({ ...q, correctAnswer: newCorrect });` where `newCorrect` is array.
      // Let's look at `GameView` original code: `String(currentQuestion.correctAnswer).trim()` implies it might be string.
      // `Array.isArray(currentQuestion.correctAnswer)` checks are everywhere.
      // So standardized to array is safer or hybrid.
      // In `select`, it should probably be a string in the final data, OR the system handles both.
      // The original code `handleCorrectChange`: `newCorrect = [option];`.
      // So locally it is array.
    } else {
      const currentCorrect = Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [qData.correctAnswer as string];
      if (currentCorrect.includes(option)) {
        newCorrect = currentCorrect.filter(c => c !== option);
      } else {
        newCorrect = [...currentCorrect, option];
      }
    }
    setQData({ ...qData, correctAnswer: newCorrect });
  };

  // 正解変更（記述式）
  const handleAnswerChange = (idx: number, value: string) => {
    const newAnswers = [...(Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [qData.correctAnswer])];
    newAnswers[idx] = value;
    setQData({ ...qData, correctAnswer: newAnswers });
  };

  // 正解追加（記述式）
  const handleAddAnswer = () => {
    const currentCorrect = Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [qData.correctAnswer];
    setQData({ ...qData, correctAnswer: [...currentCorrect, ''] });
  };

  // 正解削除（記述式）
  const handleRemoveAnswer = (idx: number) => {
    const currentCorrect = Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [qData.correctAnswer];
    if (currentCorrect.length <= 1) return;
    const newAnswers = currentCorrect.filter((_, i) => i !== idx);
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
              answers={Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [qData.correctAnswer]}
              onChange={handleAnswerChange}
              onAdd={handleAddAnswer}
              onRemove={handleRemoveAnswer}
            />
          ) : (
            <OptionsEditor
              type={qData.type}
              options={qData.options || []}
              correctAnswer={Array.isArray(qData.correctAnswer) ? qData.correctAnswer : [qData.correctAnswer as string]}
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
            value={qData.explanation || ''}
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
