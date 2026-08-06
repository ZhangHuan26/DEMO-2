import React, { useState, useEffect, useMemo } from 'react';
import { Article, Category } from '../../types';
import { articlesApi } from '../../api/articles';
import { ArticleCard } from '../../components/user/ArticleCard';
import { CategoryImageBar } from '../../components/common/CategoryImageBar';
import { CreateWorkModal } from '../../components/common/CreateWorkModal';
import { Layers, Star, Search, X, SlidersHorizontal, Plus, ThumbsUp, Eye, Bookmark, Clock } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views' | 'favorites'>('latest');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const [cats, arts] = await Promise.all([
        articlesApi.getCategories(),
        articlesApi.getArticles({ categoryId: selectedCatId || undefined })
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setArticles(Array.isArray(arts?.list) ? arts.list : Array.isArray(arts) ? arts : []);
    } catch {
      setCategories([]);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCatId]);

  const filteredAndSortedArticles = useMemo(() => {
    let result = [...articles];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          (a.summary && a.summary.toLowerCase().includes(q)) ||
          (a.author?.nickName && a.author.nickName.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'popular') return (b.likeCount || 0) - (a.likeCount || 0);
      if (sortBy === 'views') return (b.viewCount || 0) - (a.viewCount || 0);
      if (sortBy === 'favorites') return (b.favoriteCount || 0) - (a.favoriteCount || 0);
      return (b.id || 0) - (a.id || 0);
    });

    return result;
  }, [articles, searchQuery, sortBy]);

  return (
    <div className="bg-white min-h-screen pb-16 font-sans">
      {/* Top Image Category Bar */}
      <CategoryImageBar
        categories={categories}
        selectedCatId={selectedCatId}
        onSelectCategory={setSelectedCatId}
        allLabel="全部图文作品"
        allIcon={Star}
      />

      <div className="max-w-[1700px] mx-auto px-4 lg:px-10 py-6 space-y-6">
        {/* Toolbar: Search, Sort Filter, and Publish Button */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-neutral-50/90 p-4 rounded-2xl border border-neutral-200/80">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索图文作品标题、内容简介或作者..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] transition-all"
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
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 text-xs font-semibold">
              <span className="text-[11px] text-neutral-400 px-2 font-mono flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" /> 排序:
              </span>
              {[
                { id: 'latest', label: '最新发布', icon: Clock },
                { id: 'popular', label: '最多点赞', icon: ThumbsUp },
                { id: 'views', label: '最多浏览', icon: Eye },
                { id: 'favorites', label: '最多收藏', icon: Bookmark },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id as any)}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-neutral-900 text-white font-bold shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Publish Button with Fixed Type "article" */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-[#0057FF]/20 cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>发布图文作品</span>
            </button>
          </div>
        </div>

        {/* Grid Canvas */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAndSortedArticles.length === 0 ? (
          <div className="py-24 text-center text-neutral-500 text-sm space-y-3 bg-neutral-50 rounded-2xl border border-neutral-200">
            <Layers className="w-12 h-12 mx-auto text-neutral-400" />
            <p className="font-bold text-base text-neutral-800">
              {searchQuery ? '未检索到符合条件的图文作品' : '暂无该分类下的图文作品'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#0057FF] hover:underline font-medium"
              >
                清空搜索关键词
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {filteredAndSortedArticles.map((art, idx) => (
              <ArticleCard key={`home-art-${art.id ?? idx}-${idx}`} article={art} />
            ))}
          </div>
        )}
      </div>

      {/* Modal for creating work with fixed article type */}
      <CreateWorkModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialType="article"
        lockType={true}
        onSuccess={fetchArticles}
      />
    </div>
  );
};
