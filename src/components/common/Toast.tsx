import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

let toastId = 0;

// Helper: trigger toast from anywhere
export const showToast = (options: ToastOptions) => {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: options }));
};

export const Toast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleShowToast = (e: CustomEvent<ToastOptions>) => {
      if (e.detail?.message) {
        const id = ++toastId;
        const duration = e.detail.duration ?? 3000;
        setToasts(prev => [...prev, { ...e.detail, id }]);
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
      }
    };

    window.addEventListener('show-toast' as any, handleShowToast as any);
    return () => {
      window.removeEventListener('show-toast' as any, handleShowToast as any);
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold max-w-sm animate-in slide-in-from-top-2 fade-in duration-200 ${
            toast.type === 'success'
              ? 'bg-neutral-900 text-white border-neutral-700 shadow-black/30'
              : toast.type === 'error'
              ? 'bg-rose-950/95 text-white border-rose-800/70 shadow-rose-950/30'
              : toast.type === 'warning'
              ? 'bg-amber-950/95 text-white border-amber-800/70 shadow-amber-950/30'
              : 'bg-neutral-900 text-white border-neutral-700 shadow-black/30'
          }`}
        >
          {getIcon(toast.type || 'info')}
          <span className="leading-relaxed">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-1 p-0.5 text-current/50 hover:text-current/100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;