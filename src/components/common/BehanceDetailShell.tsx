import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X, ChevronLeft, ChevronRight, Share2, ThumbsUp, Star,
  MessageSquare, UserPlus, Eye, Flag, Check
} from 'lucide-react';
import { User } from '../../types';
import { resolveImageUrl } from '../../config/env';

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
  onPrev?: () => void;
  onNext?: () => void;
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
  onPrev,
  onNext,
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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/95 backdrop-blur-2xl flex flex-col font-sans text-white selection:bg-[#0057FF] selection:text-white animate-in fade-in duration-200">
      {/* 1. Top Fixed Black Navigation Header (Modal Header) */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-neutral-800/80 px-4 md:px-6 py-3 flex items-center justify-between shadow-2xl">
        {/* Left: Author Avatar, Title, Author Name & Follow Button */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Link to={`/users/${author?.id}`} className="relative group shrink-0">
            <img
              src={resolveImageUrl(author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
              alt={author?.nickName || 'Author'}
              className="w-10 h-10 rounded-full object-cover border border-neutral-700 group-hover:border-[#0057FF] transition-colors"
            />
            {author && !author.isFollowing && !isOwner && (
              <span className="absolute -bottom-0.5 -right-0.5 bg-[#0057FF] text-white rounded-full p-0.5 shadow-md">
                <UserPlus className="w-3 h-3" />
              </span>
            )}
          </Link>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-lg leading-snug">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Link to={`/users/${author?.id}`} className="hover:text-white font-medium truncate">
                {author?.nickName || '匿名创作者'}
              </Link>
              {author && !isOwner && (
                <>
                  <span className="text-neutral-600">•</span>
                  <button
                    onClick={onToggleFollow}
                    className={`text-xs font-bold transition-colors cursor-pointer ${
                      author.isFollowing ? 'text-neutral-400 hover:text-white' : 'text-[#0057FF] hover:text-blue-400'
                    }`}
                  >
                    {author.isFollowing ? '已关注' : '关注'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Links & Close X Button */}
        <div className="flex items-center gap-3 shrink-0">
          {!isOwner && onOpenChat && (
            <button
              onClick={onOpenChat}
              className="hidden sm:inline-flex px-4 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-md shadow-[#0057FF]/30"
            >
              聘请创作者
            </button>
          )}

          <button
            onClick={onShare}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium rounded-full border border-neutral-800 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>分享工作</span>
          </button>

          {/* Prominent Close X Modal Button */}
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 transition-colors cursor-pointer ml-1"
            title="关闭弹窗 (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Main Stage Media Display Canvas */}
      <div className="relative w-full bg-black min-h-[420px] md:min-h-[520px] flex items-center justify-center py-8 px-4 md:px-16 overflow-hidden">
        {/* Left Edge Flip Navigation */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 px-3.5 py-2.5 bg-black/70 hover:bg-black/95 text-neutral-300 hover:text-white text-xs font-bold rounded-full border border-neutral-800 backdrop-blur-md transition-all cursor-pointer shadow-2xl group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">上一步</span>
          </button>
        )}

        {/* Right Edge Flip Navigation */}
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 px-3.5 py-2.5 bg-black/70 hover:bg-black/95 text-neutral-300 hover:text-white text-xs font-bold rounded-full border border-neutral-800 backdrop-blur-md transition-all cursor-pointer shadow-2xl group"
          >
            <span className="hidden sm:inline">下一步</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Center Media Showcase (Strictly width-aligned with content below) */}
        <div className="max-w-4xl w-full mx-auto flex items-center justify-center relative px-2 sm:px-4">
          {mediaContent ? (
            mediaContent
          ) : coverImage ? (
            <img
              src={resolveImageUrl(coverImage)}
              alt={title}
              className="w-full h-auto max-h-[720px] object-cover rounded-2xl shadow-2xl border border-neutral-800/80"
            />
          ) : null}
        </div>
      </div>

      {/* Floating Bottom Card Bar Fixed Overlaying Page */}
      {showBottomBar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-[92%] bg-neutral-900/95 border border-neutral-800 backdrop-blur-2xl rounded-2xl p-3 px-5 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.9)] transition-all">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={resolveImageUrl(coverImage || author?.avatar)}
              alt="Mini Cover"
              className="w-12 h-12 rounded-xl object-cover border border-neutral-700 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-sm leading-tight">{title}</h4>
              <p className="text-xs text-neutral-400 truncate mt-0.5">{author?.nickName || '创作者'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {author && !isOwner && (
              <button
                onClick={onToggleFollow}
                className="px-3.5 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                {author.isFollowing ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{author.isFollowing ? '已关注' : '关注'}</span>
              </button>
            )}

            <button
              onClick={onToggleLike}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isLiked
                  ? 'bg-[#0057FF] text-white shadow-lg shadow-[#0057FF]/40'
                  : 'bg-neutral-800 text-white hover:bg-neutral-700'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5 fill-current" />
              <span>赞 {likeCount > 0 ? likeCount : ''}</span>
            </button>

            <button
              onClick={onToggleFavorite}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isFavorited
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40'
                  : 'bg-neutral-800 text-white hover:bg-neutral-700'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>收藏 {favoriteCount > 0 ? favoriteCount : ''}</span>
            </button>

            <button
              onClick={() => setShowBottomBar(false)}
              className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
              title="关闭浮框"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Floating Right Action Sidebar (Vertical Pill with Like, Favorite, Chat, Share, Report) */}
      <div className="fixed right-3 md:right-8 lg:right-12 xl:right-16 top-1/2 -translate-y-1/2 z-40 bg-neutral-900/95 border border-neutral-800 backdrop-blur-2xl rounded-full py-4 px-2.5 flex flex-col items-center gap-4 text-white shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
        {/* Author Avatar with Plus Badge */}
        <Link to={`/users/${author?.id}`} className="relative group flex flex-col items-center" title="创作者主页">
          <img
            src={resolveImageUrl(author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
            alt={author?.nickName || 'Author'}
            className="w-12 h-12 rounded-full object-cover border-2 border-neutral-700 group-hover:border-[#0057FF] transition-colors"
          />
          {author && !author.isFollowing && !isOwner && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFollow?.();
              }}
              className="absolute -bottom-1 -right-1 bg-[#0057FF] hover:bg-[#0046CC] text-white rounded-full p-1 shadow-md cursor-pointer"
              title="关注创作者"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Hover Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-2xl z-50">
            {author?.nickName || '创作者'}
          </div>
        </Link>

        <div className="w-6 h-px bg-neutral-800" />

        {/* Message / Chat */}
        {onOpenChat && (
          <button
            onClick={onOpenChat}
            className="relative group flex flex-col items-center gap-1 text-neutral-300 hover:text-[#0057FF] transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-neutral-800 group-hover:bg-[#0057FF]/20 flex items-center justify-center transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-neutral-400 font-medium group-hover:text-white">私信</span>

            {/* Hover Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-2xl z-50">
              发送私信
            </div>
          </button>
        )}

        {/* Share */}
        <button
          onClick={onShare}
          className="relative group flex flex-col items-center gap-1 text-neutral-300 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-neutral-800 group-hover:bg-emerald-400/20 flex items-center justify-center transition-colors">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-neutral-400 font-medium group-hover:text-white">分享</span>

          {/* Hover Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-2xl z-50">
            分享此作品
          </div>
        </button>

        {/* Appreciate Blue ThumbsUp Button */}
        <button
          onClick={onToggleLike}
          className={`relative group flex flex-col items-center gap-1 transition-all cursor-pointer ${
            isLiked ? 'text-[#0057FF]' : 'text-neutral-300 hover:text-[#0057FF]'
          }`}
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all ${
            isLiked
              ? 'bg-[#0057FF] text-white shadow-[#0057FF]/40'
              : 'bg-[#0057FF]/20 text-[#0057FF] group-hover:bg-[#0057FF] group-hover:text-white'
          }`}>
            <ThumbsUp className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[10px] font-bold text-white">{likeCount}</span>

          {/* Hover Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-2xl z-50">
            {isLiked ? '已赞赏' : '欣赏赞赏'}
          </div>
        </button>

        {/* Favorite Yellow Star Button (Requested by User) */}
        <button
          onClick={onToggleFavorite}
          className={`relative group flex flex-col items-center gap-1 transition-all cursor-pointer ${
            isFavorited ? 'text-amber-400' : 'text-neutral-300 hover:text-amber-400'
          }`}
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all ${
            isFavorited
              ? 'bg-amber-500 text-white shadow-amber-500/40'
              : 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white'
          }`}>
            <Star className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[10px] font-bold text-white">{favoriteCount}</span>

          {/* Hover Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-2xl z-50">
            {isFavorited ? '已收藏' : '收藏作品'}
          </div>
        </button>

        {/* Report (Same size as other icons) */}
        {onReport && (
          <button
            onClick={onReport}
            className="relative group flex flex-col items-center gap-1 text-neutral-300 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-neutral-800 group-hover:bg-rose-500/20 flex items-center justify-center transition-colors">
              <Flag className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-neutral-400 font-medium group-hover:text-rose-400">举报</span>

            {/* Hover Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-2xl z-50">
              举报作品
            </div>
          </button>
        )}
      </div>

      {/* 4. Body Content Area Below Stage (Matched max-w-4xl width with cover image) */}
      <div className="w-full bg-neutral-950 text-white border-t border-neutral-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
          {children}
        </div>
      </div>
    </div>
  );
};


