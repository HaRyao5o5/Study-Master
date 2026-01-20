// src/components/course/QuizListView.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Layers, Target, Brain, RotateCcw, Plus, FileText, Trash2, ChevronRight, Play, Settings } from 'lucide-react';

const QuizListView = ({ course, onSelectQuiz, wrongHistory, onSelectReview, onCreateQuiz, onDeleteQuiz }) => {
  const [showMockSettings, setShowMockSettings] = useState(false);
  const [mockQuestionCount, setMockQuestionCount] = useState(10); // 初期値

  // コース内の全問題を取得
  const allQuestions = useMemo(() => {
    return course.quizzes.flatMap(q => q.questions);
  }, [course]);

  // ★ バグ修正: 総問題数が10問未満の場合、初期値を総問題数に合わせる
  useEffect(() => {
    if (allQuestions.length > 0 && allQuestions.length < 10) {
      setMockQuestionCount(allQuestions.length);
    } else if (allQuestions.length >= 10 && mockQuestionCount < 10) {
        // もし以前の設定で小さい値になっていて、かつ問題数が十分あるなら10に戻す（お好みで）
        // ここでは「現在の設定値が総数を超えていたら丸める」処理だけにするのが安全
        if (mockQuestionCount > allQuestions.length) {
            setMockQuestionCount(allQuestions.length);
        }
    }
  }, [allQuestions.length]);

  // 設定値が変わったときに、上限を超えないようにガード
  const handleCountChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val > allQuestions.length) {
      setMockQuestionCount(allQuestions.length);
    } else if (val < 1) {
      setMockQuestionCount(1);
    } else {
      setMockQuestionCount(val);
    }
  };

  const startMockExam = () => {
    // ランダムに問題を抽出して新しいクイズセットを作成
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, mockQuestionCount);
    
    const mockQuiz = {
      id: 'mock-exam',
      title: '実力診断テスト',
      description: `${course.title}からランダムに${selected.length}問出題`,
      questions: selected,
      isMock: true
    };
    onSelectQuiz(mockQuiz);
  };

  const startWeaknessReview = () => {
    // 間違えた履歴のある問題だけを抽出
    const weaknessQuestions = allQuestions.filter(q => wrongHistory.includes(q.id));
    
    const reviewQuiz = {
      id: 'review-mode',
      title: '弱点克服モード',
      description: '過去に間違えた問題を重点的に復習します',
      questions: weaknessQuestions,
      isMock: false
    };
    onSelectReview(reviewQuiz);
  };

  const weaknessCount = allQuestions.filter(q => wrongHistory.includes(q.id)).length;

  return (
    <div className="space-y-6">
      {/* 学習モード選択エリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 実力診断テスト */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={100} />
          </div>
          <h3 className="text-xl font-bold mb-2 flex items-center"><Layers className="mr-2" /> 実力診断テスト</h3>
          <p className="text-indigo-100 text-sm mb-4">全範囲からランダムに出題して実力を測ります。</p>
          
          {showMockSettings ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 animate-fade-in">
              <label className="block text-xs font-bold mb-1">出題数: {mockQuestionCount}問</label>
              <input 
                type="range" 
                min="1" 
                max={allQuestions.length} 
                value={mockQuestionCount} 
                onChange={handleCountChange}
                className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-white mb-3"
              />
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowMockSettings(false)}
                  className="flex-1 bg-transparent border border-white/30 hover:bg-white/10 text-xs py-2 rounded font-bold transition-colors"
                >
                  キャンセル
                </button>
                <button 
                  onClick={startMockExam}
                  className="flex-1 bg-white text-indigo-600 hover:bg-indigo-50 text-xs py-2 rounded font-bold transition-colors flex items-center justify-center"
                  disabled={allQuestions.length === 0}
                >
                  <Play size={14} className="mr-1" /> 開始
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => {
                  // 設定を開いた瞬間にもチェック
                  if (allQuestions.length < 10) setMockQuestionCount(allQuestions.length);
                  setShowMockSettings(true);
              }}
              className="w-full bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
              disabled={allQuestions.length === 0}
            >
              {allQuestions.length > 0 ? "テスト設定へ" : "問題がありません"}
            </button>
          )}
        </div>

        {/* 弱点克服 */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Brain size={100} />
          </div>
          <h3 className="text-xl font-bold mb-2 flex items-center"><RotateCcw className="mr-2" /> 弱点克服モード</h3>
          <p className="text-orange-100 text-sm mb-4">苦手な問題: {weaknessCount}問</p>
          <button 
            onClick={startWeaknessReview}
            disabled={weaknessCount === 0}
            className="w-full bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {weaknessCount > 0 ? "復習を開始" : "苦手な問題はありません"}
          </button>
        </div>
      </div>

      {/* 問題セット一覧 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center">
            <Layers size={20} className="mr-2" /> 問題セット一覧
          </h3>
          <button 
            onClick={onCreateQuiz}
            className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold flex items-center transition-colors"
          >
            <Plus size={16} className="mr-1" /> 新規作成
          </button>
        </div>

        <div className="space-y-3">
          {course.quizzes.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <FileText size={48} className="mx-auto mb-2 opacity-50" />
              <p>まだ問題セットがありません</p>
              <button onClick={onCreateQuiz} className="mt-4 text-blue-500 font-bold hover:underline">最初のセットを作成する</button>
            </div>
          ) : (
            course.quizzes.map(quiz => (
              <div 
                key={quiz.id} 
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex justify-between items-center group cursor-pointer"
                onClick={() => onSelectQuiz(quiz)}
              >
                <div className="flex items-center overflow-hidden">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mr-4 flex-shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate pr-4">{quiz.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{quiz.questions.length}問 • {quiz.description || '説明なし'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                   <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteQuiz(quiz.id); }}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    title="削除"
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight size={20} className="text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizListView;