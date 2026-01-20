import React from 'react';
import { Info, X } from 'lucide-react'; // ← ここが忘れがちなポイントだ！

const ChangelogModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center"><Info size={24} className="mr-2 text-blue-600" /> 更新情報</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500 dark:text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center mb-2"><span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mr-2">Latest</span><h3 className="font-bold text-lg text-gray-800 dark:text-white">v2.1.0 - 多機能化アップデート</h3></div>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-1">
              <li>複数選択（チェックボックス）形式の問題に対応しました。</li>
              <li>選択肢の数を自由に設定できるようになりました（2つ以上）。</li>
              <li>記述式問題で複数の正解（別解）を設定できるようになりました。</li>
              <li>既存のデータ構造を新形式へ自動変換する機能を追加しました。</li>
              <li>UIの微調整（フォルダ名の表示崩れ修正など）を行いました。</li>
            </ul>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h3 className="font-bold text-md text-gray-700 dark:text-gray-200 mb-2">v2.0.0 - クリエイター機能実装</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-1">
              <li>自分でフォルダや問題セットを作成・編集できる機能を追加しました。</li>
              <li>画像付き問題の作成に対応しました。</li>
              <li>ダークモード/ライトモードの手動・システム切り替えに対応しました。</li>
            </ul>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h3 className="font-bold text-md text-gray-700 dark:text-gray-200 mb-2">v1.2.0 - 学習機能強化</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-1">
              <li>実力診断模試（ランダム出題）機能を追加しました。</li>
              <li>間違えた問題を復習できる「弱点克服モード」を追加しました。</li>
              <li>学習履歴の保存機能を追加しました。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;