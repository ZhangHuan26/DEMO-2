import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Video as VideoIcon,
  Folder,
  Eye,
  ThumbsUp,
  Bookmark,
  MessageCircle,
  Lock,
  Globe,
  Pencil,
  Trash2,
  Sparkles,
  Plus,
  Calendar,
  Layers,
  Search,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Download,
  Ban
} from 'lucide-react';

import { User, Article, Video, FileItem } from '../../types';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi, formatBytesToString } from '../../api/files';
import { feedApi } from '../../api/feed';
import { useAuth } from '../../context/AuthContext';
import { CreateWorkModal } from '../../components/common/CreateWorkModal';
import { resolveImageUrl } from '../../config/env';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

// 统一作品卡片组件 (白色质感风格)
const WorkCard: React.FC<{
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
    status: number; // 0-公共, 1-私人
    isHidden?: number; // 0-正常, 1-已被管理员隐藏
    allowDownload?: number; // 0-禁止下载, 1-允许下载
    createdAt?: string;
    linkUrl: string;
  };
  onDelete: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onToggleDownload?: () => void;
  isEditingLoading?: boolean;
}> = ({ item, onDelete, onEdit, onToggleStatus, onToggleDownload, isEditingLoading }) => {
  return (
    <div className="group bg-white border border-neutral-200/90 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1">
      {/* 封面图 统一 16:10 比例 */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 shrink-0">
        <img
          src={resolveImageUrl(item.coverImage)}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
          }}
        />

        {/* 顶部角标 */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-1">
          <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold rounded-full shadow-xs truncate max-w-[100px]">
            {item.categoryName || (item.type === 'article' ? '图文' : item.type === 'video' ? '视频' : '资源')}
          </span>

          <div className="flex items-center gap-1">
            {/* 文件类别的下载可否状态标示 */}
            {item.type === 'file' && (
              <span className={`px-2 py-1 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs ${
                item.allowDownload === 0 ? 'bg-rose-500' : 'bg-blue-600'
              }`} title={item.allowDownload === 0 ? '禁止下载' : '允许下载'}>
                {item.allowDownload === 0 ? <Ban className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                <span>{item.allowDownload === 0 ? '禁下载' : '可下载'}</span>
              </span>
            )}

            {/* 公共 / 私人 / 被隐藏 状态 */}
            {item.isHidden === 1 ? (
              <span className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs">
                <AlertCircle className="w-3 h-3" /> 已隐藏
              </span>
            ) : (
              <span className={`px-2.5 py-1 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs ${
                item.status === 1 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}>
                {item.status === 1 ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {item.status === 1 ? '私人' : '公共'}
              </span>
            )}
          </div>
        </div>

        {/* 视频图标 */}
        {item.type === 'video' && (
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center transition-colors">
            <div className="w-10 h-10 bg-[#0057FF] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0057FF]/40 group-hover:scale-110 transition-transform">
              <VideoIcon className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors line-clamp-2 leading-snug mb-1.5 min-h-[2.5rem]">
            {item.title}
          </h3>

          {/* 发布时间与状态类型 */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-3">
            {item.createdAt && (
              <div className="flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-neutral-400" />
                <span>{formatDate(item.createdAt)}</span>
              </div>
            )}
            <span className="font-semibold text-neutral-500">
              {item.type === 'article' ? '图文' : item.type === 'video' ? '视频' : '文件'} · {item.status === 1 ? '私人' : '公共'}
            </span>
          </div>
        </div>

        <div>
          {/* 数据指标 */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium mb-3 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1" title="浏览数">
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                {item.viewCount}
              </span>
              <span className="flex items-center gap-1" title="赞赏数">
                <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                {item.likeCount}
              </span>
              <span className="flex items-center gap-1" title="收藏数">
                <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                {item.favoriteCount || 0}
              </span>
              <span className="flex items-center gap-1" title="评论数">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                {item.commentCount || 0}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1 pt-2 border-t border-neutral-100">
            <button
              onClick={onEdit}
              disabled={isEditingLoading}
              className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0057FF] text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
            >
              {isEditingLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Pencil className="w-3 h-3" />
              )}
              <span>编辑</span>
            </button>

            <button
              onClick={onToggleStatus}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                item.status === 1 
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' 
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-600'
              }`}
              title={item.status === 1 ? '设为公共' : '设为私人'}
            >
              {item.status === 1 ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span>{item.status === 1 ? '设为公共' : '设为私人'}</span>
            </button>

            {/* 文件类型的允许/禁止下载快速切换 */}
            {item.type === 'file' && onToggleDownload && (
              <button
                onClick={onToggleDownload}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  item.allowDownload === 0
                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }`}
                title={item.allowDownload === 0 ? '允许他人下载' : '禁止他人下载'}
              >
                {item.allowDownload === 0 ? <Download className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                <span>{item.allowDownload === 0 ? '允许下载' : '禁止下载'}</span>
              </button>
            )}

            <button
              onClick={onDelete}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer shrink-0"
              title="删除作品"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MyWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'videos' | 'files'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<{
    type: 'article' | 'video' | 'file';
    article?: Article;
    video?: Video;
    file?: FileItem;
  } | null>(null);

  // 删除确认 Modal 与 Toast 提示状态
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    type: 'article' | 'video' | 'file';
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loadingEditKey, setLoadingEditKey] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadMyWorks();
  }, [user, navigate]);

  const loadMyWorks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      try {
        const userWorksRes = await feedApi.getUserWorks(user.id, { page: 1, size: 100 });
        const allContent = userWorksRes.list || [];
        
        if (allContent.length > 0) {
          const articlesFromFeed = allContent.filter((item: any) => item.contentType === 1);
          const videosFromFeed = allContent.filter((item: any) => item.contentType === 2);
          const filesFromFeed = allContent.filter((item: any) => item.contentType === 3);
          
          setArticles(articlesFromFeed.map((item: any) => ({
            id: item.contentId || item.id,
            title: item.title,
            summary: item.summary || '',
            content: item.content || '',
            coverImage: item.coverImage,
            categoryId: item.categoryId || 1,
            categoryName: item.categoryName,
            viewCount: item.viewCount || 0,
            likeCount: item.likeCount || 0,
            favoriteCount: item.favoriteCount || 0,
            commentCount: item.commentCount || 0,
            // aggregation: visibility=公共/私人, isHidden=管理员隐藏, status=管理员隐藏(兼容)
            visibility: item.visibility !== undefined ? item.visibility : 0,
            status: item.visibility !== undefined ? item.visibility : 0,
            isHidden: item.isHidden ?? item.status ?? 0,
            createdAt: item.createdAt,
            userId: user.id,
            author: user
          })));
          
          setVideos(videosFromFeed.map((item: any) => ({
            id: item.contentId || item.id,
            title: item.title,
            description: item.summary || '',
            videoUrl: item.filePath || '',
            coverImage: item.coverImage,
            categoryId: item.categoryId || 3,
            categoryName: item.categoryName,
            duration: item.duration || '00:00',
            viewCount: item.viewCount || 0,
            likeCount: item.likeCount || 0,
            favoriteCount: item.favoriteCount || 0,
            commentCount: item.commentCount || 0,
            // aggregation: visibility=公共/私人, isHidden=管理员隐藏, status=管理员隐藏(兼容)
            visibility: item.visibility !== undefined ? item.visibility : 0,
            status: item.visibility !== undefined ? item.visibility : 0,
            isHidden: item.isHidden ?? item.status ?? 0,
            allowDownload: item.allowDownload ?? 1,
            createdAt: item.createdAt,
            userId: user.id,
            author: user
          })));
          
          setFiles(filesFromFeed.map((item: any) => ({
            id: item.contentId || item.id,
            title: item.title,
            description: item.summary || item.description || '',
            fileName: item.title,
            fileUrl: item.filePath || '',
            coverImage: item.coverImage,
            categoryId: item.categoryId || 5,
            categoryName: item.categoryName,
            fileType: item.fileType !== undefined && typeof item.fileType !== 'string' ? (['其他','图片','文档','视频','音频','压缩包'][Number(item.fileType)] || '') : (item.fileType || ''),
            fileSize: item.fileSize !== undefined && typeof item.fileSize !== 'string' ? formatBytesToString(item.fileSize) : (item.fileSize || ''),
            downloadCount: item.viewCount || 0,
            likeCount: item.likeCount || 0,
            favoriteCount: item.favoriteCount || 0,
            commentCount: item.commentCount || 0,
            // aggregation: visibility=公共/私人, isHidden=管理员隐藏, status=管理员隐藏(兼容)
            visibility: item.visibility !== undefined ? item.visibility : 0,
            status: item.visibility !== undefined ? item.visibility : 0,
            isHidden: item.isHidden ?? item.status ?? 0,
            allowDownload: item.allowDownload ?? 1,
            createdAt: item.createdAt,
            userId: user.id,
            author: user
          })));
          
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('聚合接口不可用，使用分散接口获取:', error);
      }

      const [artsRes, vidsRes, flsRes] = await Promise.all([
        articlesApi.getArticles({ userId: user.id, limit: 100 }),
        videosApi.getVideos({ userId: user.id, limit: 100 }),
        filesApi.getFiles({ userId: user.id, limit: 100 })
      ]);

      setArticles((artsRes.list || []).map(a => ({
        ...a,
        favoriteCount: a.favoriteCount || 0,
        commentCount: a.commentCount || 0
      })));
      
      setVideos((vidsRes.list || []).map(v => ({
        ...v,
        favoriteCount: v.favoriteCount || 0,
        commentCount: v.commentCount || 0
      })));
      
      setFiles((flsRes.list || []).map(f => ({
        ...f,
        favoriteCount: f.favoriteCount || 0,
        commentCount: f.commentCount || 0
      })));
    } catch (error) {
      console.error('加载作品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 统一确认删除操作
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'article') {
        await articlesApi.deleteArticle(deleteTarget.id);
        setArticles(prev => prev.filter(a => a.id !== deleteTarget.id));
      } else if (deleteTarget.type === 'video') {
        await videosApi.deleteVideo(deleteTarget.id);
        setVideos(prev => prev.filter(v => v.id !== deleteTarget.id));
      } else {
        await filesApi.deleteFile(deleteTarget.id);
        setFiles(prev => prev.filter(f => f.id !== deleteTarget.id));
      }
      setToastMessage({ text: `作品《${deleteTarget.title}》已成功删除`, type: 'success' });
    } catch (error) {
      console.error('删除作品失败:', error);
      setToastMessage({ text: '删除失败，请稍后重试', type: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // 状态切换 (0为公开，1为私人)
  const handleToggleArticleStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await articlesApi.updateArticleStatus(id, newStatus);
      setArticles(prev => prev.map(a => a.id === id ? { ...a, status: newStatus, visibility: newStatus } : a));
      setToastMessage({
        text: `作品状态已更新为「${newStatus === 1 ? '私人' : '公共'}」`,
        type: 'success'
      });
    } catch (error) {
      console.error('更新文章状态失败:', error);
      setToastMessage({ text: '状态更新失败，请稍后重试', type: 'error' });
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleToggleVideoStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await videosApi.updateVideoStatus(id, newStatus);
      setVideos(prev => prev.map(v => v.id === id ? { ...v, status: newStatus, visibility: newStatus } : v));
      setToastMessage({
        text: `作品状态已更新为「${newStatus === 1 ? '私人' : '公共'}」`,
        type: 'success'
      });
    } catch (error) {
      console.error('更新视频状态失败:', error);
      setToastMessage({ text: '状态更新失败，请稍后重试', type: 'error' });
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleToggleFileStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await filesApi.updateFileStatus(id, newStatus);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: newStatus, visibility: newStatus } : f));
      setToastMessage({
        text: `作品状态已更新为「${newStatus === 1 ? '私人' : '公共'}」`,
        type: 'success'
      });
    } catch (error) {
      console.error('更新文件状态失败:', error);
      setToastMessage({ text: '状态更新失败，请稍后重试', type: 'error' });
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleToggleFileDownload = async (id: number, currentAllow: number) => {
    const newAllow = currentAllow === 1 ? 0 : 1;
    try {
      await filesApi.updateAllowDownload(id, newAllow);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, allowDownload: newAllow } : f));
      setToastMessage({
        text: `文件下载控制已更改为「${newAllow === 1 ? '允许下载' : '禁止下载'}」`,
        type: 'success'
      });
    } catch (error) {
      console.error('更新下载权限失败:', error);
      setToastMessage({ text: '修改下载权限失败，请稍后重试', type: 'error' });
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // 编辑作品：精准调用 GET /articles/{id}, GET /videos/{id}, GET /files/{id} 获取完整详情
  const handleEditWork = async (work: { id: number; type: 'article' | 'video' | 'file' }) => {
    const key = `${work.type}-${work.id}`;
    setLoadingEditKey(key);
    try {
      if (work.type === 'article') {
        const articleDetail = await articlesApi.getArticleById(work.id);
        setEditModalData({ type: 'article', article: articleDetail });
      } else if (work.type === 'video') {
        const videoDetail = await videosApi.getVideoById(work.id);
        setEditModalData({ type: 'video', video: videoDetail });
      } else {
        const fileDetail = await filesApi.getFileById(work.id);
        setEditModalData({ type: 'file', file: fileDetail });
      }
    } catch (error) {
      console.error('获取作品详情失败，使用列表缓存:', error);
      if (work.type === 'article') {
        const article = articles.find(a => a.id === work.id);
        if (article) setEditModalData({ type: 'article', article });
      } else if (work.type === 'video') {
        const video = videos.find(v => v.id === work.id);
        if (video) setEditModalData({ type: 'video', video });
      } else {
        const file = files.find(f => f.id === work.id);
        if (file) setEditModalData({ type: 'file', file });
      }
    } finally {
      setLoadingEditKey(null);
    }
  };

  if (!user) {
    return null;
  }

  // 格式化作品数据
  const formattedArticles = articles.map(a => {
    const statusVal = a.visibility !== undefined ? a.visibility : (a.status ?? 0);
    return {
      id: a.id,
      type: 'article' as const,
      title: a.title,
      coverImage: a.coverImage,
      categoryName: a.categoryName || '图文',
      viewCount: a.viewCount || 0,
      likeCount: a.likeCount || 0,
      favoriteCount: a.favoriteCount || 0,
      commentCount: a.commentCount || 0,
      status: statusVal,
      visibility: statusVal,
      isHidden: a.isHidden ?? 0,
      createdAt: a.createdAt,
      linkUrl: `/articles/${a.id}`
    };
  });

  const formattedVideos = videos.map(v => {
    const statusVal = v.visibility !== undefined ? v.visibility : (v.status ?? 0);
    return {
      id: v.id,
      type: 'video' as const,
      title: v.title,
      coverImage: v.coverImage,
      categoryName: v.categoryName || '视频',
      viewCount: v.viewCount || 0,
      likeCount: v.likeCount || 0,
      favoriteCount: v.favoriteCount || 0,
      commentCount: v.commentCount || 0,
      status: statusVal,
      visibility: statusVal,
      isHidden: v.isHidden ?? 0,
      createdAt: v.createdAt,
      linkUrl: `/videos/${v.id}`
    };
  });

  const formattedFiles = files.map(f => {
    const statusVal = f.visibility !== undefined ? f.visibility : (f.status ?? 0);
    return {
      id: f.id,
      type: 'file' as const,
      title: f.title,
      coverImage: f.coverImage,
      categoryName: f.categoryName || '资源',
      viewCount: f.downloadCount || f.viewCount || 0,
      likeCount: f.likeCount || 0,
      favoriteCount: f.favoriteCount || 0,
      commentCount: f.commentCount || 0,
      status: statusVal,
      visibility: statusVal,
      isHidden: f.isHidden ?? 0,
      allowDownload: f.allowDownload !== undefined ? f.allowDownload : 1,
      createdAt: f.createdAt,
      linkUrl: `/files/${f.id}`
    };
  });

  const allWorks = [...formattedArticles, ...formattedVideos, ...formattedFiles];
  const displayedWorks = (activeTab === 'articles' 
    ? formattedArticles 
    : activeTab === 'videos' 
    ? formattedVideos 
    : activeTab === 'files' 
    ? formattedFiles 
    : allWorks).filter(item => 
      !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white min-h-screen pb-16 font-sans"
    >
      <div className="w-full px-[20px] py-6 space-y-6">
        {/* Header Header - Clean Studio White Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0057FF] text-xs font-bold rounded-full border border-blue-100">
                  <Sparkles className="w-3.5 h-3.5 text-[#0057FF]" />
                  <span>个人作品中心</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                个人作品中心
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
                统一管理您的图文专栏、视频案例与设计资源，实时监控作品状态与公开权限
              </p>
            </div>

            {/* Right Action & Asset Breakdown */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 mr-1">
                <div className="text-center px-2">
                  <div className="text-xs text-neutral-400 font-mono">图文</div>
                  <div className="text-sm font-extrabold text-neutral-900 font-mono">{articles.length}</div>
                </div>
                <div className="w-px h-6 bg-neutral-200" />
                <div className="text-center px-2">
                  <div className="text-xs text-neutral-400 font-mono">视频</div>
                  <div className="text-sm font-extrabold text-neutral-900 font-mono">{videos.length}</div>
                </div>
                <div className="w-px h-6 bg-neutral-200" />
                <div className="text-center px-2">
                  <div className="text-xs text-neutral-400 font-mono">资源</div>
                  <div className="text-sm font-extrabold text-neutral-900 font-mono">{files.length}</div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0057FF]/20 cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>发布新作品</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Control Toolbar & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-neutral-50/90 p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索作品标题..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/20 transition-all"
            />
          </div>

          {/* Animated Tab Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 text-xs font-semibold relative">
            {[
              { id: 'all', label: `全部 (${allWorks.length})`, icon: Layers },
              { id: 'articles', label: `图文 (${articles.length})`, icon: FileText },
              { id: 'videos', label: `视频 (${videos.length})`, icon: VideoIcon },
              { id: 'files', label: `资源 (${files.length})`, icon: Folder },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive ? 'text-white font-bold' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeWorksTab"
                      className="absolute inset-0 bg-black rounded-lg -z-10 shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Works Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : displayedWorks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 text-center space-y-4 bg-neutral-50 rounded-2xl border border-neutral-200"
          >
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-800">暂无符合条件的作品</h3>
              <p className="text-xs text-neutral-500 mt-1">即刻发布您的创作成果，展现视觉创意</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-[#0057FF]/20 cursor-pointer"
            >
              创建新作品
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {displayedWorks.map((work) => (
                <motion.div
                  key={`${work.type}-${work.id}`}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <WorkCard
                    item={work}
                    isEditingLoading={loadingEditKey === `${work.type}-${work.id}`}
                    onDelete={() => {
                      setDeleteTarget({ id: work.id, type: work.type, title: work.title });
                    }}
                    onEdit={() => handleEditWork(work)}
                    onToggleStatus={() => {
                      if (work.type === 'article') handleToggleArticleStatus(work.id, work.status);
                      else if (work.type === 'video') handleToggleVideoStatus(work.id, work.status);
                      else handleToggleFileStatus(work.id, work.status);
                    }}
                    onToggleDownload={
                      work.type === 'file' 
                        ? () => handleToggleFileDownload(work.id, work.allowDownload ?? 1) 
                        : undefined
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 创建/编辑模态框 */}
      {(isCreateModalOpen || editModalData) && (
        <CreateWorkModal
          isOpen={true}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditModalData(null);
          }}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            setEditModalData(null);
            loadMyWorks();
          }}
          initialType={editModalData?.type}
          editData={editModalData}
        />
      )}

      {/* 删除确认弹窗 */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 relative overflow-hidden space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="text-base font-bold text-neutral-900">确定要删除该作品吗？</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    您即将删除作品 <span className="font-bold text-neutral-800 break-all">《{deleteTarget.title}》</span>，删除后关联的数据将无法恢复。
                  </p>
                </div>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>确认删除</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast 消息提示 */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-neutral-900 text-white border-neutral-800 shadow-black/20'
                : 'bg-rose-900 text-white border-rose-800 shadow-rose-900/20'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

