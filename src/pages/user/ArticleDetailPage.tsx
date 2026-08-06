import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Share2, Bookmark, UserPlus, UserCheck, MessageSquare, Flag, Trash2, Send, Heart, Eye, ArrowLeft, MoreHorizontal, Pencil, Globe, Lock } from 'lucide-react';

import { Article, Comment, User } from '../../types';
import { articlesApi } from '../../api/articles';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { AppreciateButton } from '../../components/common/AppreciateButton';
import { ReportModal } from '../../components/common/ReportModal';
import { ChatDrawer } from '../../components/user/ChatDrawer';
import { resolveImageUrl } from '../../config/env';


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
    return <div className="min-h-screen bg-white flex items-center justify-center text-xs text-neutral-500">正在加载作品画板...</div>;
  }

  if (!article) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-xs text-neutral-500">未找到该作品</div>;
  }

  // 后端 ArticleDetailVO 没有 userId 字段，需要通过 author.id 判断
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
    if (!newCommentText.trim()) return;
    try {
      const created = await articlesApi.createComment(article.id, {
        content: newCommentText,
        rootId: replyingTo?.rootId || replyingTo?.id,
        replyToId: replyingTo?.id,
      });
      setComments(prev => [created, ...prev]);
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-[#0057FF] selection:text-white relative">
      {/* 1. Top Sub-Header Sticky Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1.5 text-neutral-600 hover:text-black rounded-full hover:bg-neutral-100 transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-neutral-900 truncate max-w-md">{article.title}</h1>
            <p className="text-[10px] text-neutral-500">{article.categoryName || 'UI/UX Design'}</p>
          </div>
        </div>

        {/* Author Info & Hire Button - 仅非当前用户作品时显示 */}
        {!isOwner && (
          <div className="flex items-center gap-3">
            <Link to={`/users/${article.userId}`} className="flex items-center gap-2 group">
              <img src={resolveImageUrl(article.author?.avatar)} alt={article.author?.nickName} className="w-8 h-8 rounded-full object-cover border border-neutral-200 shadow-xs" />
              <span className="text-xs font-semibold text-neutral-900 group-hover:text-[#0057FF] transition-colors">{article.author?.nickName}</span>
            </Link>

            {article.author && (
              <button
                onClick={handleToggleFollow}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  article.author.isFollowing ? 'bg-neutral-100 text-neutral-700 border border-neutral-200' : 'bg-neutral-900 text-white hover:bg-black'
                }`}
              >
                {article.author.isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                {article.author.isFollowing ? '已关注' : '关注创作者'}
              </button>
            )}

            <button
              onClick={() => {
                setChatTarget(article.author || null);
                setIsChatOpen(true);
              }}
              className="px-4 py-1.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-full transition-all shadow-md shadow-[#0057FF]/20 cursor-pointer"
            >
              聘请创作者
            </button>
          </div>
        )}

      </header>

      {/* Main Canvas Body */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-8 flex gap-8">
        {/* Central Full Screen Content Canvas */}
        <div className="flex-1 space-y-8">
          {/* Main Hero Cover */}
          <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-lg">
            <img src={resolveImageUrl(article.coverImage)} alt={article.title} className="w-full object-cover max-h-[600px]" />
          </div>


          {/* Article Body Content */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 space-y-6 shadow-xs">
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">{article.title}</h1>

            {article.summary && (
              <div className="p-4 bg-blue-50/60 rounded-xl border-l-4 border-[#0057FF] text-neutral-700 text-sm leading-relaxed italic">
                {article.summary}
              </div>
            )}

            <div className="text-neutral-800 text-sm leading-loose whitespace-pre-wrap font-sans">
              {article.content}
            </div>

            {/* View Count & Tags */}
            <div className="pt-6 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 font-mono">
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-[#0057FF]" /> {article.viewCount} 次浏览</span>
              <span>发布于 {new Date(article.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* 5. Community Discussion Section */}
          <div id="comments-section" className="bg-white border border-neutral-200 rounded-2xl p-8 space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              作品评论交流 ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3">
              {replyingTo && (
                <div className="flex items-center justify-between text-xs text-[#0057FF] bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                  <span>正在回复评论 #{replyingTo.id}...</span>
                  <button type="button" onClick={() => setReplyingTo(null)} className="hover:underline font-bold">取消</button>
                </div>
              )}
              <textarea
                required
                rows={3}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="分享您对该作品的看法或建议..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0057FF]/20"
                >
                  <Send className="w-3.5 h-3.5" /> 发表评论
                </button>
              </div>
            </form>

            {/* Comment List Tree */}
            <div className="space-y-4 pt-4 border-t border-neutral-200">
              {(comments || []).map((c, idx) => (
                <div key={`comment-${c.id ?? idx}-${idx}`} className="p-4 bg-neutral-50/80 rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={resolveImageUrl(c.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} alt="Commenter" className="w-6 h-6 rounded-full object-cover border border-neutral-200" />

                      <span className="font-semibold text-neutral-900">{c.author?.nickName || '创作者'}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setReplyingTo(c)} className="text-[10px] text-[#0057FF] hover:underline font-semibold">回复</button>
                      <button onClick={() => { setReportTarget({ type: 3, id: c.id }); setIsReportOpen(true); }} className="text-neutral-400 hover:text-rose-500 p-1">
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                      {(c.userId === user?.id || user?.role === 1) && (
                        <button onClick={() => handleDeleteComment(c.id)} className="text-neutral-400 hover:text-rose-500 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-800 leading-relaxed pl-8">{c.content}</p>

                  {/* Sub Replies */}
                  {c.children && c.children.length > 0 && (
                    <div className="pl-8 pt-2 space-y-2">
                      {c.children.map((sub, idx) => (
                        <div key={`sub-${sub.id ?? idx}-${idx}`} className="p-2.5 bg-white rounded-lg text-xs text-neutral-700 border border-neutral-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-neutral-900 text-[11px]">{sub.author?.nickName || '创作者'}</span>
                            <span className="text-[9px] text-neutral-400 font-mono">{new Date(sub.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-[11px]">{sub.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>


      {/* 4. Bottom Floating Action Bar - 仅自己可见 */}
      {canEditOrDelete && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-black/90 backdrop-blur-xl border border-neutral-800 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('确定要删除该作品吗？')) {
                articlesApi.deleteArticle(article.id).then(() => {
                  alert('作品已删除');
                  navigate('/profile');
                });
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> 删除
          </button>
          <button
            onClick={() => navigate(`/articles/${article.id}/edit`)}
            className="px-4 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" /> 修改
          </button>
          <button
            onClick={() => {
              const newStatus = article.status === 1 ? 0 : 1;
              articlesApi.updateArticleStatus(article.id, newStatus).then(() => {
                setArticle(prev => prev ? { ...prev, status: newStatus } : null);
                alert(newStatus === 1 ? '作品已发布' : '作品已下架');
              });
            }}
            className={`px-4 py-2 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              article.status === 1 ? 'bg-amber-500 hover:bg-amber-400' : 'bg-emerald-500 hover:bg-emerald-400'
            }`}
          >
            {article.status === 1 ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
            {article.status === 1 ? '下架' : '发布'}
          </button>
        </div>
      )}


      {/* Modals */}
      <ReportModal isOpen={isReportOpen} targetType={reportTarget.type} targetId={reportTarget.id} onClose={() => setIsReportOpen(false)} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} targetUser={chatTarget} />
    </div>
  );
};
