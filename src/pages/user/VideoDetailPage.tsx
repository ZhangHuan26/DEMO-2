import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Share2, Bookmark, UserPlus, UserCheck, Flag, ArrowLeft, Eye, Send, Trash2, Pencil, Globe, Lock } from 'lucide-react';

import { Video, Comment, User } from '../../types';
import { videosApi } from '../../api/videos';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { AppreciateButton } from '../../components/common/AppreciateButton';
import { ReportModal } from '../../components/common/ReportModal';
import { ChatDrawer } from '../../components/user/ChatDrawer';
import { resolveImageUrl } from '../../config/env';


export const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  const [isReportOpen, setIsReportOpen] = useState(false);
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
    return <div className="min-h-screen bg-white flex items-center justify-center text-xs text-neutral-500">正在加载动态画板...</div>;
  }

  if (!video) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-xs text-neutral-500">未找到该视频作品</div>;
  }

  const isOwner = user?.id === video.userId;

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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      const created = await videosApi.createComment(video.id, { content: newCommentText });
      setComments(prev => [created, ...prev]);
      setNewCommentText('');
    } catch {
      alert('发表评论失败');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans relative">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1.5 text-neutral-600 hover:text-black rounded-full hover:bg-neutral-100 transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-neutral-900 truncate max-w-md">{video.title}</h1>
        </div>

        {/* Author Info & Hire Button - 仅非当前用户作品时显示 */}
        {!isOwner && (
          <div className="flex items-center gap-3">
            <Link to={`/users/${video.userId}`} className="flex items-center gap-2 group">
              <img src={resolveImageUrl(video.author?.avatar)} alt="Author" className="w-8 h-8 rounded-full object-cover border border-neutral-200 shadow-xs" />

              <span className="text-xs font-semibold text-neutral-900 group-hover:text-[#0057FF] transition-colors">{video.author?.nickName}</span>
            </Link>

            <button
              onClick={() => {
                setChatTarget(video.author || null);
                setIsChatOpen(true);
              }}
              className="px-4 py-1.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-md shadow-[#0057FF]/20"
            >
              聘请创作者
            </button>
          </div>
        )}

      </header>

      {/* Main Grid */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-8 flex gap-8">
        <div className="flex-1 space-y-8">
          {/* 16:9 Video Canvas Player */}
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-neutral-200 bg-black shadow-lg">
            <video
              src={video.videoUrl}
              poster={resolveImageUrl(video.coverImage)}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />

          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-8 space-y-4 shadow-xs">
            <h1 className="text-2xl font-bold text-neutral-900">{video.title}</h1>
            <p className="text-sm text-neutral-700 leading-relaxed">{video.description}</p>
            <div className="pt-4 border-t border-neutral-200 text-xs text-neutral-500 font-mono flex justify-between">
              <span>视频时长: {video.duration}</span>
              <span>播放量: {video.viewCount} 次</span>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-neutral-900">视频讨论交流 ({comments.length})</h3>
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                rows={3}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="对该动效设计作品发表您的看法..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all"
              />
              <div className="flex justify-end">
                <button type="submit" className="px-5 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0057FF]/20">
                  <Send className="w-3.5 h-3.5" /> 发表评论
                </button>
              </div>
            </form>

            <div className="space-y-3 pt-4 border-t border-neutral-200">
              {comments.map((c, idx) => (
                <div key={`vcomment-${c.id ?? idx}-${idx}`} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-800 space-y-1">
                  <div className="font-semibold text-neutral-900">{c.author?.nickName || '创作者'}</div>
                  <p>{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Floating Action Bar - 仅自己可见 */}
      {isOwner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-black/90 backdrop-blur-xl border border-neutral-800 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('确定要删除该视频作品吗？')) {
                videosApi.deleteVideo(video.id).then(() => {
                  alert('视频作品已删除');
                  navigate('/profile');
                });
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> 删除
          </button>
          <button
            onClick={() => navigate(`/videos/${video.id}/edit`)}
            className="px-4 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" /> 修改
          </button>
          <button
            onClick={() => {
              const newStatus = video.status === 1 ? 0 : 1;
              videosApi.updateVideoStatus(video.id, newStatus).then(() => {
                setVideo(prev => prev ? { ...prev, status: newStatus } : null);
                alert(newStatus === 1 ? '视频已发布' : '视频已下架');
              });
            }}
            className={`px-4 py-2 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              video.status === 1 ? 'bg-amber-500 hover:bg-amber-400' : 'bg-emerald-500 hover:bg-emerald-400'
            }`}
          >
            {video.status === 1 ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
            {video.status === 1 ? '下架' : '发布'}
          </button>
        </div>
      )}

      <ReportModal isOpen={isReportOpen} targetType={1} targetId={video.id} onClose={() => setIsReportOpen(false)} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} targetUser={chatTarget} />

    </div>
  );
};
