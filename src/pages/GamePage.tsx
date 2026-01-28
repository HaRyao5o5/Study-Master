import React from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useApp } from '../context/AppContext';
import GameView from '../components/game/GameView';
import { calculateNextReview, isDue } from '../utils/srs';
import { Quiz } from '../types';

interface GamePageProps {
    gameSettings: {
        randomize: boolean;
        shuffleOptions: boolean;
        immediateFeedback: boolean;
    };
    wrongHistory: string[];
    onFinish: (answers: any[], time: number, courseId: string, quizId: string, quiz?: Quiz) => void;
}

/**
 * ゲームプレイページ
 * クイズを実際にプレイする画面
 */
const GamePage: React.FC<GamePageProps> = ({ gameSettings, wrongHistory, onFinish }) => {
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
    const { courses, reviews, updateReviewStatus } = useApp();
    const location = useLocation(); // Retrieve location
    // const course = courses.find(c => c.id === courseId); // Unused variable

    let quiz: Quiz | undefined; // Better type inference or explicit
    const stateQuiz = location.state?.quiz as Quiz | undefined; // Check state

    if (stateQuiz) {
        quiz = stateQuiz;
    } else if (quizId === 'srs-mode') {
        const dueQuestions: Quiz['questions'] = [];
        courses.forEach(c => c.quizzes.forEach(q => q.questions.forEach(ques => {
            const review = reviews[ques.id];
            if (review && isDue(review)) {
                dueQuestions.push(ques);
            }
        })));
        quiz = { id: 'srs-mode', title: '本日の復習 (SRS)', description: '忘却曲線に基づいた最適な学習です', questions: dueQuestions };
    } else if (quizId === 'review-mode') {
        const wrongQuestions: Quiz['questions'] = [];
        courses.forEach(c => c.quizzes.forEach(q => q.questions.forEach(ques => {
            if (wrongHistory.includes(ques.id)) wrongQuestions.push(ques);
        })));
        quiz = { id: 'review-mode', title: '弱点克服', description: '', questions: wrongQuestions };
    } else {
        const course = courses.find(c => c.id === courseId);
        quiz = course?.quizzes.find(q => q.id === quizId);
    }

    if (!quiz || !courseId || !quizId) {
        return <Navigate to="/" />;
    }


    const handleFinish = (answers: any[], time: number) => {
        // SRS Update
         answers.forEach(ans => {
            const qId = ans.question.id;
            const currentReview = reviews[qId];
            // Only allow SRS level up (streak increase) if in SRS mode
            // Other modes will initialize new items or perform maintenance reviews on existing ones
            const isSRSMode = quizId === 'srs-mode';
            const result = calculateNextReview(currentReview, ans.isCorrect, isSRSMode);
            
            updateReviewStatus({
                id: qId,
                questionId: qId,
                courseId: courseId || 'unknown',
                ...result,
                createdAt: currentReview?.createdAt || Date.now(),
                updatedAt: Date.now()
            });
        });

        onFinish(answers, time, courseId!, quizId!, quiz);
    };

    return (
        <GameView
            quiz={quiz}
            isRandom={gameSettings.randomize}
            shuffleOptions={gameSettings.shuffleOptions}
            immediateFeedback={gameSettings.immediateFeedback} 
            onFinish={handleFinish}
        />
    );
};

export default GamePage;
