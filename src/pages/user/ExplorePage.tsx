import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Eye, ThumbsUp, Search, Layers, Play, Download, SlidersHorizontal,
  Star, Heart, Award, ChevronLeft, ChevronRight, UserPlus, UserCheck, Users
} from 'lucide-react';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { categoriesApi, AllCategoriesData } from '../../api/categories';
import { authApi } from '../../api/auth';
import { searchApi } from '../../api/search';
import { Article, Video, FileItem, User } from '../../types';
import { resolveImageUrl } from '../../config/env';
import { openAuthorModal } from '../../components/common/AuthorProfileModal';
import { useAuth } from '../../context/AuthContext';


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
  const { user: currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('为您推荐');
  const [sortOrder, setSortOrder] = useState<'trending' | 'latest' | 'likes'>('trending');
  const [contentType, setContentType] = useState<'all' | 'article' | 'video' | 'file'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [allCategories, setAllCategories] = useState<AllCategoriesData>({ articles: [], files: [], videos: [] });
  const [loading, setLoading] = useState(true);

  // 搜索结果状态
  const [searchResults, setSearchResults] = useState<{
    articles: Article[];
    videos: Video[];
    files: FileItem[];
    users: User[];
  }>({ articles: [], videos: [], files: [], users: [] });

  // 推荐创作者相关状态
  const [creators, setCreators] = useState<User[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});

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

  // 加载推荐创作者
  useEffect(() => {
    const loadCreators = async () => {
      setCreatorsLoading(true);
      try {
        const list = await authApi.getRecommendedCreators();
        setCreators(list);
      } catch (err) {
        console.error('Failed to fetch creators:', err);
      } finally {
        setCreatorsLoading(false);
      }
    };
    loadCreators();
  }, []);

  // 搜索功能 - 使用全局搜索API
  useEffect(() => {
    const performSearch = async () => {
      if (!searchKeyword.trim()) {
        setSearchResults({ articles: [], videos: [], files: [], users: [] });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchApi.globalSearch(searchKeyword, 'all');
        console.log('[ExplorePage] Search results:', results);
        
        const data = results?.data || results;
        setSearchResults({
          articles: Array.isArray(data?.articles?.list) ? data.articles.list : (Array.isArray(data?.articles) ? data.articles : []),
          videos: Array.isArray(data?.videos?.list) ? data.videos.list : (Array.isArray(data?.videos) ? data.videos : []),
          files: Array.isArray(data?.files?.list) ? data.files.list : (Array.isArray(data?.files) ? data.files : []),
          users: Array.isArray(data?.users?.list) ? data.users.list : (Array.isArray(data?.users) ? data.users : []),
        });
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults({ articles: [], videos: [], files: [], users: [] });
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchKeyword]);

  // 处理关注/取消关注
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
    ...files.map(f => ({ ...f, workType: 'file' as const, viewCount: f.downloadCount })),
  ];

  // 如果正在搜索，使用搜索结果；否则使用所有作品
  const displayWorks = isSearching && searchKeyword.trim() ? [
    ...searchResults.articles.map(a => ({ ...a, workType: 'article' as const })),
    ...searchResults.videos.map(v => ({ ...v, workType: 'video' as const })),
    ...searchResults.files.map(f => ({ ...f, workType: 'file' as const, viewCount: f.downloadCount })),
  ] : allWorks;

  // 如果正在搜索，显示搜索到的用户；否则显示推荐创作者
  const displayCreators = isSearching && searchKeyword.trim() ? searchResults.users : creators;

  // Filter logic
  const filteredWorks = displayWorks.filter(item => {
    // Content type filter
    if (contentType !== 'all' && item.workType !== contentType) return false;

    // Category filter (only apply when not searching)
    if (!isSearching && selectedCategory !== '为您推荐' && selectedCategory !== '全部') {
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
      <div className="w-full px-[20px] pt-8 space-y-8">
        {/* Filter Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-5 pb-3 border-b border-neutral-200">
          {/* Right Toolbar: Search & Order */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索作品、创作者..."
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
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (work.userId) openAuthorModal(work.userId);
                        }}
                        className="flex items-center gap-2.5 hover:text-black transition-colors cursor-pointer text-left"
                      >
                        <img
                          src={resolveImageUrl(work.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                          alt={work.author?.nickName || '创作者'}
                          className="w-7 h-7 rounded-full object-cover border border-neutral-200 shadow-xs hover:ring-2 hover:ring-[#0057FF] transition-all"
                        />

                        <span className="font-semibold text-sm text-neutral-800 truncate max-w-[110px]">
                          {work.author?.nickName || '创作者'}
                        </span>
                      </button>

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

        {/* 推荐创作者区域 */}
        <div className="mt-16 pt-12 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#0057FF]" />
                推荐创作者
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                发现设计界、艺术领域的杰出创作者，关注他们获取灵感
              </p>
            </div>
            <Link
              to="/creators"
              className="text-sm text-[#0057FF] hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {creatorsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 animate-pulse">
                  <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto" />
                  <div className="h-3 bg-neutral-200 rounded w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : creators.length === 0 ? (
            <div className="text-center py-16 bg-neutral-50 border border-neutral-200 rounded-2xl p-8 space-y-3">
              <Users className="w-12 h-12 text-neutral-400 mx-auto" />
              <p className="text-neutral-600 font-medium">暂无推荐创作者</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {creators.slice(0, 6).map((creator) => (
                <div
                  key={creator.id}
                  className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl p-6 text-center space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <button
                      onClick={() => openAuthorModal(creator.id)}
                      className="inline-block group cursor-pointer text-center"
                    >
                      <img
                        src={resolveImageUrl(creator.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                        alt={creator.nickName}
                        className="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-neutral-100 group-hover:scale-105 transition-transform"
                      />
                      <h3 className="text-base font-bold text-neutral-900 mt-3 group-hover:text-[#0057FF] transition-colors">
                        {creator.nickName}
                      </h3>
                    </button>
                    <p className="text-xs text-neutral-500 line-clamp-2 min-h-[32px]">
                      {creator.signature || '这位创作者很神秘，还没有填写个性签名'}
                    </p>
                  </div>

                  {currentUser && currentUser.id !== creator.id && (
                    <button
                      onClick={() => handleToggleFollow(creator.id)}
                      className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        followingMap[creator.id]
                          ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          : 'bg-[#0057FF] text-white hover:bg-[#0046CC]'
                      }`}
                    >
                      {followingMap[creator.id] ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          已关注
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          关注
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
