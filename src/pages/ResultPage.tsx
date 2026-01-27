// src/pages/ResultPage.tsx
import React from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import ResultView from '../components/game/ResultView';
import StreakCelebrationOverlay from '../components/game/StreakCelebrationOverlay';
import { ResultData } from '../types';

interface ResultPageProps {
    resultData: ResultData | null;
    gameSettings: {
        randomize: boolean;
        shuffleOptions: boolean;
        immediateFeedback: boolean;
    };
    onRetry: (courseId: string, quizId: string, randomize: boolean, shuffleOptions: boolean, immediateFeedback: boolean) => void;
}

/**
 * 結果表示ページ
 * クイズの結果、獲得XP、レベルアップ等を表示
 */
const ResultPage: React.FC<ResultPageProps> = ({ resultData: propResultData, gameSettings, onRetry }) => {
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // props または location.state からデータを取得 (location.state優先)
    const resultData: ResultData = location.state?.resultData || propResultData;
    const isReviewMode = location.state?.isReviewMode || false;
    const streakUpdated = location.state?.streakUpdated || false;
    const streak = location.state?.streak || 0;
    
    // Manage overlay visibility
    const [showCelebration, setShowCelebration] = React.useState(streakUpdated);

    if (!resultData || !courseId || !quizId) {
        return <Navigate to={`/course/${courseId || ''}`} />;
    }

    const handleBack = () => {
        if (isReviewMode) {
            navigate('/review');
        } else {
            navigate(`/course/${courseId}`);
        }
    };

    return (
        <>
            {showCelebration && (
                <StreakCelebrationOverlay 
                    streak={streak} 
                    onDismiss={() => setShowCelebration(false)} 
                />
            )}
            <ResultView
                resultData={resultData}
                onRetry={() => onRetry(courseId, quizId, gameSettings.randomize, gameSettings.shuffleOptions, gameSettings.immediateFeedback)}
                onBackToMenu={handleBack}
            />
        </>
    );
};

export default ResultPage;
