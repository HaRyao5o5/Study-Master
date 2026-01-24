// src/components/common/ConfirmDialog.jsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * 確認ダイアログコンポーネント
 * browser confirm()の代わりに使用する
 */
const ConfirmDialog = ({ title, message, onConfirm, onCancel, confirmText = '実行', cancelText = 'キャンセル', type = 'warning' }) => {
    const typeStyles = {
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500',
        danger: 'bg-red-50 dark:bg-red-900/20 border-red-500',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
    };

    const buttonStyles = {
        warning: 'bg-yellow-600 hover:bg-yellow-700',
        danger: 'bg-red-600 hover:bg-red-700',
        info: 'bg-blue-600 hover:bg-blue-700'
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 animate-fade-in">
            <div className="glass max-w-md w-full mx-4 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-slide-up">
                {/* Header */}
                <div className={`${typeStyles[type]} border-l-4 rounded-t-2xl p-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-100 dark:bg-red-900/50' : type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                            <AlertTriangle size={20} className={type === 'danger' ? 'text-red-600' : type === 'warning' ? 'text-yellow-600' : 'text-blue-600'} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="p-4 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2.5 rounded-xl font-bold text-white ${buttonStyles[type]} transition-colors shadow-lg`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
