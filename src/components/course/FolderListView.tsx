// src/components/course/FolderListView.tsx
import React, { useRef, memo } from 'react';
import { Folder, Plus, X, Edit3, Share2, Upload } from 'lucide-react';
import { importFromFile } from '../../utils/fileIO';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { SUCCESS, CONFIRM } from '../../utils/errorMessages';
import { Course } from '../../types';

interface FolderListViewProps {
  onSelectCourse: (course: Course) => void;
  onCreateCourse: () => void;
  onEditCourse: (course: Course) => void;
}

const FolderListView: React.FC<FolderListViewProps> = ({ onSelectCourse, onCreateCourse, onEditCourse }) => {
  const { courses, saveData, user } = useApp();
  const { showSuccess, showConfirm, showWarning, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    importFromFile(e.target.files[0], 'course', (newCourseData: Course) => { // Type assertion/inference needed
      saveData({ courses: [...courses, newCourseData] });
      showSuccess(SUCCESS.FOLDER_CREATED(newCourseData.title));
    });
    e.target.value = ''; 
  };

  const handleDelete = async (courseId: string) => {
    const confirmed = await showConfirm(CONFIRM.DELETE_FOLDER);
    if (confirmed) {
      saveData({ courses: courses.filter(c => c.id !== courseId) });
    }
  };

  const handleShare = (course: Course) => {
    console.log('Share button clicked');
    
    // ログインチェック
    if (!user) {
      showWarning('⚠️ 共有機能を使うにはログインが必要です。\n\n右上のメニューからログインしてください。');
      return;
    }
    
    // visibilityチェック
    if (!course.visibility || course.visibility === 'private') {
      showWarning('⚠️ このコースは現在「非公開」設定です。\n\n共有するには：\n1. コースの編集ボタン（✏️）をクリック\n2. 公開設定を「公開」または「限定公開」に変更\n3. 保存してください');
      return;
    }
    
    // 共有URL生成とコピー
    const shareUrl = `${window.location.origin}/share/${user.uid}/${course.id}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showSuccess(`✅ 共有リンクをコピーしました！\n\n${shareUrl}\n\nこのURLを友達に教えてあげましょう。`);
      })
      .catch((err: any) => {
        console.error('Clipboard copy failed:', err);
        showError(`共有リンク：\n${shareUrl}\n\n※自動コピーに失敗しました。上記URLを手動でコピーしてください。`);
      });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* gapを少し広げた */}
      {courses.map((course, index) => (
        <div 
          key={course.id} 
          onClick={() => onSelectCourse(course)}
          className="group relative animate-slide-up cursor-pointer"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* カード本体: ガラス効果とホバーアニメーション */}
          <div className="h-full p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm hover:shadow-xl dark:shadow-none bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white dark:hover:bg-gray-800 relative overflow-hidden">
            
            {/* 装飾: 背景の淡いグラデーション */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex items-start justify-between mb-4">
              {/* アイコン部分 */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Folder size={28} />
              </div>
              
              {/* 公開設定バッジ (右上に移動) */}
              {course.visibility && course.visibility !== 'private' && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                  course.visibility === 'public' 
                    ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                }`}>
                  {course.visibility === 'public' ? 'Public' : 'Link'}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {course.title}
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
              {course.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                {course.quizzes.length} sets inside
              </span>
              
              {/* アクションボタン群 (常に表示だが控えめに、ホバーで強調) */}
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleShare(course); }}
                  className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                  title="共有"
                >
                  <Share2 size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEditCourse(course); }}
                  className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                  title="編集"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                  title="削除"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 新規作成・インポートボタンエリア */}
      <div 
        className="flex flex-col gap-4 animate-slide-up"
        style={{ animationDelay: `${courses.length * 50}ms` }}
      >
        <button 
          onClick={onCreateCourse}
          className="flex-1 min-h-[140px] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
        >
          <div className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform mb-3">
            <Plus size={24} />
          </div>
          <span className="font-bold text-sm">新しい科目を作成</span>
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="h-16 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-green-600 hover:border-green-500 hover:shadow-md transition-all duration-300 gap-2 font-bold text-sm"
        >
          <Upload size={18} />
          <span>ファイルを読み込む</span>
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileSelect} />
      </div>
      

    </div>
  );
};

export default memo(FolderListView);
