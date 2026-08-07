import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Share2, Bookmark, UserPlus, UserCheck, Flag, Trash2, Send, Heart, Eye,
  ArrowLeft, MoreHorizontal, Pencil, Globe, Lock, Clock, Sparkles, Tag,
  ThumbsUp, Star, MessageSquare, Check
} from 'lucide-react';

import { Article, Comment, User } from '../../types';
import { articlesApi } from '../../api/articles';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/common/Toast';
import { formatPublishTime } from '../../utils/dateUtils';
import { ReportModal } from '../../components/common/ReportModal';
import { ChatDrawer } from '../../components/user/ChatDrawer';
import { resolveImageUrl } from '../../config/env';
import { BehanceDetailShell } from '../../components/common/BehanceDetailShell';
import { LikeFavoriteAvatarWall } from '../../components/common/LikeFavoriteAvatarWall';

export const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);

  // Interaction Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: number; id: number }>({ type: 0, id: Number(id) });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<User | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadDetail = async () => {
      setLoading(true);
      try {
        const item = await articlesApi.getArticleById(Number(id));
        setArticle(item);
        const comms = await articlesApi.getComments(Number(id));
        setComments(comms);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-xs text-neutral-500">
        <Sparkles className="w-5 h-5 text-[#0057FF] animate-spin mr-2" />
        正在加载作品画板...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-xs text-neutral-500 space-y-4">
        <p>未找到该作品或该作品已被下架</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-xl hover:bg-neutral-200 transition-colors"
        >
          返回上一页
        </button>
      </div>
    );
  }

  const isOwner = user?.id === article.author?.id;
  const canEditOrDelete = isOwner || user?.role === 1;

  const handleToggleLike = async () => {
    if (!article) return;
    try {
      if (article.isLiked) {
        await articlesApi.unlikeArticle(article.id);
        setArticle(prev => prev ? { ...prev, isLiked: false, likeCount: Math.max(0, prev.likeCount - 1) } : null);
      } else {
        await articlesApi.likeArticle(article.id);
        setArticle(prev => prev ? { ...prev, isLiked: true, likeCount: prev.likeCount + 1 } : null);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleFavorite = async () => {
    if (!article) return;
    try {
      if (article.isFavorited) {
        await articlesApi.unfavoriteArticle(article.id);
        setArticle(prev => prev ? { ...prev, isFavorited: false, favoriteCount: Math.max(0, prev.favoriteCount - 1) } : null);
      } else {
        await articlesApi.favoriteArticle(article.id);
        setArticle(prev => prev ? { ...prev, isFavorited: true, favoriteCount: prev.favoriteCount + 1 } : null);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleFollow = async () => {
    if (!article?.author) return;
    const isCurrentlyFollowing = !!article.author.isFollowing;
    const nextFollowing = !isCurrentlyFollowing;
    setArticle(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: nextFollowing } } : prev);

    try {
      if (isCurrentlyFollowing) {
        await authApi.unfollowUser(article.author.id);
      } else {
        const res = await authApi.followUser(article.author.id);
        if (res && res.code === 40900) {
          // Already handled notice modal
          setArticle(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: true } } : prev);
        }
      }
    } catch (err: any) {
      setArticle(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: isCurrentlyFollowing } } : prev);
      const resCode = err?.response?.data?.code || err?.code;
      if (resCode !== 40900 && !err?.message?.includes('已关注')) {
        showToast({ message: err?.response?.data?.message || err?.message || '操作失败，请重试', type: 'error' });
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !article) return;
    try {
      const created = await articlesApi.createComment(article.id, {
        content: newCommentText,
        rootId: replyingTo?.rootId || replyingTo?.id,
        replyToId: replyingTo?.id,
        parentId: replyingTo?.id,
      });
      const freshComments = await articlesApi.getComments(article.id);
      if (freshComments && freshComments.length > 0) {
        setComments(freshComments);
      } else if (created && created.content) {
        setComments(prev => [created, ...prev]);
      }
      setNewCommentText('');
      setReplyingTo(null);
    } catch {
      showToast({ message: '发表评论失败', type: 'error' });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('确定要删除这条评论吗？')) return;
    try {
      await articlesApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch {
      // ignore
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast({ message: '作品链接已成功复制到剪贴板！', type: 'success' });
  };

  return (
    <BehanceDetailShell
      title={article.title}
      categoryName={article.category?.name || article.categoryName}
      author={article.author}
      coverImage={article.coverImage}
      workType="article"
      isLiked={article.isLiked}
      likeCount={article.likeCount}
      isFavorited={article.isFavorited}
      favoriteCount={article.favoriteCount}
      viewCount={article.viewCount}
      isOwner={isOwner}
      onToggleLike={handleToggleLike}
      onToggleFavorite={handleToggleFavorite}
      onToggleFollow={handleToggleFollow}
      onShare={handleShare}
      onOpenChat={() => {
        setChatTarget(article.author || null);
        setIsChatOpen(true);
      }}
      onReport={() => {
        setReportTarget({ type: 0, id: article.id });
        setIsReportOpen(true);
      }}
    >
      {/* Main Details Body */}
      <div className="space-y-10 text-white">
        {/* Title, Category & Summary Header */}
        <div className="space-y-6 border-b border-neutral-800/80 pb-8">
          {/* Top Metadata Row: Category & Views */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0057FF]/20 text-[#0057FF] text-xs font-extrabold rounded-full border border-[#0057FF]/30 shadow-xs">
                <Tag className="w-3.5 h-3.5 text-[#0057FF]" />
                {article.category?.name || article.categoryName || '图文视觉设计'}
              </span>
            </div>

            {/* View Count Stat Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 rounded-full border border-neutral-800 text-xs text-neutral-300 font-mono shadow-xs">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-white font-bold">{article.viewCount}</span>
              <span className="text-neutral-400">次浏览</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug font-sans">
            {article.title}
          </h1>

          {/* Author Header Bar */}
          {article.author && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <img
                  src={resolveImageUrl(article.author.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt={article.author.nickName || 'Author'}
                  className="w-11 h-11 rounded-full object-cover border-2 border-neutral-700 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                  }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{article.author.nickName || '创作者'}</span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-1">设计创作者 · 专注于高质量视觉艺术</p>
                </div>
              </div>

              {!isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleFollow}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      article.author.isFollowing
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                        : 'bg-[#0057FF] hover:bg-[#0046CC] text-white shadow-[#0057FF]/30'
                    }`}
                  >
                    {article.author.isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>{article.author.isFollowing ? '已关注' : '关注'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setChatTarget(article.author || null);
                      setIsChatOpen(true);
                    }}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl border border-neutral-700 transition-all cursor-pointer"
                    title="私信作者"
                  >
                    <MessageSquare className="w-4 h-4 text-[#0057FF]" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Article Summary Quote Box */}
          {article.summary && (
            <div className="relative p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-md overflow-hidden group">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#0057FF] via-blue-500 to-indigo-500" />
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed pl-2 font-medium italic">
                “{article.summary}”
              </p>
            </div>
          )}
        </div>

        {/* Article Full Rich Body Content */}
        <div className="space-y-6 text-neutral-200 text-sm sm:text-base leading-relaxed font-sans">
          {article.content ? (
            article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-neutral-200 leading-relaxed tracking-normal">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-neutral-400 italic">暂无更多详细正文说明。</p>
          )}
        </div>

        {/* Big Interactive Action Buttons Section */}
        <div className="py-6 border-t border-b border-neutral-800/80 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleToggleLike}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
              article.isLiked
                ? 'bg-[#0057FF] text-white shadow-[#0057FF]/40 border border-[#0057FF]'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${article.isLiked ? 'fill-current' : 'text-[#0057FF]'}`} />
            <span>{article.isLiked ? '已赞赏' : '赞赏作品'}</span>
            <span className="px-2 py-0.5 bg-white/20 text-xs rounded-full font-mono">{article.likeCount}</span>
          </button>

          <button
            onClick={handleToggleFavorite}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
              article.isFavorited
                ? 'bg-amber-500 text-white shadow-amber-500/40 border border-amber-500'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <Star className={`w-4 h-4 ${article.isFavorited ? 'fill-current' : 'text-amber-400'}`} />
            <span>{article.isFavorited ? '已保存' : '保存灵感'}</span>
            <span className="px-2 py-0.5 bg-white/20 text-xs rounded-full font-mono">{article.favoriteCount}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-5 py-3 rounded-2xl font-bold text-sm bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>分享作品</span>
          </button>
        </div>

        {/* Metrics Dashboard Bar */}
        <div className="p-5 bg-neutral-900/90 rounded-2xl border border-neutral-800/90 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-xs sm:text-sm font-medium">
              <Eye className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-white font-extrabold text-sm sm:text-base">{article.viewCount}</span>
              <span className="text-neutral-400">次浏览</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-xs sm:text-sm font-medium">
              <ThumbsUp className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-white font-extrabold text-sm sm:text-base">{article.likeCount}</span>
              <span className="text-neutral-400">次赞赏</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-xs sm:text-sm font-medium">
              <Star className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-white font-extrabold text-sm sm:text-base">{article.favoriteCount}</span>
              <span className="text-neutral-400">次保存</span>
            </div>
          </div>
        </div>

        {/* Liked & Favorited Creator Avatar Wall */}
        <LikeFavoriteAvatarWall
          contentId={article.id}
          contentType="article"
          likeCount={article.likeCount}
          favoriteCount={article.favoriteCount}
          isLiked={article.isLiked}
          isFavorited={article.isFavorited}
          currentUser={user}
          workTitle={article.title}
        />

        {/* Community Discussion Section */}
        <div id="comments-section" className="space-y-5 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0057FF]" />
              作品评论交流 <span className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-full font-mono">{comments.length}</span>
            </h3>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-3 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800">
            {replyingTo && (
              <div className="flex items-center justify-between text-xs text-blue-400 bg-blue-500/10 p-3 rounded-xl border border-blue-500/30">
                <span>正在回复评论 #{replyingTo.id}...</span>
                <button type="button" onClick={() => setReplyingTo(null)} className="hover:underline font-bold cursor-pointer">取消</button>
              </div>
            )}
            <textarea
              required
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="分享您对该作品的看法或设计建议..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/20 transition-all shadow-inner resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0057FF]/30 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" /> 发表评论
              </button>
            </div>
          </form>

          {/* Comment List Tree */}
          <div className="space-y-3 pt-2">
            {comments.length === 0 ? (
              <div className="text-center py-10 text-xs text-neutral-400 bg-neutral-900/60 rounded-2xl border border-neutral-800/80 space-y-1">
                <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="font-semibold text-neutral-300">暂无评论</p>
                <p className="text-neutral-500">抢先发表对作品的第一条赞赏评语吧！</p>
              </div>
            ) : (
              comments.map((c, idx) => (
                <div key={`comment-${c.id ?? idx}-${idx}`} className="p-4 bg-neutral-900/90 rounded-2xl border border-neutral-800/90 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={resolveImageUrl(c.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} alt="Commenter" className="w-8 h-8 rounded-full object-cover border border-neutral-700" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm">{c.author?.nickName || '创作者'}</span>
                          {c.author?.id === article.author?.id && (
                            <span className="px-1.5 py-0.2 bg-[#0057FF]/20 text-[#0057FF] text-[10px] font-bold rounded border border-[#0057FF]/30">作者</span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setReplyingTo(c)} className="text-xs text-blue-400 hover:underline font-bold px-2 py-1 rounded-md hover:bg-blue-500/10 transition-colors cursor-pointer">回复</button>
                      <button onClick={() => { setReportTarget({ type: 3, id: c.id }); setIsReportOpen(true); }} className="text-neutral-500 hover:text-rose-400 p-1 transition-colors cursor-pointer" title="举报评论">
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                      {(c.userId === user?.id || user?.role === 1) && (
                        <button onClick={() => handleDeleteComment(c.id)} className="text-neutral-500 hover:text-rose-400 p-1 transition-colors cursor-pointer" title="删除评论">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed pl-10">{c.content}</p>

                  {/* Sub Replies */}
                  {c.children && c.children.length > 0 && (
                    <div className="pl-10 pt-1 space-y-2">
                      {c.children.map((sub, sIdx) => (
                        <div key={`sub-${sub.id ?? sIdx}-${sIdx}`} className="p-3 bg-neutral-800/70 rounded-xl text-xs sm:text-sm text-neutral-200 border border-neutral-700/70">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-white text-xs sm:text-sm">{sub.author?.nickName || '创作者'}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">{new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">{sub.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Interaction Modals */}
      <ReportModal isOpen={isReportOpen} targetType={reportTarget.type} targetId={reportTarget.id} onClose={() => setIsReportOpen(false)} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} targetUser={chatTarget} />
    </BehanceDetailShell>
  );
};
