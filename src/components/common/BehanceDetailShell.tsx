import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X, Share2, ThumbsUp, Star,
  MessageSquare, UserPlus, Eye, Flag, Check
} from 'lucide-react';
import { User } from '../../types';
import { resolveImageUrl } from '../../config/env';
import { openAuthorModal } from './AuthorProfileModal';

interface BehanceDetailShellProps {
  title: string;
  categoryName?: string;
  author?: User | null;
  coverImage?: string;
  workType?: 'article' | 'video' | 'file';
  isLiked?: boolean;
  likeCount?: number;
  isFavorited?: boolean;
  favoriteCount?: number;
  viewCount?: number;
  isOwner?: boolean;
  onToggleLike?: () => void;
  onToggleFavorite?: () => void;
  onToggleFollow?: () => void;
  onShare?: () => void;
  onOpenChat?: () => void;
  onReport?: () => void;
  children?: React.ReactNode;
  mediaContent?: React.ReactNode;
  tools?: string[];
}

export const BehanceDetailShell: React.FC<BehanceDetailShellProps> = ({
  title,
  categoryName,
  author,
  coverImage,
  workType = 'article',
  isLiked = false,
  likeCount = 0,
  isFavorited = false,
  favoriteCount = 0,
  viewCount = 0,
  isOwner = false,
  onToggleLike,
  onToggleFavorite,
  onToggleFollow,
  onShare,
  onOpenChat,
  onReport,
  children,
  mediaContent,
}) => {
  const navigate = useNavigate();
  const [showBottomBar, setShowBottomBar] = useState(true);

  // 监听按键 Escape 触发关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 md:bg-[#0a0a0c] flex flex-col font-sans text-white selection:bg-[#0057FF] selection:text-white animate-in fade-in duration-200">
      {/* Floating Top-Right Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-5 right-5 z-[200] p-3 text-neutral-300 hover:text-white bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 rounded-full backdrop-blur-2xl transition-all cursor-pointer shadow-2xl group hover:scale-105 active:scale-95"
        title="关闭作品弹窗 (Esc)"
      >
        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Main Scrollable Workspace Container */}
      <div className="flex-1 overflow-y-auto min-h-0 relative bg-[#0a0a0c]">
        {/* 2. Main Stage Media Display Canvas */}
        <div className="relative w-full bg-gradient-to-b from-neutral-900/80 via-neutral-950 to-[#0a0a0c] min-h-[420px] md:min-h-[520px] flex items-center justify-center py-10 px-4 md:px-16 overflow-hidden border-b border-neutral-800/80">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,87,255,0.08)_0,transparent_70%)] pointer-events-none" />

          {/* Center Media Showcase (Fixed width, height auto according to ratio, no cropping) */}
          <div className="max-w-4xl w-full mx-auto flex items-center justify-center relative px-2 sm:px-4 z-10">
            {mediaContent ? (
              mediaContent
            ) : coverImage ? (
              <img
                src={resolveImageUrl(coverImage)}
                alt={title}
                className="w-full h-auto rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-neutral-800/90"
              />
            ) : null}
          </div>
        </div>

        {/* Body Content Area Below Stage */}
        <div className="w-full bg-[#0a0a0c] text-white pb-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-10">
            {children}
          </div>
        </div>
      </div>

      {/* Floating Bottom Card Bar Fixed Overlaying Page */}
      {showBottomBar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-[94%] bg-neutral-900/90 border border-neutral-800 backdrop-blur-2xl rounded-full p-3 px-6 flex items-center justify-between gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all">
          {/* Left: Author Info & Author Actions */}
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={() => author?.id && openAuthorModal(author.id)}
              className="shrink-0 cursor-pointer"
            >
              <img
                src={resolveImageUrl(author?.avatar || coverImage)}
                alt={author?.nickName || title}
                className="w-11 h-11 rounded-full object-cover border border-neutral-700 shrink-0 hover:border-[#0057FF] transition-colors"
              />
            </button>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white truncate max-w-[140px] sm:max-w-xs leading-tight">{title}</h4>
              <button
                onClick={() => author?.id && openAuthorModal(author.id)}
                className="text-xs text-neutral-400 hover:text-white truncate mt-0.5 cursor-pointer text-left block"
              >
                {author?.nickName || '创作者'}
              </button>
            </div>
          </div>

          {/* Right: Author Action Buttons (关注作者 & 私信作者 & Close) */}
          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            {author && (
              <button
                onClick={() => {
                  if (isOwner) {
                    alert('这是您自己发布的作品');
                  } else if (onToggleFollow) {
                    onToggleFollow();
                  }
                }}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                  author.isFollowing
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                    : 'bg-[#0057FF] hover:bg-blue-600 text-white shadow-[#0057FF]/30'
                }`}
              >
                {author.isFollowing ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{author.isFollowing ? '已关注' : '关注作者'}</span>
              </button>
            )}

            {author && onOpenChat && (
              <button
                onClick={() => {
                  if (isOwner) {
                    alert('不能与自己对话');
                  } else {
                    onOpenChat();
                  }
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs md:text-sm font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <MessageSquare className="w-4 h-4 text-[#0057FF]" />
                <span>私信作者</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={() => setShowBottomBar(false)}
              className="text-neutral-500 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 transition-colors ml-1 cursor-pointer"
              title="关闭浮框"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Floating Right Action Sidebar (Vertical Pill matching screenshot style) */}
      <div className="fixed right-3 md:right-8 lg:right-12 xl:right-16 top-1/2 -translate-y-1/2 z-50 bg-neutral-900/90 border border-neutral-800 backdrop-blur-2xl rounded-full py-5 px-3 flex flex-col items-center gap-4 text-neutral-200 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Author Avatar with Plus Badge */}
        <div className="relative group flex flex-col items-center">
          <button
            onClick={() => author?.id && openAuthorModal(author.id)}
            className="cursor-pointer"
            title="查看创作者弹窗"
          >
            <img
              src={resolveImageUrl(author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
              alt={author?.nickName || 'Author'}
              className="w-12 h-12 rounded-full object-cover border-2 border-neutral-200 group-hover:border-[#0057FF] transition-colors"
            />
          </button>
          {author && !author.isFollowing && !isOwner && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFollow?.();
              }}
              className="absolute -bottom-1 -right-1 bg-[#0057FF] hover:bg-[#0046CC] text-white rounded-full p-1 shadow-md cursor-pointer z-10"
              title="关注创作者"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Hover Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
            {author?.nickName || '创作者'}
          </div>
        </div>

        <div className="w-6 h-px bg-neutral-800" />

        {/* Message / Chat */}
        {onOpenChat && (
          <button
            onClick={() => {
              if (isOwner) {
                alert('不能与自己对话');
              } else {
                onOpenChat();
              }
            }}
            className="relative group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#0057FF] transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-neutral-800 group-hover:bg-[#0057FF]/20 flex items-center justify-center transition-colors border border-neutral-700">
              <MessageSquare className="w-5 h-5 text-neutral-300 group-hover:text-[#0057FF]" />
            </div>
            <span className="text-[10px] text-neutral-400 font-medium group-hover:text-white">私信</span>

            {/* Hover Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
              发送私信
            </div>
          </button>
        )}

        {/* Share */}
        <button
          onClick={onShare}
          className="relative group flex flex-col items-center gap-1 text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-neutral-800 group-hover:bg-emerald-950/50 flex items-center justify-center transition-colors border border-neutral-700">
            <Share2 className="w-5 h-5 text-neutral-300 group-hover:text-emerald-400" />
          </div>
          <span className="text-[10px] text-neutral-400 font-medium group-hover:text-white">分享</span>

          {/* Hover Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
            分享此作品
          </div>
        </button>

        {/* Appreciate Blue ThumbsUp Button */}
        <button
          onClick={onToggleLike}
          className={`relative group flex flex-col items-center gap-1 transition-all cursor-pointer ${
            isLiked ? 'text-[#0057FF]' : 'text-neutral-400 hover:text-[#0057FF]'
          }`}
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all border border-neutral-700 ${
            isLiked
              ? 'bg-[#0057FF] text-white shadow-[#0057FF]/40 border-[#0057FF]'
              : 'bg-[#0057FF]/15 text-[#0057FF] group-hover:bg-[#0057FF] group-hover:text-white'
          }`}>
            <ThumbsUp className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[10px] font-bold text-neutral-300">{likeCount}</span>

          {/* Hover Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
            {isLiked ? '已赞赏' : '欣赏赞赏'}
          </div>
        </button>

        {/* Favorite Yellow Star Button */}
        <button
          onClick={onToggleFavorite}
          className={`relative group flex flex-col items-center gap-1 transition-all cursor-pointer ${
            isFavorited ? 'text-amber-500' : 'text-neutral-400 hover:text-amber-500'
          }`}
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all border border-neutral-700 ${
            isFavorited
              ? 'bg-amber-500 text-white shadow-amber-500/40 border-amber-500'
              : 'bg-amber-500/15 text-amber-500 group-hover:bg-amber-500 group-hover:text-white'
          }`}>
            <Star className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[10px] font-bold text-neutral-300">{favoriteCount}</span>

          {/* Hover Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
            {isFavorited ? '已收藏' : '收藏作品'}
          </div>
        </button>

        {/* Report */}
        {onReport && (
          <button
            onClick={onReport}
            className="relative group flex flex-col items-center gap-1 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-neutral-800 group-hover:bg-rose-950/50 flex items-center justify-center transition-colors border border-neutral-700">
              <Flag className="w-5 h-5 text-neutral-300 group-hover:text-rose-400" />
            </div>
            <span className="text-[10px] text-neutral-400 font-medium group-hover:text-rose-400">举报</span>

            {/* Hover Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
              举报作品
            </div>
          </button>
        )}
      </div>
    </div>
  );
};


