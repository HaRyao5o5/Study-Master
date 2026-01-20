import React from 'react';
import { Clock, CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';

const ResultView = ({ resultData, onRetry, onBackToMenu }) => {
  const { answers, totalTime } = resultData;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalCount = answers.length;
  const accuracy = Math.round((correctCount / totalCount) * 100);
  const formattedTime = `${Math.floor(totalTime / 1000)}秒`;

  let comment = "もう一歩！";
  let color = "text-yellow-500";
  if (accuracy === 100) { comment = "パーフェクト！完璧だ！"; color = "text-green-500"; } 
  else if (accuracy >= 80) { comment = "素晴らしい！合格圏内だ。"; color = "text-blue-500"; } 
  else if (accuracy < 50) { comment = "もう少し復習が必要かも。"; color = "text-red-500"; }

  const renderCorrectAnswer = (q) => {
    if (q.type === 'multiple') return q.correctAnswer[0];
    if (q.type === 'multi-select') return q.correctAnswer.join(', ');
    if (q.type === 'input') return q.correctAnswer.join(' または ');
    return '';
  };

  const renderUserAnswer = (ans) => {
    if (Array.isArray(ans.selectedAnswer)) return ans.selectedAnswer.join(', ');
    return ans.selectedAnswer;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-lg text-gray-500 dark:text-gray-400 font-bold mb-2">RESULT</h2>
        <div className={`text-4xl font-black mb-2 ${color}`}>{accuracy}%</div>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{correctCount} / {totalCount} 問正解</p>
        <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">{comment}</p>
        <div className="flex justify-center items-center text-gray-500 dark:text-gray-400 text-sm"><Clock size={16} className="mr-1" /> かかった時間: {formattedTime}</div>
      </div>
      <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">詳細レポート</h3>
        <div className="space-y-4">
          {answers.map((ans, idx) => (
            <div key={idx} className={`bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 shadow-sm ${ans.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-gray-500 dark:text-gray-400">Q{idx + 1}</span>
                {ans.isCorrect ? <span className="flex items-center text-green-600 text-sm font-bold"><CheckCircle size={16} className="mr-1"/> 正解</span> : <span className="flex items-center text-red-600 text-sm font-bold"><XCircle size={16} className="mr-1"/> 不正解</span>}
              </div>
              <p className="text-gray-800 dark:text-gray-200 font-medium mb-2 whitespace-pre-line">{ans.question.text}</p>
              {ans.question.image && <img src={ans.question.image} className="h-20 w-auto object-contain border rounded mb-2" alt="Q" />}
              <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className={`p-2 rounded ${ans.isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}><span className="text-xs opacity-70 block">あなたの回答</span>{renderUserAnswer(ans)}</div>
                {!ans.isCorrect && <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-2 rounded"><span className="text-xs opacity-70 block">正解</span>{renderCorrectAnswer(ans.question)}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-center bg-white dark:bg-gray-800 sticky bottom-0">
        <button onClick={onRetry} className="flex-1 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors"><RotateCcw size={18} className="mr-2" /> もう一度挑戦</button>
        <button onClick={onBackToMenu} className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"><ArrowLeft size={18} className="mr-2" /> メニューに戻る</button>
      </div>
    </div>
  );
};

export default ResultView;