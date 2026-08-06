import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Eye, ThumbsUp, Search, Layers, Play, Download, SlidersHorizontal,
  Star, Heart, Award, ChevronLeft, ChevronRight
} from 'lucide-react';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { categoriesApi, AllCategoriesData } from '../../api/categories';
import { Article, Video, FileItem } from '../../types';
import { resolveImageUrl } from '../../config/env';


interface PresetCategory {
  id: string;
  name: string;
  icon?: React.ElementType;
  coverImage: string;
  isBlueTheme?: boolean;
}

const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: 'for-you',
    name: '为您推荐',
    icon: Star,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    isBlueTheme: true,
  },
  {
    id: 'following',
    name: '关注中',
    icon: Heart,
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'curated',
    name: 'Behance 精选',
    icon: Award,
    coverImage: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'graphic',
    name: '图形设计',
    coverImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'photo',
    name: '摄影',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'illustration',
    name: '插图',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3d',
    name: '3D Art',
    coverImage: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'uiux',
    name: 'UI/UX',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'animation',
    name: '动画',
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'architecture',
    name: '建筑',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'product',
    name: '产品设计',
    coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'fashion',
    name: '时尚',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'ad',
    name: '广告',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'fineart',
    name: '美术',
    coverImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'crafts',
    name: '手工艺',
    coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop',
  },
];

export const ExplorePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('为您推荐');
  const [sortOrder, setSortOrder] = useState<'trending' | 'latest' | 'likes'>('trending');
  const [contentType, setContentType] = useState<'all' | 'article' | 'video' | 'file'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [allCategories, setAllCategories] = useState<AllCategoriesData>({ articles: [], files: [], videos: [] });
  const [loading, setLoading] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [artsRes, vidsRes, filesRes, catsData] = await Promise.all([
          articlesApi.getArticles(),
          videosApi.getVideos(),
          filesApi.getFiles(),
          categoriesApi.getAllCategories(),
        ]);
        setArticles(artsRes.list || []);
        setVideos(vidsRes.list || []);
        setFiles(filesRes.list || []);
        setAllCategories(catsData);
      } catch {
        // fallback empty
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Merge presets with dynamic categories from backend
  const displayCategories = useMemo(() => {
    const list = [...PRESET_CATEGORIES];
    const seenNames = new Set(PRESET_CATEGORIES.map(c => c.name.toLowerCase()));

    const dynamicList = [
      ...(allCategories.articles || []),
      ...(allCategories.videos || []),
      ...(allCategories.files || []),
    ];

    dynamicList.forEach(item => {
      if (item.name && !seenNames.has(item.name.toLowerCase())) {
        seenNames.add(item.name.toLowerCase());
        list.push({
          id: `dyn-${item.id}-${item.name}`,
          name: item.name,
          coverImage: item.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
        });
      }
    });

    return list;
  }, [allCategories]);

  // Handle scroll arrows state
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Center button on click
  const handleCategoryClick = (catName: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedCategory(catName);
    if (event.currentTarget) {
      event.currentTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  };

  // Combine items for unified explore grid
  const allWorks = [
    ...articles.map(a => ({ ...a, workType: 'article' as const })),
    ...videos.map(v => ({ ...v, workType: 'video' as const })),
    ...files.map(f => ({ ...f, workType: 'file' as const })),
  ];

  // Filter logic
  const filteredWorks = allWorks.filter(item => {
    // Content type filter
    if (contentType !== 'all' && item.workType !== contentType) return false;

    // Search filter
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchAuthor = item.author?.nickName?.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor) return false;
    }

    // Category filter
    if (selectedCategory !== '为您推荐' && selectedCategory !== '全部') {
      if (selectedCategory === '关注中') {
        // return subset or all
        return true;
      }
      if (selectedCategory === 'Behance 精选') {
        return (item.likeCount || 0) > 10 || (item.viewCount || 0) > 100;
      }
      if (item.categoryName) {
        const catLower = selectedCategory.toLowerCase().replace('艺术', '').replace('设计', '').trim();
        const itemCatLower = item.categoryName.toLowerCase();
        if (catLower && !itemCatLower.includes(catLower) && !catLower.includes(itemCatLower)) {
          return false;
        }
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortOrder === 'latest') return (b.id || 0) - (a.id || 0);
    if (sortOrder === 'likes') return (b.likeCount || 0) - (a.likeCount || 0);
    return (b.viewCount || 0) - (a.viewCount || 0); // default trending
  });

  return (
    <div className="bg-white min-h-screen text-neutral-900 pb-16 font-sans">
      {/* Top Image Category Filter Bar */}
      <div className="sticky top-[68px] z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 py-3.5 px-4 lg:px-10 shadow-xs">
        <div className="max-w-[1700px] mx-auto relative group/nav">
          {/* Left Arrow Button */}
          {showLeftArrow && (
            <button
              onClick={() => scrollByAmount('left')}
              className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 text-neutral-800 shadow-lg border border-neutral-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="向左滚动"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Category Scroll Container without scrollbar */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 px-3.5 -mx-1"
          >
            {displayCategories.map((cat, idx) => {
              const isSelected = selectedCategory === cat.name;
              const IconComp = cat.icon;

              return (
                <button
                  key={`exp-cat-${cat.id ?? idx}-${idx}`}
                  onClick={(e) => handleCategoryClick(cat.name, e)}
                  className={`h-14 px-4.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shrink-0 relative overflow-hidden group/item transition-all duration-300 border select-none ${
                    isSelected
                      ? 'border-[#0057FF] ring-2 ring-[#0057FF] ring-offset-2 scale-[1.03] shadow-md'
                      : 'border-white/20 hover:scale-[1.02] opacity-90 hover:opacity-100 shadow-2xs'
                  }`}
                  style={{
                    backgroundImage: cat.isBlueTheme && isSelected
                      ? 'linear-gradient(135deg, #0057FF 0%, #3B82F6 100%)'
                      : `url(${cat.coverImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Dark Overlay Gradient for High Legibility */}
                  <div
                    className={`absolute inset-0 transition-colors ${
                      isSelected
                        ? cat.isBlueTheme
                          ? 'bg-transparent'
                          : 'bg-black/45 group-hover/item:bg-black/35'
                        : 'bg-black/55 group-hover/item:bg-black/40'
                    }`}
                  />

                  {/* Icon & Category Text */}
                  <div className="relative z-10 flex items-center gap-2 text-white">
                    {IconComp && (
                      <IconComp
                        className={`w-4 h-4 shrink-0 ${
                          cat.isBlueTheme ? 'text-amber-300 fill-amber-300' : 'text-white'
                        }`}
                      />
                    )}
                    <span className="text-sm font-bold tracking-wide whitespace-nowrap drop-shadow-sm">
                      {cat.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          {showRightArrow && (
            <button
              onClick={() => scrollByAmount('right')}
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 text-neutral-800 shadow-lg border border-neutral-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="向右滚动"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 lg:px-10 pt-8 space-y-8">
        {/* Banner Section / Personalized Feed Trigger */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-gradient-to-r from-neutral-50 via-blue-50/30 to-neutral-50 border border-neutral-200/80 p-6 sm:p-7 rounded-2xl shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-[#0057FF]" /> 探索全域创意作品
            </h1>
            <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
              汇聚来自视觉、3D、UI/UX、动效与插画领域的全球高分灵感作品
            </p>
          </div>

          <button className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>打造个性化的信息源</span>
          </button>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-5 pb-3 border-b border-neutral-200">
          {/* Work Type Tabs */}
          <div className="flex items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setContentType('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                contentType === 'all' ? 'bg-white text-black shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              全部作品 ({allWorks.length})
            </button>
            <button
              onClick={() => setContentType('article')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                contentType === 'article' ? 'bg-white text-[#0057FF] shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              图文画廊 ({articles.length})
            </button>
            <button
              onClick={() => setContentType('video')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                contentType === 'video' ? 'bg-white text-purple-600 shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              视频动效 ({videos.length})
            </button>
            <button
              onClick={() => setContentType('file')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                contentType === 'file' ? 'bg-white text-emerald-600 shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              设计资源 ({files.length})
            </button>
          </div>

          {/* Right Toolbar: Search & Order */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="筛选探索关键词..."
                className="bg-neutral-100 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all w-52 sm:w-72"
              />
            </div>

            <div className="flex items-center gap-1.5 text-sm text-neutral-500 bg-neutral-100 p-1.5 rounded-xl">
              <button
                onClick={() => setSortOrder('trending')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition-all ${
                  sortOrder === 'trending' ? 'bg-white text-black shadow-xs' : 'hover:text-black'
                }`}
              >
                热门推荐
              </button>
              <button
                onClick={() => setSortOrder('latest')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition-all ${
                  sortOrder === 'latest' ? 'bg-white text-black shadow-xs' : 'hover:text-black'
                }`}
              >
                最新发布
              </button>
              <button
                onClick={() => setSortOrder('likes')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition-all ${
                  sortOrder === 'likes' ? 'bg-white text-black shadow-xs' : 'hover:text-black'
                }`}
              >
                赞赏最多
              </button>
            </div>
          </div>
        </div>

        {/* Masonry / Responsive Showcase Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="py-24 text-center text-neutral-500 text-sm space-y-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <Layers className="w-14 h-14 mx-auto text-neutral-300" />
            <p className="font-bold text-base text-neutral-800">未找到符合该条件的探索作品</p>
            <p className="text-xs text-neutral-500">尝试清空关键字或切换顶部分类查看更多作品</p>
            <button
              onClick={() => {
                setSearchKeyword('');
                setContentType('all');
                setSelectedCategory('全部');
              }}
              className="px-5 py-2.5 bg-[#0057FF] text-white text-sm font-bold rounded-xl shadow-xs cursor-pointer mt-2 hover:bg-blue-700 transition-colors"
            >
              重置所有筛选项
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {filteredWorks.map((work, idx) => {
              const detailPath = work.workType === 'video' ? `/videos/${work.id}` : work.workType === 'file' ? `/files/${work.id}` : `/articles/${work.id}`;

              return (
                <div
                  key={`exp-work-${work.workType}-${work.id ?? idx}-${idx}`}
                  className="group bg-white border border-neutral-200/90 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1.5"
                >
                  {/* Media Thumbnail */}
                  <Link to={detailPath} className="relative aspect-[4/3] overflow-hidden bg-neutral-100 block">
                    <img
                      src={resolveImageUrl(work.coverImage)}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />


                    {/* Badge Overlay */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      {work.workType === 'video' && (
                        <span className="px-2.5 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                          <Play className="w-3 h-3 fill-white" /> 视频
                        </span>
                      )}
                      {work.workType === 'file' && (
                        <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                          <Download className="w-3 h-3" /> 资源
                        </span>
                      )}
                      {work.categoryName && (
                        <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm">
                          {work.categoryName}
                        </span>
                      )}
                    </div>

                    {/* Author PRO Badge */}
                    <span className="absolute top-3.5 right-3.5 px-2.5 py-1 bg-[#0057FF] text-white text-[10px] font-black rounded-md uppercase tracking-wider shadow-md">
                      PRO 精选
                    </span>
                  </Link>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={detailPath}>
                        <h3 className="text-base font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors line-clamp-2 leading-snug mb-2">
                          {work.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-5">
                        {'summary' in work ? work.summary : 'description' in work ? work.description : '设计创作者精选灵感作品'}
                      </p>
                    </div>

                    {/* Author & Metrics Footer */}
                    <div className="pt-3.5 border-t border-neutral-100 flex items-center justify-between text-sm text-neutral-600">
                      <Link to={`/users/${work.userId}`} className="flex items-center gap-2.5 hover:text-black transition-colors">
                        <img
                          src={resolveImageUrl(work.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                          alt={work.author?.nickName || '创作者'}
                          className="w-7 h-7 rounded-full object-cover border border-neutral-200 shadow-xs"
                        />

                        <span className="font-semibold text-sm text-neutral-800 truncate max-w-[110px]">
                          {work.author?.nickName || '创作者'}
                        </span>
                      </Link>

                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="flex items-center gap-1 text-neutral-500">
                          <Eye className="w-4 h-4 text-neutral-400" />
                          {work.viewCount}
                        </span>
                        <span className="flex items-center gap-1 text-[#0057FF] font-bold">
                          <ThumbsUp className="w-4 h-4" />
                          {work.likeCount}
                        </span>
                      </div>
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
