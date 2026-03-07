import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

/**
 * Toast notification system.
 * Usage: const { showToast } = useToast();
 *        showToast('Success!', 'success');
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => {
                        setToasts(prev => prev.filter(t => t.id !== toast.id));
                    }} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const bgColor = {
        success: 'border-l-4 border-l-emerald-500 bg-emerald-500/10',
        error: 'border-l-4 border-l-red-500 bg-red-500/10',
        warning: 'border-l-4 border-l-amber-500 bg-amber-500/10',
        info: 'border-l-4 border-l-indigo-500 bg-indigo-500/10',
    }[toast.type] || 'border-l-4 border-l-indigo-500 bg-indigo-500/10';

    return (
        <div
            className={`glass-card px-5 py-3 min-w-[300px] max-w-[420px] flex items-center justify-between gap-3 transition-all duration-300 ${bgColor} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
        >
            <p className="text-sm text-[var(--color-text-primary)]">{toast.message}</p>
            <button
                onClick={onClose}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors text-lg leading-none cursor-pointer"
            >
                ×
            </button>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}
