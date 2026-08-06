import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CelebrationModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  onConfirm: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  title = '欢迎加入 LeapLunar04 创意社区！',
  subtitle = '会员账号创建成功，正在为您跳转至社区大厅...',
  onConfirm,
}) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onConfirm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, onConfirm]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#0057FF]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 bg-[#0057FF]/20 text-[#0057FF] border border-[#0057FF]/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0057FF]/20">
            <Sparkles className="w-8 h-8 animate-spin-slow" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{title}</h2>
          <p className="text-sm text-neutral-400 mb-8 leading-relaxed">{subtitle}</p>

          <div className="flex items-center justify-center gap-2 mb-6 text-xs text-neutral-500 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            将在 <span className="text-white font-bold">{countdown} 秒</span> 后自动跳转
          </div>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3.5 bg-[#0057FF] hover:bg-[#0046CC] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0057FF]/30 cursor-pointer"
          >
            立即进入社区
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
