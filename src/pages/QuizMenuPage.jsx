// src/pages/QuizMenuPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Breadcrumbs from '../components/common/Breadcrumbs';
import QuizMenuView from '../components/course/QuizMenuView';

/**
 * クイズメニューページ
 * クイズの設定（ランダム化、シャッフル等）を選択してゲームを開始
 */
const QuizMenuPage = ({ wrongHistory, onStart, onClearHistory }) => {
    const { courseId, quizId } = useParams();
    const { courses } = useApp();
    const navigate = useNavigate();
    const course = courses.find(c => c.id === courseId);

    if (!course) {
        return <div>コースが見つかりません</div>;
    }

    let quiz;
    if (quizId === 'review-mode') {
        const wrongQuestions = [];
        courses.forEach(c => c.quizzes.forEach(q => q.questions.forEach(ques => {
            if (wrongHistory.includes(ques.id)) wrongQuestions.push(ques);
        })));
        quiz = {
            id: 'review-mode',
            title: '弱点克服（復習）',
            description: '間違えた問題のみ出題されます',
            questions: wrongQuestions
        };
    } else {
        quiz = course.quizzes.find(q => q.id === quizId);
    }

    if (!quiz) {
        return <div>問題セットが見つかりません</div>;
    }

    const path = [
        { title: course.title, id: course.id, type: 'course' },
        { title: quiz.title, id: quiz.id, type: 'quiz_menu' }
    ];

    return (
        <>
            <Breadcrumbs
                path={path}
                onNavigate={(type, id) => {
                    if (type === 'home') navigate('/');
                    if (type === 'course') navigate(`/course/${courseId}`);
                }}
            />
            <QuizMenuView
                quiz={quiz}
                onStart={(rand, shuf, imm) => onStart(courseId, quizId, rand, shuf, imm)}
                isReviewMode={quizId === 'review-mode'}
                onClearHistory={onClearHistory}
                onEdit={quizId === 'review-mode' ? null : () => navigate(`/course/${courseId}/quiz/${quizId}/edit`)}
            />
        </>
    );
};

export default QuizMenuPage;
