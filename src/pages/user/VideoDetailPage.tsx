import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Share2, Bookmark, UserPlus, UserCheck, Flag, Trash2, Send, Eye,
  Pencil, Globe, Lock, Play, Sparkles, Clock, Tag, ThumbsUp, Star, MessageSquare, Check
} from 'lucide-react';

import { Video, Comment, User } from '../../types';
import { videosApi } from '../../api/videos';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { ReportModal } from '../../components/common/ReportModal';
import { ChatDrawer } from '../../components/user/ChatDrawer';
import { resolveImageUrl } from '../../config/env';
import { BehanceDetailShell } from '../../components/common/BehanceDetailShell';
import { LikeFavoriteAvatarWall } from '../../components/common/LikeFavoriteAvatarWall';
import { formatPublishTime } from '../../utils/dateUtils';

export const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: number; id: number }>({ type: 1, id: Number(id) });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<User | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadDetail = async () => {
      setLoading(true);
      try {
        const item = await videosApi.getVideoById(Number(id));
        setVideo(item);
        const comms = await videosApi.getComments(Number(id));
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
        正在加载动态视频画板...
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-xs text-neutral-500 space-y-4">
        <p>未找到该视频作品或已被下架</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-xl hover:bg-neutral-200 transition-colors"
        >
          返回上一页
        </button>
      </div>
    );
  }

  const isOwner = user?.id === video.userId;
  const canEditOrDelete = isOwner || user?.role === 1;

  const handleToggleLike = async () => {
    if (!video) return;
    try {
      if (video.isLiked) {
        await videosApi.unlikeVideo(video.id);
        setVideo(prev => prev ? { ...prev, isLiked: false, likeCount: Math.max(0, prev.likeCount - 1) } : null);
      } else {
        await videosApi.likeVideo(video.id);
        setVideo(prev => prev ? { ...prev, isLiked: true, likeCount: prev.likeCount + 1 } : null);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleFavorite = async () => {
    if (!video) return;
    try {
      if (video.isFavorited) {
        await videosApi.unfavoriteVideo(video.id);
        setVideo(prev => prev ? { ...prev, isFavorited: false, favoriteCount: Math.max(0, prev.favoriteCount - 1) } : null);
      } else {
        await videosApi.favoriteVideo(video.id);
        setVideo(prev => prev ? { ...prev, isFavorited: true, favoriteCount: prev.favoriteCount + 1 } : null);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleFollow = async () => {
    if (!video?.author) return;
    const isCurrentlyFollowing = !!video.author.isFollowing;
    const nextFollowing = !isCurrentlyFollowing;
    setVideo(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: nextFollowing } } : prev);

    try {
      if (isCurrentlyFollowing) {
        await authApi.unfollowUser(video.author.id);
      } else {
        const res = await authApi.followUser(video.author.id);
        if (res && res.code === 40900) {
          setVideo(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: true } } : prev);
        }
      }
    } catch (err: any) {
      setVideo(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: isCurrentlyFollowing } } : prev);
      const resCode = err?.response?.data?.code || err?.code;
      if (resCode !== 40900 && !err?.message?.includes('已关注')) {
        alert(err?.response?.data?.message || err?.message || '操作失败，请重试');
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !video) return;
    try {
      const created = await videosApi.createComment(video.id, { content: newCommentText });
      const freshComments = await videosApi.getComments(video.id);
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
    alert('视频作品链接已成功复制到剪贴板！');
  };

  const videoPlayerStage = (
    <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-neutral-200/90 bg-black shadow-xl relative">
      <video
        src={resolveImageUrl(video.videoUrl)}
        poster={resolveImageUrl(video.coverImage)}
        controls
        autoPlay
        className="w-full h-full object-contain"
      />
    </div>
  );

  return (
    <BehanceDetailShell
      title={video.title}
      categoryName={video.category?.name || video.categoryName || '动效秀场'}
      author={video.author}
      coverImage={video.coverImage}
      workType="video"
      isLiked={video.isLiked}
      likeCount={video.likeCount}
      isFavorited={video.isFavorited}
      favoriteCount={video.favoriteCount}
      viewCount={video.viewCount}
      isOwner={isOwner}
      onToggleLike={handleToggleLike}
      onToggleFavorite={handleToggleFavorite}
      onToggleFollow={handleToggleFollow}
      onShare={handleShare}
      onOpenChat={() => {
        setChatTarget(video.author || null);
        setIsChatOpen(true);
      }}
      onReport={() => {
        setReportTarget({ type: 1, id: video.id });
        setIsReportOpen(true);
      }}
      mediaContent={videoPlayerStage}
      tools={['After Effects', 'Premiere Pro', 'Cinema 4D']}
    >
      {/* Video Description & Content Section */}
      <div className="space-y-8 text-white">
        {/* Title, Category & Description Header */}
        <div className="space-y-4 border-b border-neutral-800 pb-6">
          {/* Metadata Row: Category, Duration, Publish Time & Views */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 text-white text-[11px] font-bold rounded-full border border-purple-500/30 shadow-xs">
                <Play className="w-3 h-3 fill-white text-white" />
                {video.category?.name || video.categoryName || '动效视频秀场'}
              </span>
              <span className="text-white font-mono text-[11px]">•</span>
              <span className="flex items-center gap-1 text-[11px] text-white font-mono">
                <Clock className="w-3 h-3 text-white" />
                {formatPublishTime(video.createdAt)}
              </span>
              {video.duration && (
                <>
                  <span className="text-white font-mono text-[11px]">•</span>
                  <span className="text-[11px] text-white font-mono">
                    时长: {video.duration}
                  </span>
                </>
              )}
            </div>

            {/* View Count Stat Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 rounded-full border border-neutral-800 text-[11px] text-white font-mono shadow-xs">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-white font-bold">{video.viewCount}</span>
              <span className="text-white">次播放</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug font-sans">
            {video.title}
          </h1>

          {/* Video Description Box */}
          {video.description && (
            <div className="relative p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-xs overflow-hidden group">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500" />
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed pl-1 font-normal">
                {video.description}
              </p>
            </div>
          )}
        </div>

        {/* Video Stats Metrics Panel */}
        <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-xs sm:text-sm font-medium">
              <Eye className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-white font-extrabold text-sm sm:text-base">{video.viewCount}</span>
              <span className="text-neutral-200">次播放</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-xs sm:text-sm font-medium">
              <ThumbsUp className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-white font-extrabold text-sm sm:text-base">{video.likeCount}</span>
              <span className="text-neutral-200">次赞赏</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-xs sm:text-sm font-medium">
              <Star className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-white font-extrabold text-sm sm:text-base">{video.favoriteCount}</span>
              <span className="text-neutral-200">次收藏</span>
            </div>
          </div>
        </div>

        {/* Liked & Favorited Creator Avatar Wall */}
        <LikeFavoriteAvatarWall
          likeCount={video.likeCount}
          favoriteCount={video.favoriteCount}
          isLiked={video.isLiked}
          isFavorited={video.isFavorited}
          currentUser={user}
          workTitle={video.title}
          workType="video"
        />

        {/* Video Comments */}
        <div id="comments-section" className="space-y-4 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            视频讨论交流 ({comments.length})
          </h3>

          <form onSubmit={handleAddComment} className="space-y-2.5">
            <textarea
              required
              rows={2}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="分享您对该视频动效作品的看法..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3.5 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] transition-all shadow-inner"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0057FF]/20"
              >
                <Send className="w-3.5 h-3.5" /> 发表评论
              </button>
            </div>
          </form>

          <div className="space-y-3 pt-1">
            {comments.length === 0 ? (
              <p className="text-center py-8 text-xs text-neutral-400 bg-neutral-900 rounded-xl border border-neutral-800">
                暂无评论，抢先为该动效视频留下第一条精彩评论吧！
              </p>
            ) : (
              comments.map((c, idx) => (
                <div key={`vid-comment-${c.id ?? idx}-${idx}`} className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2.5">
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
