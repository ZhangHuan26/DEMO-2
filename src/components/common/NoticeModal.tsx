import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Check, BellRing } from 'lucide-react';

export interface NoticeOptions {
  title?: string;
  message: string;
  code?: number | string;
  type?: 'warning' | 'info' | 'error' | 'success';
}

export const NoticeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState<NoticeOptions>({
    title: '提示',
    message: '',
    code: undefined,
    type: 'warning',
  });

  useEffect(() => {
    const handleShowNotice = (e: CustomEvent<NoticeOptions>) => {
      if (e.detail) {
        setNotice({
          title: e.detail.title || '操作提示',
          message: e.detail.message || '未知提示消息',
          code: e.detail.code,
          type: e.detail.type || 'warning',
        });
        setIsOpen(true);
      }
    };

    window.addEventListener('show-notice' as any, handleShowNotice as any);
    return () => {
      window.removeEventListener('show-notice' as any, handleShowNotice as any);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden transform transition-all scale-100">
        {/* Glow Accent Effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Header & Icon */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-wide">
              {notice.title || '关注提醒'}
            </h3>
            {notice.code !== undefined && (
              <span className="inline-block px-2.5 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-400 font-mono text-[11px] rounded-full">
                code: {notice.code}
              </span>
            )}
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed pt-1">
            {notice.message}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-2">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 px-4 bg-[#0057FF] hover:bg-blue-600 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-[#0057FF]/25 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>我知道了</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Export helper function to trigger from anywhere
export const showNoticeModal = (options: NoticeOptions) => {
  window.dispatchEvent(new CustomEvent('show-notice', { detail: options }));
};
