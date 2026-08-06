import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  UserCheck,
  MessageSquare,
  Mail,
  Calendar,
  User as UserIcon,
  ThumbsUp,
  Bookmark,
  MessageCircle,
  Share2,
  FileText,
  Video as VideoIcon,
  Folder,
  Download,
  Eye,
  Check,
  Copy,
  Send,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { User, Article, Video, FileItem, Comment } from '../../types';
import { authApi } from '../../api/auth';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { resolveImageUrl } from '../../config/env';
import { useAuth } from '../../context/AuthContext';

interface AuthorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  onOpenChat?: (user: User) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  onOpenChat,
}) => {
  const { user: currentUser } = useAuth();
  const [author, setAuthor] = useState<User | null>(null);
  const [loadingAuthor, setLoadingAuthor] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Tabs
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'files'>('articles');

  // Works state
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(false);

  // Comments Sub-modal / Drawer state
  const [activeCommentItem, setActiveCommentItem] = useState<{
    id: number;
    type: 'article' | 'video' | 'file';
    title: string;
  } | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentInput, setNewCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Share Sub-modal state
  const [shareItem, setShareItem] = useState<{
    id: number;
    type: 'article' | 'video' | 'file';
    title: string;
    url: string;
  } | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadAuthorProfile(userId);
      loadAuthorWorks(userId);
    } else {
      setAuthor(null);
      setArticles([]);
      setVideos([]);
      setFiles([]);
    }
  }, [isOpen, userId]);

  const loadAuthorProfile = async (id: number) => {
    setLoadingAuthor(true);
    try {
      const data = await authApi.getUserById(id);
      setAuthor(data);
      setIsFollowing(!!data?.isFollowing);
      setFollowerCount(data?.followerCount || 0);
    } catch (err) {
      console.error('Failed to load author profile:', err);
    } finally {
      setLoadingAuthor(false);
    }
  };

  const loadAuthorWorks = async (id: number) => {
    setLoadingWorks(true);
    try {
      const [artRes, vidRes, fileRes] = await Promise.all([
        articlesApi.getArticles({ userId: id, limit: 50 }),
        videosApi.getVideos({ userId: id, limit: 50 }),
        filesApi.getFiles({ userId: id, limit: 50 }),
      ]);
      setArticles(artRes.list || []);
      setVideos(vidRes.list || []);
      setFiles(fileRes.list || []);
    } catch (err) {
      console.error('Failed to load author works:', err);
    } finally {
      setLoadingWorks(false);
    }
  };

  // Follow Toggle
  const handleToggleFollow = async () => {
    if (!userId) return;
    try {
      if (isFollowing) {
        await authApi.unfollowUser(userId);
        setIsFollowing(false);
        setFollowerCount((prev) => Math.max(0, prev - 1));
      } else {
        const res = await authApi.followUser(userId);
        setIsFollowing(true);
        if (!(res && res.code === 40900)) {
          setFollowerCount((prev) => prev + 1);
        }
      }
    } catch (err: any) {
      const resCode = err?.response?.data?.code || err?.code;
      if (resCode === 40900 || err?.message?.includes('已关注')) {
        setIsFollowing(true);
      } else {
        console.error('Failed to toggle follow:', err);
      }
    }
  };

  // Like Handlers
  const handleLikeArticle = async (articleId: number) => {
    const article = articles.find((a) => a.id === articleId);
    if (!article) return;
    const isLiked = article.isLiked;

    // Optimistic update
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId
          ? {
              ...a,
              isLiked: !isLiked,
              likeCount: isLiked ? Math.max(0, a.likeCount - 1) : a.likeCount + 1,
            }
          : a
      )
    );

    try {
      if (isLiked) {
        await articlesApi.unlikeArticle(articleId);
      } else {
        await articlesApi.likeArticle(articleId);
      }
    } catch (err) {
      console.error('Failed to toggle like article:', err);
      // rollback
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? article : a))
      );
    }
  };

  const handleFavoriteArticle = async (articleId: number) => {
    const article = articles.find((a) => a.id === articleId);
    if (!article) return;
    const isFav = article.isFavorited;

    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId
          ? {
              ...a,
              isFavorited: !isFav,
              favoriteCount: isFav ? Math.max(0, a.favoriteCount - 1) : a.favoriteCount + 1,
            }
          : a
      )
    );

    try {
      if (isFav) {
        await articlesApi.unfavoriteArticle(articleId);
      } else {
        await articlesApi.favoriteArticle(articleId);
      }
    } catch (err) {
      console.error('Failed to toggle favorite article:', err);
      setArticles((prev) => prev.map((a) => (a.id === articleId ? article : a)));
    }
  };

  const handleLikeVideo = async (videoId: number) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video) return;
    const isLiked = video.isLiked;

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              isLiked: !isLiked,
              likeCount: isLiked ? Math.max(0, v.likeCount - 1) : v.likeCount + 1,
            }
          : v
      )
    );

    try {
      if (isLiked) {
        await videosApi.unlikeVideo(videoId);
      } else {
        await videosApi.likeVideo(videoId);
      }
    } catch (err) {
      console.error('Failed to toggle video like:', err);
      setVideos((prev) => prev.map((v) => (v.id === videoId ? video : v)));
    }
  };

  const handleFavoriteVideo = async (videoId: number) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video) return;
    const isFav = video.isFavorited;

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              isFavorited: !isFav,
              favoriteCount: isFav ? Math.max(0, v.favoriteCount - 1) : v.favoriteCount + 1,
            }
          : v
      )
    );

    try {
      if (isFav) {
        await videosApi.unfavoriteVideo(videoId);
      } else {
        await videosApi.favoriteVideo(videoId);
      }
    } catch (err) {
      console.error('Failed to toggle video favorite:', err);
      setVideos((prev) => prev.map((v) => (v.id === videoId ? video : v)));
    }
  };

  const handleLikeFile = async (fileId: number) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    const isLiked = file.isLiked;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              isLiked: !isLiked,
              likeCount: isLiked ? Math.max(0, f.likeCount - 1) : f.likeCount + 1,
            }
          : f
      )
    );

    try {
      if (isLiked) {
        await filesApi.unlikeFile(fileId);
      } else {
        await filesApi.likeFile(fileId);
      }
    } catch (err) {
      console.error('Failed to toggle file like:', err);
      setFiles((prev) => prev.map((f) => (f.id === fileId ? file : f)));
    }
  };

  const handleFavoriteFile = async (fileId: number) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    const isFav = file.isFavorited;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              isFavorited: !isFav,
              favoriteCount: isFav ? Math.max(0, f.favoriteCount - 1) : f.favoriteCount + 1,
            }
          : f
      )
    );

    try {
      if (isFav) {
        await filesApi.unfavoriteFile(fileId);
      } else {
        await filesApi.favoriteFile(fileId);
      }
    } catch (err) {
      console.error('Failed to toggle file favorite:', err);
      setFiles((prev) => prev.map((f) => (f.id === fileId ? file : f)));
    }
  };

  // Open Comments Modal
  const handleOpenComments = async (id: number, type: 'article' | 'video' | 'file', title: string) => {
    setActiveCommentItem({ id, type, title });
    setLoadingComments(true);
    try {
      let list: Comment[] = [];
      if (type === 'article') {
        list = await articlesApi.getComments(id);
      } else if (type === 'video') {
        list = await videosApi.getComments(id);
      } else if (type === 'file') {
        list = await filesApi.getComments(id);
      }
      setComments(list);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!activeCommentItem || !newCommentInput.trim()) return;
    setSubmittingComment(true);
    try {
      const content = newCommentInput.trim();
      let created: Comment | null = null;

      if (activeCommentItem.type === 'article') {
        created = await articlesApi.createComment(activeCommentItem.id, { content });
      } else if (activeCommentItem.type === 'video') {
        created = await videosApi.createComment(activeCommentItem.id, { content });
      } else if (activeCommentItem.type === 'file') {
        created = await filesApi.createComment(activeCommentItem.id, { content });
      }

      if (created) {
        setComments((prev) => [created!, ...prev]);
        setNewCommentInput('');

        // Increment comment count in parent list
        if (activeCommentItem.type === 'article') {
          setArticles((prev) =>
            prev.map((a) => (a.id === activeCommentItem.id ? { ...a, commentCount: a.commentCount + 1 } : a))
          );
        } else if (activeCommentItem.type === 'video') {
          setVideos((prev) =>
            prev.map((v) => (v.id === activeCommentItem.id ? { ...v, commentCount: v.commentCount + 1 } : v))
          );
        } else if (activeCommentItem.type === 'file') {
          setFiles((prev) =>
            prev.map((f) => (f.id === activeCommentItem.id ? { ...f, commentCount: (f.commentCount || 0) + 1 } : f))
          );
        }
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Open Share Modal
  const handleOpenShare = (id: number, type: 'article' | 'video' | 'file', title: string) => {
    const origin = window.location.origin;
    const urlPath = type === 'article' ? `/articles/${id}` : type === 'video' ? `/videos/${id}` : `/files/${id}`;
    setShareItem({
      id,
      type,
      title,
      url: `${origin}${urlPath}`,
    });
    setCopiedShareLink(false);
  };

  const handleCopyShareLink = () => {
    if (!shareItem) return;
    navigator.clipboard.writeText(shareItem.url);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  if (!isOpen) return null;

  // Format gender text
  const getGenderLabel = (g?: number) => {
    if (g === 1) return { text: '男', icon: '♂', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    if (g === 2) return { text: '女', icon: '♀', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' };
    return { text: '保密', icon: '🔒', color: 'text-neutral-400 bg-neutral-800 border-neutral-700' };
  };

  const genderInfo = getGenderLabel(author?.gender);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header bar / Close button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="p-2 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-full transition-colors cursor-pointer backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-b border-neutral-800 p-6 md:p-8 shrink-0">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-tr from-[#0057FF] via-purple-500 to-pink-500 shadow-xl">
                <img
                  src={
                    resolveImageUrl(author?.avatar) ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
                  }
                  alt={author?.nickName || '作者'}
                  className="w-full h-full object-cover rounded-full bg-neutral-800"
                />
              </div>
            </div>

            {/* Author Information */}
            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {author?.nickName || '创作者'}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${genderInfo.color}`}
                >
                  <span>{genderInfo.icon}</span>
                  <span>{genderInfo.text}</span>
                </span>
              </div>

              {/* Email & Birthday & Signature */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-neutral-400 mb-3">
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span>{author?.email || `${author?.nickName || 'author'}@design.com`}</span>
                </div>
                {author?.birthday && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>生日: {author.birthday}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed max-w-2xl mb-4 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                {author?.signature || '暂未填写个性签名。这位创作者正在专心创作极致的设计与动效作品！'}
              </p>

              {/* Stats & Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-5 text-xs">
                  <div>
                    <span className="font-bold text-white text-base mr-1">{followerCount}</span>
                    <span className="text-neutral-400">粉丝</span>
                  </div>
                  <div>
                    <span className="font-bold text-white text-base mr-1">{author?.followingCount || 0}</span>
                    <span className="text-neutral-400">关注</span>
                  </div>
                  <div>
                    <span className="font-bold text-white text-base mr-1">{articles.length + videos.length + files.length}</span>
                    <span className="text-neutral-400">作品</span>
                  </div>
                </div>

                {/* Follow & Message Buttons */}
                {currentUser?.id !== userId && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleFollow}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isFollowing
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                          : 'bg-[#0057FF] hover:bg-[#0057FF]/90 text-white shadow-lg shadow-[#0057FF]/25'
                      }`}
                    >
                      {isFollowing ? <UserCheck className="w-4 h-4 text-emerald-400" /> : <UserPlus className="w-4 h-4" />}
                      <span>{isFollowing ? '已关注' : '关注作者'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (author && onOpenChat) {
                          onOpenChat(author);
                          onClose();
                        }
                      }}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-[#0057FF]" />
                      <span>私信作者</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Public Works */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('articles')}
            className={`py-3.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'articles'
                ? 'border-[#0057FF] text-[#0057FF]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>图文作品 ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`py-3.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'videos'
                ? 'border-[#0057FF] text-[#0057FF]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            <span>视频作品 ({videos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`py-3.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'files'
                ? 'border-[#0057FF] text-[#0057FF]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>设计资源 ({files.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[320px]">
          {loadingWorks ? (
            <div className="flex items-center justify-center py-20 text-neutral-400 text-xs">
              <Sparkles className="w-5 h-5 animate-spin text-[#0057FF] mr-2" />
              <span>正在加载作者资源列表...</span>
            </div>
          ) : (
            <>
              {/* Tab 1: Articles */}
              {activeTab === 'articles' && (
                <div>
                  {articles.length === 0 ? (
                    <div className="text-center py-16 text-neutral-500 text-xs">
                      暂无公开图文作品
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {articles.map((article) => (
                        <div
                          key={article.id}
                          className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all flex flex-col group"
                        >
                          <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                            <img
                              src={resolveImageUrl(article.coverImage)}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {article.categoryName && (
                              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/75 backdrop-blur-md text-[10px] font-bold text-white rounded-full">
                                {article.categoryName}
                              </span>
                            )}
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-white line-clamp-1 mb-1 group-hover:text-[#0057FF] transition-colors">
                                {article.title}
                              </h4>
                              {article.summary && (
                                <p className="text-[11px] text-neutral-400 line-clamp-2 mb-3">
                                  {article.summary}
                                </p>
                              )}
                            </div>

                            {/* Card Interaction Bar */}
                            <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-400">
                              <div className="flex items-center gap-3">
                                {/* Like */}
                                <button
                                  onClick={() => handleLikeArticle(article.id)}
                                  className={`flex items-center gap-1 cursor-pointer hover:text-white transition-colors ${
                                    article.isLiked ? 'text-[#0057FF] font-bold' : ''
                                  }`}
                                  title="点赞"
                                >
                                  <ThumbsUp className={`w-3.5 h-3.5 ${article.isLiked ? 'fill-[#0057FF]' : ''}`} />
                                  <span>{article.likeCount}</span>
                                </button>

                                {/* Favorite */}
                                <button
                                  onClick={() => handleFavoriteArticle(article.id)}
                                  className={`flex items-center gap-1 cursor-pointer hover:text-white transition-colors ${
                                    article.isFavorited ? 'text-amber-400 font-bold' : ''
                                  }`}
                                  title="收藏"
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${article.isFavorited ? 'fill-amber-400' : ''}`} />
                                  <span>{article.favoriteCount}</span>
                                </button>

                                {/* Comment */}
                                <button
                                  onClick={() => handleOpenComments(article.id, 'article', article.title)}
                                  className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                                  title="评论"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>{article.commentCount}</span>
                                </button>
                              </div>

                              {/* Forward / Share */}
                              <button
                                onClick={() => handleOpenShare(article.id, 'article', article.title)}
                                className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="转发分享"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Videos */}
              {activeTab === 'videos' && (
                <div>
                  {videos.length === 0 ? (
                    <div className="text-center py-16 text-neutral-500 text-xs">
                      暂无公开视频作品
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((video) => (
                        <div
                          key={video.id}
                          className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all flex flex-col group"
                        >
                          <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                            <img
                              src={resolveImageUrl(video.coverImage)}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {video.duration && (
                              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[10px] font-mono font-semibold text-white rounded-md">
                                {video.duration}
                              </span>
                            )}
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-white line-clamp-1 mb-1 group-hover:text-[#0057FF] transition-colors">
                                {video.title}
                              </h4>
                              {video.description && (
                                <p className="text-[11px] text-neutral-400 line-clamp-1 mb-3">
                                  {video.description}
                                </p>
                              )}
                            </div>

                            {/* Card Interaction Bar */}
                            <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-400">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleLikeVideo(video.id)}
                                  className={`flex items-center gap-1 cursor-pointer hover:text-white transition-colors ${
                                    video.isLiked ? 'text-[#0057FF] font-bold' : ''
                                  }`}
                                  title="点赞"
                                >
                                  <ThumbsUp className={`w-3.5 h-3.5 ${video.isLiked ? 'fill-[#0057FF]' : ''}`} />
                                  <span>{video.likeCount}</span>
                                </button>

                                <button
                                  onClick={() => handleFavoriteVideo(video.id)}
                                  className={`flex items-center gap-1 cursor-pointer hover:text-white transition-colors ${
                                    video.isFavorited ? 'text-amber-400 font-bold' : ''
                                  }`}
                                  title="收藏"
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${video.isFavorited ? 'fill-amber-400' : ''}`} />
                                  <span>{video.favoriteCount}</span>
                                </button>

                                <button
                                  onClick={() => handleOpenComments(video.id, 'video', video.title)}
                                  className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                                  title="评论"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>{video.commentCount}</span>
                                </button>
                              </div>

                              <button
                                onClick={() => handleOpenShare(video.id, 'video', video.title)}
                                className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="转发分享"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Files */}
              {activeTab === 'files' && (
                <div>
                  {files.length === 0 ? (
                    <div className="text-center py-16 text-neutral-500 text-xs">
                      暂无公开资源文件
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all flex flex-col group"
                        >
                          <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                            <img
                              src={
                                resolveImageUrl(file.coverImage) ||
                                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop'
                              }
                              alt={file.title || file.fileName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white rounded-md uppercase">
                              {file.fileType || 'zip'}
                            </span>
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-white line-clamp-1 mb-1 group-hover:text-[#0057FF] transition-colors">
                                {file.title || file.fileName}
                              </h4>
                              <p className="text-[10px] text-neutral-400 mb-3">
                                大小: {file.fileSize || '未标明'}
                              </p>
                            </div>

                            {/* Card Interaction Bar */}
                            <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-400">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleLikeFile(file.id)}
                                  className={`flex items-center gap-1 cursor-pointer hover:text-white transition-colors ${
                                    file.isLiked ? 'text-[#0057FF] font-bold' : ''
                                  }`}
                                  title="点赞"
                                >
                                  <ThumbsUp className={`w-3.5 h-3.5 ${file.isLiked ? 'fill-[#0057FF]' : ''}`} />
                                  <span>{file.likeCount}</span>
                                </button>

                                <button
                                  onClick={() => handleFavoriteFile(file.id)}
                                  className={`flex items-center gap-1 cursor-pointer hover:text-white transition-colors ${
                                    file.isFavorited ? 'text-amber-400 font-bold' : ''
                                  }`}
                                  title="收藏"
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${file.isFavorited ? 'fill-amber-400' : ''}`} />
                                  <span>{file.favoriteCount}</span>
                                </button>

                                <button
                                  onClick={() => handleOpenComments(file.id, 'file', file.title || file.fileName)}
                                  className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                                  title="评论"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>{file.commentCount || 0}</span>
                                </button>
                              </div>

                              <button
                                onClick={() => handleOpenShare(file.id, 'file', file.title || file.fileName)}
                                className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="转发分享"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sub-Modal 1: Comments Drawer */}
      {activeCommentItem && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl w-full max-w-lg p-5 flex flex-col max-h-[80vh] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="min-w-0 pr-3">
                <h3 className="text-sm font-bold text-white truncate">评论作品: {activeCommentItem.title}</h3>
                <p className="text-[10px] text-neutral-400">全站交流与反馈讨论</p>
              </div>
              <button
                onClick={() => setActiveCommentItem(null)}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 min-h-[180px]">
              {loadingComments ? (
                <div className="text-center py-10 text-neutral-500 text-xs">加载评论中...</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs">抢沙发！快来发表第一条评论吧</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 text-xs space-y-1">
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
                        <span className="font-semibold text-neutral-200">{comment.author?.nickName || (comment as any).user?.nickName || '体验用户'}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">{comment.createdAt?.slice(0, 10)}</span>
                    </div>
                    <p className="text-neutral-300 text-xs pl-7 leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post Comment Input */}
            <div className="flex gap-2 pt-2 border-t border-neutral-800">
              <input
                type="text"
                value={newCommentInput}
                onChange={(e) => setNewCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                placeholder="撰写你的优质点评..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0057FF]"
              />
              <button
                onClick={handlePostComment}
                disabled={submittingComment || !newCommentInput.trim()}
                className="bg-[#0057FF] hover:bg-[#0057FF]/90 disabled:bg-neutral-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>发送</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal 2: Share & Forward */}
      {shareItem && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl w-full max-w-md p-5 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#0057FF]" />
                <span>转发与分享作品</span>
              </h3>
              <button
                onClick={() => setShareItem(null)}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-neutral-200 line-clamp-1 mb-1">{shareItem.title}</p>
              <p className="text-[10px] text-neutral-400">将作品链接快速复制或分享到社交平台</p>
            </div>

            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl">
              <input
                type="text"
                readOnly
                value={shareItem.url}
                className="flex-1 bg-transparent text-xs text-neutral-300 focus:outline-none truncate"
              />
              <button
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 bg-[#0057FF] hover:bg-[#0057FF]/90 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedShareLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedShareLink ? '已复制' : '复制'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] text-neutral-400">
              <div className="bg-neutral-950 border border-neutral-800/80 p-2.5 rounded-xl flex flex-col items-center gap-1 hover:border-[#0057FF] hover:text-white cursor-pointer transition-colors" onClick={handleCopyShareLink}>
                <Copy className="w-4 h-4 text-[#0057FF]" />
                <span>复制链接</span>
              </div>
              <div className="bg-neutral-950 border border-neutral-800/80 p-2.5 rounded-xl flex flex-col items-center gap-1 hover:border-emerald-500 hover:text-white cursor-pointer transition-colors" onClick={handleCopyShareLink}>
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>微信/朋友圈</span>
              </div>
              <div className="bg-neutral-950 border border-neutral-800/80 p-2.5 rounded-xl flex flex-col items-center gap-1 hover:border-amber-500 hover:text-white cursor-pointer transition-colors" onClick={handleCopyShareLink}>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>生成动态卡片</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Global Helper function to trigger AuthorProfileModal
export const openAuthorModal = (userId: number) => {
  window.dispatchEvent(new CustomEvent('open-author-modal', { detail: { userId } }));
};
