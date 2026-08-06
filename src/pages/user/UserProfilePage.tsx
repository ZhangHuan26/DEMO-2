import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { UserPlus, UserCheck, MessageSquare, FileText, Video as VideoIcon, Folder, Eye, ThumbsUp, Bookmark, MessageCircle, Lock, Pencil, Trash2, Globe } from 'lucide-react';

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


// 统计信息组件：评论、收藏、阅读、点赞
const StatsRow: React.FC<{ viewCount: number; likeCount: number; favoriteCount: number; commentCount: number }> = ({ viewCount, likeCount, favoriteCount, commentCount }) => (
  <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500">
    <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-neutral-400" />{commentCount}</span>
    <span className="flex items-center gap-1"><Bookmark className="w-3.5 h-3.5 text-amber-500" />{favoriteCount}</span>
    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-neutral-400" />{viewCount}</span>
    <span className="flex items-center gap-1 text-[#0057FF] font-bold"><ThumbsUp className="w-3.5 h-3.5 fill-[#0057FF]/20" />{likeCount}</span>
  </div>
);

// 管理操作栏组件 - 仅自己可见
const ManageBar: React.FC<{
  isSelf: boolean;
  status: number;
  onDelete: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}> = ({ isSelf, status, onDelete, onEdit, onToggleStatus }) => {
  if (!isSelf) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/80">
      <button
        onClick={onDelete}
        className="flex-1 px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
      >
        <Trash2 className="w-3 h-3" /> 删除
      </button>
      <button
        onClick={onEdit}
        className="flex-1 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0057FF] text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
      >
        <Pencil className="w-3 h-3" /> 修改
      </button>
      <button
        onClick={onToggleStatus}
        className={`flex-1 px-2 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
          status === 1 ? 'bg-amber-50 hover:bg-amber-100 text-amber-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
        }`}
      >
        {status === 1 ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
        {status === 1 ? '私人' : '公共'}
      </button>

    </div>
  );
};

// 文章卡片
const ManageableArticleCard: React.FC<{
  article: Article;
  isSelf: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}> = ({ article, isSelf, onDelete, onEdit, onToggleStatus }) => {
  return (
    <div className="group bg-white border border-neutral-200/90 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1.5">
      <Link to={`/articles/${article.id}`} className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={resolveImageUrl(article.coverImage)}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {article.categoryName && (
          <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-black/75 backdrop-blur-md text-xs font-bold text-white rounded-full shadow-xs">
            {article.categoryName}
          </span>
        )}
        {article.status === 1 && (
          <span className="absolute top-3.5 right-3.5 px-2.5 py-1 bg-amber-500/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" /> 私人
          </span>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/articles/${article.id}`}>
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors line-clamp-2 leading-snug mb-2">
              {article.title}
            </h3>
          </Link>
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-3">
            {article.summary || article.content.slice(0, 80)}
          </p>
        </div>

        {/* 作者信息 */}
        <Link to={`/users/${article.userId}`} className="flex items-center gap-2 mb-3 hover:text-black transition-colors">
          <img
            src={resolveImageUrl(article.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
            alt={article.author?.nickName || '创作者'}
            className="w-6 h-6 rounded-full object-cover border border-neutral-200"
          />
          <span className="font-semibold text-xs text-neutral-700 truncate max-w-[120px]">{article.author?.nickName || '创作者'}</span>
        </Link>

        {/* 统计信息：评论、收藏、阅读、点赞 */}
        <StatsRow
          viewCount={article.viewCount}
          likeCount={article.likeCount}
          favoriteCount={article.favoriteCount}
          commentCount={article.commentCount}
        />
      </div>

      {/* 管理操作栏 - 仅自己可见 */}
      <ManageBar
        isSelf={isSelf}
        status={article.status}
        onDelete={onDelete}
        onEdit={onEdit}
        onToggleStatus={onToggleStatus}
      />
    </div>
  );
};

// 视频卡片
const ManageableVideoCard: React.FC<{
  video: Video;
  isSelf: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}> = ({ video, isSelf, onDelete, onEdit, onToggleStatus }) => {
  return (
    <div className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
      <Link to={`/videos/${video.id}`} className="relative aspect-video overflow-hidden bg-neutral-100">
        <img
          src={resolveImageUrl(video.coverImage)}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center transition-colors">
          <div className="w-10 h-10 bg-[#0057FF] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0057FF]/40 group-hover:scale-110 transition-transform">
            <VideoIcon className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
        {video.status === 1 && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" /> 私人
          </span>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/videos/${video.id}`}>
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors line-clamp-2 leading-snug mb-1">
              {video.title}
            </h3>
          </Link>
          <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{video.description || '精选动态视觉设计与视频创作'}</p>
        </div>

        {/* 作者信息 */}
        <Link to={`/users/${video.userId}`} className="flex items-center gap-2 mb-3 hover:text-black transition-colors">
          <img
            src={resolveImageUrl(video.author?.avatar) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'}
            alt={video.author?.nickName || '创作者'}
            className="w-6 h-6 rounded-full object-cover border border-neutral-200"
          />
          <span className="font-semibold text-xs text-neutral-700 truncate max-w-[120px]">{video.author?.nickName || '创作者'}</span>
        </Link>

        {/* 统计信息 */}
        <StatsRow
          viewCount={video.viewCount}
          likeCount={video.likeCount}
          favoriteCount={video.favoriteCount}
          commentCount={video.commentCount}
        />
      </div>

      {/* 管理操作栏 - 仅自己可见 */}
      <ManageBar
        isSelf={isSelf}
        status={video.status}
        onDelete={onDelete}
        onEdit={onEdit}
        onToggleStatus={onToggleStatus}
      />
    </div>
  );
};

// 文件卡片
const ManageableFileCard: React.FC<{
  file: FileItem;
  isSelf: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}> = ({ file, isSelf, onDelete, onEdit, onToggleStatus }) => {
  return (
    <div className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
      <Link to={`/files/${file.id}`} className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        <img
          src={resolveImageUrl(file.coverImage)}
          alt={file.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-[#0057FF] text-white text-[10px] font-bold uppercase rounded tracking-wider shadow-xs">
            {file.fileType || 'ZIP'}
          </span>
          <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono rounded">
            {file.fileSize || '10 MB'}
          </span>
        </div>
        {file.status === 1 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" /> 私人
          </span>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/files/${file.id}`}>
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors line-clamp-2 leading-snug mb-1">
              {file.title}
            </h3>
          </Link>
          <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{file.description || file.fileName}</p>
        </div>

        {/* 作者信息 */}
        <Link to={`/users/${file.userId}`} className="flex items-center gap-2 mb-3 hover:text-black transition-colors">
          <img
            src={resolveImageUrl(file.author?.avatar) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'}
            alt={file.author?.nickName || '创作者'}
            className="w-6 h-6 rounded-full object-cover border border-neutral-200"
          />
          <span className="font-semibold text-xs text-neutral-700 truncate max-w-[120px]">{file.author?.nickName || '创作者'}</span>
        </Link>

        {/* 统计信息 */}
        <StatsRow
          viewCount={file.downloadCount}
          likeCount={file.likeCount}
          favoriteCount={file.favoriteCount}
          commentCount={file.commentCount}
        />
      </div>

      {/* 管理操作栏 - 仅自己可见 */}
      <ManageBar
        isSelf={isSelf}
        status={file.status}
        onDelete={onDelete}
        onEdit={onEdit}
        onToggleStatus={onToggleStatus}
      />
    </div>
  );
};

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'files'>('articles');

  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [userFiles, setUserFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
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
        const u = await authApi.getUserById(userId);
        setProfileUser(u);

        // 通过 userId 参数从后端直接筛选该用户的作品，避免分页导致数据不全
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
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-xs text-neutral-500">正在加载创作者主页...</div>;
  }

  if (!profileUser) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-xs text-neutral-500">未找到该创作者信息</div>;
  }

  const isSelf = currentUser?.id === profileUser.id;

  const handleToggleFollow = async () => {
    try {
      if (profileUser.isFollowing) {
        await authApi.unfollowUser(profileUser.id);
        setProfileUser(prev => prev ? { ...prev, isFollowing: false, followerCount: Math.max(0, prev.followerCount - 1) } : null);
      } else {
        await authApi.followUser(profileUser.id);
        setProfileUser(prev => prev ? { ...prev, isFollowing: true, followerCount: prev.followerCount + 1 } : null);
      }
    } catch {
      // ignore
    }
  };

  // 删除作品
  const handleDeleteArticle = async (articleId: number) => {
    if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) return;
    try {
      await articlesApi.deleteArticle(articleId);
      setUserArticles(prev => prev.filter(a => a.id !== articleId));
    } catch {
      alert('删除失败，请稍后重试');
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('确定要删除这个视频吗？此操作不可撤销。')) return;
    try {
      await videosApi.deleteVideo(videoId);
      setUserVideos(prev => prev.filter(v => v.id !== videoId));
    } catch {
      alert('删除失败，请稍后重试');
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('确定要删除这个资源文件吗？此操作不可撤销。')) return;
    try {
      await filesApi.deleteFile(fileId);
      setUserFiles(prev => prev.filter(f => f.id !== fileId));
    } catch {
      alert('删除失败，请稍后重试');
    }
  };

  // 切换可见状态（公共/私人）
  const handleToggleArticleStatus = async (articleId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await articlesApi.updateArticleStatus(articleId, newStatus);
      setUserArticles(prev => prev.map(a => a.id === articleId ? { ...a, status: newStatus } : a));
    } catch {
      alert('状态切换失败，请稍后重试');
    }
  };

  const handleToggleVideoStatus = async (videoId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await videosApi.updateVideoStatus(videoId, newStatus);
      setUserVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: newStatus } : v));
    } catch {
      alert('状态切换失败，请稍后重试');
    }
  };

  const handleToggleFileStatus = async (fileId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await filesApi.updateFileStatus(fileId, newStatus);
      setUserFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: newStatus } : f));
    } catch {
      alert('状态切换失败，请稍后重试');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <img
            src={resolveImageUrl(profileUser.avatar)}
            alt={profileUser.nickName}
            className="w-24 h-24 rounded-full object-cover border-4 border-[#0057FF] shadow-lg"
          />

          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2 justify-center md:justify-start">
              {profileUser.nickName}
              {profileUser.role === 1 && <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] uppercase font-bold">超级管理员</span>}
            </h1>
            <p className="text-xs text-neutral-600 mt-1 max-w-md leading-relaxed">{profileUser.signature || 'LeapLunar04 签约创作者'}</p>

            {/* Stats Row */}
            <div className="flex items-center justify-center md:justify-start gap-6 mt-4 text-xs font-mono">
              <button
                onClick={() => { setFollowModalTab('followers'); setIsFollowModalOpen(true); }}
                className="hover:text-[#0057FF] transition-colors cursor-pointer"
              >
                <span className="font-bold text-neutral-900 block text-base">{profileUser.followerCount}</span>
                <span className="text-neutral-500">粉丝</span>
              </button>
              <button
                onClick={() => { setFollowModalTab('following'); setIsFollowModalOpen(true); }}
                className="hover:text-[#0057FF] transition-colors cursor-pointer"
              >
                <span className="font-bold text-neutral-900 block text-base">{profileUser.followingCount}</span>
                <span className="text-neutral-500">关注</span>
              </button>
              <div>
                <span className="font-bold text-neutral-900 block text-base">{userArticles.length + userVideos.length + userFiles.length}</span>
                <span className="text-neutral-500">发布作品</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        {!isSelf && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleFollow}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                profileUser.isFollowing ? 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200' : 'bg-[#0057FF] text-white hover:bg-[#0046CC] shadow-md shadow-[#0057FF]/20'
              }`}
            >
              {profileUser.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {profileUser.isFollowing ? '已关注创作者' : '关注创作者'}
            </button>

            <button
              onClick={() => setIsChatOpen(true)}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-[#0057FF]" /> ✉️ 聘请 / 私信交流
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'articles' ? 'border-[#0057FF] text-[#0057FF] font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-4 h-4" /> 设计文章 ({userArticles.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'videos' ? 'border-[#0057FF] text-[#0057FF] font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <VideoIcon className="w-4 h-4" /> 动效视频 ({userVideos.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'files' ? 'border-[#0057FF] text-[#0057FF] font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Folder className="w-4 h-4" /> 资源文件 ({userFiles.length})
        </button>
      </div>

      {/* Content Grid */}
      {activeTab === 'articles' ? (
        userArticles.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">暂无已发布的文章作品</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {userArticles.map((a, idx) => (
              <ManageableArticleCard
                key={`user-art-${a.id ?? idx}-${idx}`}
                article={a}
                isSelf={isSelf}
                onDelete={() => handleDeleteArticle(a.id)}
                onEdit={() => {
                  // 列表接口不返回 content 字段，需要先获取完整详情
                  articlesApi.getArticleById(a.id).then(full => {
                    setEditModalData({ type: 'article', article: full });
                  }).catch(() => {
                    setEditModalData({ type: 'article', article: a });
                  });
                }}
                onToggleStatus={() => handleToggleArticleStatus(a.id, a.status)}


              />
            ))}
          </div>
        )
      ) : activeTab === 'videos' ? (
        userVideos.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">暂无已发布的动效视频</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userVideos.map((v, idx) => (
              <ManageableVideoCard
                key={`user-vid-${v.id ?? idx}-${idx}`}
                video={v}
                isSelf={isSelf}
                onDelete={() => handleDeleteVideo(v.id)}
                onEdit={() => {
                  // 列表接口不返回 description/videoUrl/status 等字段，需要先获取完整详情
                  videosApi.getVideoById(v.id).then(full => {
                    setEditModalData({ type: 'video', video: full });
                  }).catch(() => {
                    setEditModalData({ type: 'video', video: v });
                  });
                }}
                onToggleStatus={() => handleToggleVideoStatus(v.id, v.status)}


              />
            ))}
          </div>
        )
      ) : (
        userFiles.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">暂无已发布的资源文件</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userFiles.map((f, idx) => (
              <ManageableFileCard
                key={`user-file-${f.id ?? idx}-${idx}`}
                file={f}
                isSelf={isSelf}
                onDelete={() => handleDeleteFile(f.id)}
                onEdit={() => {
                  // 列表接口可能缺少 description 等字段，先获取完整详情
                  filesApi.getFileById(f.id).then(full => {
                    setEditModalData({ type: 'file', file: full });
                  }).catch(() => {
                    setEditModalData({ type: 'file', file: f });
                  });
                }}
                onToggleStatus={() => handleToggleFileStatus(f.id, f.status)}


              />
            ))}
          </div>
        )
      )}

      <FollowerModal isOpen={isFollowModalOpen} userId={profileUser.id} initialTab={followModalTab} onClose={() => setIsFollowModalOpen(false)} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} targetUser={profileUser} />

      {/* 编辑作品弹窗 */}
      <CreateWorkModal
        isOpen={!!editModalData}
        onClose={() => setEditModalData(null)}
        editData={editModalData}
        onSuccess={() => {
          // 刷新数据
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


