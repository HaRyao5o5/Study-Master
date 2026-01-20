// src/components/course/FolderListView.jsx
import React, { useRef } from 'react';
import { Folder, Plus, X, Edit3, Share2, Upload } from 'lucide-react';
import { exportToFile, importFromFile } from '../../utils/fileIO';

const FolderListView = ({ courses, onSelectCourse, onCreateCourse, onDeleteCourse, onEditCourse, onImportCourse }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    importFromFile(e.target.files[0], 'course', (newCourseData) => {
      onImportCourse(newCourseData);
    });
    e.target.value = ''; 
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {courses.map((course, index) => (
        <div 
          key={course.id} 
          className="relative group animate-slide-up"
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
        >
          <div 
            onClick={() => onSelectCourse(course)}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-500 flex flex-col items-center justify-center min-h-[12rem] h-auto active:scale-95"
          >
            <div className="transform transition-transform duration-300 group-hover:scale-110">
               <Folder size={64} className="text-blue-200 dark:text-blue-900 group-hover:text-blue-400 dark:group-hover:text-blue-500 mb-4 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-center line-clamp-2 w-full break-words">
              {course.title}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center line-clamp-1">
              {course.description || 'No description'}
            </p>
            <span className="mt-4 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
              {course.quizzes.length} フォルダ
            </span>
          </div>

          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                exportToFile(course, 'course', `folder-${course.title}`);
              }}
              className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-gray-600 rounded-full transition-colors"
              title="共有"
            >
              <Share2 size={16} />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); onEditCourse(course); }}
              className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-full transition-colors"
              title="編集"
            >
              <Edit3 size={16} />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteCourse(course.id); }}
              className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-600 rounded-full transition-colors"
              title="削除"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}

      <div 
        className="flex flex-col gap-2 min-h-[12rem] h-auto animate-slide-up"
        style={{ animationDelay: `${courses.length * 100}ms`, animationFillMode: 'both' }}
      >
        {/* 新規作成ボタン (回転軸修正済み) */}
        <button 
          onClick={onCreateCourse}
          className="flex-1 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:-translate-y-1 text-gray-400 dark:text-gray-500 hover:text-blue-500 group"
        >
          {/* ★ 修正ポイント: mr-2 を回転要素の外側に出した */}
          <div className="mr-2">
            <div className="transform transition-transform duration-300 group-hover:rotate-90">
               <Plus size={24} />
            </div>
          </div>
          <span className="font-bold">新規作成</span>
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 transition-all active:scale-95 text-gray-400 font-bold text-sm"
        >
          <Upload size={18} className="mr-2" />
          <span>ファイルを読込</span>
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileSelect} />
      </div>
    </div>
  );
};

export default FolderListView;