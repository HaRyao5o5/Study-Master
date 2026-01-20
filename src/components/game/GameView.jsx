// src/components/game/GameView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, ArrowRight, BookOpen } from 'lucide-react';
import { SimpleTable } from '../common/SimpleTable';

const GameView = ({ quiz, isRandom, shuffleOptions, immediateFeedback, onFinish }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState([]); 
  const [startTime, setStartTime] = useState(null);
  const [qStartTime, setQStartTime] = useState(null);
  const [inputText, setInputText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

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
    setShowFeedback(false);
    setCurrentResult(null);
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

    if (immediateFeedback) {
      setCurrentResult(answerRecord);
      setShowFeedback(true);
    } else {
      if (currentQIndex < questionOrder.length - 1) {
        setCurrentQIndex(prev => prev + 1);
      } else {
        const totalTime = now - startTime;
        onFinish(newAnswers, totalTime);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questionOrder.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      const totalTime = Date.now() - startTime;
      onFinish(answers, totalTime);
    }
  };

  const toggleMultiSelect = (option) => {
    if (showFeedback) return;
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const currentQuestion = questionOrder[currentQIndex];
  const progress = ((currentQIndex) / questionOrder.length) * 100;

  const renderCorrectAnswer = (q) => {
    if (q.type === 'multiple') return q.correctAnswer[0];
    if (q.type === 'multi-select') return q.correctAnswer.join(', ');
    if (q.type === 'input') return q.correctAnswer.join(' または ');
    return '';
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
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

        <div className={showFeedback ? "opacity-80 pointer-events-none" : ""}>
          {currentQuestion.type === 'multiple' && (
            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => {
                let optionClass = "border-gray-100 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30";
                if (showFeedback && currentResult) {
                  if (option === currentResult.selectedAnswer) {
                     optionClass = currentResult.isCorrect 
                       ? "border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500" 
                       : "border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500";
                  } else if (currentQuestion.correctAnswer.includes(option) && !currentResult.isCorrect) {
                     optionClass = "border-green-500 bg-green-50 dark:bg-green-900/20 opacity-50";
                  }
                }

                return (
                  <button key={idx} onClick={() => handleAnswer(option)} className={`w-full text-left p-4 rounded-xl border-2 transition-all group flex items-center bg-white dark:bg-gray-800 ${optionClass}`}>
                    <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold mr-4 group-hover:bg-blue-500 group-hover:text-white transition-colors flex-shrink-0">{idx + 1}</span>
                    <span className="text-gray-700 dark:text-gray-200 font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'multi-select' && (
            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOptions.includes(option);
                let optionClass = isSelected ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700';
                
                if (showFeedback && currentResult) {
                   if (currentQuestion.correctAnswer.includes(option)) {
                      optionClass += " border-green-500 ring-1 ring-green-500";
                   } else if (isSelected) {
                      optionClass += " border-red-500 ring-1 ring-red-500";
                   }
                }

                return (
                  <button key={idx} onClick={() => toggleMultiSelect(option)} className={`w-full text-left p-4 rounded-xl border-2 transition-all group flex items-center ${optionClass}`}>
                    <div className={`w-6 h-6 rounded border-2 mr-4 flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 bg-white'}`}>{isSelected && <CheckCircle size={16} />}</div>
                    <span className="text-gray-700 dark:text-gray-200 font-medium">{option}</span>
                  </button>
                );
              })}
              <button onClick={() => handleAnswer(selectedOptions)} className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow transition-colors disabled:opacity-50" disabled={selectedOptions.length === 0 || showFeedback}>回答を確定する</button>
            </div>
          )}

          {currentQuestion.type === 'input' && (
            <div className="space-y-4">
              <input 
                type="text" 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                disabled={showFeedback} 
                className="w-full p-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 outline-none dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800" 
                placeholder="回答を入力..." 
                onKeyDown={(e) => { 
                  // ★ バグ修正: 変換中(isComposing)は無視 & 確定時はpreventDefault
                  if (e.key === 'Enter') {
                    if (e.nativeEvent.isComposing) return;
                    e.preventDefault();
                    if (inputText.trim() && !showFeedback) { 
                      handleAnswer(inputText); 
                    }
                  }
                }} 
              />
              <button onClick={() => handleAnswer(inputText)} disabled={!inputText.trim() || showFeedback} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow transition-colors">回答する</button>
            </div>
          )}
        </div>

        {showFeedback && currentResult && (
          <div className="mt-8 animate-fade-in">
            <div className={`p-4 rounded-lg border-l-4 mb-4 ${currentResult.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-red-50 dark:bg-red-900/20 border-red-500'}`}>
              <div className="flex items-center mb-2">
                {currentResult.isCorrect ? (
                  <>
                    <CheckCircle size={24} className="text-green-500 mr-2" />
                    <span className="font-bold text-lg text-green-700 dark:text-green-300">正解！</span>
                  </>
                ) : (
                  <>
                    <XCircle size={24} className="text-red-500 mr-2" />
                    <span className="font-bold text-lg text-red-700 dark:text-red-300">残念... 不正解</span>
                  </>
                )}
              </div>
              
              {!currentResult.isCorrect && (
                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-bold block mb-1">正解は...</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{renderCorrectAnswer(currentQuestion)}</span>
                </div>
              )}
            </div>

            {currentQuestion.explanation && (
              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/30 mb-6">
                <div className="flex items-center mb-2">
                  <BookOpen size={18} className="text-yellow-600 dark:text-yellow-500 mr-2" />
                  <span className="font-bold text-yellow-700 dark:text-yellow-500">解説</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}

            <button 
              onClick={handleNextQuestion} 
              autoFocus
              className="w-full bg-gray-800 hover:bg-gray-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center justify-center text-lg"
            >
              {currentQIndex < questionOrder.length - 1 ? (
                <>次の問題へ <ArrowRight size={20} className="ml-2" /></>
              ) : (
                <>結果を見る <ArrowRight size={20} className="ml-2" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameView;