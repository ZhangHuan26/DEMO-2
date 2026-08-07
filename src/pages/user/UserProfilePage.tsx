import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UserPlus,
  UserCheck,
  MessageSquare,
  FileText,
  Video as VideoIcon,
  FolderArchive,
  Eye,
  ThumbsUp,
  Bookmark,
  MessageCircle,
  Lock,
  Pencil,
  Trash2,
  Globe,
  Briefcase,
  MapPin,
  ExternalLink,
  BookmarkCheck,
  Award,
  Sparkles,
  Layers,
  Mail,
  Calendar,
  ShieldCheck,
  Hash,
  Activity,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock,
  Send,
  MoreHorizontal
} from 'lucide-react';

import { User, Article, Video, FileItem } from '../../types';
import { authApi } from '../../api/auth';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { useAuth } from '../../context/AuthContext';
import { FollowerModal } from '../../components/common/FollowerModal';
import { ChatDrawer } from '../../components/user/ChatDrawer';
import { CreateWorkModal } from '../../components/common/CreateWorkModal';
import { resolveImageUrl } from '../../config/env';
import { showToast } from '../../components/common/Toast';

// 统一的通用作品卡片（Behance / ArtStation 极简暗黑高质感风格）
const RefinedWorkCard: React.FC<{
  item: {
    id: number;
    type: 'article' | 'video' | 'file';
    title: string;
    coverImage: string;
    categoryName?: string;
    viewCount: number;
    likeCount: number;
    favoriteCount?: number;
    commentCount?: number;
    status: number;
    createdAt?: string;
    linkUrl: string;
    rawItem: Article | Video | FileItem;
  };
  isSelf: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}> = ({ item, isSelf, onDelete, onEdit, onToggleStatus }) => {
  const getTypeBadge = () => {
    switch (item.type) {
      case 'article':
        return { label: '图文专栏', bg: 'bg-blue-600/80 text-blue-100 border border-blue-500/30', icon: FileText };
      case 'video':
        return { label: '动效视频', bg: 'bg-purple-600/80 text-purple-100 border border-purple-500/30', icon: VideoIcon };
      case 'file':
        return { label: '设计资源', bg: 'bg-emerald-600/80 text-emerald-100 border border-emerald-500/30', icon: FolderArchive };
    }
  };

  const badge = getTypeBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="group bg-neutral-950/80 border border-neutral-900 rounded-2xl overflow-hidden hover:border-neutral-800 hover:shadow-[0_16px_40px_rgba(0,0,0,0.8)] transition-all duration-300 flex flex-col">
      {/* 封面图 */}
      <Link to={item.linkUrl} className="relative aspect-[16/10] overflow-hidden bg-neutral-900 block">
        <img
          src={resolveImageUrl(item.coverImage)}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
          }}
        />

        {/* 顶部状态浮层 */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className={`px-2.5 py-1 ${badge.bg} backdrop-blur-md text-[10px] font-bold font-mono rounded-lg shadow-sm flex items-center gap-1 uppercase tracking-wider`}>
            <BadgeIcon className="w-3 h-3" />
            {item.categoryName || badge.label}
          </span>

          {item.status === 1 && (
            <span className="px-2.5 py-1 bg-amber-500/90 text-black text-[10px] font-black rounded-lg flex items-center gap-1 shadow-sm backdrop-blur-md">
              <Lock className="w-3 h-3" /> 仅自己可见
            </span>
          )}
        </div>

        {/* 视频专属播放层 */}
        {item.type === 'video' && (
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <div className="w-11 h-11 bg-white text-black rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <VideoIcon className="w-5 h-5 fill-black ml-0.5" />
            </div>
          </div>
        )}
      </Link>

      {/* 卡片内容 */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <Link to={item.linkUrl} className="block group-hover:text-[#3882FF] transition-colors">
          <h3 className="text-sm font-bold text-neutral-100 leading-snug line-clamp-2">
            {item.title}
          </h3>
        </Link>

        {/* 底部指标 */}
        <div className="pt-3 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-neutral-400" title="浏览量">
              <Eye className="w-3.5 h-3.5 text-neutral-500" />
              {item.viewCount}
            </span>
            {item.commentCount !== undefined && (
              <span className="flex items-center gap-1 text-neutral-400" title="评论数">
                <MessageCircle className="w-3.5 h-3.5 text-neutral-500" />
                {item.commentCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-neutral-200 font-bold" title="获赞数">
            <ThumbsUp className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>{item.likeCount}</span>
          </div>
        </div>
      </div>

      {/* 管理快捷入口 (限本人) */}
      {isSelf && (
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-neutral-900 bg-black/60 text-[11px] font-bold">
          <button
            onClick={onEdit}
            className="flex-1 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-lg border border-neutral-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Pencil className="w-3 h-3 text-blue-400" /> 编辑
          </button>
          <button
            onClick={onToggleStatus}
            className={`flex-1 py-1 rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer ${
              item.status === 1 
                ? 'bg-amber-950/60 text-amber-300 border-amber-800/80 hover:bg-amber-900/80' 
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/80'
            }`}
          >
            {item.status === 1 ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {item.status === 1 ? '设为公开' : '设私密'}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-900/80 transition-all cursor-pointer"
            title="删除作品"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'works' | 'moodboards' | 'appreciations'>('works');
  const [worksSubTab, setWorksSubTab] = useState<'all' | 'articles' | 'videos' | 'files'>('all');

  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [userFiles, setUserFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<{
    type: 'article' | 'video' | 'file';
    article?: Article;
    video?: Video;
    file?: FileItem;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadProfile = async () => {
      setLoading(true);
      try {
        const userId = Number(id);

        let u: User;
        if (currentUser && currentUser.id === userId) {
          try {
            u = await authApi.getMe();
          } catch {
            u = await authApi.getUserById(userId);
          }
        } else {
          u = await authApi.getUserById(userId);
        }

        setProfileUser(u);

        const [arts, vids, fls] = await Promise.all([
          articlesApi.getArticles({ userId, limit: 100 }),
          videosApi.getVideos({ userId, limit: 100 }),
          filesApi.getFiles({ userId, limit: 100 })
        ]);
        setUserArticles(arts.list || []);
        setUserVideos(vids.list || []);
        setUserFiles(fls.list || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id, currentUser]);

  // 监听 Escape 按键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0A0A0C]/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-3 text-neutral-400 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-5 right-5 z-[200] p-3 text-neutral-300 hover:text-white bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 rounded-full backdrop-blur-2xl transition-all cursor-pointer shadow-2xl group hover:scale-105 active:scale-95"
          title="关闭弹窗 (Esc)"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <div className="w-9 h-9 border-3 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">加载创作者档案...</span>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0A0A0C]/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-4 text-center px-4 font-sans text-white">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-5 right-5 z-[200] p-3 text-neutral-300 hover:text-white bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 rounded-full backdrop-blur-2xl transition-all cursor-pointer shadow-2xl group hover:scale-105 active:scale-95"
          title="关闭弹窗 (Esc)"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <p className="text-base font-extrabold text-white">未找到该创作者信息</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-white text-neutral-900 rounded-2xl text-xs font-bold hover:bg-neutral-200 transition-all cursor-pointer shadow-sm"
        >
          返回探索广场
        </button>
      </div>
    );
  }

  const isSelf = currentUser?.id === profileUser.id;

  const handleToggleFollow = async () => {
    console.log('关注功能');
  };

  const handleDeleteArticle = async (articleId: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try {
      await articlesApi.deleteArticle(articleId);
      setUserArticles(prev => prev.filter(a => a.id !== articleId));
    } catch {
      showToast({ message: '删除失败，请稍后重试', type: 'error' });
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('确定要删除这个视频吗？')) return;
    try {
      await videosApi.deleteVideo(videoId);
      setUserVideos(prev => prev.filter(v => v.id !== videoId));
    } catch {
      showToast({ message: '删除失败，请稍后重试', type: 'error' });
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('确定要删除这个资源文件吗？')) return;
    try {
      await filesApi.deleteFile(fileId);
      setUserFiles(prev => prev.filter(f => f.id !== fileId));
    } catch {
      showToast({ message: '删除失败，请稍后重试', type: 'error' });
    }
  };

  const handleToggleArticleStatus = async (articleId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await articlesApi.updateArticleStatus(articleId, newStatus);
      setUserArticles(prev => prev.map(a => a.id === articleId ? { ...a, status: newStatus } : a));
    } catch {
      showToast({ message: '状态更新失败', type: 'error' });
    }
  };

  const handleToggleVideoStatus = async (videoId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await videosApi.updateVideoStatus(videoId, newStatus);
      setUserVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: newStatus } : v));
    } catch {
      showToast({ message: '状态更新失败', type: 'error' });
    }
  };

  const handleToggleFileStatus = async (fileId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await filesApi.updateFileStatus(fileId, newStatus);
      setUserFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: newStatus } : f));
    } catch {
      showToast({ message: '状态更新失败', type: 'error' });
    }
  };

  // 统计数值计算
  const realArticleCount = profileUser.articleCount ?? userArticles.length;
  const realVideoCount = profileUser.videoCount ?? userVideos.length;
  const realFileCount = profileUser.fileCount ?? userFiles.length;
  const realWorksCount = profileUser.worksCount ?? (realArticleCount + realVideoCount + realFileCount);

  const totalArticlesFavorites = userArticles.reduce((sum, a) => sum + (a.favoriteCount || 0), 0);
  const totalVideosFavorites = userVideos.reduce((sum, v) => sum + (v.favoriteCount || 0), 0);
  const totalFilesFavorites = userFiles.reduce((sum, f) => sum + (f.favoriteCount || 0), 0);
  const realFavoriteCount = profileUser.favoriteCount ?? (totalArticlesFavorites + totalVideosFavorites + totalFilesFavorites);

  const totalArticlesComments = userArticles.reduce((sum, a) => sum + (a.commentCount || 0), 0);
  const totalVideosComments = userVideos.reduce((sum, v) => sum + (v.commentCount || 0), 0);
  const totalFilesComments = userFiles.reduce((sum, f) => sum + (f.commentCount || 0), 0);
  const realCommentCount = profileUser.commentCount ?? (totalArticlesComments + totalVideosComments + totalFilesComments);

  const totalArticlesLikes = userArticles.reduce((sum, a) => sum + (a.likeCount || 0), 0);
  const totalVideosLikes = userVideos.reduce((sum, v) => sum + (v.likeCount || 0), 0);
  const totalFilesLikes = userFiles.reduce((sum, f) => sum + (f.likeCount || 0), 0);
  const totalAppreciations = totalArticlesLikes + totalVideosLikes + totalFilesLikes;

  // 聚合作品列表
  const formattedArticles = userArticles.map(a => ({
    id: a.id,
    type: 'article' as const,
    title: a.title,
    coverImage: a.coverImage,
    categoryName: a.categoryName,
    viewCount: a.viewCount || 0,
    likeCount: a.likeCount || 0,
    favoriteCount: a.favoriteCount || 0,
    commentCount: a.commentCount || 0,
    status: a.status,
    linkUrl: `/articles/${a.id}`,
    rawItem: a
  }));

  const formattedVideos = userVideos.map(v => ({
    id: v.id,
    type: 'video' as const,
    title: v.title,
    coverImage: v.coverImage,
    categoryName: '动态视频',
    viewCount: v.viewCount || 0,
    likeCount: v.likeCount || 0,
    favoriteCount: v.favoriteCount || 0,
    commentCount: v.commentCount || 0,
    status: v.status,
    linkUrl: `/videos/${v.id}`,
    rawItem: v
  }));

  const formattedFiles = userFiles.map(f => ({
    id: f.id,
    type: 'file' as const,
    title: f.title,
    coverImage: f.coverImage,
    categoryName: f.fileType ? `${String(f.fileType).toUpperCase()} 资源` : '设计资源',
    viewCount: f.downloadCount || 0,
    likeCount: f.likeCount || 0,
    favoriteCount: f.favoriteCount || 0,
    commentCount: f.commentCount || 0,
    status: f.status,
    linkUrl: `/files/${f.id}`,
    rawItem: f
  }));

  const allWorks = [...formattedArticles, ...formattedVideos, ...formattedFiles];

  const displayedWorks = worksSubTab === 'articles'
    ? formattedArticles
    : worksSubTab === 'videos'
    ? formattedVideos
    : worksSubTab === 'files'
    ? formattedFiles
    : allWorks;

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto flex flex-col font-sans text-neutral-100 selection:bg-neutral-800 selection:text-white animate-in fade-in duration-200 pb-28">
      {/* Floating Top-Right Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 right-6 z-[200] p-3 text-neutral-400 hover:text-white bg-neutral-950/90 hover:bg-neutral-900 border border-neutral-800 rounded-full backdrop-blur-2xl transition-all cursor-pointer shadow-2xl group hover:scale-105 active:scale-95"
        title="关闭页面 (Esc)"
      >
        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Editorial Dark Ambient Top Banner */}
      <div className="h-56 sm:h-64 md:h-72 w-full bg-black relative overflow-hidden shrink-0 border-b border-neutral-900/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(60,60,80,0.25),transparent_75%)] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Container - Full-width Studio Gallery Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 -mt-28 sm:-mt-32 relative z-10 space-y-8 w-full">
        
        {/* Creator Hero Header Card */}
        <div className="bg-neutral-950/90 border border-neutral-900 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            {/* Avatar & User Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group shrink-0">
                <img
                  src={resolveImageUrl(profileUser.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt={profileUser.nickName || profileUser.username}
                  className="w-22 h-22 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-neutral-800 shadow-2xl bg-neutral-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                  }}
                />
                <div 
                  className={`absolute -bottom-1 -right-1 p-1 rounded-lg ring-2 ring-black shadow-sm ${
                    profileUser.status === 0 ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                  }`}
                  title={profileUser.status === 0 ? '账号状态正常' : '账号处于限制状态'}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
                    {profileUser.nickName || profileUser.username}
                  </h1>
                  
                  {profileUser.role === 1 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      ADMIN
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-neutral-900 text-neutral-300 border border-neutral-800">
                      CREATOR
                    </span>
                  )}
                </div>

                <p className="text-xs font-mono text-neutral-500 flex items-center gap-2">
                  <span>@{profileUser.username || profileUser.nickName}</span>
                  <span>•</span>
                  <span>UID: #{profileUser.id}</span>
                </p>

                <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl font-normal leading-relaxed pt-0.5">
                  {profileUser.signature || '这位创作者沉浸于创作中，暂未填写个性签名。'}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t border-neutral-900 sm:border-none pt-4 sm:pt-0">
              {!isSelf ? (
                <>
                  <button
                    onClick={handleToggleFollow}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                      profileUser.isFollowing
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800'
                        : 'bg-white hover:bg-neutral-200 text-black font-extrabold'
                    }`}
                  >
                    {profileUser.isFollowing ? <UserCheck className="w-4 h-4 text-emerald-400" /> : <UserPlus className="w-4 h-4" />}
                    <span>{profileUser.isFollowing ? '已关注' : '关注作者'}</span>
                  </button>

                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>发私信</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/settings')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-200 text-black rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Pencil className="w-4 h-4" />
                  <span>编辑资料</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-neutral-900">
            <div className="p-4 bg-black/60 rounded-2xl border border-neutral-900 text-left">
              <span className="text-[11px] font-mono text-neutral-500 block mb-1">作品发布</span>
              <span className="text-2xl font-black font-mono text-white">{realWorksCount}</span>
            </div>

            <div className="p-4 bg-black/60 rounded-2xl border border-neutral-900 text-left">
              <span className="text-[11px] font-mono text-neutral-500 block mb-1">获赞好评</span>
              <span className="text-2xl font-black font-mono text-rose-500">{totalAppreciations.toLocaleString()}</span>
            </div>

            <div className="p-4 bg-black/60 rounded-2xl border border-neutral-900 text-left">
              <span className="text-[11px] font-mono text-neutral-500 block mb-1">被收藏数</span>
              <span className="text-2xl font-black font-mono text-amber-500">{realFavoriteCount.toLocaleString()}</span>
            </div>

            <button
              onClick={() => { setFollowModalTab('followers'); setIsFollowModalOpen(true); }}
              className="p-4 bg-black/60 hover:bg-neutral-900 hover:border-neutral-800 rounded-2xl border border-neutral-900 text-left transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-mono text-neutral-500 group-hover:text-neutral-300 block mb-1">关注粉丝</span>
              <span className="text-2xl font-black font-mono text-white group-hover:text-[#3882FF]">{profileUser.followerCount || 0}</span>
            </button>

            <button
              onClick={() => { setFollowModalTab('following'); setIsFollowModalOpen(true); }}
              className="p-4 bg-black/60 hover:bg-neutral-900 hover:border-neutral-800 rounded-2xl border border-neutral-900 text-left transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-mono text-neutral-500 group-hover:text-neutral-300 block mb-1">正在关注</span>
              <span className="text-2xl font-black font-mono text-white group-hover:text-[#3882FF]">{profileUser.followingCount || 0}</span>
            </button>
          </div>
        </div>

        {/* Gallery Content Section (Full Width, Studio Grid) */}
        <div className="space-y-6">
          {/* Main Navigation & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-neutral-900">
            {/* Primary Gallery Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {[
                { id: 'works', label: '全部作品集', count: allWorks.length },
                { id: 'moodboards', label: '情绪收藏集' },
                { id: 'appreciations', label: '获得赞誉' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 ${
                      isActive ? 'text-white font-black' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${isActive ? 'bg-white text-black font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'}`}>
                        {tab.count}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBarLine"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sub Categories Pills */}
            {activeTab === 'works' && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold">
                <button
                  onClick={() => setWorksSubTab('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    worksSubTab === 'all'
                      ? 'bg-white text-black font-extrabold shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                >
                  全部 ({allWorks.length})
                </button>
                <button
                  onClick={() => setWorksSubTab('articles')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    worksSubTab === 'articles'
                      ? 'bg-white text-black font-extrabold shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                >
                  图文 ({userArticles.length})
                </button>
                <button
                  onClick={() => setWorksSubTab('videos')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    worksSubTab === 'videos'
                      ? 'bg-white text-black font-extrabold shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                >
                  视频 ({userVideos.length})
                </button>
                <button
                  onClick={() => setWorksSubTab('files')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    worksSubTab === 'files'
                      ? 'bg-white text-black font-extrabold shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                >
                  资源 ({userFiles.length})
                </button>
              </div>
            )}
          </div>

          {/* Works Grid / High-End Gallery */}
          {activeTab === 'works' ? (
            displayedWorks.length === 0 ? (
              <div className="py-24 text-center space-y-3 bg-neutral-950 rounded-3xl border border-neutral-900 p-8 shadow-sm">
                <Layers className="w-9 h-9 mx-auto text-neutral-600" />
                <p className="text-xs font-extrabold text-neutral-300">暂无作品发布</p>
                <p className="text-xs text-neutral-500">该类型下创作者尚未上传任何作品。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {displayedWorks.map((work, idx) => (
                  <RefinedWorkCard
                    key={`work-${work.type}-${work.id}-${idx}`}
                    item={work}
                    isSelf={isSelf}
                    onDelete={() => {
                      if (work.type === 'article') handleDeleteArticle(work.id);
                      if (work.type === 'video') handleDeleteVideo(work.id);
                      if (work.type === 'file') handleDeleteFile(work.id);
                    }}
                    onEdit={() => {
                      if (work.type === 'article') {
                        articlesApi.getArticleById(work.id).then(full => {
                          setEditModalData({ type: 'article', article: full });
                        }).catch(() => setEditModalData({ type: 'article', article: work.rawItem as Article }));
                      }
                      if (work.type === 'video') {
                        videosApi.getVideoById(work.id).then(full => {
                          setEditModalData({ type: 'video', video: full });
                        }).catch(() => setEditModalData({ type: 'video', video: work.rawItem as Video }));
                      }
                      if (work.type === 'file') {
                        filesApi.getFileById(work.id).then(full => {
                          setEditModalData({ type: 'file', file: full });
                        }).catch(() => setEditModalData({ type: 'file', file: work.rawItem as FileItem }));
                      }
                    }}
                    onToggleStatus={() => {
                      if (work.type === 'article') handleToggleArticleStatus(work.id, work.status);
                      if (work.type === 'video') handleToggleVideoStatus(work.id, work.status);
                      if (work.type === 'file') handleToggleFileStatus(work.id, work.status);
                    }}
                  />
                ))}
              </div>
            )
          ) : activeTab === 'moodboards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {allWorks.filter(w => w.favoriteCount > 0).length === 0 ? (
                <div className="col-span-full py-24 text-center space-y-3 bg-neutral-950 rounded-3xl border border-neutral-900 p-8 shadow-sm">
                  <BookmarkCheck className="w-9 h-9 mx-auto text-neutral-600" />
                  <p className="text-xs font-extrabold text-neutral-300">暂无收藏的情绪板</p>
                </div>
              ) : (
                allWorks.filter(w => w.favoriteCount > 0).map((work, idx) => (
                  <RefinedWorkCard
                    key={`mood-${work.type}-${work.id}-${idx}`}
                    item={work}
                    isSelf={isSelf}
                    onDelete={() => {}}
                    onEdit={() => {}}
                    onToggleStatus={() => {}}
                  />
                ))
              )}
            </div>
          ) : activeTab === 'appreciations' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {allWorks.filter(w => w.likeCount > 0).length === 0 ? (
                <div className="col-span-full py-24 text-center space-y-3 bg-neutral-950 rounded-3xl border border-neutral-900 p-8 shadow-sm">
                  <Award className="w-9 h-9 mx-auto text-neutral-600" />
                  <p className="text-xs font-extrabold text-neutral-300">暂无获得好评的作品</p>
                </div>
              ) : (
                allWorks.filter(w => w.likeCount > 0).map((work, idx) => (
                  <RefinedWorkCard
                    key={`apprec-${work.type}-${work.id}-${idx}`}
                    item={work}
                    isSelf={isSelf}
                    onDelete={() => {}}
                    onEdit={() => {}}
                    onToggleStatus={() => {}}
                  />
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Modals & Drawers */}
      <FollowerModal
        isOpen={isFollowModalOpen}
        userId={profileUser.id}
        initialTab={followModalTab}
        onClose={() => setIsFollowModalOpen(false)}
      />
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetUser={profileUser}
      />

      <CreateWorkModal
        isOpen={!!editModalData}
        onClose={() => setEditModalData(null)}
        editData={editModalData}
        onSuccess={() => {
          if (id) {
            const userId = Number(id);
            Promise.all([
              articlesApi.getArticles({ userId, limit: 100 }),
              videosApi.getVideos({ userId, limit: 100 }),
              filesApi.getFiles({ userId, limit: 100 })
            ]).then(([arts, vids, fls]) => {
              setUserArticles(arts.list || []);
              setUserVideos(vids.list || []);
              setUserFiles(fls.list || []);
            });
          }
        }}
      />
    </div>
  );
};

