import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Share2, Bookmark, UserPlus, UserCheck, Flag, Trash2, Send, Eye,
  Pencil, Globe, Lock, Play, Sparkles
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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-xs text-neutral-400">
        <Sparkles className="w-5 h-5 text-[#0057FF] animate-spin mr-2" />
        正在加载动态视频画板...
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-xs text-neutral-400 space-y-4">
        <p>未找到该视频作品或已被下架</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-white rounded-xl hover:bg-neutral-800 transition-colors"
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
    try {
      if (video.author.isFollowing) {
        await authApi.unfollowUser(video.author.id);
        setVideo(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: false } } : null);
      } else {
        await authApi.followUser(video.author.id);
        setVideo(prev => prev && prev.author ? { ...prev, author: { ...prev.author, isFollowing: true } } : null);
      }
    } catch {
      // ignore
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
    <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-neutral-800 bg-black shadow-2xl relative">
      <video
        src={video.videoUrl}
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
      categoryName={video.categoryName || '动效秀场'}
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
      onPrev={video.id > 1 ? () => navigate(`/videos/${video.id - 1}`) : undefined}
      onNext={() => navigate(`/videos/${video.id + 1}`)}
      mediaContent={videoPlayerStage}
      tools={['After Effects', 'Premiere Pro', 'Cinema 4D']}
    >
      {/* Video Description & Content Section */}
      <div className="space-y-8">
        <div className="space-y-4 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-950/80 text-purple-400 text-xs font-bold rounded-full border border-purple-800/80 flex items-center gap-1">
              <Play className="w-3 h-3 fill-purple-400" />
              {video.categoryName || '动效视频秀场'}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              视频时长: {video.duration || '00:30'}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-white leading-snug">{video.title}</h1>
          <p className="text-sm text-neutral-300 leading-relaxed">{video.description}</p>
        </div>

        {/* Video Stats & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-neutral-900/90 rounded-2xl border border-neutral-800">
          <div className="flex items-center gap-6 text-xs text-neutral-400 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Eye className="w-4 h-4 text-purple-400" /> {video.viewCount} 次播放
            </span>
            <span>❤️ {video.likeCount} 赞赏</span>
            <span>⭐ {video.favoriteCount} 收藏</span>
          </div>

          {canEditOrDelete && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm('确定要删除该视频作品吗？')) {
                    videosApi.deleteVideo(video.id).then(() => {
                      alert('视频作品已删除');
                      navigate('/profile');
                    });
                  }
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> 删除视频
              </button>
            </div>
          )}
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

        {/* Author Card */}
        {video.author && (
          <div className="p-6 bg-gradient-to-r from-neutral-900 to-neutral-950 text-white rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <img
                src={resolveImageUrl(video.author.avatar)}
                alt={video.author.nickName}
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
              />
              <div>
                <h3 className="text-lg font-bold text-white">{video.author.nickName}</h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{video.author.signature || '动效设计师 & 视频创作者'}</p>
              </div>
            </div>

            {!isOwner && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleToggleFollow}
                  className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    video.author.isFollowing ? 'bg-neutral-800 text-neutral-300 border border-neutral-700' : 'bg-white text-black hover:bg-neutral-200'
                  }`}
                >
                  {video.author.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {video.author.isFollowing ? '已关注创作者' : '关注创作者'}
                </button>
                <button
                  onClick={() => {
                    setChatTarget(video.author || null);
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

        {/* Video Comments */}
        <div id="comments-section" className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            视频讨论交流 ({comments.length})
          </h3>

          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              required
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="分享您对该视频动效作品的看法..."
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

          <div className="space-y-4 pt-2">
            {comments.length === 0 ? (
              <p className="text-center py-10 text-xs text-neutral-400 bg-neutral-900/60 rounded-2xl border border-neutral-800">
                暂无评论，抢先为该动效视频留下第一条精彩评论吧！
              </p>
            ) : (
              comments.map((c, idx) => (
                <div key={`vid-comment-${c.id ?? idx}-${idx}`} className="p-4 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-2">
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
