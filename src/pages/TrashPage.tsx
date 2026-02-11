// src/pages/TrashPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, RotateCcw, XCircle, Folder, FileText, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { TrashItem, Course, Quiz } from '../types';
import { useToast } from '../context/ToastContext';
import { CONFIRM, SUCCESS } from '../utils/errorMessages';

interface TrashPageProps {
  trash: TrashItem[];
  onRestore: (trashId: string) => Promise<void>;
  onDelete: (trashId: string) => Promise<void>;
  onEmptyTrash: () => Promise<void>;
}

const TRASH_RETENTION_DAYS = 30;

const TrashPage: React.FC<TrashPageProps> = ({ trash, onRestore, onDelete, onEmptyTrash }) => {
  const navigate = useNavigate();
  const { showConfirm, showSuccess } = useToast();

  const getRemainingDays = (expiresAt: number): number => {
    const now = Date.now();
    const remaining = expiresAt - now;
    return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
  };

  const getProgressPercentage = (deletedAt: number, expiresAt: number): number => {
    const total = expiresAt - deletedAt;
    const elapsed = Date.now() - deletedAt;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRestore = async (item: TrashItem) => {
    await onRestore(item.id);
  };

  const handleDelete = async (item: TrashItem) => {
    const confirmed = await showConfirm(CONFIRM.TRASH_PERMANENT_DELETE, { type: 'danger' });
    if (confirmed) {
      await onDelete(item.id);
      showSuccess(SUCCESS.TRASH_DELETED);
    }
  };

  const handleEmptyTrash = async () => {
    const confirmed = await showConfirm(CONFIRM.TRASH_EMPTY, { type: 'danger' });
    if (confirmed) {
      await onEmptyTrash();
      showSuccess(SUCCESS.TRASH_EMPTIED);
    }
  };

  const getItemTitle = (item: TrashItem): string => {
    return (item.data as Course | Quiz).title || '無題';
  };

  const getItemDescription = (item: TrashItem): string => {
    if (item.type === 'course') {
      const course = item.data as Course;
      return `${course.quizzes?.length || 0} 問題セット`;
    }
    if (item.type === 'quiz') {
      const quiz = item.data as Quiz;
      return `${quiz.questions?.length || 0} 問`;
    }
    return '';
  };

  // 残日数でソート（残り少ないものが上に）
  const sortedTrash = [...trash].sort((a, b) => a.expiresAt - b.expiresAt);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white">ゴミ箱</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {trash.length > 0 ? `${trash.length} アイテム` : '空です'}
              </p>
            </div>
          </div>
        </div>

        {trash.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-bold"
          >
            <Trash2 size={16} />
            ゴミ箱を空にする
          </button>
        )}
      </div>

      {/* 注意書き */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-300">
          <p className="font-bold mb-1">ゴミ箱について</p>
          <p>削除されたアイテムは <strong>{TRASH_RETENTION_DAYS}日間</strong> ゴミ箱に保存されます。{TRASH_RETENTION_DAYS}日を過ぎると自動的に完全削除され、復元できなくなります。</p>
        </div>
      </div>

      {/* ゴミ箱が空の場合 */}
      {trash.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex p-6 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Trash2 size={48} className="text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500 mb-2">ゴミ箱は空です</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500">削除されたアイテムはここに表示されます</p>
        </div>
      )}

      {/* アイテムリスト */}
      <div className="space-y-3">
        {sortedTrash.map((item) => {
          const remainingDays = getRemainingDays(item.expiresAt);
          const progress = getProgressPercentage(item.deletedAt, item.expiresAt);
          const isUrgent = remainingDays <= 3;

          return (
            <div
              key={item.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* アイコン */}
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                  item.type === 'course'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                    : 'bg-purple-50 dark:bg-purple-900/20 text-purple-500'
                }`}>
                  {item.type === 'course' ? <Folder size={20} /> : <FileText size={20} />}
                </div>

                {/* コンテンツ */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 dark:text-white text-sm truncate">
                        {getItemTitle(item)}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.type === 'course' ? '科目フォルダ' : '問題セット'}
                        {item.type === 'quiz' && item.originPath.courseTitle && (
                          <span> · {item.originPath.courseTitle}</span>
                        )}
                        <span className="mx-1">·</span>
                        {getItemDescription(item)}
                      </p>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleRestore(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-xs font-bold"
                        title="復元する"
                      >
                        <RotateCcw size={14} />
                        復元
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-xs font-bold"
                        title="完全に削除"
                      >
                        <XCircle size={14} />
                        削除
                      </button>
                    </div>
                  </div>

                  {/* 期限情報 */}
                  <div className="mt-3 flex items-center gap-2">
                    <Clock size={12} className={isUrgent ? 'text-red-500' : 'text-gray-400'} />
                    <span className={`text-xs font-medium ${
                      isUrgent
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {remainingDays === 0
                        ? 'まもなく削除されます'
                        : `あと ${remainingDays} 日で完全削除`
                      }
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                      {formatDate(item.deletedAt)} に削除
                    </span>
                  </div>

                  {/* 進捗バー */}
                  <div className="mt-2 w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUrgent
                          ? 'bg-gradient-to-r from-red-400 to-red-500'
                          : 'bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(TrashPage);
