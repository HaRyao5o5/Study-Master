// src/components/course/SharedCourseView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPublicCourse } from '../../utils/cloudSync';
import { useApp } from '../../context/AppContext';
import { Download, AlertTriangle, Loader, BookOpen, User } from 'lucide-react';
import { generateId } from '../../utils/helpers';

const SharedCourseView = () => {
  const { targetUid, courseId } = useParams();
  const navigate = useNavigate();
  const { user, setCourses } = useApp(); // インポート用に使う
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPublicCourse(targetUid, courseId);
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [targetUid, courseId]);

  const handleImport = () => {
    if (!confirm(`「${course.title}」をあなたのライブラリに追加しますか？`)) return;

    // 新しいIDを割り振って自分のものにする（ディープコピー）
    const newCourse = {
      ...course,
      id: `course-${generateId()}`, // 新しいID
      visibility: 'private', // インポートしたものは最初は非公開に
      quizzes: course.quizzes.map(q => ({
        ...q,
        id: `quiz-${generateId()}` // クイズIDも一新
      }))
    };

    setCourses(prev => [...prev, newCourse]);
    alert("インポートが完了しました！ホーム画面に戻ります。");
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <Loader className="animate-spin mb-4" size={48} />
        <p>コースデータを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 p-4 text-center">
        <AlertTriangle size={64} className="mb-4" />
        <h2 className="text-2xl font-bold mb-2">エラーが発生しました</h2>
        <p className="mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="text-blue-500 hover:underline">
          ホームに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <BookOpen size={48} className="mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl font-black mb-2">{course.title}</h1>
          <div className="flex items-center justify-center text-blue-100 text-sm">
            <User size={14} className="mr-1" />
            <span>Shared Content</span>
          </div>
        </div>
        
        <div className="p-8">
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-2">説明</h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {course.description || "説明はありません。"}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-gray-500 mb-4 flex items-center">
              収録されている問題セット
              <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
                {course.quizzes.length}
              </span>
            </h3>
            <div className="grid gap-3">
              {course.quizzes.map((quiz, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm mr-3">
                    {i + 1}
                  </div>
                  <span className="font-medium truncate">{quiz.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            {user ? (
              <button
                onClick={handleImport}
                className="flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Download className="mr-2" />
                このコースを自分の学習リストに追加
              </button>
            ) : (
              <div className="text-center">
                <p className="mb-2 text-gray-500">このコースを追加するにはログインが必要です</p>
                <button
                  onClick={() => navigate('/')} // ホームでログインさせる
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  ログイン画面へ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedCourseView;