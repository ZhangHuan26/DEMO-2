import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
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
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Award,
  Users,
  Activity,
  Sparkles,
  Edit3,
  Plus,
  Info
} from 'lucide-react';

import { User, Article, Video, FileItem } from '../../types';
import { authApi } from '../../api/auth';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { useAuth } from '../../context/AuthContext';
import { CreateWorkModal } from '../../components/common/CreateWorkModal';
import { resolveImageUrl } from '../../config/env';

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
    <div className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* 封面图 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={resolveImageUrl(item.coverImage)}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
          }}
        />

        {/* 角标 */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg">
            {item.categoryName || item.type.toUpperCase()}
          </span>
          <span className={`px-2.5 py-1 text-white text-[10px] font-bold rounded-full flex items-center gap-1 ${
            item.status === 1 ? 'bg-amber-500/90' : 'bg-emerald-500/90'
          }`}>
            {item.status === 1 ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {item.status === 1 ? '私人' : '公共'}
          </span>
        </div>

        {/* 视频图标 */}
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-[#0057FF] text-white rounded-full flex items-center justify-center shadow-lg">
              <VideoIcon className="w-6 h-6 fill-white" />
            </div>
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug">
          {item.title}
        </h3>

        {/* 数据指标 */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {item.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              {item.likeCount}
            </span>
          </div>
          <span className="text-[10px] text-neutral-400">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
          </span>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
          <button
            onClick={onEdit}
            className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-[#0057FF] text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> 编辑
          </button>
          <button
            onClick={onToggleStatus}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              item.status === 1 
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' 
                : 'bg-amber-50 hover:bg-amber-100 text-amber-600'
            }`}
          >
            {item.status === 1 ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {item.status === 1 ? '设为公共' : '设为私人'}
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const MyWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'videos' | 'files'>('all');
  
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
      // 获取完整个人信息
      const me = await authApi.getMe();
      setProfileUser(me);

      // 方案1: 使用 GET /content/user/{userId} 聚合接口（推荐）
      // 这个接口专门用于获取用户的所有作品，作者本人可以看到公共+私人作品
      try {
        const userWorksRes = await feedApi.getUserWorks(user.id, { page: 1, size: 100 });
        const allContent = userWorksRes.list || [];
        
        // 按类型分类
        const articlesFromFeed = allContent.filter((item: any) => item.contentType === 1);
        const videosFromFeed = allContent.filter((item: any) => item.contentType === 2);
        const filesFromFeed = allContent.filter((item: any) => item.contentType === 3);
        
        // 如果聚合接口返回了数据，就使用它
        if (allContent.length > 0) {
          // 转换为标准格式
          setArticles(articlesFromFeed.map((item: any) => ({
            id: item.id,
            title: item.title,
            coverImage: item.coverImage,
            categoryName: item.categoryName,
            viewCount: item.viewCount || 0,
            likeCount: item.likeCount || 0,
            favoriteCount: item.favoriteCount || 0,
            commentCount: item.commentCount || 0,
            status: item.status || 0,
            createdAt: item.createdAt,
            userId: user.id
          })));
          
          setVideos(videosFromFeed.map((item: any) => ({
            id: item.id,
            title: item.title,
            coverImage: item.coverImage,
            categoryName: item.categoryName,
            viewCount: item.viewCount || 0,
            likeCount: item.likeCount || 0,
            favoriteCount: item.favoriteCount || 0,
            commentCount: item.commentCount || 0,
            status: item.status || 0,
            createdAt: item.createdAt,
            userId: user.id
          })));
          
          setFiles(filesFromFeed.map((item: any) => ({
            id: item.id,
            title: item.title,
            coverImage: item.coverImage,
            categoryName: item.categoryName,
            downloadCount: item.viewCount || 0,
            likeCount: item.likeCount || 0,
            favoriteCount: item.favoriteCount || 0,
            commentCount: item.commentCount || 0,
            status: item.status || 0,
            createdAt: item.createdAt,
            userId: user.id
          })));
          
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('聚合接口不可用，使用分散接口获取');
      }

      // 方案2: 分别获取（备用方案）
      // API文档说明：传 userId 时，作者本人可以看到自己的公共+私人作品
      const [artsRes, vidsRes, flsRes] = await Promise.all([
        articlesApi.getArticles({ userId: user.id, limit: 100 }),
        videosApi.getVideos({ userId: user.id, limit: 100 }),
        filesApi.getFiles({ userId: user.id, limit: 100 })
      ]);

      setArticles(artsRes.list || []);
      setVideos(vidsRes.list || []);
      setFiles(flsRes.list || []);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#0057FF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-neutral-600 font-medium">正在加载您的作品和个人信息...</p>
        </div>
      </div>
    );
  }

  // 格式化作品数据
  const formattedArticles = articles.map(a => ({
    id: a.id,
    type: 'article' as const,
    title: a.title,
    coverImage: a.coverImage,
    categoryName: a.categoryName || '文章',
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
    categoryName: f.categoryName || '文件',
    viewCount: f.downloadCount || 0,
    likeCount: f.likeCount || 0,
    favoriteCount: f.favoriteCount || 0,
    commentCount: f.commentCount || 0,
    status: f.status,
    createdAt: f.createdAt,
    linkUrl: `/files/${f.id}`
  }));

  const allWorks = [...formattedArticles, ...formattedVideos, ...formattedFiles];
  const displayedWorks = activeTab === 'articles' 
    ? formattedArticles 
    : activeTab === 'videos' 
    ? formattedVideos 
    : activeTab === 'files' 
    ? formattedFiles 
    : allWorks;

  const stats = {
    totalWorks: allWorks.length,
    publicWorks: allWorks.filter(w => w.status === 0).length,
    privateWorks: allWorks.filter(w => w.status === 1).length,
    totalViews: allWorks.reduce((sum, w) => sum + w.viewCount, 0),
    totalLikes: allWorks.reduce((sum, w) => sum + w.likeCount, 0),
    totalFavorites: allWorks.reduce((sum, w) => sum + (w.favoriteCount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 顶部横幅 */}
      <div className="h-48 bg-gradient-to-r from-[#0057FF] to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
      </div>

      {/* 主要内容区 */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 pb-12">
        {/* 个人信息卡片 */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* 头像 */}
            <img
              src={resolveImageUrl(profileUser?.avatar || user.avatar)}
              alt={user.nickName}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />

            {/* 用户信息 */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-neutral-900">{profileUser?.nickName || user.nickName}</h1>
                {user.role === 1 && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">管理员</span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {profileUser?.email && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <span className="truncate">{profileUser.email}</span>
                  </div>
                )}
                {profileUser?.phone && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <span>{profileUser.phone}</span>
                  </div>
                )}
                {profileUser?.birthday && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span>{String(profileUser.birthday)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-neutral-600">
                  <Activity className="w-4 h-4 text-neutral-400" />
                  <span>ID: {user.id}</span>
                </div>
              </div>

              {profileUser?.signature && (
                <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                  {profileUser.signature}
                </p>
              )}
            </div>

            {/* 编辑按钮 */}
            <button
              onClick={() => navigate('/settings')}
              className="px-6 py-3 bg-[#0057FF] hover:bg-[#0046CC] text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              编辑资料
            </button>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6 pt-6 border-t border-neutral-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0057FF]">{stats.totalWorks}</div>
              <div className="text-xs text-neutral-500 mt-1">作品总数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.publicWorks}</div>
              <div className="text-xs text-neutral-500 mt-1">公开作品</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.privateWorks}</div>
              <div className="text-xs text-neutral-500 mt-1">私人作品</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900">{stats.totalViews}</div>
              <div className="text-xs text-neutral-500 mt-1">总浏览量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rose-600">{stats.totalLikes}</div>
              <div className="text-xs text-neutral-500 mt-1">总点赞数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalFavorites}</div>
              <div className="text-xs text-neutral-500 mt-1">总收藏数</div>
            </div>
          </div>
        </div>

        {/* 作品区域 */}
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 overflow-hidden">
          {/* 顶部操作栏 */}
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0057FF]" />
                我的作品管理
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                创建新作品
              </button>
            </div>
            <p className="text-sm text-neutral-600 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#0057FF]" />
              这里显示您的所有作品，包括<span className="font-bold text-amber-600">私人作品</span>和<span className="font-bold text-emerald-600">公共作品</span>。您可以在这里编辑、删除或改变作品状态。
            </p>
          </div>

          {/* 标签页切换 */}
          <div className="px-6 pt-4 flex items-center gap-2 border-b border-neutral-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-all ${
                activeTab === 'all' 
                  ? 'bg-[#0057FF] text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              全部 ({allWorks.length})
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === 'articles' 
                  ? 'bg-[#0057FF] text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              文章 ({articles.length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === 'videos' 
                  ? 'bg-[#0057FF] text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <VideoIcon className="w-4 h-4" />
              视频 ({videos.length})
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === 'files' 
                  ? 'bg-[#0057FF] text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Folder className="w-4 h-4" />
              文件 ({files.length})
            </button>
          </div>

          {/* 作品网格 */}
          <div className="p-6">
            {displayedWorks.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-neutral-500 mb-4">暂无作品</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 bg-[#0057FF] text-white font-bold rounded-lg hover:bg-[#0046CC] transition-all cursor-pointer"
                >
                  创建第一个作品
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedWorks.map((work) => (
                  <WorkCard
                    key={`${work.type}-${work.id}`}
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
                ))}
              </div>
            )}
          </div>
        </div>
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
          initialWorkType={editModalData?.type}
          initialArticle={editModalData?.article}
          initialVideo={editModalData?.video}
          initialFile={editModalData?.file}
        />
      )}
    </div>
  );
};
