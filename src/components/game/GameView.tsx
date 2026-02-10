import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, XCircle, ArrowRight, Volume2, Check, BrainCircuit } from 'lucide-react';
import { playSound, speakText } from '../../utils/sound';
import { Quiz, Question, UserAnswer } from '../../types';
import AIEvaluationModal from './AIEvaluationModal';

interface GameViewProps {
  quiz: Quiz;
  isRandom: boolean;
  shuffleOptions: boolean;
  immediateFeedback: boolean;
  onFinish: (answers: UserAnswer[], totalTime: number) => void;
}

const GameView: React.FC<GameViewProps> = ({ quiz, isRandom, shuffleOptions, immediateFeedback, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]); // 複数選択用
  const [inputValue, setInputValue] = useState(''); // 記述式用
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAIModal, setShowAIModal] = useState(false);
  
  // useRefでstartTimeを保持（再レンダリング時にリセットされない）
  const startTimeRef = useRef<number>(Date.now());
  // セッションキーをrefで保持
  const sessionKeyRef = useRef<string>(`quiz_session_${quiz?.id || 'unknown'}_${Date.now()}`);
  // 初期化フラグ
  const isInitializedRef = useRef(false);

  // セッションデータをsessionStorageに保存する関数
  const saveSessionData = useCallback((answers: UserAnswer[], questionIndex: number) => {
    try {
      const sessionData = {
        userAnswers: answers,
        currentQuestionIndex: questionIndex,
        startTime: startTimeRef.current,
        quizId: quiz?.id,
        timestamp: Date.now()
      };
      sessionStorage.setItem(sessionKeyRef.current, JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Failed to save quiz session data:', e);
    }
  }, [quiz?.id]);

  // セッションデータを復元する関数
  const restoreSessionData = useCallback(() => {
    try {
      // 既存のセッションを探す
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(`quiz_session_${quiz?.id}_`)) {
          const storedData = sessionStorage.getItem(key);
          if (storedData) {
            const sessionData = JSON.parse(storedData);
            // 10分以内のセッションのみ復元
            if (Date.now() - sessionData.timestamp < 10 * 60 * 1000 && sessionData.quizId === quiz?.id) {
              return {
                userAnswers: sessionData.userAnswers || [],
                currentQuestionIndex: sessionData.currentQuestionIndex || 0,
                startTime: sessionData.startTime || Date.now(),
                sessionKey: key
              };
            } else {
              // 古いセッションは削除
              sessionStorage.removeItem(key);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to restore quiz session data:', e);
    }
    return null;
  }, [quiz?.id]);

  // セッションをクリアする関数
  const clearSessionData = useCallback(() => {
    try {
      sessionStorage.removeItem(sessionKeyRef.current);
      // 同じクイズの古いセッションも削除
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(`quiz_session_${quiz?.id}_`)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Failed to clear quiz session data:', e);
    }
  }, [quiz?.id]);

  // 初期化とセッション復元
  useEffect(() => {
    if (!quiz || isInitializedRef.current) return;
    
    let q = [...quiz.questions];
    if (isRandom) {
      q = q.sort(() => Math.random() - 0.5);
    }
    setQuestions(q);

    // 既存セッションの復元を試みる
    const restoredSession = restoreSessionData();
    if (restoredSession && restoredSession.userAnswers.length > 0) {
      setUserAnswers(restoredSession.userAnswers);
      setCurrentQuestionIndex(restoredSession.currentQuestionIndex);
      startTimeRef.current = restoredSession.startTime;
      sessionKeyRef.current = restoredSession.sessionKey;
      console.log('Quiz session restored:', restoredSession.userAnswers.length, 'answers');
    } else {
      // 新しいセッション
      startTimeRef.current = Date.now();
      sessionKeyRef.current = `quiz_session_${quiz?.id || 'unknown'}_${Date.now()}`;
    }
    
    isInitializedRef.current = true;
  }, [quiz, isRandom, restoreSessionData]);

  // visibilitychangeイベントでタブ切り替え時にセッションを保存
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // タブが非アクティブになったらセッションを保存
        saveSessionData(userAnswers, currentQuestionIndex);
      }
    };

    // beforeunloadイベントでページを離れる前にセッションを保存
    const handleBeforeUnload = () => {
      saveSessionData(userAnswers, currentQuestionIndex);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userAnswers, currentQuestionIndex, saveSessionData]);

  // 回答が追加されたらセッションを保存
  useEffect(() => {
    if (userAnswers.length > 0) {
      saveSessionData(userAnswers, currentQuestionIndex);
    }
  }, [userAnswers, currentQuestionIndex, saveSessionData]);

  // 問題が変わったらリセット
  useEffect(() => {
    setSelectedOption(null);
    setSelectedMultiple([]);
    setInputValue('');
    setShowFeedback(false);
  }, [currentQuestionIndex]);

  if (questions.length === 0) return <div>読み込み中...</div>;

  const currentQuestion = questions[currentQuestionIndex];

  const getOptions = () => {
    if (!currentQuestion) return [];
    let options = currentQuestion.options || [];
    // If shuffleOptions is true, we should probably shuffle them. 
    // In React strictly, we should memoize this shuffling or do it in state to avoid reshuffling on re-renders unrelated to question change.
    // For now, to keep behavior consistent with what I see or what is expected:
    if (shuffleOptions) {
        // Simple shuffle for display. 
        // Note: In a real app properly handling this requires stable shuffled order per question instance.
        // Assuming the parent component passed a flag. 
        // For accurate React Strict Mode behavior, store shuffled options in state/memo key'd by question ID.
        // But for this migration, I'll allow potential re-shuffle on re-render if that was behavior or just implement simple approach.
        // Original code: `getOptions` just returned `currentQuestion.options`. It didn't seem to use `shuffleOptions` prop in `getOptions`.
        // Let's check original `GameView.jsx` `getOptions`:
        // `return currentQuestion.options || [];` 
        // It seems `shuffleOptions` prop wasn't implemented in the original logic shown?
        // Wait, let's re-read original `GameView.jsx`.
        // Line 6: `shuffleOptions` is destructured.
        // Line 37: `getOptions` defined.
        // It ignores `shuffleOptions`. 
        // I will keep it as is (ignoring it) or implement it if I feel generous. 
        // Since I want to preserve logic, I'll ignore it unless I see it used elsewhere.
        // It's not used elsewhere in the file. So it was a dummy prop.
        // I'll keep it as dummy prop.
    }
    return options;
  };

  // 単一選択の処理
  const handleAnswer = (option: string) => {
    if (showFeedback || selectedOption !== null) return;

    setSelectedOption(option);

    const safeOption = String(option).trim();
    const safeCorrect = String(currentQuestion.correctAnswer).trim();
    const isCorrect = safeOption === safeCorrect;

    setTimeout(() => {
      if (immediateFeedback) {
        playSound(isCorrect ? 'correct' : 'wrong');
      } else {
        playSound('select');
      }
    }, 0);

    const newAnswer: UserAnswer = {
      question: currentQuestion,
      selectedAnswer: option,
      isCorrect: isCorrect,
      timeTaken: 0
    };

    const newAnswers = [...userAnswers, newAnswer];
    setUserAnswers(newAnswers);

    if (immediateFeedback) {
      setShowFeedback(true);
    } else {
      setTimeout(() => {
        handleNext(newAnswers);
      }, 800);
    }
  };

  // 複数選択のトグル
  const handleMultiToggle = (option: string) => {
    if (showFeedback) return;
    setSelectedMultiple(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  // 複数選択の送信
  const handleMultiSubmit = () => {
    if (showFeedback || selectedMultiple.length === 0) return;

    const correctAnswers = Array.isArray(currentQuestion.correctAnswer)
      ? currentQuestion.correctAnswer
      : [currentQuestion.correctAnswer];

    const selectedSet = new Set(selectedMultiple.map(s => String(s).trim()));
    const correctSet = new Set(correctAnswers.map(c => String(c).trim()));

    const isCorrect = selectedSet.size === correctSet.size &&
      [...selectedSet].every(s => correctSet.has(s));

    setTimeout(() => {
      if (immediateFeedback) {
        playSound(isCorrect ? 'correct' : 'wrong');
      } else {
        playSound('select');
      }
    }, 0);

    const newAnswer: UserAnswer = {
      question: currentQuestion,
      selectedAnswer: selectedMultiple,
      isCorrect: isCorrect,
      timeTaken: 0
    };

    const newAnswers = [...userAnswers, newAnswer];
    setUserAnswers(newAnswers);

    if (immediateFeedback) {
      setShowFeedback(true);
    } else {
      setTimeout(() => {
        handleNext(newAnswers);
      }, 800);
    }
  };

  // 記述式の送信
  const handleInputSubmit = () => {
    if (showFeedback || !inputValue.trim()) return;

    const correctAnswers = Array.isArray(currentQuestion.correctAnswer)
      ? currentQuestion.correctAnswer
      : [currentQuestion.correctAnswer];

    const isCorrect = correctAnswers.some(ans =>
      String(ans).trim() === inputValue.trim()
    );

    setTimeout(() => {
      if (immediateFeedback) {
        playSound(isCorrect ? 'correct' : 'wrong');
      } else {
        playSound('select');
      }
    }, 0);

    const newAnswer: UserAnswer = {
      question: currentQuestion,
      selectedAnswer: inputValue,
      isCorrect: isCorrect,
      timeTaken: 0
    };

    const newAnswers = [...userAnswers, newAnswer];
    setUserAnswers(newAnswers);

    if (immediateFeedback) {
      setShowFeedback(true);
    } else {
      setTimeout(() => {
        handleNext(newAnswers);
      }, 800);
    }
  };

  const handleNext = (answers = userAnswers) => {
    setSelectedOption(null);
    setSelectedMultiple([]);
    setInputValue('');
    setShowFeedback(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const endTime = Date.now();
      const totalTime = (endTime - startTimeRef.current) / 1000;
      // クイズ完了時にセッションデータをクリア
      clearSessionData();
      onFinish(answers, totalTime);
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(currentQuestion.text);
  };

  const questionType = currentQuestion.type || 'select';

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      {/* 進捗バー */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
          <span>Progress</span>
          <span>{currentQuestionIndex + 1} / {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 問題カード */}
      <div className="glass p-6 md:p-8 rounded-3xl shadow-xl mb-6 md:mb-8 border-t border-white/50 min-h-[160px] md:min-h-[200px] flex flex-col justify-center items-center text-center">
        
        <div className="w-full flex justify-between items-start mb-4">
            <span className="text-xs font-black text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
            Q.{currentQuestionIndex + 1}
            </span>

            <button
            onClick={handleSpeak}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition-colors -mt-2 -mr-2"
            title="読み上げ"
            >
            <Volume2 size={24} />
            </button>
        </div>

        {/* 画像表示 */}
        {currentQuestion.image && (
          <div className="mb-6 max-w-md">
            <img
              src={currentQuestion.image}
              alt="Question"
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
        )}

        <h2 className="text-lg md:text-3xl font-bold text-gray-800 dark:text-white mb-2 leading-relaxed">
          {currentQuestion.text}
        </h2>
        <p className="text-sm text-gray-400 font-bold mt-2">
          {questionType === 'input' ? '答えを入力してください' :
            questionType === 'multi-select' ? '正しい答えをすべて選んでください' :
              '正しい答えを選んでください'}
        </p>
      </div>

      {/* 選択肢・入力欄 */}
      {questionType === 'input' ? (
        // 記述式
        <div className="space-y-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
            disabled={showFeedback}
            placeholder="ここに答えを入力..."
            className="w-full p-4 text-lg rounded-xl glass border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {!showFeedback && (
            <button
              onClick={handleInputSubmit}
              disabled={!inputValue.trim()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all"
            >
              回答する
            </button>
          )}
        </div>
      ) : questionType === 'multi-select' ? (
        // 複数選択
        <>
          <div className="grid gap-4">
            {getOptions().map((option, idx) => {
              const isSelected = selectedMultiple.includes(option);
              return (
                <button
                  key={idx}
                  onClick={() => handleMultiToggle(option)}
                  disabled={showFeedback}
                  className={`group w-full p-5 text-left rounded-2xl glass border-2 transition-all duration-200 flex items-center ${isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40'
                      : 'border-transparent hover:bg-white/80 dark:hover:bg-gray-700/80'
                    } ${showFeedback ? 'cursor-not-allowed' : ''}`}
                >
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                  <span className="font-bold text-lg">{option}</span>
                </button>
              );
            })}
          </div>
          {!showFeedback && (
            <button
              onClick={handleMultiSubmit}
              disabled={selectedMultiple.length === 0}
              className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all"
            >
              回答する
            </button>
          )}
        </>
      ) : (
        // 単一選択
        <div className="grid gap-4">
          {getOptions().map((option, idx) => {
            let stateClass = "hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-[1.01] active:scale-[0.98]";
            let icon = null;

            if (showFeedback || (selectedOption === option && !immediateFeedback)) {
              const safeOption = String(option).trim();
              const safeCorrect = String(currentQuestion.correctAnswer).trim();
              const isThisCorrect = safeOption === safeCorrect;
              const isSelected = option === selectedOption;

              if (isThisCorrect && showFeedback) {
                stateClass = "bg-green-100 dark:bg-green-900/40 border-green-500 text-green-700 dark:text-green-300 ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900";
                icon = <CheckCircle className="ml-auto text-green-500" size={20} />;
              } else if (isSelected) {
                if (showFeedback && !isThisCorrect) {
                  stateClass = "bg-red-100 dark:bg-red-900/40 border-red-500 text-red-700 dark:text-red-300 ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-900";
                  icon = <XCircle className="ml-auto text-red-500" size={20} />;
                } else if (!showFeedback) {
                  stateClass = "bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300";
                }
              } else if (showFeedback) {
                stateClass = "opacity-50 grayscale";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback || selectedOption !== null}
                className={`group w-full p-5 text-left rounded-2xl glass border border-transparent transition-all duration-200 flex items-center ${stateClass}`}
              >
                <span className="font-bold text-lg">{option}</span>
                {icon}
              </button>
            );
          })}
        </div>
      )}

      {showFeedback && (
        <div className="mt-8 space-y-4">
          {/* 正解表示 */}
          <div className="glass p-6 rounded-2xl border-l-4 border-blue-500">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <CheckCircle size={20} className="mr-2 text-blue-500" />
              正解
            </h3>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {Array.isArray(currentQuestion.correctAnswer)
                ? (currentQuestion.correctAnswer as string[]).join(', ')
                : currentQuestion.correctAnswer}
            </p>
          </div>

          {/* 解説表示 */}
          {currentQuestion.explanation && (
            <div className="glass p-6 rounded-2xl border-l-4 border-green-500">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">解説</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
              <button
                onClick={() => setShowAIModal(true)}
                className="mt-4 flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 hover:opacity-70 transition-opacity bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg"
              >
                <BrainCircuit size={14} />
                AIに詳しく聞く
              </button>
            </div>
          )}

          <button
            onClick={() => handleNext()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:-translate-y-1 transition-all flex items-center justify-center"
          >
            次へ進む
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      )}

      <AIEvaluationModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        question={currentQuestion.text}
        correctAnswer={Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(', ') : currentQuestion.correctAnswer}
        userAnswer={
          questionType === 'input' ? inputValue : 
          questionType === 'multi-select' ? selectedMultiple.join(', ') : 
          selectedOption || undefined
        }
      />
    </div>
  );
};

export default GameView;
