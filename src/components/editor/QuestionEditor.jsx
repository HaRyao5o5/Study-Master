import React, { useState, useRef } from 'react';
import { List, CheckSquare, Type, ImageIcon, X, PlusCircle, MinusCircle, CircleHelp } from 'lucide-react';
import { convertImageToBase64 } from '../../utils/helpers';

const QuestionEditor = ({ question, onSave, onCancel }) => {
  const [q, setQ] = useState(question);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { 
        alert("画像サイズが大きすぎます。読み込みが遅くなる可能性があります。");
      }
      try {
        const base64 = await convertImageToBase64(file);
        setQ({ ...q, image: base64 });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOptionChange = (idx, val) => {
    const newOptions = [...q.options];
    newOptions[idx] = val;
    setQ({ ...q, options: newOptions });
  };

  const addOption = () => {
    setQ({ ...q, options: [...q.options, ''] });
  };

  const removeOption = (idx) => {
    if (q.options.length <= 2) {
      alert('選択肢は最低2つ必要です');
      return;
    }
    const optionToRemove = q.options[idx];
    const newOptions = q.options.filter((_, i) => i !== idx);
    const newCorrect = q.correctAnswer.filter(ans => ans !== optionToRemove);
    setQ({ ...q, options: newOptions, correctAnswer: newCorrect });
  };

  const toggleCorrectAnswer = (optionValue) => {
    let newCorrect;
    if (q.type === 'multiple') {
      newCorrect = [optionValue];
    } else {
      if (q.correctAnswer.includes(optionValue)) {
        newCorrect = q.correctAnswer.filter(c => c !== optionValue);
      } else {
        newCorrect = [...q.correctAnswer, optionValue];
      }
    }
    setQ({ ...q, correctAnswer: newCorrect });
  };

  const addInputAnswer = () => {
    setQ({ ...q, correctAnswer: [...q.correctAnswer, ''] });
  };
  
  const updateInputAnswer = (idx, val) => {
    const newCorrect = [...q.correctAnswer];
    newCorrect[idx] = val;
    setQ({ ...q, correctAnswer: newCorrect });
  };

  const removeInputAnswer = (idx) => {
    if (q.correctAnswer.length <= 1) return;
    const newCorrect = q.correctAnswer.filter((_, i) => i !== idx);
    setQ({ ...q, correctAnswer: newCorrect });
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
        <button onClick={onCancel} className="text-gray-500">キャンセル</button>
        <h2 className="font-bold text-gray-800 dark:text-white">問題の編集</h2>
        <button 
          onClick={() => onSave(q)} 
          className="text-blue-600 font-bold disabled:opacity-50"
          disabled={!q.text || q.correctAnswer.length === 0 || (q.correctAnswer.length === 1 && q.correctAnswer[0] === '')}
        >
          完了
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">出題形式</label>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button 
              className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center transition-all ${q.type === 'multiple' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setQ({ ...q, type: 'multiple', correctAnswer: [] })}
            >
              <List size={16} className="mr-2" /> 単一選択
            </button>
            <button 
              className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center transition-all ${q.type === 'multi-select' ? 'bg-white dark:bg-gray-600 shadow text-orange-600 dark:text-orange-300' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setQ({ ...q, type: 'multi-select', correctAnswer: [] })}
            >
              <CheckSquare size={16} className="mr-2" /> 複数選択
            </button>
            <button 
              className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center transition-all ${q.type === 'input' ? 'bg-white dark:bg-gray-600 shadow text-purple-600 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setQ({ ...q, type: 'input', correctAnswer: [''] })}
            >
              <Type size={16} className="mr-2" /> 記述
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">問題文</label>
          <textarea 
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white h-32"
            value={q.text}
            onChange={(e) => setQ({ ...q, text: e.target.value })}
            placeholder="ここに問題を入力..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">添付画像 (任意)</label>
          <div className="flex items-start space-x-4">
            {q.image ? (
              <div className="relative">
                <img src={q.image} alt="Preview" className="h-32 w-auto rounded border dark:border-gray-600 object-cover" />
                <button 
                  onClick={() => setQ({ ...q, image: null })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-32 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <ImageIcon size={32} className="mb-2" />
                <span className="text-xs">画像をアップロード</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
            <CircleHelp size={16} className="mr-1 text-green-500" /> 解説 (任意)
          </label>
          <textarea 
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white h-24 text-sm"
            value={q.explanation || ''}
            onChange={(e) => setQ({ ...q, explanation: e.target.value })}
            placeholder="正解後の画面に表示される解説を入力してください..."
          />
        </div>

        {q.type !== 'input' ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                選択肢 ({q.type === 'multiple' ? '正解を1つ選択' : '正解を全て選択'})
              </label>
              <button 
                onClick={addOption}
                className="text-xs flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
              >
                <PlusCircle size={14} className="mr-1" /> 選択肢を追加
              </button>
            </div>
            
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    type={q.type === 'multiple' ? 'radio' : 'checkbox'}
                    name="correct-opt"
                    checked={q.correctAnswer.includes(opt) && opt !== ''}
                    onChange={() => toggleCorrectAnswer(opt)}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={`選択肢 ${idx + 1}`}
                  />
                  <button 
                    onClick={() => removeOption(idx)}
                    className="text-gray-400 hover:text-red-500"
                    title="削除"
                  >
                    <MinusCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                正解のキーワード (別解も登録可)
              </label>
              <button 
                onClick={addInputAnswer}
                className="text-xs flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
              >
                <PlusCircle size={14} className="mr-1" /> 別解を追加
              </button>
            </div>
            
            <div className="space-y-3">
              {q.correctAnswer.map((ans, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm font-bold w-6 text-center">{idx + 1}.</span>
                  <input 
                    type="text" 
                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={ans}
                    onChange={(e) => updateInputAnswer(idx, e.target.value)}
                    placeholder="正解を入力（完全一致で判定されます）"
                  />
                  {q.correctAnswer.length > 1 && (
                    <button 
                      onClick={() => removeInputAnswer(idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <MinusCircle size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">※ユーザーが入力した値と完全に一致した場合に正解となります。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionEditor;