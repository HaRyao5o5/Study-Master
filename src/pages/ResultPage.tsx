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

    // props → location.state → sessionStorage の優先順でデータを取得
    const getResultData = (): { resultData: ResultData | null; isReviewMode: boolean; streakUpdated: boolean; streak: number } => {
        // location.state が最優先
        if (location.state?.resultData) {
            return {
                resultData: location.state.resultData,
                isReviewMode: location.state.isReviewMode || false,
                streakUpdated: location.state.streakUpdated || false,
                streak: location.state.streak || 0
            };
        }
        // propsからのデータ
        if (propResultData) {
            return { resultData: propResultData, isReviewMode: false, streakUpdated: false, streak: 0 };
        }
        // sessionStorageからのフォールバック（リロード対策）
        try {
            const saved = sessionStorage.getItem('study_master_last_result');
            if (saved) {
                const parsed = JSON.parse(saved);
                // URL上のcourseId/quizIdと一致する場合のみ復元
                if (parsed.courseId === courseId && parsed.quizId === quizId) {
                    return {
                        resultData: parsed.resultData,
                        isReviewMode: parsed.isReviewMode || false,
                        streakUpdated: false, // リロード後はストリーク演出を再表示しない
                        streak: parsed.streak || 0
                    };
                }
            }
        } catch {
            // パース失敗は無視
        }
        return { resultData: null, isReviewMode: false, streakUpdated: false, streak: 0 };
    };

    const { resultData, isReviewMode, streakUpdated, streak } = getResultData();
    const isFlashcardMode = location.pathname.includes('/flashcards') || location.state?.isFlashcardMode;
    
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

    const handleRetry = () => {
        if (isFlashcardMode) {
            navigate(`/course/${courseId}/quiz/${quizId}/flashcards`, { state: { quiz: location.state?.quiz } });
        } else {
            onRetry(courseId, quizId, gameSettings.randomize, gameSettings.shuffleOptions, gameSettings.immediateFeedback);
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
                onRetry={handleRetry}
                onBackToMenu={handleBack}
            />
        </>
    );
};

export default ResultPage;
