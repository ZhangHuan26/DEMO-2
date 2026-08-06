import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  UserCheck,
  MessageSquare,
  FileText,
  Video as VideoIcon,
  Folder,
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
  Key,
  Hash,
  Activity,
  CheckCircle2,
  XCircle,
  Info
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

// 统一的通用作品卡片（Behance / ArtStation 高级艺术风格）
const BehanceWorkCard: React.FC<{
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
  return (
    <div className="group bg-white border border-neutral-200/80 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* 封面图片 */}
      <Link to={item.linkUrl} className="relative aspect-[4/3] overflow-hidden bg-neutral-100 block">
        <img
          src={resolveImageUrl(item.coverImage)}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
          }}
        />

        {/* 顶部标签/角标 */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {item.categoryName ? (
            <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md text-[11px] font-bold text-white rounded-lg shadow-xs">
              {item.categoryName}
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md text-[11px] font-bold text-white rounded-lg uppercase shadow-xs">
              {item.type}
            </span>
          )}

          {item.status === 1 && (
            <span className="px-2.5 py-1 bg-amber-500/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs">
              <Lock className="w-3 h-3" /> 私人
            </span>
          )}
        </div>

        {/* 视频专属播放 Icon */}
        {item.type === 'video' && (
          <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 flex items-center justify-center transition-colors">
            <div className="w-11 h-11 bg-[#0057FF] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0057FF]/40 group-hover:scale-110 transition-transform">
              <VideoIcon className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
        )}
      </Link>

      {/* 卡片主体 */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <Link to={item.linkUrl}>
          <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h3>
        </Link>

        {/* 底部数据交互指标 */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 hover:text-neutral-900 transition-colors" title="阅读/查看">
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              {item.viewCount}
            </span>
            {item.commentCount !== undefined && (
              <span className="flex items-center gap-1 hover:text-neutral-900 transition-colors" title="评论">
                <MessageCircle className="w-3.5 h-3.5 text-neutral-400" />
                {item.commentCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[#0057FF] font-bold" title="好评/点赞">
            <ThumbsUp className="w-3.5 h-3.5 fill-[#0057FF]/20" />
            {item.likeCount}
          </div>
        </div>
      </div>

      {/* 管理操作栏 - 仅作者本人可见 */}
      {isSelf && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-neutral-100 bg-neutral-50/90 text-xs">
          <button
            onClick={onDelete}
            className="flex-1 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /> 删除
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-1 bg-blue-50 hover:bg-blue-100 text-[#0057FF] font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Pencil className="w-3 h-3" /> 修改
          </button>
          <button
            onClick={onToggleStatus}
            className={`flex-1 py-1 font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
              item.status === 1 ? 'bg-amber-50 hover:bg-amber-100 text-amber-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
            }`}
          >
            {item.status === 1 ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {item.status === 1 ? '私人' : '公共'}
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

        // 如果是访问自己的主页，优先通过 GET /auth/me 接口获取包含邮箱、生日等全量私密字段
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

        // 获取用户的个人作品集
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

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center gap-3 text-neutral-500">
        <div className="w-8 h-8 border-3 border-[#0057FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold">正在加载创作者资料与全量数据...</span>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-base font-bold text-neutral-800">未找到该创作者主页</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 bg-neutral-900 text-white rounded-full text-xs font-bold hover:bg-black transition-all cursor-pointer"
        >
          返回探索广场
        </button>
      </div>
    );
  }

  const isSelf = currentUser?.id === profileUser.id;

  // 关注 / 取消关注 - 已禁用API调用
  const handleToggleFollow = async () => {
    // API调用已移除,仅保留UI交互
    console.log('关注功能已禁用');
  };

  // 删除逻辑
  const handleDeleteArticle = async (articleId: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try {
      await articlesApi.deleteArticle(articleId);
      setUserArticles(prev => prev.filter(a => a.id !== articleId));
    } catch {
      alert('删除失败，请稍后重试');
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('确定要删除这个视频吗？')) return;
    try {
      await videosApi.deleteVideo(videoId);
      setUserVideos(prev => prev.filter(v => v.id !== videoId));
    } catch {
      alert('删除失败，请稍后重试');
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('确定要删除这个资源文件吗？')) return;
    try {
      await filesApi.deleteFile(fileId);
      setUserFiles(prev => prev.filter(f => f.id !== fileId));
    } catch {
      alert('删除失败，请稍后重试');
    }
  };

  // 状态切换
  const handleToggleArticleStatus = async (articleId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await articlesApi.updateArticleStatus(articleId, newStatus);
      setUserArticles(prev => prev.map(a => a.id === articleId ? { ...a, status: newStatus } : a));
    } catch {
      alert('状态更新失败');
    }
  };

  const handleToggleVideoStatus = async (videoId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await videosApi.updateVideoStatus(videoId, newStatus);
      setUserVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: newStatus } : v));
    } catch {
      alert('状态更新失败');
    }
  };

  const handleToggleFileStatus = async (fileId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await filesApi.updateFileStatus(fileId, newStatus);
      setUserFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: newStatus } : f));
    } catch {
      alert('状态更新失败');
    }
  };

  // 统计数值计算与 API 整合
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

  const totalArticlesViews = userArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
  const totalVideosViews = userVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0);
  const totalFilesViews = userFiles.reduce((sum, f) => sum + (f.downloadCount || 0), 0);
  const totalProjectViews = totalArticlesViews + totalVideosViews + totalFilesViews;

  const totalArticlesLikes = userArticles.reduce((sum, a) => sum + (a.likeCount || 0), 0);
  const totalVideosLikes = userVideos.reduce((sum, v) => sum + (v.likeCount || 0), 0);
  const totalFilesLikes = userFiles.reduce((sum, f) => sum + (f.likeCount || 0), 0);
  const totalAppreciations = totalArticlesLikes + totalVideosLikes + totalFilesLikes;

  // 格式化作品数组为统一结构
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
    categoryName: f.fileType ? `${f.fileType.toUpperCase()} 资源` : '设计资源',
    viewCount: f.downloadCount || 0,
    likeCount: f.likeCount || 0,
    favoriteCount: f.favoriteCount || 0,
    commentCount: f.commentCount || 0,
    status: f.status,
    linkUrl: `/files/${f.id}`,
    rawItem: f
  }));

  const allWorks = [...formattedArticles, ...formattedVideos, ...formattedFiles];

  // 筛选渲染的作品列表
  const displayedWorks = worksSubTab === 'articles'
    ? formattedArticles
    : worksSubTab === 'videos'
    ? formattedVideos
    : worksSubTab === 'files'
    ? formattedFiles
    : allWorks;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20">
      {/* 1. 高级全宽顶栏 Banner 背景图 */}
      <div className="h-56 sm:h-72 md:h-80 w-full overflow-hidden relative bg-neutral-950">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop"
          alt="Banner"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 pointer-events-none" />
        <div className="absolute bottom-4 right-6 hidden sm:flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-white/80">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>高级创作者黑金画廊</span>
        </div>
      </div>

      {/* 2. 头像与状态指示 layout */}
      <div className="border-b border-neutral-200/80 bg-white shadow-xs">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-5">
          <div className="flex items-end gap-5">
            {/* 头像 */}
            <div className="relative -mt-16 sm:-mt-20 z-10 shrink-0">
              <img
                src={resolveImageUrl(profileUser.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                alt={profileUser.nickName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-2xl bg-white object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                }}
              />
              <span className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-sm ${
                profileUser.status === 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`} title={profileUser.status === 0 ? '账号状态：正常' : '账号状态：冻结'}>
                {profileUser.status === 0 ? '✓' : '!'}
              </span>
            </div>

            {/* 用户快速标识 */}
            <div className="pt-2 sm:pt-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-none">
                  {profileUser.nickName}
                </h1>
                {profileUser.role === 1 ? (
                  <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> 超级管理员
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-700 rounded-full text-[10px] font-bold tracking-wider border border-neutral-200">
                    普通创作者
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 font-mono mt-1 flex items-center gap-2">
                <span>@{profileUser.username || profileUser.nickName}</span>
                <span>•</span>
                <span>UID: #{profileUser.id}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 两栏主体区域 */}

      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-8">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10">

          {/* ================= 左侧栏 (Profile Credentials & Full Attributes) ================= */}
          <div className="w-full lg:w-80 xl:w-88 shrink-0 space-y-6">

            {/* 核心个人属性概览卡片 */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#0057FF]" />
                  账号详细档案
                </h3>
              </div>


              {/* 核心字段一览 */}
              <div className="space-y-3.5 text-xs text-neutral-700 font-medium">
                {/* ID */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-neutral-400" />
                    用户 ID

                  </span>
                  <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                    #{profileUser.id}
                  </span>
                </div>

                {/* 用户名 */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <UserPlus className="w-3.5 h-3.5 text-neutral-400" />
                    账号用户名

                  </span>
                  <span className="font-mono font-bold text-neutral-900 truncate max-w-[140px]">
                    {profileUser.username || '未设定'}
                  </span>
                </div>

                {/* 昵称 */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                    显示昵称

                  </span>
                  <span className="font-bold text-neutral-900 truncate max-w-[140px]">
                    {profileUser.nickName}
                  </span>
                </div>

                {/* 邮箱 */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    电子邮箱

                  </span>
                  <span className="font-mono font-semibold text-neutral-900 truncate max-w-[150px]" title={profileUser.email}>
                    {profileUser.email || '未公开 / 私密保护'}
                  </span>
                </div>

                {/* 联系电话 */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-neutral-400" />
                    手机号码

                  </span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {profileUser.phone || '138****8888'}
                  </span>
                </div>

                {/* 性别 */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-neutral-400" />
                    性别标识

                  </span>
                  <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                    {profileUser.gender === 1 ? '1 - 男' : profileUser.gender === 2 ? '2 - 女' : '0 - 保密'}
                  </span>
                </div>

                {/* 出生日期 */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    出生日期

                  </span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {profileUser.birthday ? String(profileUser.birthday) : '未设置'}
                  </span>
                </div>

                {/* 角色 */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                    角色权限

                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    profileUser.role === 1 ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {profileUser.role === 1 ? '1 - 管理员' : '0 - 普通用户'}
                  </span>
                </div>

                {/* 账号状态 */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-neutral-400" />
                    账号状态

                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
                    profileUser.status === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {profileUser.status === 0 ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                    {profileUser.status === 0 ? '0 - 正常' : '1 - 冻结'}
                  </span>
                </div>

                {/* 账号创建时间 */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    注册时间

                  </span>
                  <span className="font-mono text-[11px] font-semibold text-neutral-900">
                    {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString() : '2025/01/01'}
                  </span>
                </div>

                {/* 个性签名 */}
                <div className="pt-2 border-t border-neutral-100 space-y-1">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                    个性签名

                  </span>
                  <p className="text-neutral-800 leading-relaxed bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60 font-normal">
                    {profileUser.signature || '暂未填写个人签名，这位创作者很神秘~'}
                  </p>
                </div>
              </div>

              {/* 按钮动作组 */}
              <div className="space-y-2 pt-2">
                {!isSelf ? (
                  <>
                    <button
                      onClick={handleToggleFollow}
                      className={`w-full py-2.5 px-5 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        profileUser.isFollowing
                          ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
                          : 'bg-[#0057FF] hover:bg-[#0046CC] text-white shadow-[#0057FF]/25'
                      }`}
                    >
                      {profileUser.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      {profileUser.isFollowing ? '已关注创作者' : '+ 关注创作者'}
                    </button>

                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="w-full py-2.5 px-5 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4 text-white" />
                      发送私信消息
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="w-full py-2.5 px-5 bg-[#0057FF] hover:bg-[#0046CC] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0057FF]/20"
                  >
                    <Pencil className="w-4 h-4" />
                    编辑我的个人资料
                  </button>
                )}
              </div>
            </div>

            {/* 社交属性与工作概况 */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">职场履历 & 外链</h4>
              <div className="space-y-2.5 text-xs text-neutral-600 font-medium">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>高级视觉艺术总监 & UI/UX 架构师</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>Chile • 智利</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[#0057FF] underline hover:text-blue-700 transition-colors truncate max-w-[200px]"
                  >
                    {`linkedin.com/in/${profileUser.nickName?.toLowerCase().replace(/\s+/g, '-') || 'creator'}`}
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* ================= 右侧主区域 (Statistical Highlights & Content) ================= */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* 1. 高级数据看板 */}

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">

              {/* 作品总数 */}

              <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
                  <span>作品总数</span>
                  <Layers className="w-4 h-4 text-[#0057FF]" />
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-neutral-900">
                    {realWorksCount}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1 font-mono">
                    <span>图文:{realArticleCount}</span>
                    <span>•</span>
                    <span>视频:{realVideoCount}</span>
                    <span>•</span>
                    <span>文件:{realFileCount}</span>
                  </div>
                </div>
              </div>

              {/* 作品收藏总数 */}

              <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
                  <span>作品收藏数</span>
                  <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-neutral-900">
                    {realFavoriteCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                    全站收藏总量
                  </div>

                </div>
              </div>

              {/* 作品评论总数 */}

              <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
                  <span>作品评论数</span>
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-neutral-900">
                    {realCommentCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    全站评论总量
                  </div>

                </div>
              </div>

              {/* 粉丝数 */}

              <button
                onClick={() => { setFollowModalTab('followers'); setIsFollowModalOpen(true); }}
                className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-2 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-neutral-500 text-xs font-medium group-hover:text-[#0057FF]">
                  <span>粉丝数</span>
                  <UserPlus className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-neutral-900 group-hover:text-[#0057FF]">
                    {profileUser.followerCount || 0}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 group-hover:underline">
                    点击查看粉丝列表
                  </div>

                </div>
              </button>

              {/* 关注数 */}

              <button
                onClick={() => { setFollowModalTab('following'); setIsFollowModalOpen(true); }}
                className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-2 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-neutral-500 text-xs font-medium group-hover:text-[#0057FF]">
                  <span>关注数</span>
                  <UserCheck className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-neutral-900 group-hover:text-[#0057FF]">
                    {profileUser.followingCount || 0}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 group-hover:underline">
                    点击查看关注列表
                  </div>

                </div>
              </button>

            </div>

            {/* 2. 顶栏 Tab 导航 */}

            <div className="flex items-center justify-between border-b border-neutral-200/90 bg-white px-4 rounded-2xl border shadow-xs">
              <div className="flex items-center gap-6 sm:gap-8">
                <button
                  onClick={() => setActiveTab('works')}
                  className={`py-3.5 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
                    activeTab === 'works' ? 'text-black border-b-2 border-black' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  作品 ({allWorks.length})
                </button>

                <button
                  onClick={() => setActiveTab('moodboards')}
                  className={`py-3.5 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
                    activeTab === 'moodboards' ? 'text-black border-b-2 border-black' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  情绪板 / 收藏集
                </button>

                <button
                  onClick={() => setActiveTab('appreciations')}
                  className={`py-3.5 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
                    activeTab === 'appreciations' ? 'text-black border-b-2 border-black' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  好评 / 获得赞
                </button>
              </div>
            </div>


            {/* 子分类筛选 pills */}
            {activeTab === 'works' && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setWorksSubTab('all')}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                    worksSubTab === 'all'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  全部作品 ({allWorks.length})
                </button>
                <button
                  onClick={() => setWorksSubTab('articles')}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                    worksSubTab === 'articles'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  图文文章 ({userArticles.length})
                </button>
                <button
                  onClick={() => setWorksSubTab('videos')}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                    worksSubTab === 'videos'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  动效视频 ({userVideos.length})
                </button>
                <button
                  onClick={() => setWorksSubTab('files')}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                    worksSubTab === 'files'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  设计资源 ({userFiles.length})
                </button>
              </div>
            )}

            {/* 内容渲染区域 */}
            {activeTab === 'works' ? (
              displayedWorks.length === 0 ? (
                <div className="py-20 text-center text-xs text-neutral-400 bg-white rounded-2xl border border-dashed border-neutral-200 space-y-2">
                  <Layers className="w-8 h-8 mx-auto text-neutral-300" />
                  <p className="font-semibold text-neutral-600">该分类下暂无已发布的作品</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5">
                  {displayedWorks.map((work, idx) => (
                    <BehanceWorkCard
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
              /* 情绪板 / 收藏集 */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5">
                {allWorks.filter(w => w.favoriteCount > 0).length === 0 ? (
                  <div className="col-span-full py-20 text-center text-xs text-neutral-400 bg-white rounded-2xl border border-dashed border-neutral-200 space-y-2">
                    <BookmarkCheck className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="font-semibold text-neutral-600">暂无收藏的情绪板项目</p>
                  </div>
                ) : (
                  allWorks.filter(w => w.favoriteCount > 0).map((work, idx) => (
                    <BehanceWorkCard
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
              /* 好评 / 获得点赞的项目 */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5">
                {allWorks.filter(w => w.likeCount > 0).length === 0 ? (
                  <div className="col-span-full py-20 text-center text-xs text-neutral-400 bg-white rounded-2xl border border-dashed border-neutral-200 space-y-2">
                    <Award className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="font-semibold text-neutral-600">暂无获得好评的项目</p>
                  </div>
                ) : (
                  allWorks.filter(w => w.likeCount > 0).map((work, idx) => (
                    <BehanceWorkCard
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

      {/* 编辑作品弹窗 */}
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
