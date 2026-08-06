import React, { useState, useEffect } from 'react';
import { feedApi } from '../../api/feed';
import { ArticleCard } from '../../components/user/ArticleCard';
import { VideoCard } from '../../components/user/VideoCard';
import { FileCard } from '../../components/user/FileCard';
import { resolveImageUrl } from '../../config/env';
import { Heart, Clock } from 'lucide-react';

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

export const FeedPage: React.FC = () => {
  const [contents, setContents] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        // 获取关注动态，按最新日期排序，不做类型筛选
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
      role: 0,
      status: 0,
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
      role: 0,
      status: 0,
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
      role: 0,
      status: 0,
      gender: 0,
      followerCount: 0,
      followingCount: 0,
    },
  });

  return (
    <div className="w-full py-8 flex justify-center bg-neutral-50">
      <div className="w-full max-w-[50%] px-6 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h1 className="text-lg font-bold text-neutral-900">关注动态</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Clock className="w-3.5 h-3.5" />
            <span>按最新发布时间排序</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-full animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-neutral-100 rounded w-1/4 animate-pulse" />
                  <div className="h-40 bg-neutral-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : contents.length === 0 ? (
          <div className="py-24 text-center text-neutral-600 text-sm bg-neutral-50 rounded-2xl border border-neutral-200">
            您关注的创作者暂无最新动态，去关注更多优秀创作者吧！
          </div>
        ) : (
          <div className="space-y-8">
            {contents.map((item, idx) => {
              // 格式化日期
              const formatDate = (dateStr: string) => {
                const date = new Date(dateStr);
                return date.toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              };

              return (
                <div key={`feed-${item.contentType}-${item.id}-${idx}`} className="flex gap-4 pb-6 border-b border-neutral-100 last:border-b-0">
                  {/* 左边：用户头像 */}
                  <div className="shrink-0">
                    <button
                      onClick={() => {
                        if (item.authorId) {
                          // 使用 openAuthorModal 打开用户详情
                          const event = new CustomEvent('open-author-modal', { detail: { userId: item.authorId } });
                          window.dispatchEvent(event);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <img
                        src={resolveImageUrl(item.authorAvatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                        alt={item.authorName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-neutral-200 hover:border-[#0057FF] transition-all"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                        }}
                      />
                    </button>
                  </div>

                  {/* 右边：用户信息、内容和日期 */}
                  <div className="flex-1 min-w-0">
                    {/* 用户昵称和作品名称 */}
                    <div className="mb-2">
                      <button
                        onClick={() => {
                          if (item.authorId) {
                            const event = new CustomEvent('open-author-modal', { detail: { userId: item.authorId } });
                            window.dispatchEvent(event);
                          }
                        }}
                        className="font-bold text-[#0057FF] hover:underline cursor-pointer text-sm"
                      >
                        {item.authorName}
                      </button>
                      <span className="text-neutral-600 text-sm ml-2">
                        发布了{item.contentType === 1 ? '图文作品' : item.contentType === 2 ? '视频作品' : '设计资源'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-neutral-900 font-medium mb-3">
                      {item.title}
                    </div>

                    {/* 内容卡片 */}
                    <div className="mb-3">
                      {item.contentType === 1 && <ArticleCard article={convertToArticle(item)} />}
                      {item.contentType === 2 && <VideoCard video={convertToVideo(item)} />}
                      {item.contentType === 3 && <FileCard file={convertToFile(item)} />}
                    </div>

                    {/* 发布日期 */}
                    <div className="text-xs text-neutral-400">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
