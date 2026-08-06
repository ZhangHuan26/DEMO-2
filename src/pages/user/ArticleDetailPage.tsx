import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Share2, Bookmark, UserPlus, UserCheck, Flag, Trash2, Send, Heart, Eye,
  ArrowLeft, MoreHorizontal, Pencil, Globe, Lock, Clock, Sparkles
} from 'lucide-react';

import { Article, Comment, User } from '../../types';
import { articlesApi } from '../../api/articles';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-xs text-neutral-400">
        <Sparkles className="w-5 h-5 text-[#0057FF] animate-spin mr-2" />
        正在加载作品画板...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-xs text-neutral-400 space-y-4">
        <p>未找到该作品或该作品已被下架</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-white rounded-xl hover:bg-neutral-800 transition-colors"
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
    try {
      if (article.author.isFollowing) {
        await authApi.unfollowUser(article.author.id);
        setArticle(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: false } } : null);
      } else {
        await authApi.followUser(article.author.id);
        setArticle(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: true } } : null);
      }
    } catch {
      // ignore
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
      alert('发表评论失败');
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
    alert('作品链接已成功复制到剪贴板！');
  };

  return (
    <BehanceDetailShell
      title={article.title}
      categoryName={article.categoryName}
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
      onPrev={article.id > 1 ? () => navigate(`/articles/${article.id - 1}`) : undefined}
      onNext={() => navigate(`/articles/${article.id + 1}`)}
    >
      {/* Main Details Body */}
      <div className="space-y-8">
        {/* Title, Category & Summary Header */}
        <div className="space-y-4 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-950/80 text-[#0057FF] text-xs font-bold rounded-full border border-blue-800/80">
              {article.categoryName || '图文视觉设计'}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              发布于 {new Date(article.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
            {article.title}
          </h1>

          {article.summary && (
            <div className="p-4 bg-neutral-900/90 rounded-2xl border-l-4 border-[#0057FF] text-neutral-300 text-sm leading-relaxed italic border-y border-r border-neutral-800/80">
              {article.summary}
            </div>
          )}
        </div>

        {/* Article Full Rich Body Content */}
        <div className="prose prose-invert max-w-none text-neutral-200 text-base leading-loose whitespace-pre-wrap font-sans">
          {article.content}
        </div>

        {/* Metrics & Owner Management Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-neutral-900/90 rounded-2xl border border-neutral-800">
          <div className="flex items-center gap-6 text-xs text-neutral-400 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Eye className="w-4 h-4 text-[#0057FF]" /> {article.viewCount} 次浏览
            </span>
            <span>❤️ {article.likeCount} 欣赏赞赏</span>
            <span>⭐ {article.favoriteCount} 次保存</span>
          </div>

          {canEditOrDelete && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm('确定要删除该作品吗？')) {
                    articlesApi.deleteArticle(article.id).then(() => {
                      alert('作品已删除');
                      navigate('/profile');
                    });
                  }
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> 删除作品
              </button>
              <button
                onClick={() => navigate(`/articles/${article.id}/edit`)}
                className="px-3.5 py-1.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Pencil className="w-3.5 h-3.5" /> 修改作品
              </button>
              <button
                onClick={() => {
                  const newStatus = article.status === 1 ? 0 : 1;
                  articlesApi.updateArticleStatus(article.id, newStatus).then(() => {
                    setArticle(prev => prev ? { ...prev, status: newStatus } : null);
                    alert(newStatus === 1 ? '作品已发布' : '作品已下架');
                  });
                }}
                className={`px-3.5 py-1.5 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  article.status === 1 ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {article.status === 1 ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                {article.status === 1 ? '下架' : '发布'}
              </button>
            </div>
          )}
        </div>

        {/* Liked & Favorited Creator Avatar Wall */}
        <LikeFavoriteAvatarWall
          likeCount={article.likeCount}
          favoriteCount={article.favoriteCount}
          isLiked={article.isLiked}
          isFavorited={article.isFavorited}
          currentUser={user}
          workTitle={article.title}
          workType="article"
        />

        {/* Creator Profile Card */}
        {article.author && (
          <div className="p-6 bg-gradient-to-r from-neutral-900 to-neutral-950 text-white rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <img
                src={resolveImageUrl(article.author.avatar)}
                alt={article.author.nickName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#0057FF]"
              />
              <div>
                <h3 className="text-lg font-bold text-white">{article.author.nickName}</h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{article.author.signature || '设计与创意内容创作者'}</p>
              </div>
            </div>

            {!isOwner && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleToggleFollow}
                  className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    article.author.isFollowing ? 'bg-neutral-800 text-neutral-300 border border-neutral-700' : 'bg-white text-black hover:bg-neutral-200'
                  }`}
                >
                  {article.author.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {article.author.isFollowing ? '已关注创作者' : '关注创作者'}
                </button>
                <button
                  onClick={() => {
                    setChatTarget(article.author || null);
                    setIsChatOpen(true);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-[#0057FF]/30"
                >
                  聘请合作
                </button>
              </div>
            )}
          </div>
        )}

        {/* Community Discussion Section */}
        <div id="comments-section" className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            作品评论交流 ({comments.length})
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-3">
            {replyingTo && (
              <div className="flex items-center justify-between text-xs text-[#0057FF] bg-blue-950/60 p-2.5 rounded-xl border border-blue-800/80">
                <span>正在回复评论 #{replyingTo.id}...</span>
                <button type="button" onClick={() => setReplyingTo(null)} className="hover:underline font-bold">取消</button>
              </div>
            )}
            <textarea
              required
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="分享您对该作品的看法或设计建议..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0057FF] focus:bg-black transition-all shadow-inner"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0057FF]/20"
              >
                <Send className="w-3.5 h-3.5" /> 发表评论
              </button>
            </div>
          </form>

          {/* Comment List Tree */}
          <div className="space-y-4 pt-2">
            {comments.length === 0 ? (
              <p className="text-center py-10 text-xs text-neutral-400 bg-neutral-900/60 rounded-2xl border border-neutral-800">
                暂无评论，抢先发表对作品的第一条赞赏评语吧！
              </p>
            ) : (
              comments.map((c, idx) => (
                <div key={`comment-${c.id ?? idx}-${idx}`} className="p-4 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={resolveImageUrl(c.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} alt="Commenter" className="w-7 h-7 rounded-full object-cover border border-neutral-700" />
                      <span className="font-bold text-white">{c.author?.nickName || '创作者'}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setReplyingTo(c)} className="text-[11px] text-[#0057FF] hover:underline font-bold">回复</button>
                      <button onClick={() => { setReportTarget({ type: 3, id: c.id }); setIsReportOpen(true); }} className="text-neutral-500 hover:text-rose-400 p-1">
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                      {(c.userId === user?.id || user?.role === 1) && (
                        <button onClick={() => handleDeleteComment(c.id)} className="text-neutral-500 hover:text-rose-400 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed pl-9">{c.content}</p>

                  {/* Sub Replies */}
                  {c.children && c.children.length > 0 && (
                    <div className="pl-9 pt-2 space-y-2">
                      {c.children.map((sub, sIdx) => (
                        <div key={`sub-${sub.id ?? sIdx}-${sIdx}`} className="p-3 bg-neutral-950 rounded-xl text-xs text-neutral-300 border border-neutral-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white text-[11px]">{sub.author?.nickName || '创作者'}</span>
                            <span className="text-[9px] text-neutral-500 font-mono">{new Date(sub.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-[11px]">{sub.content}</p>
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
