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
  Search
} from 'lucide-react';

import { User, Article, Video, FileItem } from '../../types';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
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

// 统一作品卡片组件
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
    status: number;
    createdAt?: string;
    linkUrl: string;
  };
  onDelete: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}> = ({ item, onDelete, onEdit, onToggleStatus }) => {
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
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold rounded-full shadow-xs">
            {item.categoryName || (item.type === 'article' ? '图文' : item.type === 'video' ? '视频' : '资源')}
          </span>
          <span className={`px-2.5 py-1 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs ${
            item.status === 1 ? 'bg-amber-500/90 backdrop-blur-md' : 'bg-emerald-500/90 backdrop-blur-md'
          }`}>
            {item.status === 1 ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {item.status === 1 ? '私人' : '公开'}
          </span>
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

          {/* 发布时间 - 位于简介下方 */}
          {item.createdAt && (
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono mb-3">
              <Calendar className="w-3 h-3 text-neutral-400" />
              <span>{formatDate(item.createdAt)}</span>
            </div>
          )}
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
          <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-100">
            <button
              onClick={onEdit}
              className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0057FF] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" /> 编辑
            </button>
            <button
              onClick={onToggleStatus}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                item.status === 1 
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' 
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-600'
              }`}
            >
              {item.status === 1 ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {item.status === 1 ? '设为公开' : '设为私人'}
            </button>
            <button
              onClick={onDelete}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
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
            id: item.id,
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
            status: item.status || 0,
            isHidden: 0,
            createdAt: item.createdAt,
            userId: user.id,
            author: user
          })));
          
          setVideos(videosFromFeed.map((item: any) => ({
            id: item.id,
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
            status: item.status || 0,
            isHidden: 0,
            allowDownload: 1,
            createdAt: item.createdAt,
            userId: user.id,
            author: user
          })));
          
          setFiles(filesFromFeed.map((item: any) => ({
            id: item.id,
            title: item.title,
            fileName: item.title,
            fileUrl: item.filePath || '',
            coverImage: item.coverImage,
            categoryId: item.categoryId || 5,
            categoryName: item.categoryName,
            fileType: item.fileType || 'zip',
            fileSize: item.fileSize || '10 MB',
            downloadCount: item.viewCount || 0,
            likeCount: item.likeCount || 0,
            favoriteCount: item.favoriteCount || 0,
            commentCount: item.commentCount || 0,
            status: item.status || 0,
            isHidden: 0,
            allowDownload: 1,
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

  // 删除操作
  const handleDeleteArticle = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try {
      await articlesApi.deleteArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch {
      alert('删除失败');
    }
  };

  const handleDeleteVideo = async (id: number) => {
    if (!confirm('确定要删除这个视频吗？')) return;
    try {
      await videosApi.deleteVideo(id);
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch {
      alert('删除失败');
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (!confirm('确定要删除这个文件吗？')) return;
    try {
      await filesApi.deleteFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch {
      alert('删除失败');
    }
  };

  // 状态切换
  const handleToggleArticleStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await articlesApi.updateArticleStatus(id, newStatus);
      setArticles(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch {
      alert('状态更新失败');
    }
  };

  const handleToggleVideoStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await videosApi.updateVideoStatus(id, newStatus);
      setVideos(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
    } catch {
      alert('状态更新失败');
    }
  };

  const handleToggleFileStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await filesApi.updateFileStatus(id, newStatus);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
    } catch {
      alert('状态更新失败');
    }
  };

  if (!user) {
    return null;
  }

  // 格式化作品数据
  const formattedArticles = articles.map(a => ({
    id: a.id,
    type: 'article' as const,
    title: a.title,
    coverImage: a.coverImage,
    categoryName: a.categoryName || '图文',
    viewCount: a.viewCount || 0,
    likeCount: a.likeCount || 0,
    favoriteCount: a.favoriteCount || 0,
    commentCount: a.commentCount || 0,
    status: a.status,
    createdAt: a.createdAt,
    linkUrl: `/articles/${a.id}`
  }));

  const formattedVideos = videos.map(v => ({
    id: v.id,
    type: 'video' as const,
    title: v.title,
    coverImage: v.coverImage,
    categoryName: v.categoryName || '视频',
    viewCount: v.viewCount || 0,
    likeCount: v.likeCount || 0,
    favoriteCount: v.favoriteCount || 0,
    commentCount: v.commentCount || 0,
    status: v.status,
    createdAt: v.createdAt,
    linkUrl: `/videos/${v.id}`
  }));

  const formattedFiles = files.map(f => ({
    id: f.id,
    type: 'file' as const,
    title: f.title,
    coverImage: f.coverImage,
    categoryName: f.categoryName || '资源',
    viewCount: f.downloadCount || 0,
    likeCount: f.likeCount || 0,
    favoriteCount: f.favoriteCount || 0,
    commentCount: f.commentCount || 0,
    status: f.status,
    createdAt: f.createdAt,
    linkUrl: `/files/${f.id}`
  }));

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
        {/* Header Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-blue-950 text-white rounded-3xl shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#0057FF] text-white text-[10px] font-extrabold uppercase rounded tracking-wider">
                Personal Collection
              </span>
              <span className="text-xs text-neutral-400 font-mono">共 {allWorks.length} 项资产</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-[#0057FF]" />
              作品管理
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300">
              聚焦创作灵感，统一管理并展示您的全流图文、视频与资源资产
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0057FF]/30 cursor-pointer self-start md:self-center shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>发布新作品</span>
          </motion.button>
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
                    onDelete={() => {
                      if (work.type === 'article') handleDeleteArticle(work.id);
                      else if (work.type === 'video') handleDeleteVideo(work.id);
                      else handleDeleteFile(work.id);
                    }}
                    onEdit={() => {
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
                    }}
                    onToggleStatus={() => {
                      if (work.type === 'article') handleToggleArticleStatus(work.id, work.status);
                      else if (work.type === 'video') handleToggleVideoStatus(work.id, work.status);
                      else handleToggleFileStatus(work.id, work.status);
                    }}
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
    </motion.div>
  );
};

