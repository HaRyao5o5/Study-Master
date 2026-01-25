import React from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import ResultView from '../components/game/ResultView';

/**
 * 結果表示ページ
 * クイズの結果、獲得XP、レベルアップ等を表示
 */
const ResultPage = ({ resultData: propResultData, gameSettings, onRetry }) => {
    const { courseId, quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // 追加

    // props または location.state からデータを取得 (location.state優先)
    const resultData = location.state?.resultData || propResultData;
    const isReviewMode = location.state?.isReviewMode || false;

    if (!resultData) {
        return <Navigate to={`/course/${courseId}`} />;
    }

    const handleBack = () => {
        if (isReviewMode) {
            navigate('/review');
        } else {
            navigate(`/course/${courseId}`);
        }
    };

    return (
        <ResultView
            resultData={resultData}
            onRetry={() => onRetry(courseId, quizId, gameSettings.randomize, gameSettings.shuffleOptions, gameSettings.immediateFeedback)}
            onBackToMenu={handleBack}
        />
    );
};

export default ResultPage;
