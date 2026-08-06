import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AppreciateButtonProps {
  isLiked?: boolean;
  likeCount: number;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const AppreciateButton: React.FC<AppreciateButtonProps> = ({
  isLiked = false,
  likeCount,
  onToggle,
  size = 'md',
}) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onToggle();
    if (!isLiked) {
      const id = Date.now();
      const rect = e.currentTarget.getBoundingClientRect();
      setParticles((prev) => [...prev, { id, x: rect.width / 2, y: 0 }]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 1000);
    }
  };

  const buttonSizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-3 font-bold',
  };

  return (
    <div className="relative inline-block">
      {/* Floating +1 Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -40, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 -top-6 text-[#0057FF] font-black text-sm pointer-events-none select-none drop-shadow-[0_0_8px_rgba(0,87,255,0.8)]"
          >
            +1 💙
          </motion.span>
        ))}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleClick}
        className={`relative overflow-hidden rounded-full font-semibold flex items-center justify-center transition-all cursor-pointer shadow-lg ${
          buttonSizes[size]
        } ${
          isLiked
            ? 'bg-[#0057FF] text-white ring-4 ring-[#0057FF]/30 shadow-[#0057FF]/40'
            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
        }`}
      >
        <ThumbsUp className={`transition-transform duration-300 ${isLiked ? 'fill-white scale-110 -rotate-12' : 'w-4 h-4'}`} />
        <span>{isLiked ? '已赞过' : '点赞支持'}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${isLiked ? 'bg-white/20 text-white' : 'bg-neutral-900 text-neutral-400'}`}>
          {likeCount}
        </span>
      </motion.button>
    </div>
  );
};
