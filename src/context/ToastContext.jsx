// src/context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Toast from '../components/common/Toast';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ToastContext = createContext();

/**
 * Toast通知を管理するプロバイダーコンポーネント
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState(null);

    /**
     * Toast通知を表示する
     * @param {string} message - 表示するメッセージ
     * @param {('success'|'error'|'warning'|'info')} type - 通知のタイプ
     * @param {number} duration - 表示時間（ミリ秒）、0で自動非表示なし
     */
    const showToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);
    }, []);

    /**
     * 成功通知を表示
     */
    const showSuccess = useCallback((message, duration) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    /**
     * エラー通知を表示
     */
    const showError = useCallback((message, duration) => {
        showToast(message, 'error', duration);
    }, [showToast]);

    /**
     * 警告通知を表示
     */
    const showWarning = useCallback((message, duration) => {
        showToast(message, 'warning', duration);
    }, [showToast]);

    /**
     * 情報通知を表示
     */
    const showInfo = useCallback((message, duration) => {
        showToast(message, 'info', duration);
    }, [showToast]);

    /**
     * 確認ダイアログを表示（Promiseベース）
     * @param {string} message - 確認メッセージ
     * @param {Object} options - オプション設定
     * @returns {Promise<boolean>} - ユーザーの選択
     */
    const showConfirm = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            setConfirmDialog({
                title: options.title || '確認',
                message,
                type: options.type || 'warning',
                confirmText: options.confirmText || '実行',
                cancelText: options.cancelText || 'キャンセル',
                onConfirm: () => {
                    setConfirmDialog(null);
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmDialog(null);
                    resolve(false);
                }
            });
        });
    }, []);

    /**
     * 特定のToastを閉じる
     */
    const closeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo, showConfirm }}>
            {children}
            {createPortal(
                <div 
                    className="fixed top-4 right-4 z-[9999] space-y-2 flex flex-col items-end pointer-events-none"
                    style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999 }}
                >
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto w-full max-w-md">
                            <Toast
                                message={toast.message}
                                type={toast.type}
                                duration={toast.duration}
                                onClose={() => closeToast(toast.id)}
                            />
                        </div>
                    ))}
                </div>,
                document.body
            )}
            {confirmDialog && <ConfirmDialog {...confirmDialog} />}
        </ToastContext.Provider>
    );
}

/**
 * Toast機能を使用するためのカスタムフック
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
