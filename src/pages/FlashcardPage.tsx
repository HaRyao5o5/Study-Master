import React, { useState, useMemo } from 'react';
import { useParams, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import FlashcardView from '../components/game/FlashcardView';
import { calculateNextReview, isDue } from '../utils/srs';
import { Quiz } from '../types';
import { Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface FlashcardPageProps {
  onFinish: (answers: any[], time: number, courseId: string, quizId: string, quiz?: Quiz) => void;
}

const FlashcardPage: React.FC<FlashcardPageProps> = ({ onFinish }) => {
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
    const { courses, reviews, updateReviewStatus } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [isFinished, setIsFinished] = useState(false);
    const [finalResults, setFinalResults] = useState<{ questionId: string; isKnown: boolean }[]>([]);

    const quiz = useMemo(() => {
        const stateQuiz = location.state?.quiz as Quiz | undefined;
        if (stateQuiz) return stateQuiz;

        if (quizId === 'srs-mode') {
            const dueQuestions: Quiz['questions'] = [];
            courses.forEach(c => c.quizzes.forEach(q => q.questions.forEach(ques => {
                const review = reviews[ques.id];
                if (review && isDue(review)) dueQuestions.push(ques);
            })));
            return { id: 'srs-mode', title: '本日の復習 (SRS)', questions: dueQuestions } as Quiz;
        }

        const course = courses.find(c => c.id === courseId);
        return course?.quizzes.find(q => q.id === quizId);
    }, [courseId, quizId, courses, reviews, location.state]);

    if (!quiz || !courseId || !quizId) {
        return <Navigate to="/" />;
    }

    const handleFinish = (results: { questionId: string; isKnown: boolean }[]) => {
        setFinalResults(results);
        setIsFinished(true);

        // SRS Update
        results.forEach(res => {
            const qId = res.questionId;
            const currentReview = reviews[qId];
            const isSRSMode = quizId === 'srs-mode';
            
            // 自己評価の結果をSRSに反映
            const result = calculateNextReview(currentReview, res.isKnown, isSRSMode);
            
            updateReviewStatus({
                id: qId,
                questionId: qId,
                courseId: courseId || 'unknown',
                ...result,
                createdAt: currentReview?.createdAt || Date.now(),
                updatedAt: Date.now()
            });
        });

        // Quiz結果として変換 (GamePage/useGameLogic.finishQuiz と形式を合わせる)
        const mockAnswers = results.map(res => ({
            question: quiz.questions.find(q => q.id === res.questionId),
            selectedAnswer: res.isKnown ? 'Known' : 'Unknown', // 追加: 判定ロジックで必要
            isCorrect: res.isKnown,
            timeTaken: 0
        }));

        // 少しディレイを入れてからリザルト画面へ
        setTimeout(() => {
            onFinish(mockAnswers, 0, courseId, quizId, quiz);
        }, 2000);
    };

    if (isFinished) {
        const knownCount = finalResults.filter(r => r.isKnown).length;
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2">暗記完了！</h2>
                <p className="text-gray-500 dark:text-gray-400 font-bold mb-8">
                    {finalResults.length}問中 {knownCount}問を「知っている」と回答しました。
                </p>
                <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 font-bold animate-pulse">
                    <Sparkles size={20} />
                    <span>スコア集計中...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="max-w-xl mx-auto mb-4 flex items-center justify-between px-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-500"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="text-center">
                    <h1 className="text-sm font-black text-gray-400 uppercase tracking-widest">Flashcard Mode</h1>
                    <div className="text-lg font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{quiz.title}</div>
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>
            
            <FlashcardView 
                questions={quiz.questions} 
                onFinish={handleFinish} 
            />
        </div>
    );
};

export default FlashcardPage;
