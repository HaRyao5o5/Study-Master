// src/components/course/FolderListView.jsx
import React from 'react';
import { Folder, Plus, X, Edit3 } from 'lucide-react'; // Edit3を追加

// onEditCourse を受け取るように変更
const FolderListView = ({ courses, onSelectCourse, onCreateCourse, onDeleteCourse, onEditCourse }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {courses.map(course => (
      <div key={course.id} className="relative group">
        <div 
          onClick={() => onSelectCourse(course)}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-500 flex flex-col items-center justify-center h-48"
        >
          <Folder size={64} className="text-blue-200 dark:text-blue-900 group-hover:text-blue-400 dark:group-hover:text-blue-500 mb-4 transition-colors" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-center line-clamp-2">{course.title}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{course.description || 'No description'}</p>
          <span className="mt-4 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
            {course.quizzes.length} フォルダ
          </span>
        </div>

        {/* 編集ボタン */}
        <button 
          onClick={(e) => { e.stopPropagation(); onEditCourse(course); }}
          className="absolute top-2 right-8 p-1 bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity mr-1"
          title="編集"
        >
          <Edit3 size={16} />
        </button>

        {/* 削除ボタン */}
        <button 
          onClick={(e) => { e.stopPropagation(); onDeleteCourse(course.id); }}
          className="absolute top-2 right-2 p-1 bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          title="削除"
        >
          <X size={16} />
        </button>
      </div>
    ))}
    <button 
      onClick={onCreateCourse}
      className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 rounded-xl flex flex-col items-center justify-center h-48 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-gray-400 dark:text-gray-500 hover:text-blue-500"
    >
      <Plus size={48} className="mb-2" />
      <span className="font-bold">新規フォルダ作成</span>
    </button>
  </div>
);

export default FolderListView;