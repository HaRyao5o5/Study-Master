// src/context/ToastContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Toast, { ToastAction } from '../components/common/Toast';
import ConfirmDialog from '../components/common/ConfirmDialog';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
    type?: ToastType;
    duration?: number;
    action?: ToastAction;
}

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
    action?: ToastAction;
}

interface ConfirmDialogState {
    title: string;
    message: string;
    type: 'warning' | 'info' | 'danger';
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
}

interface ToastContextType {
    showToast: (message: string, typeOrOptions?: ToastType | ToastOptions, duration?: number) => void;
    showSuccess: (message: string, options?: number | ToastOptions) => void;
    showError: (message: string, options?: number | ToastOptions) => void;
    showWarning: (message: string, options?: number | ToastOptions) => void;
    showInfo: (message: string, options?: number | ToastOptions) => void;
    showConfirm: (message: string, options?: any) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast通知を管理するプロバイダーコンポーネント
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

    /**
     * Toast通知を表示する
     */
    const showToast = useCallback((message: string, typeOrOptions: ToastType | ToastOptions = 'info', duration: number = 5000) => {
        const id = String(Date.now() + Math.random());
        
        let type: ToastType = 'info';
        let action: ToastAction | undefined;
        let finalDuration = duration;

        if (typeof typeOrOptions === 'object' && typeOrOptions !== null) {
            type = typeOrOptions.type || 'info';
            finalDuration = typeOrOptions.duration || duration;
            action = typeOrOptions.action;
        } else {
            type = typeOrOptions;
        }

        const newToast: ToastItem = { id, message, type, duration: finalDuration, action };

        setToasts(prev => [...prev, newToast]);
    }, []);

    /**
     * 成功通知を表示
     */
    const showSuccess = useCallback((message: string, options?: number | ToastOptions) => {
        const toastOptions: ToastOptions = typeof options === 'number' ? { duration: options } : (options || {});
        showToast(message, { ...toastOptions, type: 'success' });
    }, [showToast]);

    /**
     * エラー通知を表示
     */
    const showError = useCallback((message: string, options?: number | ToastOptions) => {
        const toastOptions: ToastOptions = typeof options === 'number' ? { duration: options } : (options || {});
        showToast(message, { ...toastOptions, type: 'error' });
    }, [showToast]);

    /**
     * 警告通知を表示
     */
    const showWarning = useCallback((message: string, options?: number | ToastOptions) => {
        const toastOptions: ToastOptions = typeof options === 'number' ? { duration: options } : (options || {});
        showToast(message, { ...toastOptions, type: 'warning' });
    }, [showToast]);

    /**
     * 情報通知を表示
     */
    const showInfo = useCallback((message: string, options?: number | ToastOptions) => {
        const toastOptions: ToastOptions = typeof options === 'number' ? { duration: options } : (options || {});
        showToast(message, { ...toastOptions, type: 'info' });
    }, [showToast]);

    /**
     * 確認ダイアログを表示（Promiseベース）
     */
    const showConfirm = useCallback((message: string, options: any = {}): Promise<boolean> => {
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
    const closeToast = useCallback((id: string) => {
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
                                id={toast.id}
                                message={toast.message}
                                type={toast.type}
                                duration={toast.duration}
                                onClose={closeToast}
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
export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
