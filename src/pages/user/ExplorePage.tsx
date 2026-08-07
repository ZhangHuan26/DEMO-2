import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, Flame, Sparkles, UserPlus, UserCheck, Layers, FileText, Video as VideoIcon, FolderDown
} from 'lucide-react';
import { ArticleCard } from '../../components/user/ArticleCard';
import { VideoCard } from '../../components/user/VideoCard';
import { FileCard } from '../../components/user/FileCard';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { authApi } from '../../api/auth';
import { searchApi } from '../../api/search';
import { Article, Video, FileItem, User } from '../../types';
import { resolveImageUrl } from '../../config/env';
import { openAuthorModal } from '../../components/common/AuthorProfileModal';
import { useAuth } from '../../context/AuthContext';

export const ExplorePage: React.FC = () => {
  const { user: currentUser } = useAuth();

  // Selected state
  const [contentType, setContentType] = useState<'all' | 'article' | 'video' | 'file'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data states
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [creators, setCreators] = useState<User[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Search results
  const [searchResults, setSearchResults] = useState<{
    articles: Article[];
    videos: Video[];
    files: FileItem[];
  }>({ articles: [], videos: [], files: [] });

  // Load primary data from API
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [artsRes, vidsRes, filesRes, creatorsList] = await Promise.all([
          articlesApi.getArticles(),
          videosApi.getVideos(),
          filesApi.getFiles(),
          authApi.getRecommendedCreators().catch(() => []),
        ]);

        setArticles(Array.isArray(artsRes?.list) ? artsRes.list : Array.isArray(artsRes) ? artsRes : []);
        setVideos(Array.isArray(vidsRes?.list) ? vidsRes.list : Array.isArray(vidsRes) ? vidsRes : []);
        setFiles(Array.isArray(filesRes?.list) ? filesRes.list : Array.isArray(filesRes) ? filesRes : []);
        setCreators(Array.isArray(creatorsList) ? creatorsList : []);
      } catch (err) {
        console.error('Failed to load explore data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Global search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults({ articles: [], videos: [], files: [] });
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchApi.globalSearch(searchQuery.trim(), 'all');
        setSearchResults({
          articles: Array.isArray(data?.articles) ? data.articles : [],
          videos: Array.isArray(data?.videos) ? data.videos : [],
          files: Array.isArray(data?.files) ? data.files : [],
        });
      } catch (err) {
        console.error('Search failed:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle follow / unfollow creator
  const handleToggleFollow = async (creatorId: number) => {
    const isFollowing = !!followingMap[creatorId];
    try {
      if (isFollowing) {
        await authApi.unfollowUser(creatorId);
        setFollowingMap((prev) => ({ ...prev, [creatorId]: false }));
      } else {
        await authApi.followUser(creatorId);
        setFollowingMap((prev) => ({ ...prev, [creatorId]: true }));
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  // Combine works for grid display
  const combinedWorks = useMemo(() => {
    const sourceArticles = isSearching ? searchResults.articles : articles;
    const sourceVideos = isSearching ? searchResults.videos : videos;
    const sourceFiles = isSearching ? searchResults.files : files;

    const list: Array<
      | ({ workType: 'article' } & Article)
      | ({ workType: 'video' } & Video)
      | ({ workType: 'file' } & FileItem)
    > = [];

    if (contentType === 'all' || contentType === 'article') {
      sourceArticles.forEach((a) => list.push({ ...a, workType: 'article' }));
    }
    if (contentType === 'all' || contentType === 'video') {
      sourceVideos.forEach((v) => list.push({ ...v, workType: 'video' }));
    }
    if (contentType === 'all' || contentType === 'file') {
      sourceFiles.forEach((f) => list.push({ ...f, workType: 'file' }));
    }

    // Sort
    return list.sort((a, b) => {
      if (sortBy === 'popular') return (b.likeCount || 0) - (a.likeCount || 0);
      if (sortBy === 'views') {
        const viewsA = 'viewCount' in a ? a.viewCount || 0 : 'downloadCount' in a ? a.downloadCount || 0 : 0;
        const viewsB = 'viewCount' in b ? b.viewCount || 0 : 'downloadCount' in b ? b.downloadCount || 0 : 0;
        return viewsB - viewsA;
      }
      return (b.id || 0) - (a.id || 0);
    });
  }, [articles, videos, files, searchResults, isSearching, contentType, sortBy]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white min-h-screen pb-16 font-sans"
    >
      <div className="w-full px-[20px] py-6 space-y-6">
        {/* Toolbar: Search, Content Type Filters, and Sorting */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-neutral-50/90 p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索灵感作品、图文、视频或资源文件..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Content Type Selector & Sort Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Content Type Filter */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 text-xs font-semibold relative">
              {[
                { id: 'all', label: '全部', icon: null },
                { id: 'article', label: '图文', icon: FileText },
                { id: 'video', label: '视频', icon: VideoIcon },
                { id: 'file', label: '资源', icon: FolderDown },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = contentType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setContentType(item.id as any)}
                    className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      isActive ? 'text-white' : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeContentType"
                        className="absolute inset-0 bg-black rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    {IconComp && <IconComp className="w-3.5 h-3.5" />}
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Sort Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 text-xs font-semibold relative">
              {[
                { id: 'latest', label: '最新', icon: null },
                { id: 'popular', label: '最热', icon: Flame, iconColor: 'text-amber-500' },
                { id: 'views', label: '最多热度', icon: null },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = sortBy === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSortBy(item.id as any)}
                    className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      isActive ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSortBy"
                        className="absolute inset-0 bg-neutral-100 rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    {IconComp && <IconComp className={`w-3.5 h-3.5 ${item.iconColor || ''}`} />}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-neutral-50 rounded-2xl border border-neutral-200/80 p-4 animate-pulse space-y-3">
                <div className="w-full h-44 bg-neutral-200/60 rounded-xl" />
                <div className="h-4 bg-neutral-200/60 rounded w-3/4" />
                <div className="h-3 bg-neutral-200/60 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : combinedWorks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center space-y-3 bg-neutral-50 rounded-2xl border border-neutral-200/80"
          >
            <Layers className="w-12 h-12 text-neutral-300 mx-auto" />
            <p className="text-sm font-semibold text-neutral-700">未找到相关的灵感作品</p>
            <p className="text-xs text-neutral-400">尝试切换分类或搜索其他关键词</p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {combinedWorks.map((work) => (
                <motion.div
                  key={`${work.workType}-${work.id}`}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  {work.workType === 'video' ? (
                    <VideoCard video={work} />
                  ) : work.workType === 'file' ? (
                    <FileCard file={work} />
                  ) : (
                    <ArticleCard article={work} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Creators Recommendation Section */}
        {creators.length > 0 && (
          <div className="pt-8 border-t border-neutral-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-black" />
                  推荐优秀创作者
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">关注前沿设计灵感与内容发布者</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {creators.slice(0, 6).map((creator, idx) => (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-neutral-200 rounded-2xl p-4 text-center space-y-3 hover:border-neutral-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <button
                      onClick={() => openAuthorModal(creator.id)}
                      className="inline-block group cursor-pointer text-center"
                    >
                      <img
                        src={resolveImageUrl(creator.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                        alt={creator.nickName}
                        className="w-14 h-14 rounded-full object-cover mx-auto ring-2 ring-neutral-100 group-hover:scale-105 transition-transform"
                      />
                      <h3 className="text-xs font-bold text-neutral-900 mt-2 group-hover:text-[#0057FF] transition-colors line-clamp-1">
                        {creator.nickName}
                      </h3>
                    </button>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-tight">
                      {creator.signature || '独立视觉创作者'}
                    </p>
                  </div>

                  {currentUser && currentUser.id !== creator.id && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleFollow(creator.id)}
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        followingMap[creator.id]
                          ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          : 'bg-black text-white hover:bg-neutral-800'
                      }`}
                    >
                      {followingMap[creator.id] ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          已关注
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          关注
                        </>
                      )}
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
