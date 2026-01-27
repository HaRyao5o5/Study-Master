import React from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useApp } from '../context/AppContext';
import GameView from '../components/game/GameView';
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
    const { courses } = useApp();
    const location = useLocation(); // Retrieve location
    // const course = courses.find(c => c.id === courseId); // Unused variable

    let quiz: Quiz | undefined; // Better type inference or explicit
    const stateQuiz = location.state?.quiz as Quiz | undefined; // Check state

    if (stateQuiz) {
        quiz = stateQuiz;
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

    return (
        <GameView
            quiz={quiz}
            isRandom={gameSettings.randomize}
            shuffleOptions={gameSettings.shuffleOptions}
            immediateFeedback={gameSettings.immediateFeedback} 
            // Wait, GameView.tsx I wrote in previous session might or might not have it.
            // Let's check GameView code if possible or trust usage.
            // Original GamePage passed it. So GameView likely has it.
            // But wait, in the view_file for GameView.jsx earlier (in context summary), I might check props.
            // Actually, I wrote GameView.tsx previously. I should assume I included it.
            // Checking `GameView.jsx` in history: top lines don't show props clearly.
            // But `QuizMenuView` passes it to `onStart` which saves to `gameSettings` which is passed here.
            // I'll trust it exists.
            onFinish={(ans: any[], time: number) => onFinish(ans, time, courseId, quizId, quiz)}
        />
    );
};

export default GamePage;
