import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { feedApi } from '../../api/feed';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { resolveImageUrl } from '../../config/env';
import { openAuthorModal } from '../../components/common/AuthorProfileModal';
import { 
  Radio, 
  Clock, 
  Sparkles, 
  RefreshCw,
  Layers,
  FileText,
  Video as VideoIcon,
  FolderArchive,
  Search,
  TrendingUp,
  Compass,
  Play,
  Download,
  Eye,
  Heart,
  Bookmark,
  MessageSquare,
  ArrowUpRight,
  Share2,
  Check,
  UserCheck
} from 'lucide-react';

interface ContentCard {
  contentType: number; // 1-文章 2-视频 3-文件
  id: number;
  title: string;
  coverImage: string;
  summary?: string;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  categoryId?: number;
  categoryName?: string;
  duration?: number;
  fileSize?: number;
  fileType?: number;
  fileExt?: string;
  createdAt: string;
  isLiked?: boolean;
  isFavorited?: boolean;
}

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚发布';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

const formatFullDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '资源包';
  if (bytes > 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
};

export const FeedPage: React.FC = () => {
  const [contents, setContents] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const result = await feedApi.getContentFeed({ size: 50 });
      setContents(result.list || []);
    } catch {
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleToggleLike = async (item: ContentCard) => {
    const isLiked = !!item.isLiked;
    setContents(prev => prev.map(c => {
      if (c.id === item.id && c.contentType === item.contentType) {
        return {
          ...c,
          isLiked: !isLiked,
          likeCount: isLiked ? Math.max(0, c.likeCount - 1) : c.likeCount + 1,
        };
      }
      return c;
    }));

    try {
      if (item.contentType === 1) {
        if (isLiked) await articlesApi.unlikeArticle(item.id);
        else await articlesApi.likeArticle(item.id);
      } else if (item.contentType === 2) {
        if (isLiked) await videosApi.unlikeVideo(item.id);
        else await videosApi.likeVideo(item.id);
      } else if (item.contentType === 3) {
        if (isLiked) await filesApi.unlikeFile(item.id);
        else await filesApi.likeFile(item.id);
      }
    } catch {
      setContents(prev => prev.map(c => {
        if (c.id === item.id && c.contentType === item.contentType) {
          return {
            ...c,
            isLiked: isLiked,
            likeCount: item.likeCount,
          };
        }
        return c;
      }));
    }
  };

  const handleToggleFavorite = async (item: ContentCard) => {
    const isFavorited = !!item.isFavorited;
    setContents(prev => prev.map(c => {
      if (c.id === item.id && c.contentType === item.contentType) {
        return {
          ...c,
          isFavorited: !isFavorited,
          favoriteCount: isFavorited ? Math.max(0, c.favoriteCount - 1) : c.favoriteCount + 1,
        };
      }
      return c;
    }));

    try {
      if (item.contentType === 1) {
        if (isFavorited) await articlesApi.unfavoriteArticle(item.id);
        else await articlesApi.favoriteArticle(item.id);
      } else if (item.contentType === 2) {
        if (isFavorited) await videosApi.unfavoriteVideo(item.id);
        else await videosApi.favoriteVideo(item.id);
      } else if (item.contentType === 3) {
        if (isFavorited) await filesApi.unfavoriteFile(item.id);
        else await filesApi.favoriteFile(item.id);
      }
    } catch {
      setContents(prev => prev.map(c => {
        if (c.id === item.id && c.contentType === item.contentType) {
          return {
            ...c,
            isFavorited: isFavorited,
            favoriteCount: item.favoriteCount,
          };
        }
        return c;
      }));
    }
  };

  const handleShare = (item: ContentCard) => {
    const detailPath = item.contentType === 1 ? `/articles/${item.id}` : item.contentType === 2 ? `/videos/${item.id}` : `/files/${item.id}`;
    const fullUrl = `${window.location.origin}${detailPath}`;
    navigator.clipboard.writeText(fullUrl);
    const key = `${item.contentType}-${item.id}`;
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getItemLink = (item: ContentCard) => {
    if (item.contentType === 1) return `/articles/${item.id}`;
    if (item.contentType === 2) return `/videos/${item.id}`;
    return `/files/${item.id}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-[#FAFAFB] min-h-screen pb-24 font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-6">
        
        {/* Minimal Header Bar (Centering updated count badge, refresh on right) */}
        <div className="relative flex items-center justify-center py-2 border-b border-neutral-200/80">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-neutral-200/80 rounded-full text-xs font-mono text-neutral-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>已更新 {contents.length} 条动态</span>
          </div>

          <button
            onClick={() => loadFeed()}
            disabled={loading}
            className="absolute right-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-neutral-200/90 text-neutral-800 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0057FF]' : ''}`} />
            <span>刷新</span>
          </button>
        </div>

        {/* Content Feed Cards (No timeline line on left) */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-2xs animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-200" />
                    <div className="space-y-1.5">
                      <div className="h-4 bg-neutral-200 rounded-lg w-28" />
                      <div className="h-3 bg-neutral-100 rounded-lg w-20" />
                    </div>
                  </div>
                  <div className="h-6 bg-neutral-100 rounded-full w-20" />
                </div>
                <div className="h-52 bg-neutral-100 rounded-2xl" />
                <div className="h-4 bg-neutral-100 rounded-lg w-3/4" />
              </div>
            ))}
          </div>
        ) : contents.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center space-y-4 bg-white rounded-3xl border border-neutral-200/80 p-10 shadow-2xs max-w-md mx-auto"
          >
            <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto text-neutral-400">
              <Compass className="w-7 h-7 text-neutral-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-900">暂无动态内容</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                订阅更多创作者，获取最新的设计案例与发布成果。
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => loadFeed()}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all cursor-pointer shadow-2xs"
              >
                刷新列表
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {contents.map((item, idx) => {
                const isArticle = item.contentType === 1;
                const isVideo = item.contentType === 2;
                const isFile = item.contentType === 3;
                const itemLink = getItemLink(item);
                const shareKey = `${item.contentType}-${item.id}`;
                const isCopied = copiedId === shareKey;

                return (
                  <motion.div
                    key={`feed-card-${item.contentType}-${item.id}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className="bg-white rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] hover:border-neutral-300 transition-all duration-300 overflow-hidden"
                  >
                    {/* Header Bar with Embedded Avatar */}
                    <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar Inside Card */}
                        <button
                          onClick={() => {
                            if (item.authorId) {
                              openAuthorModal(item.authorId);
                            }
                          }}
                          className="cursor-pointer group/avatar relative flex-shrink-0"
                          title={item.authorName}
                        >
                          <img
                            src={resolveImageUrl(item.authorAvatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                            alt={item.authorName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-200/90 group-hover/avatar:ring-[#0057FF] transition-all"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                            }}
                          />
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shadow-2xs ${
                            isArticle ? 'bg-[#0057FF]' : isVideo ? 'bg-purple-600' : 'bg-emerald-600'
                          }`}>
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            if (item.authorId) {
                              openAuthorModal(item.authorId);
                            }
                          }}
                          className="text-left group/author cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-neutral-900 group-hover/author:text-[#0057FF] transition-colors">
                              {item.authorName}
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600">
                              <UserCheck className="w-2.5 h-2.5 text-[#0057FF]" /> 认证创作者
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            发布了{isArticle ? '图文专栏' : isVideo ? '视频作品' : '设计资产'} • {formatRelativeTime(item.createdAt)}
                          </p>
                        </button>
                      </div>

                      {/* Top Category Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight ${
                        isArticle 
                          ? 'bg-blue-50 text-[#0057FF] border border-blue-100' 
                          : isVideo 
                          ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {isArticle ? <FileText className="w-3.5 h-3.5" /> : isVideo ? <VideoIcon className="w-3.5 h-3.5" /> : <FolderArchive className="w-3.5 h-3.5" />}
                        <span>{item.categoryName || (isArticle ? '视觉设计' : isVideo ? '动态设计' : '设计资产')}</span>
                      </span>
                    </div>

                    {/* Main Cover & Preview Visual Frame */}
                    <Link to={itemLink} className="relative block group/cover aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-neutral-900">
                      <img
                        src={resolveImageUrl(item.coverImage)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-700 opacity-95 group-hover/cover:opacity-100"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover/cover:opacity-60 transition-opacity" />

                      {/* Media Specific Overlay Badges */}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover/cover:scale-110 group-hover/cover:bg-[#0057FF] transition-all duration-300 shadow-lg">
                            <Play className="w-6 h-6 ml-1 fill-white text-white" />
                          </div>
                          {item.duration && (
                            <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md text-white text-[11px] font-mono font-semibold rounded-lg border border-white/10">
                              {formatDuration(item.duration)}
                            </span>
                          )}
                        </div>
                      )}

                      {isFile && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-white text-[11px] font-mono font-bold uppercase rounded-lg border border-white/10">
                            {item.fileExt ? item.fileExt.toUpperCase() : 'ZIP / PSD'}
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-mono font-bold rounded-lg border border-emerald-400/30 flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {formatFileSize(item.fileSize)}
                          </span>
                        </div>
                      )}

                      {/* Title overlay on desktop banner */}
                      <div className="absolute bottom-4 left-5 right-5 sm:left-6 sm:right-6 text-white">
                        <span className="text-[11px] text-white/70 font-mono uppercase tracking-widest block mb-1">
                          {formatFullDate(item.createdAt)}
                        </span>
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight line-clamp-1 group-hover/cover:text-blue-300 transition-colors">
                          {item.title}
                        </h2>
                      </div>
                    </Link>

                    {/* Content Summary & Interactive Actions Footer */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2">
                        {item.summary || `${item.authorName} 在 ${item.categoryName || '创意全景'} 中分享的最新高精度设计创作。点击进入深度浏览工程文件与高规格展示图库。`}
                      </p>

                      {/* Bottom Actions Row */}
                      <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
                        {/* Interactive Like, Favorite & Share buttons */}
                        <div className="flex items-center gap-1.5 sm:gap-3 text-xs">
                          <button
                            onClick={() => handleToggleLike(item)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-semibold ${
                              item.isLiked 
                                ? 'bg-rose-50 text-rose-600 border border-rose-200/60' 
                                : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-rose-600 text-rose-600' : 'text-neutral-500'}`} />
                            <span>{item.likeCount}</span>
                          </button>

                          <button
                            onClick={() => handleToggleFavorite(item)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-semibold ${
                              item.isFavorited 
                                ? 'bg-amber-50 text-amber-600 border border-amber-200/60' 
                                : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${item.isFavorited ? 'fill-amber-600 text-amber-600' : 'text-neutral-500'}`} />
                            <span>{item.favoriteCount}</span>
                          </button>

                          <button
                            onClick={() => handleShare(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 transition-all cursor-pointer font-medium"
                            title="复制链接分享"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">已复制</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5 text-neutral-500" />
                                <span>分享</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Detail Link CTA */}
                        <div className="flex items-center gap-4 text-xs">
                          <span className="hidden sm:inline-flex items-center gap-1 text-neutral-400 font-mono">
                            <Eye className="w-3.5 h-3.5 text-neutral-400" />
                            {item.viewCount} 浏览
                          </span>

                          <Link
                            to={itemLink}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-[#0057FF] transition-all duration-200 cursor-pointer shadow-2xs group/btn"
                          >
                            <span>查看详情</span>
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};



