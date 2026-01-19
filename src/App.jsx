import React, { useState, useEffect, useMemo } from 'react';
import { Folder, FileText, ChevronRight, Play, Settings, Clock, CheckCircle, XCircle, RotateCcw, Home, ArrowLeft } from 'lucide-react';

/**
 * MOCK DATA GENERATOR
 * 実際のアプリではここを外部JSONやデータベースに置き換えることができます。
 * 今回は「情報処理入門２」のために、第1回〜第13回のデータを生成しています。
 */

const generateMockData = () => {
  const courseId = 'info-process-2';
  const weeks = 13;
  const quizzes = [];

  // 第1回のサンプルデータ（具体的な問題）
  quizzes.push({
    id: `quiz-1`,
    title: `第1回 小テスト`,
    description: 'コンピュータの基礎と歴史',
    questions: [
      {
        id: 'q1-1',
        text: '世界最初の汎用電子計算機と言われているものはどれか？',
        options: ['ENIAC', 'EDVAC', 'EDSAC', 'UNIVAC'],
        correctIndex: 0 // ENIAC
      },
      {
        id: 'q1-2',
        text: 'CPUは何の略称か？',
        options: ['Central Process Unit', 'Central Processing Unit', 'Computer Processing Unit', 'Core Processing Unit'],
        correctIndex: 1 // Central Processing Unit
      },
      {
        id: 'q1-3',
        text: '1バイトは何ビットか？',
        options: ['4ビット', '8ビット', '16ビット', '32ビット'],
        correctIndex: 1 // 8ビット
      },
      {
        id: 'q1-4',
        text: '情報の最小単位は何か？',
        options: ['バイト', 'ビット', 'ワード', 'セクタ'],
        correctIndex: 1 // ビット
      }
    ]
  });

  // 第2回〜第13回はダミーデータを生成（構造確認用）
  for (let i = 2; i <= weeks; i++) {
    quizzes.push({
      id: `quiz-${i}`,
      title: `第${i}回 小テスト`,
      description: `第${i}回の授業内容に関する確認テスト`,
      questions: [
        { id: `q${i}-1`, text: `第${i}回 問1: 正解はアです。`, options: ['ア', 'イ', 'ウ', 'エ'], correctIndex: 0 },
        { id: `q${i}-2`, text: `第${i}回 問2: 正解はイです。`, options: ['ア', 'イ', 'ウ', 'エ'], correctIndex: 1 },
        { id: `q${i}-3`, text: `第${i}回 問3: 正解はウです。`, options: ['ア', 'イ', 'ウ', 'エ'], correctIndex: 2 },
        { id: `q${i}-4`, text: `第${i}回 問4: 正解はエです。`, options: ['ア', 'イ', 'ウ', 'エ'], correctIndex: 3 },
      ]
    });
  }

  return [
    {
      id: courseId,
      title: '情報処理入門２',
      description: '2025年度 後期',
      quizzes: quizzes
    },
    {
      id: 'other-course',
      title: '（サンプル）他の科目',
      description: 'フォルダ一覧のデモ用',
      quizzes: []
    }
  ];
};

const DATA = generateMockData();

// --- COMPONENTS ---

// 1. Breadcrumbs Navigation
const Breadcrumbs = ({ path, onNavigate }) => (
  <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
    <button onClick={() => onNavigate('home')} className="hover:text-blue-600 flex items-center">
      <Home size={16} className="mr-1" /> Home
    </button>
    {path.map((item, index) => (
      <React.Fragment key={item.id}>
        <ChevronRight size={16} className="mx-2" />
        <button 
          onClick={() => onNavigate(item.type, item.id)}
          className={`hover:text-blue-600 ${index === path.length - 1 ? 'font-bold text-gray-800' : ''}`}
        >
          {item.title}
        </button>
      </React.Fragment>
    ))}
  </nav>
);

// 2. Folder/Course List View
const FolderListView = ({ courses, onSelectCourse }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {courses.map(course => (
      <div 
        key={course.id}
        onClick={() => onSelectCourse(course)}
        className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 cursor-pointer transition-all hover:border-blue-300 flex flex-col items-center justify-center h-48 group"
      >
        <Folder size={64} className="text-blue-200 group-hover:text-blue-400 mb-4 transition-colors" />
        <h3 className="text-lg font-bold text-gray-800 text-center">{course.title}</h3>
        <p className="text-xs text-gray-400 mt-2">{course.description}</p>
        <span className="mt-4 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
          {course.quizzes.length} フォルダ
        </span>
      </div>
    ))}
  </div>
);

// 3. Quiz List View (Inside a Course)
const QuizListView = ({ course, onSelectQuiz }) => (
  <div className="grid grid-cols-1 gap-3">
    {course.quizzes.map(quiz => (
      <div 
        key={quiz.id}
        onClick={() => onSelectQuiz(quiz)}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-400 cursor-pointer flex items-center justify-between transition-all"
      >
        <div className="flex items-center">
          <div className="bg-yellow-100 p-3 rounded-lg mr-4 text-yellow-600">
            <FileText size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">{quiz.title}</h4>
            <p className="text-sm text-gray-500">{quiz.description}</p>
          </div>
        </div>
        <ChevronRight className="text-gray-300" />
      </div>
    ))}
  </div>
);

// 4. Quiz Detail/Menu View
const QuizMenuView = ({ quiz, onStart }) => {
  const [randomize, setRandomize] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h2>
        <p className="text-gray-600">{quiz.description}</p>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center">
            <Settings size={18} className="mr-2" /> 設定
          </h3>
          <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <input 
              type="checkbox" 
              checked={randomize} 
              onChange={(e) => setRandomize(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500" 
            />
            <span className="text-gray-700">出題順をランダムにする</span>
          </label>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-gray-700 mb-4">収録されている問題 ({quiz.questions.length}問)</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="text-sm p-3 bg-gray-50 rounded border border-gray-100 text-gray-600">
                <span className="font-bold text-blue-500 mr-2">Q{idx + 1}.</span>
                {q.text}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onStart(randomize)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-transform transform active:scale-95 flex items-center justify-center text-lg"
        >
          <Play size={24} className="mr-2 fill-current" />
          テストを開始する
        </button>
      </div>
    </div>
  );
};

// 5. Game Loop View
const GameView = ({ quiz, isRandom, onFinish }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // { questionId, selectedIndex, timeTaken }
  const [startTime, setStartTime] = useState(null);
  const [qStartTime, setQStartTime] = useState(null);

  // 実際の出題順序を決定（メモ化して再レンダリングでも順序が変わらないようにする）
  const questionOrder = useMemo(() => {
    let order = [...quiz.questions];
    if (isRandom) {
      order = order.sort(() => Math.random() - 0.5);
    }
    return order;
  }, [quiz, isRandom]);

  useEffect(() => {
    setStartTime(Date.now());
    setQStartTime(Date.now());
  }, []);

  useEffect(() => {
    // 問題が変わるたびに計測開始
    setQStartTime(Date.now());
  }, [currentQIndex]);

  const handleAnswer = (optionIndex) => {
    const now = Date.now();
    const currentQ = questionOrder[currentQIndex];
    
    const answerRecord = {
      question: currentQ,
      selectedIndex: optionIndex,
      isCorrect: optionIndex === currentQ.correctIndex,
      timeTaken: now - qStartTime
    };

    const newAnswers = [...answers, answerRecord];
    setAnswers(newAnswers);

    if (currentQIndex < questionOrder.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Finish
      const totalTime = now - startTime;
      onFinish(newAnswers, totalTime);
    }
  };

  const currentQuestion = questionOrder[currentQIndex];
  const progress = ((currentQIndex) / questionOrder.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Question {currentQIndex + 1} / {questionOrder.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-8 leading-relaxed">
          {currentQuestion.text}
        </h2>

        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group flex items-center"
            >
              <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold mr-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                {['ア', 'イ', 'ウ', 'エ'][idx]}
              </span>
              <span className="text-gray-700 font-medium">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. Result View
const ResultView = ({ resultData, onRetry, onBackToMenu }) => {
  const { answers, totalTime } = resultData;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalCount = answers.length;
  const accuracy = Math.round((correctCount / totalCount) * 100);
  const formattedTime = `${Math.floor(totalTime / 1000)}秒`;

  // 評価コメント
  let comment = "もう一歩！";
  let color = "text-yellow-500";
  if (accuracy === 100) {
    comment = "パーフェクト！完璧だ！";
    color = "text-green-500";
  } else if (accuracy >= 80) {
    comment = "素晴らしい！合格圏内だ。";
    color = "text-blue-500";
  } else if (accuracy < 50) {
    comment = "もう少し復習が必要かも。";
    color = "text-red-500";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-8 text-center bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg text-gray-500 font-bold mb-2">RESULT</h2>
        <div className={`text-4xl font-black mb-2 ${color}`}>{accuracy}%</div>
        <p className="text-2xl font-bold text-gray-800 mb-4">{correctCount} / {totalCount} 問正解</p>
        <p className="text-gray-600 font-medium mb-4">{comment}</p>
        
        <div className="flex justify-center items-center text-gray-500 text-sm">
          <Clock size={16} className="mr-1" /> かかった時間: {formattedTime}
        </div>
      </div>

      <div className="p-6 bg-gray-50/50">
        <h3 className="font-bold text-gray-700 mb-4">詳細レポート</h3>
        <div className="space-y-4">
          {answers.map((ans, idx) => (
            <div key={idx} className={`bg-white p-4 rounded-lg border-l-4 shadow-sm ${ans.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-gray-500">Q{idx + 1}</span>
                {ans.isCorrect ? 
                  <span className="flex items-center text-green-600 text-sm font-bold"><CheckCircle size={16} className="mr-1"/> 正解</span> : 
                  <span className="flex items-center text-red-600 text-sm font-bold"><XCircle size={16} className="mr-1"/> 不正解</span>
                }
              </div>
              <p className="text-gray-800 font-medium mb-2">{ans.question.text}</p>
              <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className={`p-2 rounded ${ans.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <span className="text-xs opacity-70 block">あなたの回答</span>
                  {['ア', 'イ', 'ウ', 'エ'][ans.selectedIndex]}. {ans.question.options[ans.selectedIndex]}
                </div>
                {!ans.isCorrect && (
                  <div className="bg-blue-50 text-blue-800 p-2 rounded">
                    <span className="text-xs opacity-70 block">正解</span>
                    {['ア', 'イ', 'ウ', 'エ'][ans.question.correctIndex]}. {ans.question.options[ans.question.correctIndex]}
                  </div>
                )}
              </div>
              <div className="mt-2 text-right text-xs text-gray-400">
                回答時間: {(ans.timeTaken / 1000).toFixed(1)}秒
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-center bg-white sticky bottom-0">
        <button 
          onClick={onRetry}
          className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
        >
          <RotateCcw size={18} className="mr-2" /> もう一度挑戦
        </button>
        <button 
          onClick={onBackToMenu}
          className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> メニューに戻る
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [view, setView] = useState('home'); // home, course, quiz_menu, quiz_play, result
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [gameSettings, setGameSettings] = useState({ randomize: false });
  const [resultData, setResultData] = useState(null);

  // Navigation Handlers
  const goHome = () => {
    setView('home');
    setSelectedCourse(null);
    setSelectedQuiz(null);
    setResultData(null);
  };

  const selectCourse = (course) => {
    setSelectedCourse(course);
    setView('course');
  };

  const selectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setView('quiz_menu');
  };

  const startQuiz = (randomize) => {
    setGameSettings({ randomize });
    setView('quiz_play');
  };

  const finishQuiz = (answers, totalTime) => {
    setResultData({ answers, totalTime });
    setView('result');
  };

  // Breadcrumb Path Generator
  const getPath = () => {
    const path = [];
    if (selectedCourse) {
      path.push({ title: selectedCourse.title, id: selectedCourse.id, type: 'course' });
    }
    if (selectedQuiz && view !== 'course') {
      path.push({ title: selectedQuiz.title, id: selectedQuiz.id, type: 'quiz_menu' });
    }
    return path;
  };

  const handleBreadcrumbNavigate = (type, id) => {
    if (type === 'home') goHome();
    if (type === 'course') {
      setView('course');
      setSelectedQuiz(null);
    }
    // quiz_menu level navigation usually handled by just 'course' or current view
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2" onClick={goHome} role="button">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <FileText size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">Study Master</h1>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Test Prep Mode
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Navigation Breadcrumbs */}
        {view !== 'home' && (
          <Breadcrumbs path={getPath()} onNavigate={handleBreadcrumbNavigate} />
        )}

        {/* View Switcher */}
        <div className="animate-fade-in">
          {view === 'home' && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">科目の選択</h2>
              <FolderListView courses={DATA} onSelectCourse={selectCourse} />
            </>
          )}

          {view === 'course' && selectedCourse && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedCourse.title}</h2>
                <p className="text-gray-500">{selectedCourse.description}</p>
              </div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">テスト一覧</h3>
              <QuizListView course={selectedCourse} onSelectQuiz={selectQuiz} />
            </>
          )}

          {view === 'quiz_menu' && selectedQuiz && (
            <QuizMenuView quiz={selectedQuiz} onStart={startQuiz} />
          )}

          {view === 'quiz_play' && selectedQuiz && (
            <GameView 
              quiz={selectedQuiz} 
              isRandom={gameSettings.randomize} 
              onFinish={finishQuiz} 
            />
          )}

          {view === 'result' && resultData && (
            <ResultView 
              resultData={resultData} 
              onRetry={() => startQuiz(gameSettings.randomize)}
              onBackToMenu={() => setView('course')} 
            />
          )}
        </div>
      </main>
    </div>
  );
}