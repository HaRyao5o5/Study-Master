// src/pages/CreateQuizPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizEditor from '../components/editor/QuizEditor';
import { generateId } from '../utils/helpers';

/**
 * クイズ作成ページ
 * 新規クイズを作成する
 */
const CreateQuizPage = ({ onSave }) => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const newQuiz = {
        id: `quiz-${generateId()}`,
        title: '新規問題セット',
        description: '',
        questions: []
    };

    return (
        <QuizEditor
            quiz={newQuiz}
            onSave={(updated) => onSave(updated, courseId)}
            onCancel={() => navigate(`/course/${courseId}`)}
        />
    );
};

export default CreateQuizPage;
