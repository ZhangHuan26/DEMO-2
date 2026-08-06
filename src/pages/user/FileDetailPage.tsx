import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Download, Lock, FileText, Share2, Bookmark, Flag, Send, Trash2,
  Pencil, Globe, Eye, UserPlus, UserCheck, Sparkles, Folder, Clock, Tag,
  ThumbsUp, Star, MessageSquare, Check
} from 'lucide-react';

import { FileItem, Comment, User } from '../../types';
import { filesApi } from '../../api/files';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { ReportModal } from '../../components/common/ReportModal';
import { ChatDrawer } from '../../components/user/ChatDrawer';
import { resolveImageUrl } from '../../config/env';
import { BehanceDetailShell } from '../../components/common/BehanceDetailShell';
import { LikeFavoriteAvatarWall } from '../../components/common/LikeFavoriteAvatarWall';
import { formatPublishTime } from '../../utils/dateUtils';

export const FileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [file, setFile] = useState<FileItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: number; id: number }>({ type: 2, id: Number(id) });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<User | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadDetail = async () => {
      setLoading(true);
      try {
        const item = await filesApi.getFileById(Number(id));
        console.log('[FileDetailPage] Loaded file:', item);
        console.log('[FileDetailPage] File author:', item.author);
        console.log('[FileDetailPage] Author isFollowing:', item.author?.isFollowing);
        setFile(item);
        const comms = await filesApi.getComments(Number(id));
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
        正在加载设计资源大厅...
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-xs text-neutral-500 space-y-4">
        <p>未找到该资源文件或已被删除</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-xl hover:bg-neutral-200 transition-colors"
        >
          返回上一页
        </button>
      </div>
    );
  }

  const isOwner = user?.id === file.userId;
  const canDownload = file.allowDownload === 1 || isOwner || user?.role === 1;

  const handleDownload = async () => {
    if (!canDownload) return alert('该资源已被管理员或作者关闭下载权限');
    setDownloading(true);
    try {
      await filesApi.downloadFile(file.id, file.fileName || file.title);
      setFile(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
    } catch (err: any) {
      alert(err.message || '下载资源失败');
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!file) return;
    try {
      if (file.isLiked) {
        await filesApi.unlikeFile(file.id);
        setFile(prev => prev ? { ...prev, isLiked: false, likeCount: Math.max(0, prev.likeCount - 1) } : null);
      } else {
        await filesApi.likeFile(file.id);
        setFile(prev => prev ? { ...prev, isLiked: true, likeCount: prev.likeCount + 1 } : null);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleFavorite = async () => {
    if (!file) return;
    try {
      if (file.isFavorited) {
        await filesApi.unfavoriteFile(file.id);
        setFile(prev => prev ? { ...prev, isFavorited: false, favoriteCount: Math.max(0, prev.favoriteCount - 1) } : null);
      } else {
        await filesApi.favoriteFile(file.id);
        setFile(prev => prev ? { ...prev, isFavorited: true, favoriteCount: prev.favoriteCount + 1 } : null);
      }
    } catch {
      // ignore
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !file) return;
    try {
      const created = await filesApi.createComment(file.id, { content: newCommentText });
      const freshComments = await filesApi.getComments(file.id);
      if (freshComments && freshComments.length > 0) {
        setComments(freshComments);
      } else if (created && created.content) {
        setComments(prev => [created, ...prev]);
      }
      setNewCommentText('');
    } catch {
      alert('发表评论失败');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('资源链接已成功复制到剪贴板！');
  };

  const handleToggleFollow = async () => {
    if (!file?.author) return;
    const isCurrentlyFollowing = !!file.author.isFollowing;
    const nextFollowing = !isCurrentlyFollowing;
    setFile(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: nextFollowing } } : prev);

    try {
      if (isCurrentlyFollowing) {
        await authApi.unfollowUser(file.author.id);
      } else {
        const res = await authApi.followUser(file.author.id);
        if (res && res.code === 40900) {
          setFile(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: true } } : prev);
        }
      }
    } catch (err: any) {
      setFile(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: isCurrentlyFollowing } } : prev);
      const resCode = err?.response?.data?.code || err?.code;
      if (resCode !== 40900 && !err?.message?.includes('已关注')) {
        alert(err?.response?.data?.message || err?.message || '操作失败，请重试');
      }
    }
  };

  const fileMediaStage = (
    <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center shadow-xl text-white">
      <div className="w-full md:w-72 h-52 rounded-2xl border border-neutral-800 shadow-sm overflow-hidden bg-neutral-800 flex items-center justify-center">
        {file.coverImage ? (
          <img
            src={resolveImageUrl(file.coverImage)}
            alt={file.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // 图片加载失败时显示默认图标
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="flex flex-col items-center justify-center gap-3 text-neutral-400">
                  <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-sm font-mono">${file.fileType || 'FILE'}</span>
                </div>`;
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-neutral-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            <span className="text-sm font-mono">{file.fileType || 'FILE'}</span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4 text-white w-full">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 bg-emerald-600 text-white rounded-md font-bold uppercase tracking-wider">
            {file.fileType || 'ZIP'}
          </span>
          <span className="text-neutral-400">{file.fileSize || '12.5 MB'}</span>
          <span className="text-neutral-400">📥 {file.downloadCount} 次下载</span>
        </div>

        <h3 className="text-xl font-bold text-white leading-snug">{file.title}</h3>
        <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3">
          {file.description || '高品质设计素材资源文件包，已包含矢量源文件与精细贴图。'}
        </p>

        {file.allowDownload === 0 ? (
          <button
            disabled
            className="w-full py-3.5 bg-red-600/80 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
          >
            <Lock className="w-4 h-4" />
            禁止下载
          </button>
        ) : canDownload ? (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            {downloading ? '正在准备下载资源...' : `立即下载资源 (${file.fileName || 'Resource.zip'})`}
          </button>
        ) : (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>该资源已被作者或管理员设置为不可下载。</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <BehanceDetailShell
      title={file.title}
      categoryName={file.category?.name || file.categoryName || '设计资源包'}
      author={file.author}
      coverImage={file.coverImage}
      workType="file"
      isLiked={file.isLiked}
      likeCount={file.likeCount}
      isFavorited={file.isFavorited}
      favoriteCount={file.favoriteCount}
      viewCount={file.downloadCount}
      isOwner={isOwner}
      onToggleLike={handleToggleLike}
      onToggleFavorite={handleToggleFavorite}
      onToggleFollow={handleToggleFollow}
      onShare={handleShare}
      onOpenChat={() => {
        setChatTarget(file.author || null);
        setIsChatOpen(true);
      }}
      onReport={() => {
        setReportTarget({ type: 2, id: file.id });
        setIsReportOpen(true);
      }}
      mediaContent={fileMediaStage}
      tools={['Figma', 'Sketch', 'Photoshop']}
    >
      <div className="space-y-8 text-white">
        {/* Title, Category & Description Header */}
        <div className="space-y-4 border-b border-neutral-800 pb-6">
          {/* Metadata Row: Category, Publish Time & Views */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-white text-[11px] font-bold rounded-full border border-emerald-500/30 shadow-xs">
                <Folder className="w-3 h-3 text-white" />
                {file.category?.name || file.categoryName || '设计资源库'}
              </span>
              <span className="text-white font-mono text-[11px]">•</span>
              <span className="flex items-center gap-1 text-[11px] text-white font-mono">
                <Clock className="w-3 h-3 text-white" />
                {formatPublishTime(file.createdAt)}
              </span>
            </div>

            {/* View Count Stat Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 rounded-full border border-neutral-800 text-[11px] text-white font-mono shadow-xs">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-white font-bold">{file.viewCount ?? (file as any).views ?? 0}</span>
              <span className="text-white">次浏览</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug font-sans">
            {file.title}
          </h1>

          {/* Description Box */}
          {file.description && (
            <div className="relative p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-xs overflow-hidden group">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed pl-1 font-normal">
                {file.description}
              </p>
            </div>
          )}
        </div>

        {/* Stats & Actions Dashboard Bar */}
        <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-xs sm:text-sm font-medium">
              <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-white font-extrabold text-sm sm:text-base">{file.viewCount ?? (file as any).views ?? 0}</span>
              <span className="text-neutral-200">次浏览</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-xs sm:text-sm font-medium">
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-white font-extrabold text-sm sm:text-base">{file.downloadCount}</span>
              <span className="text-neutral-200">次下载</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-xs sm:text-sm font-medium">
              <ThumbsUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-white font-extrabold text-sm sm:text-base">{file.likeCount}</span>
              <span className="text-neutral-200">次赞赏</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-xs sm:text-sm font-medium">
              <Star className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-white font-extrabold text-sm sm:text-base">{file.favoriteCount}</span>
              <span className="text-neutral-200">次保存</span>
            </div>
          </div>

          {file.allowDownload === 0 ? (
            <button
              disabled
              className="px-4 py-2 bg-red-600/80 text-white text-xs font-bold rounded-full flex items-center gap-1.5 cursor-not-allowed opacity-75"
            >
              <Lock className="w-3.5 h-3.5" /> 禁止下载
            </button>
          ) : canDownload ? (
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> 下载设计源文件
            </button>
          ) : null}
        </div>

        {/* Liked & Favorited Creator Avatar Wall */}
        <LikeFavoriteAvatarWall
          contentId={file.id}
          contentType="file"
          likeCount={file.likeCount}
          favoriteCount={file.favoriteCount}
          isLiked={file.isLiked}
          isFavorited={file.isFavorited}
          currentUser={user}
          workTitle={file.title}
        />

        {/* File Comments */}
        <div id="comments-section" className="space-y-4 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            资源使用反馈 ({comments.length})
          </h3>

          <form onSubmit={handleAddComment} className="space-y-2.5">
            <textarea
              required
              rows={2}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="对该设计资源文件进行评价或使用建议..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3.5 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] transition-all shadow-inner"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0057FF]/20"
              >
                <Send className="w-3.5 h-3.5" /> 发表反馈
              </button>
            </div>
          </form>

          <div className="space-y-3 pt-1">
            {comments.length === 0 ? (
              <p className="text-center py-8 text-xs text-neutral-400 bg-neutral-900 rounded-xl border border-neutral-800">
                暂无使用反馈，下载后发表您对该设计的想法吧！
              </p>
            ) : (
              comments.map((c, idx) => (
                <div key={`file-comment-${c.id ?? idx}-${idx}`} className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={resolveImageUrl(c.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} alt="Commenter" className="w-7 h-7 rounded-full object-cover border border-neutral-700" />
                      <span className="font-bold text-white text-xs sm:text-sm">{c.author?.nickName || '创作者'}</span>
                      {c.createdAt && (
                        <span className="text-xs text-neutral-400 font-mono">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed pl-9">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ReportModal isOpen={isReportOpen} targetType={reportTarget.type} targetId={reportTarget.id} onClose={() => setIsReportOpen(false)} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} targetUser={chatTarget} />
    </BehanceDetailShell>
  );
};
