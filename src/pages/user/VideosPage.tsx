import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Category } from '../../types';
import { videosApi } from '../../api/videos';
import { VideoCard } from '../../components/user/VideoCard';
import { CategoryImageBar } from '../../components/common/CategoryImageBar';
import { CreateWorkModal } from '../../components/common/CreateWorkModal';
import { Video as VideoIcon, Play, Search, X, SlidersHorizontal, Plus, ThumbsUp, Eye, Bookmark, Clock } from 'lucide-react';

export const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views' | 'favorites'>('latest');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const apiSort = sortBy === 'popular' ? 'hot' : sortBy === 'latest' ? 'latest' : undefined;
      const [cats, vids] = await Promise.all([
        videosApi.getCategories(),
        videosApi.getVideos({
          categoryId: selectedCatId || undefined,
          keyword: searchQuery.trim() || undefined,
          sort: apiSort
        })
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setVideos(Array.isArray(vids?.list) ? vids.list : Array.isArray(vids) ? vids : []);
    } catch {
      setCategories([]);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [selectedCatId, searchQuery, sortBy]);

  const filteredAndSortedVideos = useMemo(() => {
    let result = [...videos];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        v =>
          v.title.toLowerCase().includes(q) ||
          (v.description && v.description.toLowerCase().includes(q)) ||
          (v.author?.nickName && v.author.nickName.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'popular') return (b.likeCount || 0) - (a.likeCount || 0);
      if (sortBy === 'views') return (b.viewCount || 0) - (a.viewCount || 0);
      if (sortBy === 'favorites') return (b.favoriteCount || 0) - (a.favoriteCount || 0);
      return (b.id || 0) - (a.id || 0);
    });

    return result;
  }, [videos, searchQuery, sortBy]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white min-h-screen pb-16 font-sans"
    >
      {/* Top Image Category Bar */}
      <CategoryImageBar
        categories={categories}
        selectedCatId={selectedCatId}
        onSelectCategory={setSelectedCatId}
        allLabel="全部动效视频"
        allIcon={Play}
      />

      <div className="w-full px-[20px] py-6 space-y-6">
        {/* Toolbar: Search, Sort Filter, and Publish Video Button */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-neutral-50/90 p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索视频标题、动效描述或创作者..."
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

          {/* Right Controls: Sort Filter & Publish Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 text-xs font-semibold relative">
              <span className="text-[11px] text-neutral-400 px-2 font-mono flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" /> 排序:
              </span>
              {[
                { id: 'latest', label: '最新发布', icon: Clock },
                { id: 'popular', label: '最多点赞', icon: ThumbsUp },
                { id: 'views', label: '最多播放', icon: Eye },
                { id: 'favorites', label: '最多收藏', icon: Bookmark },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id as any)}
                    className={`relative z-10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                      active
                        ? 'text-white font-bold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeVideoSort"
                        className="absolute inset-0 bg-neutral-900 rounded-lg -z-10 shadow-2xs"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Publish Button with Fixed Type "video" */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-[#0057FF]/20 cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>发布视频作品</span>
            </motion.button>
          </div>
        </div>

        {/* Video Grid Canvas */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAndSortedVideos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 text-center text-neutral-500 text-xs space-y-2 bg-neutral-50 rounded-2xl border border-neutral-200"
          >
            <VideoIcon className="w-10 h-10 mx-auto text-neutral-400" />
            <p className="font-semibold text-neutral-700">
              {searchQuery ? '未检索到符合条件的视频作品' : '暂无该分类下的视频作品'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#0057FF] hover:underline font-medium cursor-pointer"
              >
                清空搜索关键词
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredAndSortedVideos.map((vid, idx) => (
                <motion.div
                  key={`vid-${vid.id ?? idx}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <VideoCard video={vid} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modal for creating work with fixed video type */}
      <CreateWorkModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialType="video"
        lockType={true}
        onSuccess={fetchVideos}
      />
    </motion.div>
  );
};

