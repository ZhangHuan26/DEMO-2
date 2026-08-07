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
  ArrowUpRight,
  Send,
  MoreHorizontal,
  Share2,
  Flag,
  Copy,
  Check,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Heart,
  Download,
  AlertTriangle,
  AtSign,
  ChevronRight,
  ArrowLeft,
  Search,
  User as UserIcon,
  Shield,
  Palette
} from 'lucide-react';

import { User, Article, Video, FileItem, Comment } from '../../types';
import { authApi } from '../../api/auth';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { reportsApi } from '../../api/reports';
import { useAuth } from '../../context/AuthContext';
import { FollowerModal } from '../../components/common/FollowerModal';
import { ChatDrawer } from '../../components/user/ChatDrawer';
import { CreateWorkModal } from '../../components/common/CreateWorkModal';
import { resolveImageUrl } from '../../config/env';
import { showToast } from '../../components/common/Toast';

// 高端白色质感统一作品卡片
interface WorkItem {
  id: number;
  type: 'article' | 'video' | 'file';
  title: string;
  coverImage: string;
  categoryName?: string;
  summary?: string;
  duration?: string;
  fileType?: string;
  fileSize?: string;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  status: number;
  createdAt?: string;
  linkUrl: string;
  isLiked?: boolean;
  isFavorited?: boolean;
  rawItem: Article | Video | FileItem;
}

const RefinedLightWorkCard: React.FC<{
  item: WorkItem;
  isSelf: boolean;
  onLike: () => void;
  onFavorite: () => void;
  onComment: () => void;
  onShare: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}> = ({ item, isSelf, onLike, onFavorite, onComment, onShare, onDelete, onEdit, onToggleStatus }) => {
  const getTypeBadge = () => {
    switch (item.type) {
      case 'article':
        return { label: '图文专栏', bg: 'bg-blue-50 text-[#0057FF] border-blue-200/80', icon: FileText };
      case 'video':
        return { label: '动效视频', bg: 'bg-purple-50 text-purple-600 border-purple-200/80', icon: VideoIcon };
      case 'file':
        return { label: '设计资源', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80', icon: FolderArchive };
    }
  };

  const badge = getTypeBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="group bg-white border border-neutral-200/90 rounded-2xl overflow-hidden hover:border-neutral-400 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between relative">
      {/* 顶部封面图 */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 block">
        <Link to={item.linkUrl} className="block w-full h-full">
          <img
            src={resolveImageUrl(item.coverImage)}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
            }}
          />
        </Link>

        {/* 顶部标签浮层 */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className={`px-2.5 py-1 ${badge.bg} border backdrop-blur-md text-[10px] font-bold font-mono rounded-lg shadow-xs flex items-center gap-1 uppercase tracking-wider`}>
            <BadgeIcon className="w-3 h-3" />
            {item.categoryName || badge.label}
          </span>

          {item.status === 1 && (
            <span className="px-2.5 py-1 bg-amber-500 text-black text-[10px] font-black rounded-lg flex items-center gap-1 shadow-xs backdrop-blur-md">
              <Lock className="w-3 h-3" /> 仅自己可见
            </span>
          )}
        </div>

        {/* 视频专属播放层 */}
        {item.type === 'video' && (
          <Link to={item.linkUrl} className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center transition-colors">
            <div className="w-11 h-11 bg-white/95 text-neutral-900 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <VideoIcon className="w-5 h-5 fill-neutral-900 ml-0.5 text-neutral-900" />
            </div>
            {item.duration && (
              <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/75 text-white text-[10px] font-mono font-bold rounded-md">
                {item.duration}
              </span>
            )}
          </Link>
        )}

        {/* 资源格式标签 */}
        {item.type === 'file' && item.fileType && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/75 text-white text-[10px] font-mono font-bold rounded-md uppercase">
            {item.fileType}
          </div>
        )}
      </div>

      {/* 卡片正文与元数据 */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link to={item.linkUrl} className="block group-hover:text-[#0057FF] transition-colors">
            <h3 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-1">
              {item.title}
            </h3>
          </Link>
          {item.summary && (
            <p className="text-xs text-neutral-500 line-clamp-1 mt-1 font-normal">
              {item.summary}
            </p>
          )}
        </div>

        {/* 底部指标与交互栏 */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-neutral-500" title="浏览量">
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              {item.viewCount}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); onComment(); }}
              className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              title="评论列表"
            >
              <MessageCircle className="w-3.5 h-3.5 text-neutral-400" />
              {item.commentCount}
            </button>
          </div>

          <div className="flex items-center gap-2 font-sans font-medium">
            <button
              onClick={(e) => { e.preventDefault(); onLike(); }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                item.isLiked 
                  ? 'bg-rose-50 text-rose-600 font-bold' 
                  : 'hover:bg-neutral-100 text-neutral-600'
              }`}
              title="赞同好评"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-rose-600 text-rose-600' : 'text-neutral-400'}`} />
              <span className="font-mono text-xs">{item.likeCount}</span>
            </button>

            <button
              onClick={(e) => { e.preventDefault(); onFavorite(); }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                item.isFavorited 
                  ? 'bg-amber-50 text-amber-600' 
                  : 'hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700'
              }`}
              title="收藏到情绪板"
            >
              <Bookmark className={`w-3.5 h-3.5 ${item.isFavorited ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <button
              onClick={(e) => { e.preventDefault(); onShare(); }}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              title="分享与转发"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 管理快捷入口 (仅限本人访问自己的主页时显示) */}
      {isSelf && (
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-neutral-100 bg-neutral-50/80 text-[11px] font-bold">
          <button
            onClick={onEdit}
            className="flex-1 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 rounded-lg border border-neutral-200 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
          >
            <Pencil className="w-3 h-3 text-[#0057FF]" /> 编辑
          </button>
          <button
            onClick={onToggleStatus}
            className={`flex-1 py-1.5 rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs ${
              item.status === 1 
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {item.status === 1 ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {item.status === 1 ? '设公开' : '设私密'}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-white hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-lg border border-neutral-200 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
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
  const [activeTab, setActiveTab] = useState<'works' | 'moodboards' | 'appreciations' | 'about'>('works');
  const [worksSubTab, setWorksSubTab] = useState<'all' | 'articles' | 'videos' | 'files'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'likes' | 'views'>('latest');

  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [userFiles, setUserFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 关注状态与粉丝数
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

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

  // 评论抽屉/弹窗状态
  const [activeCommentWork, setActiveCommentWork] = useState<{
    id: number;
    type: 'article' | 'video' | 'file';
    title: string;
  } | null>(null);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // 分享弹窗状态
  const [shareWork, setShareWork] = useState<{
    id: number;
    type: 'article' | 'video' | 'file';
    title: string;
    url: string;
  } | null>(null);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [copiedProfileUrl, setCopiedProfileUrl] = useState(false);

  // 举报弹窗状态
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('违规内容或侵权');
  const [reportDetail, setReportDetail] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

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
        setIsFollowing(!!u.isFollowing);
        setFollowerCount(u.followerCount || 0);

        const [arts, vids, fls] = await Promise.all([
          articlesApi.getArticles({ userId, limit: 100 }),
          videosApi.getVideos({ userId, limit: 100 }),
          filesApi.getFiles({ userId, limit: 100 })
        ]);
        setUserArticles(arts.list || []);
        setUserVideos(vids.list || []);
        setUserFiles(fls.list || []);
      } catch (err) {
        console.error('获取创作者信息失败:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id, currentUser]);

  const isSelf = currentUser?.id === profileUser?.id;

  // 关注/取关处理
  const handleToggleFollow = async () => {
    if (!profileUser) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        await authApi.unfollowUser(profileUser.id);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        showToast({ message: `已取消对 ${profileUser.nickName} 的关注`, type: 'info' });
      } else {
        const res = await authApi.followUser(profileUser.id);
        setIsFollowing(true);
        if (!(res && res.code === 40900)) {
          setFollowerCount(prev => prev + 1);
        }
        showToast({ message: `已成功关注 ${profileUser.nickName}`, type: 'success' });
      }
    } catch (err: any) {
      const resCode = err?.response?.data?.code || err?.code;
      if (resCode === 40900 || err?.message?.includes('已关注')) {
        setIsFollowing(true);
      } else {
        showToast({ message: '关注操作失败，请稍后重试', type: 'error' });
      }
    }
  };

  // 点赞处理
  const handleLikeWork = async (work: WorkItem) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const isLiked = !!work.isLiked;

    if (work.type === 'article') {
      setUserArticles(prev => prev.map(a => a.id === work.id ? {
        ...a,
        isLiked: !isLiked,
        likeCount: isLiked ? Math.max(0, a.likeCount - 1) : a.likeCount + 1
      } : a));
      try {
        if (isLiked) await articlesApi.unlikeArticle(work.id);
        else await articlesApi.likeArticle(work.id);
      } catch {
        // rollback
        setUserArticles(prev => prev.map(a => a.id === work.id ? work.rawItem as Article : a));
      }
    } else if (work.type === 'video') {
      setUserVideos(prev => prev.map(v => v.id === work.id ? {
        ...v,
        isLiked: !isLiked,
        likeCount: isLiked ? Math.max(0, v.likeCount - 1) : v.likeCount + 1
      } : v));
      try {
        if (isLiked) await videosApi.unlikeVideo(work.id);
        else await videosApi.likeVideo(work.id);
      } catch {
        setUserVideos(prev => prev.map(v => v.id === work.id ? work.rawItem as Video : v));
      }
    } else if (work.type === 'file') {
      setUserFiles(prev => prev.map(f => f.id === work.id ? {
        ...f,
        isLiked: !isLiked,
        likeCount: isLiked ? Math.max(0, f.likeCount - 1) : f.likeCount + 1
      } : f));
      try {
        if (isLiked) await filesApi.unlikeFile(work.id);
        else await filesApi.likeFile(work.id);
      } catch {
        setUserFiles(prev => prev.map(f => f.id === work.id ? work.rawItem as FileItem : f));
      }
    }
  };

  // 收藏处理
  const handleFavoriteWork = async (work: WorkItem) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const isFav = !!work.isFavorited;

    if (work.type === 'article') {
      setUserArticles(prev => prev.map(a => a.id === work.id ? {
        ...a,
        isFavorited: !isFav,
        favoriteCount: isFav ? Math.max(0, a.favoriteCount - 1) : a.favoriteCount + 1
      } : a));
      try {
        if (isFav) await articlesApi.unfavoriteArticle(work.id);
        else {
          await articlesApi.favoriteArticle(work.id);
          showToast({ message: '已收藏至您的情绪灵感集', type: 'success' });
        }
      } catch {
        setUserArticles(prev => prev.map(a => a.id === work.id ? work.rawItem as Article : a));
      }
    } else if (work.type === 'video') {
      setUserVideos(prev => prev.map(v => v.id === work.id ? {
        ...v,
        isFavorited: !isFav,
        favoriteCount: isFav ? Math.max(0, v.favoriteCount - 1) : v.favoriteCount + 1
      } : v));
      try {
        if (isFav) await videosApi.unfavoriteVideo(work.id);
        else {
          await videosApi.favoriteVideo(work.id);
          showToast({ message: '已收藏至您的情绪灵感集', type: 'success' });
        }
      } catch {
        setUserVideos(prev => prev.map(v => v.id === work.id ? work.rawItem as Video : v));
      }
    } else if (work.type === 'file') {
      setUserFiles(prev => prev.map(f => f.id === work.id ? {
        ...f,
        isFavorited: !isFav,
        favoriteCount: isFav ? Math.max(0, f.favoriteCount - 1) : f.favoriteCount + 1
      } : f));
      try {
        if (isFav) await filesApi.unfavoriteFile(work.id);
        else {
          await filesApi.favoriteFile(work.id);
          showToast({ message: '已收藏至您的情绪灵感集', type: 'success' });
        }
      } catch {
        setUserFiles(prev => prev.map(f => f.id === work.id ? work.rawItem as FileItem : f));
      }
    }
  };

  // 打开作品评论
  const handleOpenComments = async (work: WorkItem) => {
    setActiveCommentWork({ id: work.id, type: work.type, title: work.title });
    setLoadingComments(true);
    try {
      let list: Comment[] = [];
      if (work.type === 'article') {
        list = await articlesApi.getComments(work.id);
      } else if (work.type === 'video') {
        list = await videosApi.getComments(work.id);
      } else if (work.type === 'file') {
        list = await filesApi.getComments(work.id);
      }
      setCommentsList(list);
    } catch {
      setCommentsList([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // 发表作品评论
  const handlePostComment = async () => {
    if (!activeCommentWork || !newCommentText.trim()) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setSubmittingComment(true);
    try {
      const content = newCommentText.trim();
      let created: Comment | null = null;

      if (activeCommentWork.type === 'article') {
        created = await articlesApi.createComment(activeCommentWork.id, { content });
        setUserArticles(prev => prev.map(a => a.id === activeCommentWork.id ? { ...a, commentCount: a.commentCount + 1 } : a));
      } else if (activeCommentWork.type === 'video') {
        created = await videosApi.createComment(activeCommentWork.id, { content });
        setUserVideos(prev => prev.map(v => v.id === activeCommentWork.id ? { ...v, commentCount: v.commentCount + 1 } : v));
      } else if (activeCommentWork.type === 'file') {
        created = await filesApi.createComment(activeCommentWork.id, { content });
        setUserFiles(prev => prev.map(f => f.id === activeCommentWork.id ? { ...f, commentCount: (f.commentCount || 0) + 1 } : f));
      }

      if (created) {
        setCommentsList(prev => [created!, ...prev]);
        setNewCommentText('');
        showToast({ message: '评论发布成功', type: 'success' });
      }
    } catch {
      showToast({ message: '评论发布失败，请稍后重试', type: 'error' });
    } finally {
      setSubmittingComment(false);
    }
  };

  // 打开分享
  const handleOpenShare = (work: WorkItem) => {
    const url = `${window.location.origin}${work.linkUrl}`;
    setShareWork({ id: work.id, type: work.type, title: work.title, url });
    setCopiedShareUrl(false);
  };

  // 复制主页链接
  const handleCopyProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedProfileUrl(true);
    showToast({ message: '创作者主页链接已复制到剪贴板', type: 'success' });
    setTimeout(() => setCopiedProfileUrl(false), 2500);
  };

  // 提交举报
  const handleSubmitReport = async () => {
    if (!profileUser) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setSubmittingReport(true);
    try {
      await reportsApi.submitReport({
        targetType: 5, // 5 = 用户
        targetId: profileUser.id,
        reason: `${reportReason} - ${reportDetail.trim() || '无补充描述'}`
      });
      showToast({ message: '举报已提交，管理团队将尽快核查处理', type: 'success' });
      setIsReportModalOpen(false);
      setReportDetail('');
    } catch {
      showToast({ message: '举报提交失败，请稍后重试', type: 'error' });
    } finally {
      setSubmittingReport(false);
    }
  };

  // 作品删除与状态切换（仅本人）
  const handleDeleteArticle = async (articleId: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try {
      await articlesApi.deleteArticle(articleId);
      setUserArticles(prev => prev.filter(a => a.id !== articleId));
      showToast({ message: '文章已删除', type: 'success' });
    } catch {
      showToast({ message: '删除失败，请稍后重试', type: 'error' });
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('确定要删除这个视频吗？')) return;
    try {
      await videosApi.deleteVideo(videoId);
      setUserVideos(prev => prev.filter(v => v.id !== videoId));
      showToast({ message: '视频已删除', type: 'success' });
    } catch {
      showToast({ message: '删除失败，请稍后重试', type: 'error' });
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('确定要删除这个资源文件吗？')) return;
    try {
      await filesApi.deleteFile(fileId);
      setUserFiles(prev => prev.filter(f => f.id !== fileId));
      showToast({ message: '资源文件已删除', type: 'success' });
    } catch {
      showToast({ message: '删除失败，请稍后重试', type: 'error' });
    }
  };

  const handleToggleArticleStatus = async (articleId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await articlesApi.updateArticleStatus(articleId, newStatus);
      setUserArticles(prev => prev.map(a => a.id === articleId ? { ...a, status: newStatus } : a));
      showToast({ message: newStatus === 1 ? '已设为私密' : '已设为公开', type: 'success' });
    } catch {
      showToast({ message: '状态更新失败', type: 'error' });
    }
  };

  const handleToggleVideoStatus = async (videoId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await videosApi.updateVideoStatus(videoId, newStatus);
      setUserVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: newStatus } : v));
      showToast({ message: newStatus === 1 ? '已设为私密' : '已设为公开', type: 'success' });
    } catch {
      showToast({ message: '状态更新失败', type: 'error' });
    }
  };

  const handleToggleFileStatus = async (fileId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await filesApi.updateFileStatus(fileId, newStatus);
      setUserFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: newStatus } : f));
      showToast({ message: newStatus === 1 ? '已设为私密' : '已设为公开', type: 'success' });
    } catch {
      showToast({ message: '状态更新失败', type: 'error' });
    }
  };

  // 格式化作品列表
  const formattedArticles: WorkItem[] = userArticles.map(a => ({
    id: a.id,
    type: 'article',
    title: a.title,
    coverImage: a.coverImage,
    categoryName: a.categoryName || '图文专栏',
    summary: a.summary,
    viewCount: a.viewCount || 0,
    likeCount: a.likeCount || 0,
    favoriteCount: a.favoriteCount || 0,
    commentCount: a.commentCount || 0,
    status: a.status,
    createdAt: a.createdAt,
    linkUrl: `/articles/${a.id}`,
    isLiked: a.isLiked,
    isFavorited: a.isFavorited,
    rawItem: a
  }));

  const formattedVideos: WorkItem[] = userVideos.map(v => ({
    id: v.id,
    type: 'video',
    title: v.title,
    coverImage: v.coverImage,
    categoryName: '动效视频',
    summary: v.description,
    duration: v.duration || '02:40',
    viewCount: v.viewCount || 0,
    likeCount: v.likeCount || 0,
    favoriteCount: v.favoriteCount || 0,
    commentCount: v.commentCount || 0,
    status: v.status,
    createdAt: (v as any).createdAt,
    linkUrl: `/videos/${v.id}`,
    isLiked: v.isLiked,
    isFavorited: v.isFavorited,
    rawItem: v
  }));

  const formattedFiles: WorkItem[] = userFiles.map(f => ({
    id: f.id,
    type: 'file',
    title: f.title || f.fileName,
    coverImage: f.coverImage,
    categoryName: f.fileType ? `${String(f.fileType).toUpperCase()} 资源` : '设计资源',
    summary: f.description,
    fileType: f.fileType || 'zip',
    fileSize: f.fileSize,
    viewCount: f.downloadCount || 0,
    likeCount: f.likeCount || 0,
    favoriteCount: f.favoriteCount || 0,
    commentCount: f.commentCount || 0,
    status: f.status,
    createdAt: (f as any).createdAt,
    linkUrl: `/files/${f.id}`,
    isLiked: f.isLiked,
    isFavorited: f.isFavorited,
    rawItem: f
  }));

  const allWorks = [...formattedArticles, ...formattedVideos, ...formattedFiles];

  // 统计数值计算
  const realArticleCount = userArticles.length;
  const realVideoCount = userVideos.length;
  const realFileCount = userFiles.length;
  const realWorksCount = allWorks.length;

  const totalAppreciations = allWorks.reduce((sum, w) => sum + (w.likeCount || 0), 0);
  const totalFavorites = allWorks.reduce((sum, w) => sum + (w.favoriteCount || 0), 0);
  const totalViews = allWorks.reduce((sum, w) => sum + (w.viewCount || 0), 0);

  // 筛选与排序
  let displayedWorks = worksSubTab === 'articles'
    ? formattedArticles
    : worksSubTab === 'videos'
    ? formattedVideos
    : worksSubTab === 'files'
    ? formattedFiles
    : allWorks;

  if (sortBy === 'likes') {
    displayedWorks = [...displayedWorks].sort((a, b) => b.likeCount - a.likeCount);
  } else if (sortBy === 'views') {
    displayedWorks = [...displayedWorks].sort((a, b) => b.viewCount - a.viewCount);
  } else {
    displayedWorks = [...displayedWorks].sort((a, b) => b.id - a.id);
  }

  const moodboardWorks = allWorks.filter(w => w.favoriteCount > 0);
  const appreciationWorks = allWorks.filter(w => w.likeCount > 0).sort((a, b) => b.likeCount - a.likeCount);

  if (loading) {
    return (
      <div className="min-h-[85vh] bg-white flex flex-col items-center justify-center gap-4 text-neutral-400 font-sans">
        <div className="w-10 h-10 border-3 border-[#0057FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest font-bold">
          正在加载创作者档案...
        </span>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-[85vh] bg-white flex flex-col items-center justify-center gap-4 text-center px-4 font-sans text-neutral-900">
        <div className="w-16 h-16 bg-neutral-100 border border-neutral-200 rounded-3xl flex items-center justify-center text-neutral-400 shadow-xs">
          <UserIcon className="w-8 h-8" />
        </div>
        <p className="text-lg font-black text-neutral-900">未找到该创作者信息</p>
        <p className="text-xs text-neutral-500 max-w-sm">该用户可能已注销、账号被限制或访问链接不正确</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          返回探索广场
        </button>
      </div>
    );
  }

  const isSuperAdmin = profileUser.role === 1 || (profileUser.role as unknown) === 'admin' || (profileUser.role as unknown) === '1';

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-[#0057FF] selection:text-white pb-32 animate-in fade-in duration-200">
      
      {/* 顶部面包屑与快捷工具条 */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 text-xs font-bold transition-all cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-neutral-100 border border-neutral-200/80 group-hover:border-neutral-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 text-[#0057FF] group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>返回上一页</span>
          </button>

          {/* 右侧主页分享与更多操作 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyProfile}
              className="p-2 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/80 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="复制主页链接"
            >
              {copiedProfileUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedProfileUrl ? '已复制' : '分享主页'}</span>
            </button>

            {!isSelf && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="p-2 bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 border border-neutral-200/80 text-neutral-500 rounded-xl transition-all cursor-pointer"
                title="举报该创作者"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 高端白色/浅蓝微质感背景顶部 Banner */}
      <div className="h-52 sm:h-64 md:h-72 w-full bg-gradient-to-r from-blue-50/70 via-neutral-50 to-indigo-50/60 relative overflow-hidden border-b border-neutral-200/80">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute -top-16 right-1/4 w-80 h-80 bg-[#0057FF]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 主体容器 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-24 sm:-mt-28 relative z-10 space-y-8">
        
        {/* 创作者信息主卡片 */}
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-md space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* 头像与创作者核心身份 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl border-4 border-white bg-neutral-100 shadow-xl overflow-hidden ring-1 ring-neutral-200/80 relative">
                  <img
                    src={resolveImageUrl(profileUser.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                    alt={profileUser.nickName || profileUser.username}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                </div>
                {/* 状态徽章 */}
                <div 
                  className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full border-2 border-white shadow-sm flex items-center gap-1 text-[10px] font-bold text-white ${
                    profileUser.status === 0 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  title={profileUser.status === 0 ? '账号状态正常' : '账号处于限制状态'}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{profileUser.status === 0 ? '认证中' : '限制'}</span>
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 font-sans">
                    {profileUser.nickName || profileUser.username}
                  </h1>
                  
                  {isSuperAdmin ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      ADMIN 官方管理
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-[#0057FF] border border-blue-200">
                      <Award className="w-3.5 h-3.5" />
                      PRO CREATOR
                    </span>
                  )}
                </div>

                <p className="text-xs font-mono text-neutral-500 flex flex-wrap items-center gap-2">
                  <span className="text-neutral-700 font-bold">@{profileUser.username || profileUser.nickName}</span>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-400" />
                    入驻平台
                  </span>
                </p>

                <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl font-normal leading-relaxed pt-1">
                  {profileUser.signature || '这位创作者沉浸于创作中，暂未填写个性签名。'}
                </p>
              </div>
            </div>

            {/* 头部操作动作按钮 */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t border-neutral-100 md:border-none pt-4 md:pt-0 shrink-0">
              {!isSelf ? (
                <>
                  <button
                    onClick={handleToggleFollow}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isFollowing
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
                        : 'bg-[#0057FF] hover:bg-[#0046CC] text-white shadow-md shadow-[#0057FF]/20'
                    }`}
                  >
                    {isFollowing ? <UserCheck className="w-4 h-4 text-emerald-600" /> : <UserPlus className="w-4 h-4" />}
                    <span>{isFollowing ? '已关注作者' : '关注创作者'}</span>
                  </button>

                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Send className="w-4 h-4 text-[#0057FF]" />
                    <span>发私信</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => navigate('/settings')}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#0057FF] hover:bg-[#0046CC] text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-[#0057FF]/20 active:scale-95"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>编辑个人资料</span>
                  </button>
                  <button
                    onClick={() => navigate('/me/works')}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Layers className="w-4 h-4 text-[#0057FF]" />
                    <span>创作工坊</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 5项精美数据矩阵面板 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-neutral-100">
            <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 text-left">
              <span className="text-[11px] font-bold text-neutral-500 block mb-1">作品发布</span>
              <span className="text-2xl font-black font-mono text-neutral-900">{realWorksCount}</span>
            </div>

            <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 text-left">
              <span className="text-[11px] font-bold text-neutral-500 block mb-1">获赞好评</span>
              <span className="text-2xl font-black font-mono text-rose-600">{totalAppreciations.toLocaleString()}</span>
            </div>

            <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 text-left">
              <span className="text-[11px] font-bold text-neutral-500 block mb-1">灵感收藏</span>
              <span className="text-2xl font-black font-mono text-amber-600">{totalFavorites.toLocaleString()}</span>
            </div>

            <button
              onClick={() => { setFollowModalTab('followers'); setIsFollowModalOpen(true); }}
              className="p-4 bg-neutral-50/80 hover:bg-blue-50/60 hover:border-blue-200 rounded-2xl border border-neutral-200/80 text-left transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-bold text-neutral-500 group-hover:text-[#0057FF] block mb-1 flex items-center justify-between">
                <span>粉丝关注</span>
                <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-2xl font-black font-mono text-neutral-900 group-hover:text-[#0057FF]">{followerCount}</span>
            </button>

            <button
              onClick={() => { setFollowModalTab('following'); setIsFollowModalOpen(true); }}
              className="p-4 bg-neutral-50/80 hover:bg-blue-50/60 hover:border-blue-200 rounded-2xl border border-neutral-200/80 text-left transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-bold text-neutral-500 group-hover:text-[#0057FF] block mb-1 flex items-center justify-between">
                <span>正在关注</span>
                <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-2xl font-black font-mono text-neutral-900 group-hover:text-[#0057FF]">{profileUser.followingCount || 0}</span>
            </button>
          </div>
        </div>

        {/* 主导航 Tab 与筛选排序栏 */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-neutral-200">
            {/* 一级导航 Tab */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {[
                { id: 'works', label: '全部作品', count: allWorks.length, icon: Layers },
                { id: 'moodboards', label: '情绪收藏集', count: moodboardWorks.length, icon: BookmarkCheck },
                { id: 'appreciations', label: '赞誉荣誉', count: appreciationWorks.length, icon: Award },
                { id: 'about', label: '档案与关于', icon: UserIcon },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      isActive ? 'text-[#0057FF] font-black' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && (
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                        isActive ? 'bg-blue-50 text-[#0057FF] border border-blue-200' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeUserTabLine"
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0057FF] rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 作品子分类药丸与排序 */}
            {activeTab === 'works' && (
              <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 text-xs">
                {/* 分类药丸 */}
                <div className="flex items-center gap-1 p-0.5 bg-neutral-100/80 rounded-xl">
                  <button
                    onClick={() => setWorksSubTab('all')}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      worksSubTab === 'all'
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    全部 ({allWorks.length})
                  </button>
                  <button
                    onClick={() => setWorksSubTab('articles')}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      worksSubTab === 'articles'
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    图文 ({realArticleCount})
                  </button>
                  <button
                    onClick={() => setWorksSubTab('videos')}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      worksSubTab === 'videos'
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    视频 ({realVideoCount})
                  </button>
                  <button
                    onClick={() => setWorksSubTab('files')}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      worksSubTab === 'files'
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    资源 ({realFileCount})
                  </button>
                </div>

                {/* 排序方式 */}
                <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500">
                  <span>排序:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-neutral-100 hover:bg-neutral-200 border-none rounded-lg px-2 py-1 text-neutral-800 font-bold cursor-pointer focus:outline-none"
                  >
                    <option value="latest">最新发布</option>
                    <option value="likes">最多获赞</option>
                    <option value="views">最多浏览</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 内容面板 */}
          {activeTab === 'works' && (
            displayedWorks.length === 0 ? (
              <div className="py-24 text-center space-y-3 bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200 p-8 shadow-2xs">
                <Layers className="w-10 h-10 mx-auto text-neutral-400" />
                <p className="text-sm font-extrabold text-neutral-800">暂无作品发布</p>
                <p className="text-xs text-neutral-500">该分类下创作者尚未公开任何创意作品。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {displayedWorks.map((work, idx) => (
                  <RefinedLightWorkCard
                    key={`work-${work.type}-${work.id}-${idx}`}
                    item={work}
                    isSelf={isSelf}
                    onLike={() => handleLikeWork(work)}
                    onFavorite={() => handleFavoriteWork(work)}
                    onComment={() => handleOpenComments(work)}
                    onShare={() => handleOpenShare(work)}
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
          )}

          {activeTab === 'moodboards' && (
            moodboardWorks.length === 0 ? (
              <div className="py-24 text-center space-y-3 bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200 p-8 shadow-2xs">
                <BookmarkCheck className="w-10 h-10 mx-auto text-neutral-400" />
                <p className="text-sm font-extrabold text-neutral-800">暂无收藏的情绪板</p>
                <p className="text-xs text-neutral-500">创作者尚未标记喜爱的设计灵感与作品。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {moodboardWorks.map((work, idx) => (
                  <RefinedLightWorkCard
                    key={`mood-${work.type}-${work.id}-${idx}`}
                    item={work}
                    isSelf={isSelf}
                    onLike={() => handleLikeWork(work)}
                    onFavorite={() => handleFavoriteWork(work)}
                    onComment={() => handleOpenComments(work)}
                    onShare={() => handleOpenShare(work)}
                    onDelete={() => {}}
                    onEdit={() => {}}
                    onToggleStatus={() => {}}
                  />
                ))}
              </div>
            )
          )}

          {activeTab === 'appreciations' && (
            appreciationWorks.length === 0 ? (
              <div className="py-24 text-center space-y-3 bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200 p-8 shadow-2xs">
                <Award className="w-10 h-10 mx-auto text-neutral-400" />
                <p className="text-sm font-extrabold text-neutral-800">暂无获得赞誉的作品</p>
                <p className="text-xs text-neutral-500">快去探索这位创作者的作品并送上你的点赞好评吧！</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {appreciationWorks.map((work, idx) => (
                  <RefinedLightWorkCard
                    key={`apprec-${work.type}-${work.id}-${idx}`}
                    item={work}
                    isSelf={isSelf}
                    onLike={() => handleLikeWork(work)}
                    onFavorite={() => handleFavoriteWork(work)}
                    onComment={() => handleOpenComments(work)}
                    onShare={() => handleOpenShare(work)}
                    onDelete={() => {}}
                    onEdit={() => {}}
                    onToggleStatus={() => {}}
                  />
                ))}
              </div>
            )
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* 核心信息卡片 */}
              <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="w-5 h-5 text-[#0057FF]" />
                    <h2 className="text-base font-bold text-neutral-900">创作者档案与联系方式</h2>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">PUBLIC PORTFOLIO INFO</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                      <AtSign className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-neutral-400 font-bold mb-0.5">系统账号</div>
                      <div className="text-sm font-bold text-neutral-900 truncate font-mono">
                        {profileUser.username || profileUser.nickName}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-neutral-400 font-bold mb-0.5">公开联系邮箱</div>
                      <div className="text-sm font-bold text-neutral-900 truncate font-mono">
                        {profileUser.email || `${profileUser.username || 'user'}@leaplunar.com`}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-neutral-400 font-bold mb-0.5">入驻注册时间</div>
                      <div className="text-sm font-bold text-neutral-900 font-mono">
                        {profileUser.createdAt?.slice(0, 10) || '2026-08-01'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                    <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-neutral-400 font-bold mb-0.5">社区认证权限</div>
                      <div className="text-sm font-bold text-neutral-900">
                        {isSuperAdmin ? '平台超级管理员' : '认证专业创作者'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-neutral-400 font-bold mb-0.5">当前状态</div>
                      <div className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>正常活跃</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 技能与创作领域 */}
                <div className="pt-6 border-t border-neutral-100 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">设计专长与创作领域</h3>
                  <div className="flex flex-wrap gap-2">
                    {['UI/UX 界面设计', '3D 动效渲染', '品牌视觉体系', '多端交互体验', '设计系统构建', '插画与排版'].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-blue-50 hover:text-[#0057FF] text-neutral-700 text-xs font-bold rounded-xl border border-neutral-200/70 transition-colors cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 弹窗 1: 粉丝与关注者列表 */}
      <FollowerModal
        isOpen={isFollowModalOpen}
        userId={profileUser.id}
        initialTab={followModalTab}
        onClose={() => setIsFollowModalOpen(false)}
      />

      {/* 弹窗 2: 实时聊天抽屉 */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetUser={profileUser}
      />

      {/* 弹窗 3: 作品编辑弹窗 (本人) */}
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

      {/* 弹窗 4: 评论抽屉/弹窗 */}
      {activeCommentWork && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[80vh] relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="min-w-0 pr-3">
                <h3 className="text-base font-black text-neutral-900 truncate">作品评论: {activeCommentWork.title}</h3>
                <p className="text-xs text-neutral-500">与创作者和社区同好交流互动</p>
              </div>
              <button
                onClick={() => setActiveCommentWork(null)}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 评论列表 */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[200px]">
              {loadingComments ? (
                <div className="text-center py-12 text-neutral-400 text-xs">正在加载评论...</div>
              ) : commentsList.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs space-y-1">
                  <p className="font-bold text-neutral-600">暂无评论</p>
                  <p>快来发表第一条优质点评吧！</p>
                </div>
              ) : (
                commentsList.map((comment) => (
                  <div key={comment.id} className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            resolveImageUrl(comment.author?.avatar || (comment as any).user?.avatar) ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'
                          }
                          alt={comment.author?.nickName || (comment as any).user?.nickName || '用户'}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-bold text-neutral-800">
                          {comment.author?.nickName || (comment as any).user?.nickName || '社区用户'}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">{comment.createdAt?.slice(0, 10)}</span>
                    </div>
                    <p className="text-neutral-700 text-xs pl-7 leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* 评论输入框 */}
            <div className="flex gap-2 pt-2 border-t border-neutral-100">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                placeholder="撰写你的真诚点评..."
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white"
              />
              <button
                onClick={handlePostComment}
                disabled={submittingComment || !newCommentText.trim()}
                className="bg-[#0057FF] hover:bg-[#0046CC] disabled:bg-neutral-200 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>发送</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 5: 分享转发弹窗 */}
      {shareWork && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#0057FF]" />
                <span>分享与传播作品</span>
              </h3>
              <button
                onClick={() => setShareWork(null)}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-neutral-800 line-clamp-1 mb-1">{shareWork.title}</p>
              <p className="text-xs text-neutral-500">将作品链接复制或分享至微信、社交群组</p>
            </div>

            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl">
              <input
                type="text"
                readOnly
                value={shareWork.url}
                className="flex-1 bg-transparent text-xs text-neutral-700 focus:outline-none truncate font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareWork.url);
                  setCopiedShareUrl(true);
                  showToast({ message: '作品链接已复制', type: 'success' });
                  setTimeout(() => setCopiedShareUrl(false), 2000);
                }}
                className="px-3.5 py-1.5 bg-[#0057FF] hover:bg-[#0046CC] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedShareUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedShareUrl ? '已复制' : '复制'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 6: 举报创作者弹窗 */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                <span>举报违规创作者</span>
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">举报原因分类</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF]"
                >
                  <option value="侵权与冒充抄袭">侵权与冒充抄袭</option>
                  <option value="低俗与有害内容">低俗与有害内容</option>
                  <option value="垃圾广告与骚扰">垃圾广告与骚扰</option>
                  <option value="虚假欺诈与恶意刷量">虚假欺诈与恶意刷量</option>
                  <option value="其他违规行为">其他违规行为</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">详细描述说明 (选填)</label>
                <textarea
                  value={reportDetail}
                  onChange={(e) => setReportDetail(e.target.value)}
                  rows={3}
                  placeholder="请简要说明具体违规事实，便于管理员核查..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF]"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={submittingReport}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {submittingReport ? '提交中...' : '确认提交举报'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
