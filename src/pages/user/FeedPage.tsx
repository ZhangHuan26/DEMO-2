import React, { useState, useEffect } from 'react';
import { feedApi } from '../../api/feed';
import { ArticleCard } from '../../components/user/ArticleCard';
import { VideoCard } from '../../components/user/VideoCard';
import { FileCard } from '../../components/user/FileCard';
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
    <div className="w-full px-[20px] py-8 space-y-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-72 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : contents.length === 0 ? (
        <div className="py-24 text-center text-neutral-600 text-sm bg-neutral-50 rounded-2xl border border-neutral-200">
          您关注的创作者暂无最新动态，去关注更多优秀创作者吧！
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {contents.map((item, idx) => {
            if (item.contentType === 1) {
              return <ArticleCard key={`feed-article-${item.id}-${idx}`} article={convertToArticle(item)} />;
            } else if (item.contentType === 2) {
              return <VideoCard key={`feed-video-${item.id}-${idx}`} video={convertToVideo(item)} />;
            } else if (item.contentType === 3) {
              return <FileCard key={`feed-file-${item.id}-${idx}`} file={convertToFile(item)} />;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};
