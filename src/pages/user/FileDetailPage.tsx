import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Download, Lock, FileText, Share2, Bookmark, Flag, Send, Trash2,
  Pencil, Globe, Eye, UserPlus, UserCheck, Sparkles, Folder
} from 'lucide-react';

import { FileItem, Comment, User } from '../../types';
import { filesApi } from '../../api/files';
import { useAuth } from '../../context/AuthContext';
import { ReportModal } from '../../components/common/ReportModal';
import { ChatDrawer } from '../../components/user/ChatDrawer';
import { resolveImageUrl } from '../../config/env';
import { BehanceDetailShell } from '../../components/common/BehanceDetailShell';
import { LikeFavoriteAvatarWall } from '../../components/common/LikeFavoriteAvatarWall';

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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-xs text-neutral-400">
        <Sparkles className="w-5 h-5 text-[#0057FF] animate-spin mr-2" />
        正在加载设计资源大厅...
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-xs text-neutral-400 space-y-4">
        <p>未找到该资源文件或已被删除</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-white rounded-xl hover:bg-neutral-800 transition-colors"
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
      const res = await filesApi.downloadFile(file.id);
      setFile(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
      window.open(res.downloadUrl, '_blank');
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

  const fileMediaStage = (
    <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center shadow-2xl">
      <img
        src={resolveImageUrl(file.coverImage)}
        alt={file.title}
        className="w-full md:w-72 h-52 object-cover rounded-2xl border border-neutral-800 shadow-lg"
      />

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

        {canDownload ? (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            {downloading ? '正在准备下载资源...' : `立即下载资源 (${file.fileName || 'Resource.zip'})`}
          </button>
        ) : (
          <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
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
      categoryName={file.categoryName || '设计资源包'}
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
      onShare={handleShare}
      onOpenChat={() => {
        setChatTarget(file.author || null);
        setIsChatOpen(true);
      }}
      onReport={() => {
        setReportTarget({ type: 2, id: file.id });
        setIsReportOpen(true);
      }}
      onPrev={file.id > 1 ? () => navigate(`/files/${file.id - 1}`) : undefined}
      onNext={() => navigate(`/files/${file.id + 1}`)}
      mediaContent={fileMediaStage}
      tools={['Figma', 'Sketch', 'Photoshop']}
    >
      <div className="space-y-8">
        <div className="space-y-4 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-400 text-xs font-bold rounded-full border border-emerald-800/80 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5" />
              {file.categoryName || '设计资源库'}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              发布时间: {new Date(file.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-white leading-snug">{file.title}</h1>
          <p className="text-sm text-neutral-300 leading-relaxed">{file.description}</p>
        </div>

        {/* Stats & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-neutral-900/90 rounded-2xl border border-neutral-800">
          <div className="flex items-center gap-6 text-xs text-neutral-400 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Download className="w-4 h-4 text-emerald-400" /> {file.downloadCount} 次下载
            </span>
            <span>❤️ {file.likeCount} 赞赏</span>
            <span>⭐ {file.favoriteCount} 收藏</span>
          </div>

          {canDownload && (
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> 下载设计文件
            </button>
          )}
        </div>

        {/* Liked & Favorited Creator Avatar Wall */}
        <LikeFavoriteAvatarWall
          likeCount={file.likeCount}
          favoriteCount={file.favoriteCount}
          isLiked={file.isLiked}
          isFavorited={file.isFavorited}
          currentUser={user}
          workTitle={file.title}
          workType="file"
        />

        {/* Author Card */}
        {file.author && (
          <div className="p-6 bg-gradient-to-r from-neutral-900 to-neutral-950 text-white rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <img
                src={resolveImageUrl(file.author.avatar)}
                alt={file.author.nickName}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <h3 className="text-lg font-bold text-white">{file.author.nickName}</h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{file.author.signature || 'UI/UX 资源设计师'}</p>
              </div>
            </div>

            {!isOwner && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setChatTarget(file.author || null);
                    setIsChatOpen(true);
                  }}
                  className="px-5 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-[#0057FF]/30"
                >
                  聘请合作
                </button>
              </div>
            )}
          </div>
        )}

        {/* File Comments */}
        <div id="comments-section" className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            资源使用反馈 ({comments.length})
          </h3>

          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              required
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="对该设计资源文件进行评价或使用建议..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0057FF] focus:bg-black transition-all shadow-inner"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0057FF]/20"
              >
                <Send className="w-3.5 h-3.5" /> 发表反馈
              </button>
            </div>
          </form>

          <div className="space-y-4 pt-2">
            {comments.length === 0 ? (
              <p className="text-center py-10 text-xs text-neutral-400 bg-neutral-900/60 rounded-2xl border border-neutral-800">
                暂无使用反馈，下载后发表您对该设计的想法吧！
              </p>
            ) : (
              comments.map((c, idx) => (
                <div key={`file-comment-${c.id ?? idx}-${idx}`} className="p-4 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={resolveImageUrl(c.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} alt="Commenter" className="w-7 h-7 rounded-full object-cover border border-neutral-700" />
                      <span className="font-bold text-white">{c.author?.nickName || '创作者'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed pl-9">{c.content}</p>
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
