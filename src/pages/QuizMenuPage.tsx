// src/pages/QuizMenuPage.tsx
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Breadcrumbs from '../components/common/Breadcrumbs';
import QuizMenuView from '../components/course/QuizMenuView';
import { Quiz } from '../types';

interface QuizMenuPageProps {
    wrongHistory: string[];
    onStart: (courseId: string, quizId: string, randomize: boolean, shuffleOptions: boolean, immediateFeedback: boolean, quizData?: Quiz) => void;
    onClearHistory: (quizId: string) => void;
}

/**
 * クイズメニューページ
 * クイズの設定（ランダム化、シャッフル等）を選択してゲームを開始
 */
const QuizMenuPage: React.FC<QuizMenuPageProps> = ({ wrongHistory, onStart, onClearHistory }) => {
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
    const { courses } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    
    // courseId check
    const course = courses.find(c => c.id === courseId);

    if (!course || !courseId || !quizId) {
        return <div>コースが見つかりません</div>;
    }

    let quiz: Quiz | undefined;
    const stateQuiz = location.state?.quiz as Quiz | undefined;

    if (stateQuiz) {
        quiz = stateQuiz;
    } else if (quizId === 'review-mode') {
        const wrongQuestions: Quiz['questions'] = [];
        // If we are in a specific course context, only review that course's questions
        const targetCourses = courseId ? courses.filter(c => c.id === courseId) : courses;
        
        targetCourses.forEach(c => c.quizzes.forEach(q => q.questions.forEach(ques => {
            if (wrongHistory.includes(ques.id)) wrongQuestions.push(ques);
        })));
        quiz = {
            id: 'review-mode',
            title: '弱点克服（復習）',
            description: courseId ? 'このコースの間違えた問題のみ出題されます' : '間違えた問題のみ出題されます',
            questions: wrongQuestions
        };
    } else {
        quiz = course.quizzes.find(q => q.id === quizId);
    }

    if (!quiz) {
        return <div>問題セットが見つかりません</div>;
    }

    const path = [
        { title: course.title, id: course.id, type: 'course' as const },
        { title: quiz.title, id: quiz.id, type: 'quiz_menu' as const }
    ];

    return (
        <>
            <Breadcrumbs
                path={path}
                onNavigate={(type, _id) => {
                    if (type === 'home') navigate('/');
                    if (type === 'course') navigate(`/course/${courseId}`);
                }}
            />
            <QuizMenuView
                quiz={quiz}
                onStart={(rand: boolean, shuf: boolean, imm: boolean) => onStart(courseId, quizId, rand, shuf, imm, quiz)}
                isReviewMode={quizId === 'review-mode'}
                onClearHistory={onClearHistory ? (() => onClearHistory(quizId)) : undefined}
                onEdit={quizId === 'review-mode' ? undefined : () => navigate(`/course/${courseId}/quiz/${quizId}/edit`)}
            />
        </>
    );
};

export default QuizMenuPage;
