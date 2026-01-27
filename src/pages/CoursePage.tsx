// src/pages/CoursePage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Breadcrumbs from '../components/common/Breadcrumbs';
import QuizListView from '../components/course/QuizListView';
import { Quiz } from '../types';

interface CoursePageProps {
    wrongHistory: string[];
    onCreateQuiz: (courseId: string) => void;
    onDeleteQuiz: (quizId: string, courseId: string) => void;
    onImportQuiz: (quizData: Quiz, courseId: string) => void;
}

/**
 * コース詳細ページ
 * 選択したコース内のクイズ一覧を表示
 */
const CoursePage: React.FC<CoursePageProps> = ({ wrongHistory, onCreateQuiz, onDeleteQuiz, onImportQuiz }) => {
    const { courseId } = useParams<{ courseId: string }>();
    const { courses } = useApp();
    const navigate = useNavigate();
    const course = courses.find(c => c.id === courseId);

    if (!course) {
        return <div className="p-8 text-center">コースが見つかりません</div>;
    }

    return (
        <>
            <div className="mb-6 animate-slide-up">
                <Breadcrumbs
                    path={[{ title: course.title, id: course.id, type: 'course' }]}
                    onNavigate={() => navigate('/')}
                />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">
                    {course.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">{course.description}</p>
            </div>
            <QuizListView
                course={course}
                onSelectQuiz={(q: Quiz) => navigate(`/course/${course.id}/quiz/${q.id}`)}
                wrongHistory={wrongHistory}
                onSelectReview={() => navigate(`/course/${course.id}/quiz/review-mode`)}
                onCreateQuiz={() => onCreateQuiz(course.id)}
                onDeleteQuiz={(qid: string) => onDeleteQuiz(qid, course.id)}
                onImportQuiz={(q: Quiz) => onImportQuiz(q, course.id)}
            />
        </>
    );
};

export default CoursePage;
