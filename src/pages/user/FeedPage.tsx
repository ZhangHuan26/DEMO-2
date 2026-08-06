import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { feedApi } from '../../api/feed';
import { ArticleCard } from '../../components/user/ArticleCard';
import { VideoCard } from '../../components/user/VideoCard';
import { FileCard } from '../../components/user/FileCard';
import { resolveImageUrl } from '../../config/env';
import { Radio, Clock, Sparkles, Users, Calendar, ArrowRight } from 'lucide-react';

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
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
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

export const FeedPage: React.FC = () => {
  const [contents, setContents] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        const result = await feedApi.getContentFeed({ sort: 'latest', size: 50 });
        setContents(result.list || []);
      } catch {
        setContents([]);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, []);

  // 将ContentCard转换为对应的类型
  const convertToArticle = (item: ContentCard) => ({
    id: item.id,
    title: item.title,
    coverImage: item.coverImage,
    summary: item.summary || '',
    content: '',
    viewCount: item.viewCount,
    likeCount: item.likeCount,
    favoriteCount: item.favoriteCount,
    commentCount: item.commentCount,
    userId: item.authorId,
    categoryId: item.categoryId || 0,
    categoryName: item.categoryName,
    status: 0,
    isHidden: 0,
    createdAt: item.createdAt,
    isLiked: item.isLiked,
    isFavorited: item.isFavorited,
    author: {
      id: item.authorId,
      nickName: item.authorName,
      avatar: item.authorAvatar,
      signature: '',
      role: 0 as const,
      status: 0 as const,
      gender: 0,
      followerCount: 0,
      followingCount: 0,
    },
  });

  const convertToVideo = (item: ContentCard) => ({
    id: item.id,
    title: item.title,
    coverImage: item.coverImage,
    description: item.summary || '',
    videoUrl: '',
    duration: item.duration ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : '00:00',
    viewCount: item.viewCount,
    likeCount: item.likeCount,
    favoriteCount: item.favoriteCount,
    commentCount: item.commentCount,
    userId: item.authorId,
    categoryId: item.categoryId || 0,
    categoryName: item.categoryName,
    status: 0,
    isHidden: 0,
    allowDownload: 1,
    createdAt: item.createdAt,
    isLiked: item.isLiked,
    isFavorited: item.isFavorited,
    author: {
      id: item.authorId,
      nickName: item.authorName,
      avatar: item.authorAvatar,
      signature: '',
      role: 0 as const,
      status: 0 as const,
      gender: 0,
      followerCount: 0,
      followingCount: 0,
    },
  });

  const convertToFile = (item: ContentCard) => ({
    id: item.id,
    title: item.title,
    coverImage: item.coverImage,
    description: item.summary || '',
    fileUrl: '',
    fileName: item.title,
    fileSize: item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : '0 MB',
    fileType: item.fileExt || 'file',
    downloadCount: item.viewCount,
    viewCount: item.viewCount,
    likeCount: item.likeCount,
    favoriteCount: item.favoriteCount,
    commentCount: item.commentCount,
    userId: item.authorId,
    categoryId: item.categoryId || 0,
    categoryName: item.categoryName,
    status: 0,
    isHidden: 0,
    allowDownload: 1,
    createdAt: item.createdAt,
    isLiked: item.isLiked,
    isFavorited: item.isFavorited,
    author: {
      id: item.authorId,
      nickName: item.authorName,
      avatar: item.authorAvatar,
      signature: '',
      role: 0 as const,
      status: 0 as const,
      gender: 0,
      followerCount: 0,
      followingCount: 0,
    },
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white min-h-screen pb-24 font-sans"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-neutral-900 via-neutral-900 to-blue-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#0057FF] text-white text-[10px] font-extrabold uppercase rounded tracking-wider flex items-center gap-1.5 shadow-sm">
                <Radio className="w-3 h-3 animate-pulse text-white" /> Live Stream
              </span>
              <span className="text-xs text-neutral-400 font-mono">时间轴动态 ({contents.length})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-[#0057FF]" />
              灵感脉搏
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed">
              按时间先后顺序追踪关注创作者的最新灵感产出，不错过任何一次作品发布
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs font-mono text-neutral-200">
            <Clock className="w-4 h-4 text-[#0057FF]" />
            <span>倒序时序流</span>
          </div>
        </div>

        {/* Timeline Content Stream */}
        {loading ? (
          <div className="space-y-8 pl-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative space-y-3">
                <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full bg-neutral-200 animate-pulse border-2 border-white" />
                <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 animate-pulse space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  <div className="h-32 bg-neutral-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : contents.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center space-y-4 bg-neutral-50 rounded-3xl border border-neutral-200"
          >
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-800">暂无关注动态</h3>
              <p className="text-xs text-neutral-500">
                去关注更多优秀创作者，他们的作品将以时间线的方式呈现于此！
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="relative pl-6 sm:pl-10 space-y-10 before:absolute before:left-2.5 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-[#0057FF] before:via-neutral-200 before:to-neutral-100">
            <AnimatePresence>
              {contents.map((item, idx) => (
                <motion.div
                  key={`timeline-${item.contentType}-${item.id}-${idx}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="relative group"
                >
                  {/* Timeline Dot & Avatar */}
                  <div className="absolute -left-[31px] sm:-left-[47px] top-0 flex items-center justify-center">
                    <button
                      onClick={() => {
                        if (item.authorId) {
                          const event = new CustomEvent('open-author-modal', { detail: { userId: item.authorId } });
                          window.dispatchEvent(event);
                        }
                      }}
                      className="cursor-pointer group/avatar relative"
                      title={item.authorName}
                    >
                      <img
                        src={resolveImageUrl(item.authorAvatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                        alt={item.authorName}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white ring-2 ring-neutral-200 group-hover/avatar:ring-[#0057FF] shadow-xs transition-all"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#0057FF] rounded-full border border-white flex items-center justify-center shadow-2xs">
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    </button>
                  </div>

                  {/* Feed Card Node Container */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all duration-300 space-y-4">
                    {/* Header Row: Author Name, Action & Time */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (item.authorId) {
                              const event = new CustomEvent('open-author-modal', { detail: { userId: item.authorId } });
                              window.dispatchEvent(event);
                            }
                          }}
                          className="font-bold text-neutral-900 hover:text-[#0057FF] transition-colors cursor-pointer text-sm"
                        >
                          {item.authorName}
                        </button>

                        <span className="text-neutral-400 text-xs">·</span>

                        <span className="text-xs font-medium text-neutral-500">
                          发布了{item.contentType === 1 ? '图文' : item.contentType === 2 ? '视频' : '资源'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 font-bold rounded-md text-[11px]">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                        <span className="hidden sm:inline text-neutral-300">
                          {formatFullDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight leading-snug">
                      {item.title}
                    </h2>

                    {/* Embedded Card View */}
                    <div className="max-w-md sm:max-w-lg">
                      {item.contentType === 1 && <ArticleCard article={convertToArticle(item)} />}
                      {item.contentType === 2 && <VideoCard video={convertToVideo(item)} />}
                      {item.contentType === 3 && <FileCard file={convertToFile(item)} />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};


