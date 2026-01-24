// src/pages/ResultPage.jsx
import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import ResultView from '../components/game/ResultView';

/**
 * 結果表示ページ
 * クイズの結果、獲得XP、レベルアップ等を表示
 */
const ResultPage = ({ resultData, gameSettings, onRetry }) => {
    const { courseId, quizId } = useParams();
    const navigate = useNavigate();

    if (!resultData) {
        return <Navigate to={`/course/${courseId}`} />;
    }

    return (
        <ResultView
            resultData={resultData}
            onRetry={() => onRetry(courseId, quizId, gameSettings.randomize, gameSettings.shuffleOptions, gameSettings.immediateFeedback)}
            onBackToMenu={() => navigate(`/course/${courseId}`)}
        />
    );
};

export default ResultPage;
