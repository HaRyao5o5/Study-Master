// src/components/game/GameView.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronRight, HelpCircle } from 'lucide-react';
import LoadingScreen from '../common/LoadingScreen'; // ★ 追加

const GameView = ({ quiz, isRandom, shuffleOptions, immediateFeedback, onFinish }) => {
  const [isReady, setIsReady] = useState(false); // ★ 追加

  // 問題の準備（シャッフルなど）が終わったことを検知する
  useEffect(() => {
    // ほんの少し待ってから開始（アニメーションの準備時間）
    const timer = setTimeout(() => setIsReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const answersRef = useRef([]); 
  // const [startTime] = useState(Date.now()); // ★ 修正: 開始時間は isReady になってから計測すべき
  const [startTime, setStartTime] = useState(null);

  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // isReady になったらタイマー開始
  useEffect(() => {
    if (isReady) setStartTime(Date.now());
  }, [isReady]);

  const questions = useMemo(() => {
    let q = [...quiz.questions];
    if (isRandom) q.sort(() => Math.random() - 0.5);
    return q;
  }, [quiz, isRandom]);

  const currentQuestion = questions[currentQuestionIndex];

  const currentOptions = useMemo(() => {
    // ★ ガード節: currentQuestionがない場合は空配列を返す（エラー防止）
    if (!currentQuestion) return [];
    let options = [...currentQuestion.options];
    if (shuffleOptions) options.sort(() => Math.random() - 0.5);
    return options;
  }, [currentQuestion, shuffleOptions]);

  // ★ 追加: 準備中 or 問題データ異常時はロード画面
  if (!isReady || !currentQuestion || !startTime) {
    return <LoadingScreen />;
  }

  // ... (handleAnswer, nextQuestion は修正なし) ...
  const handleAnswer = (option) => {
    if (selectedOption) return;

    const cleanOption = String(option).trim();
    const cleanCorrect = String(currentQuestion.correctAnswer).trim();
    const correct = cleanOption === cleanCorrect;

    setSelectedOption(option);
    setIsCorrect(correct);

    const answerRecord = {
      question: currentQuestion,
      selectedAnswer: option,
      isCorrect: correct,
      timeTaken: 0 
    };

    answersRef.current = [...answersRef.current, answerRecord];

    if (immediateFeedback) {
      setShowFeedback(true);
    } else {
      setTimeout(() => nextQuestion(), 300);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const totalTime = (Date.now() - startTime) / 1000;
      onFinish(answersRef.current, totalTime);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      {/* ... (JSXの中身は変更なし) ... */}
      {/* 進捗バー */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">
          <span>Progress</span>
          <span>{currentQuestionIndex + 1} / {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 問題カード */}
      <div className="glass p-8 rounded-2xl shadow-xl mb-6 relative overflow-hidden min-h-[200px] flex flex-col justify-center border-white/40 dark:border-gray-600/50">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <HelpCircle size={120} />
        </div>
        
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-bold mb-4 border border-blue-200 dark:border-blue-800">
            Question {currentQuestionIndex + 1}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>
      </div>

      {/* 選択肢エリア */}
      <div className="grid grid-cols-1 gap-4">
        {currentOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            disabled={selectedOption !== null}
            className={`
              group relative p-5 rounded-xl text-left transition-all duration-200
              border-2 shadow-sm active:scale-[0.98]
              ${selectedOption === option 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.02]' 
                : 'glass hover:bg-white/80 dark:hover:bg-gray-700/80 border-white/20 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-500'
              }
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold border
                ${selectedOption === option
                  ? 'bg-white text-blue-600 border-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500 group-hover:border-blue-200'
                }
              `}>
                {['A', 'B', 'C', 'D'][index] || index + 1}
              </div>
              <span className="text-lg font-medium">{option}</span>
              <ChevronRight className={`ml-auto transform transition-transform ${selectedOption === option ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
            </div>
          </button>
        ))}
      </div>

      {/* フィードバック画面 */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-black/20 backdrop-blur-sm">
          <div 
            className={`
              relative w-full max-w-md p-8 rounded-3xl shadow-2xl transform transition-all animate-pop-in
              ${isCorrect 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'
              }
            `}
            onClick={() => nextQuestion()} 
          >
            <div className="flex flex-col items-center text-center">
              {isCorrect ? (
                <CheckCircle size={80} className="mb-4 text-green-100 animate-pulse-slow" />
              ) : (
                <XCircle size={80} className="mb-4 text-red-100 animate-shake" />
              )}
              
              <h3 className="text-3xl font-black mb-2 tracking-tight">
                {isCorrect ? 'Excellent!' : 'Missed...'}
              </h3>
              
              {!isCorrect && (
                <div className="bg-white/20 rounded-xl p-4 mt-4 w-full text-left backdrop-blur-sm">
                  <p className="text-xs font-bold text-red-100 uppercase mb-1">Correct Answer</p>
                  <p className="text-lg font-bold">{currentQuestion.correctAnswer}</p>
                </div>
              )}

              <button className="mt-8 px-8 py-3 bg-white text-gray-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center">
                Next <ChevronRight size={18} className="ml-1" />
              </button>
              
              <p className="mt-4 text-xs text-white/60">画面をクリックして次へ</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameView;