// src/components/layout/ChangelogModal.tsx
import React from 'react';
import { Info, X } from 'lucide-react';
// ↓ さっき作ったデータをインポート
import { CHANGELOG_DATA } from '../../data/changelog';

interface ChangelogModalProps {
  onClose: () => void;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <Info size={24} className="mr-2 text-blue-600" /> 更新情報
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* ↓ データをマップして自動表示！ */}
          {CHANGELOG_DATA.map((log, index) => (
            <div key={log.version} className={index !== 0 ? "border-t border-gray-100 dark:border-gray-700 pt-4" : ""}>
              <div className="flex items-center mb-2">
                {/* 最新（一番上）の時だけバッジを表示 */}
                {index === 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mr-2">Latest</span>
                )}
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                  {log.version} - {log.title}
                </h3>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-1">
                {log.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;
