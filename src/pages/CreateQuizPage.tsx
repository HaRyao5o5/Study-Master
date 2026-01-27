// src/pages/CreateQuizPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizEditor from '../components/editor/QuizEditor';
import { generateId } from '../utils/helpers';
import { Quiz } from '../types';

interface CreateQuizPageProps {
    onSave: (quiz: Quiz, courseId: string) => void;
}

/**
 * クイズ作成ページ
 * 新規クイズを作成する
 */
const CreateQuizPage: React.FC<CreateQuizPageProps> = ({ onSave }) => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const newQuiz: Quiz = {
        id: `quiz-${generateId()}`,
        title: '新規問題セット',
        description: '',
        questions: []
    };

    if (!courseId) return <div>Invalid Course ID</div>;

    return (
        <QuizEditor
            quiz={newQuiz}
            onSave={(updated: Quiz) => onSave(updated, courseId)}
            onCancel={() => navigate(`/course/${courseId}`)}
        />
    );
};

export default CreateQuizPage;
