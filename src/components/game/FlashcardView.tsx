import React, { useState, useEffect } from 'react';
import { Check, X, HelpCircle, BrainCircuit } from 'lucide-react';
import AIEvaluationModal from './AIEvaluationModal';

interface Question {
  id: string;
  text: string;
  image?: string;
  correctAnswer: string | string[];
  explanation?: string;
}

interface FlashcardViewProps {
  questions: Question[];
  onFinish: (results: { questionId: string; isKnown: boolean }[]) => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ questions, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{ questionId: string; isKnown: boolean }[]>([]);
  const [progress, setProgress] = useState(0);
  const [showAIModal, setShowAIModal] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    setProgress(((currentIndex) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  const handleNext = (isKnown: boolean) => {
    const newResults = [...results, { questionId: currentQuestion.id, isKnown }];
    
    if (currentIndex < questions.length - 1) {
      setResults(newResults);
      setIsFlipped(false);
      // 小さい遅延を入れてアニメーションがリセットされるのを待つ
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 150);
    } else {
      onFinish(newResults);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Card {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs font-black text-blue-600 dark:text-blue-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Container */}
      <div 
        className="relative h-[400px] w-full perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front (Question) */}
          <div className="absolute inset-0 backface-hidden glass dark:bg-gray-800 rounded-3xl border-2 border-white/50 dark:border-gray-700 shadow-xl flex flex-col p-8 items-center justify-center text-center overflow-hidden">
            <div className="absolute top-4 left-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <HelpCircle size={20} />
            </div>
            
            {currentQuestion.image && (
                <div className="mb-6 w-full max-h-40 overflow-hidden rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                    <img src={currentQuestion.image} alt="Question" className="w-full h-full object-contain" />
                </div>
            )}
            
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white leading-relaxed">
              {currentQuestion.text}
            </h3>
            
            <div className="mt-8 text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
              タップして答えを表示
            </div>
          </div>

          {/* Back (Answer) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 glass dark:bg-gray-800 rounded-3xl border-2 border-blue-500/30 dark:border-blue-500/50 shadow-xl flex flex-col p-8 items-center justify-center text-center overflow-y-auto">
            <div className="absolute top-4 left-4 p-2 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
              <Check size={20} />
            </div>
            
            <div className="w-full">
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4 block">
                    正解
                </span>
                <div className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-6">
                    {currentQuestion.correctAnswer}
                </div>
                
                {currentQuestion.explanation && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed text-left border border-gray-100 dark:border-gray-600">
                        {currentQuestion.explanation}
                    </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); setShowAIModal(true); }}
                  className="mt-4 flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 hover:opacity-70 transition-opacity bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800"
                >
                  <BrainCircuit size={14} />
                  AIに詳しく聞く
                </button>
            </div>
            
            <div className="mt-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
              タップで問題に戻る
            </div>
          </div>

        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(false); }}
          className="flex-1 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-black shadow-lg shadow-red-100 dark:shadow-none hover:bg-red-100 dark:hover:bg-red-900/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
          <X size={20} />
          <span>知らない</span>
        </button>
        
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(true); }}
          className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-green-100 dark:shadow-none hover:translate-y-[-2px] transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
          <Check size={20} />
          <span>知っている</span>
        </button>
      </div>

      {/* Help text */}
      <p className="mt-6 text-center text-xs text-gray-400 font-bold leading-relaxed">
        「知っている」を選ぶと学習レベルが上がり、<br/>次にこの問題が出るまでの間隔が延びます。
      </p>

      {showAIModal && (
        <AIEvaluationModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          question={currentQuestion.text}
          correctAnswer={Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(', ') : currentQuestion.correctAnswer}
          context="フラッシュカードでの学習中です。"
        />
      )}
    </div>
  );
};

export default FlashcardView;
