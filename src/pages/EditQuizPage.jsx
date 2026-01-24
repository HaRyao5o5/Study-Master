// src/pages/EditQuizPage.jsx
import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import QuizEditor from '../components/editor/QuizEditor';

/**
 * クイズ編集ページ
 * 既存のクイズを編集する
 */
const EditQuizPage = ({ onSave }) => {
    const { courseId, quizId } = useParams();
    const { courses } = useApp();
    const navigate = useNavigate();
    const course = courses.find(c => c.id === courseId);
    const quiz = course?.quizzes.find(q => q.id === quizId);

    if (!course || !quiz) {
        return <Navigate to="/" />;
    }

    return (
        <QuizEditor
            quiz={quiz}
            onSave={(updated) => onSave(updated, courseId)}
            onCancel={() => navigate(`/course/${courseId}/quiz/${quizId}`)}
        />
    );
};

export default EditQuizPage;
