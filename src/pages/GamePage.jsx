// src/pages/GamePage.jsx
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import GameView from '../components/game/GameView';

/**
 * ゲームプレイページ
 * クイズを実際にプレイする画面
 */
const GamePage = ({ gameSettings, wrongHistory, onFinish }) => {
    const { courseId, quizId } = useParams();
    const { courses } = useApp();
    const course = courses.find(c => c.id === courseId);

    let quiz;
    if (quizId === 'review-mode') {
        const wrongQuestions = [];
        courses.forEach(c => c.quizzes.forEach(q => q.questions.forEach(ques => {
            if (wrongHistory.includes(ques.id)) wrongQuestions.push(ques);
        })));
        quiz = { id: 'review-mode', title: '弱点克服', questions: wrongQuestions };
    } else {
        quiz = course?.quizzes.find(q => q.id === quizId);
    }

    if (!quiz) {
        return <Navigate to="/" />;
    }

    return (
        <GameView
            quiz={quiz}
            isRandom={gameSettings.randomize}
            shuffleOptions={gameSettings.shuffleOptions}
            immediateFeedback={gameSettings.immediateFeedback}
            onFinish={(ans, time) => onFinish(ans, time, courseId, quizId)}
        />
    );
};

export default GamePage;
