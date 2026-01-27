// src/pages/EditQuizPage.tsx
import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import QuizEditor from '../components/editor/QuizEditor';
import { Quiz } from '../types';

interface EditQuizPageProps {
    onSave: (quiz: Quiz, courseId: string) => void;
}

/**
 * クイズ編集ページ
 * 既存のクイズを編集する
 */
const EditQuizPage: React.FC<EditQuizPageProps> = ({ onSave }) => {
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
    const { courses } = useApp();
    const navigate = useNavigate();
    const course = courses.find(c => c.id === courseId);
    const quiz = course?.quizzes.find(q => q.id === quizId);

    if (!course || !quiz || !courseId) {
        return <Navigate to="/" />;
    }

    return (
        <QuizEditor
            quiz={quiz}
            onSave={(updated: Quiz) => onSave(updated, courseId)}
            onCancel={() => navigate(`/course/${courseId}/quiz/${quizId}`)}
        />
    );
};

export default EditQuizPage;
