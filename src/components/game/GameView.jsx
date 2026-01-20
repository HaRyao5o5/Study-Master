import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { SimpleTable } from '../common/SimpleTable';

const GameView = ({ quiz, isRandom, shuffleOptions, onFinish }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState([]); 
  const [startTime, setStartTime] = useState(null);
  const [qStartTime, setQStartTime] = useState(null);
  const [inputText, setInputText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);

  const questionOrder = useMemo(() => {
    let order = [...quiz.questions];
    if (isRandom) order = order.sort(() => Math.random() - 0.5);

    if (shuffleOptions) {
      order = order.map(q => {
        if (q.type === 'input') return q; 
        const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
        return {
          ...q,
          options: shuffledOptions,
        };
      });
    }
    return order;
  }, [quiz, isRandom, shuffleOptions]);

  useEffect(() => {
    setStartTime(Date.now());
    setQStartTime(Date.now());
  }, []);

  useEffect(() => {
    setQStartTime(Date.now());
    setInputText('');
    setSelectedOptions([]);
  }, [currentQIndex]);

  const handleAnswer = (answerVal) => {
    const now = Date.now();
    const currentQ = questionOrder[currentQIndex];
    let isCorrect = false;
    let finalSelectedAnswer = answerVal;

    if (currentQ.type === 'multiple') {
      isCorrect = currentQ.correctAnswer.includes(answerVal);
    } else if (currentQ.type === 'multi-select') {
      const correctSet = new Set(currentQ.correctAnswer);
      const selectedSet = new Set(answerVal);
      if (correctSet.size === selectedSet.size) {
        isCorrect = [...correctSet].every(val => selectedSet.has(val));
      }
      finalSelectedAnswer = answerVal;
    } else {
      isCorrect = currentQ.correctAnswer.some(ans => ans.trim() === answerVal.trim());
    }
    
    const answerRecord = {
      question: currentQ,
      selectedAnswer: finalSelectedAnswer,
      isCorrect: isCorrect,
      timeTaken: now - qStartTime,
      id: currentQ.id 
    };

    const newAnswers = [...answers, answerRecord];
    setAnswers(newAnswers);

    if (currentQIndex < questionOrder.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      const totalTime = now - startTime;
      onFinish(newAnswers, totalTime);
    }
  };

  const toggleMultiSelect = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const currentQuestion = questionOrder[currentQIndex];
  const progress = ((currentQIndex) / questionOrder.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>Question {currentQIndex + 1} / {questionOrder.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="mb-4">
          <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${currentQuestion.type === 'input' ? 'bg-purple-100 text-purple-600' : currentQuestion.type === 'multi-select' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
            {currentQuestion.type === 'input' ? '記述式' : currentQuestion.type === 'multi-select' ? '複数選択 (全て選べ)' : '単一選択'}
          </span>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-line">{currentQuestion.text}</h2>
        </div>

        {currentQuestion.image && <div className="mb-6 flex justify-center"><img src={currentQuestion.image} alt="Question" className="max-h-64 rounded-lg border dark:border-gray-600 object-contain" /></div>}
        {currentQuestion.tableData && <div className="mb-8"><SimpleTable data={currentQuestion.tableData} /></div>}
        <div className="mb-4"></div>

        {currentQuestion.type === 'multiple' && (
          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => (
              <button key={idx} onClick={() => handleAnswer(option)} className="w-full text-left p-4 rounded-xl border-2 border-gray-100 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all group flex items-center bg-white dark:bg-gray-800">
                <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold mr-4 group-hover:bg-blue-500 group-hover:text-white transition-colors flex-shrink-0">{idx + 1}</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{option}</span>
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'multi-select' && (
          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <button key={idx} onClick={() => toggleMultiSelect(option)} className={`w-full text-left p-4 rounded-xl border-2 transition-all group flex items-center ${isSelected ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <div className={`w-6 h-6 rounded border-2 mr-4 flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 bg-white'}`}>{isSelected && <CheckCircle size={16} />}</div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{option}</span>
                </button>
              );
            })}
            <button onClick={() => handleAnswer(selectedOptions)} className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow transition-colors disabled:opacity-50" disabled={selectedOptions.length === 0}>回答を確定する</button>
          </div>
        )}

        {currentQuestion.type === 'input' && (
          <div className="space-y-4">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full p-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 outline-none dark:bg-gray-700 dark:text-white" placeholder="回答を入力..." onKeyDown={(e) => { if (e.key === 'Enter' && inputText.trim()) { handleAnswer(inputText); } }} />
            <button onClick={() => handleAnswer(inputText)} disabled={!inputText.trim()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow transition-colors">回答する</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameView;