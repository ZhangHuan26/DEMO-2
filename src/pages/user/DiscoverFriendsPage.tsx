import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  UserPlus,
  UserCheck,
  Users,
  TrendingUp,
  Sparkles,
  Award,
  X,
  Compass,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Flame
} from 'lucide-react';
import { User } from '../../types';
import { authApi } from '../../api/auth';
import { searchApi } from '../../api/search';
import { useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '../../config/env';

export const DiscoverFriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'popular'>('all');
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});

  // 加载推荐创作者
  useEffect(() => {
    const loadRecommended = async () => {
      try {
        const users = await authApi.getRecommendedCreators();
        setRecommendedUsers(users);
        const initialMap: Record<number, boolean> = {};
        users.forEach(u => {
          if (u.isFollowing) initialMap[u.id] = true;
        });
        setFollowingMap(prev => ({ ...prev, ...initialMap }));
      } catch {
        setRecommendedUsers([]);
      }
    };
    loadRecommended();
  }, []);

  // 搜索好友
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchPerformed(true);
    try {
      const results = await searchApi.globalSearch(searchQuery, 'user');
      const users = results.users || [];
      setSearchResults(users);
      const newMap: Record<number, boolean> = {};
      users.forEach(u => {
        if (u.isFollowing) newMap[u.id] = true;
      });
      setFollowingMap(prev => ({ ...prev, ...newMap }));
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchPerformed(false);
    setSearchResults([]);
  };

  // 关注/取消关注用户
  const handleToggleFollow = async (user: User) => {
    const isCurrentlyFollowing = !!followingMap[user.id];
    setFollowingMap(prev => ({ ...prev, [user.id]: !isCurrentlyFollowing }));

    try {
      if (isCurrentlyFollowing) {
        await authApi.unfollowUser(user.id);
        setSearchResults(prev =>
          prev.map(u =>
            u.id === user.id
              ? {
                  ...u,
                  isFollowing: false,
                  followerCount: Math.max(0, (u.followerCount || 0) - 1),
                }
              : u
          )
        );
        setRecommendedUsers(prev =>
          prev.map(u =>
            u.id === user.id
              ? {
                  ...u,
                  isFollowing: false,
                  followerCount: Math.max(0, (u.followerCount || 0) - 1),
                }
              : u
          )
        );
      } else {
        await authApi.followUser(user.id);
        setSearchResults(prev =>
          prev.map(u =>
            u.id === user.id
              ? { ...u, isFollowing: true, followerCount: (u.followerCount || 0) + 1 }
              : u
          )
        );
        setRecommendedUsers(prev =>
          prev.map(u =>
            u.id === user.id
              ? { ...u, isFollowing: true, followerCount: (u.followerCount || 0) + 1 }
              : u
          )
        );
      }
    } catch (error) {
      console.error('关注操作失败:', error);
      setFollowingMap(prev => ({ ...prev, [user.id]: isCurrentlyFollowing }));
    }
  };

  // 过滤用户列表
  const filterList = (list: User[]) => {
    if (activeFilter === 'verified') {
      return list.filter(
        u => u.role === 1 || (u.role as unknown) === 'admin' || (u.followerCount && u.followerCount > 5)
      );
    }
    if (activeFilter === 'popular') {
      return [...list].sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));
    }
    return list;
  };

  // 渲染用户卡片
  const UserCard: React.FC<{ user: User; index: number }> = ({ user, index }) => {
    const isFollowing = !!followingMap[user.id];
    const isSuperAdmin = user.role === 1 || (user.role as unknown) === 'admin' || (user.role as unknown) === '1';

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className="group relative bg-white hover:bg-white border border-neutral-200/80 hover:border-blue-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between"
      >
        {/* Cover Header Banner */}
        <div className="h-24 bg-gradient-to-r from-neutral-900 via-blue-950 to-neutral-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#0057FF_0,transparent_60%)] opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:16px_16px] opacity-30" />

          {/* Top Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
            {isSuperAdmin ? (
              <span className="px-2.5 py-0.5 bg-amber-400 text-neutral-950 font-black text-[9px] rounded-md uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3" />
                官方认证
              </span>
            ) : (user.followerCount || 0) > 10 ? (
              <span className="px-2.5 py-0.5 bg-blue-500/90 backdrop-blur-md text-white font-bold text-[9px] rounded-md tracking-wider flex items-center gap-1 shadow-xs">
                <Flame className="w-3 h-3 text-amber-300" />
                热门创作者
              </span>
            ) : null}
          </div>
        </div>

        {/* Card Content Body */}
        <div className="px-5 pb-5 relative z-10 -mt-10 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Avatar and Basic Header */}
            <div className="flex items-end justify-between">
              <div
                onClick={() => navigate(`/users/${user.id}`)}
                className="cursor-pointer relative group/avatar"
              >
                <img
                  src={
                    resolveImageUrl(user.avatar) ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                  }
                  alt={user.nickName}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white bg-neutral-100 shadow-md group-hover/avatar:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                  }}
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
              </div>

              <button
                onClick={() => navigate(`/users/${user.id}`)}
                className="text-xs font-bold text-neutral-500 hover:text-[#0057FF] flex items-center gap-1 group/link transition-colors cursor-pointer"
              >
                <span>查看主页</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover/link:text-[#0057FF] group-hover/link:translate-x-1 transition-all" />
              </button>
            </div>

            {/* User Meta Name & Signature */}
            <div
              onClick={() => navigate(`/users/${user.id}`)}
              className="cursor-pointer space-y-1"
            >
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-neutral-900 hover:text-[#0057FF] transition-colors truncate">
                  {user.nickName}
                </h3>
                {isSuperAdmin && <Award className="w-4 h-4 text-amber-500 shrink-0" />}
              </div>
              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed min-h-[32px]">
                {user.signature || '这位创作者很神秘，还没有填写个性签名~'}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-xs">
              <div className="px-3 py-1.5 bg-neutral-50/80 rounded-xl border border-neutral-200/60 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-bold">粉丝数</span>
                <span className="font-mono font-bold text-neutral-800 flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-500" />
                  {user.followerCount || 0}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-neutral-50/80 rounded-xl border border-neutral-200/60 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-bold">作品总量</span>
                <span className="font-mono font-bold text-neutral-800 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-purple-500" />
                  {(user.worksCount || user.articleCount || 0) + (user.videoCount || 0) + (user.fileCount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => handleToggleFollow(user)}
            className={`w-full py-2.5 px-4 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              isFollowing
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200/80'
                : 'bg-[#0057FF] hover:bg-[#0046CC] text-white shadow-md shadow-[#0057FF]/20'
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>已关注</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>+ 关注创作者</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  const displayUsers = filterList(searchPerformed ? searchResults : recommendedUsers);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-neutral-50/70 text-neutral-900 pb-24 font-sans selection:bg-[#0057FF] selection:text-white"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-6 sm:pt-8 space-y-8">
        {/* Banner Hero Card */}
        <div className="relative bg-gradient-to-r from-neutral-900 via-blue-950 to-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 overflow-hidden shadow-xl text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#0057FF_0,transparent_55%)] opacity-50" />
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 rounded-full text-xs font-bold">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>发现与拓展人脉</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              探索灵感伙伴与优质创作者
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              汇聚极客、设计师、独立开发者与内容创作者，关注你喜爱的灵感之源，共建属于你的创意圈子。
            </p>
          </div>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="搜索创作者昵称、用户名或绑定邮箱..."
                className="w-full pl-11 pr-10 py-3 bg-neutral-50/80 border border-neutral-200 focus:border-[#0057FF] focus:bg-white rounded-2xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-3 bg-[#0057FF] hover:bg-[#0046CC] text-white font-extrabold rounded-2xl text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#0057FF]/20 shrink-0"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>立即查找</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-[11px] font-bold">快速筛选：</span>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80'
                }`}
              >
                全部展示
              </button>
              <button
                onClick={() => setActiveFilter('popular')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilter === 'popular'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                热门高粉
              </button>
              <button
                onClick={() => setActiveFilter('verified')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilter === 'verified'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                认证创作者
              </button>
            </div>

            <span className="text-neutral-400 text-[11px] font-mono font-medium">
              共计显示 {displayUsers.length} 位用户
            </span>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {searchPerformed ? (
              <>
                <Search className="w-5 h-5 text-[#0057FF]" />
                <h2 className="text-lg font-black text-neutral-900">搜索结果列表</h2>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-[#0057FF]" />
                <h2 className="text-lg font-black text-neutral-900">精选推荐创作者</h2>
              </>
            )}
          </div>

          {searchPerformed && (
            <button
              onClick={handleClearSearch}
              className="text-xs text-neutral-500 hover:text-[#0057FF] underline cursor-pointer font-bold"
            >
              返回推荐列表
            </button>
          )}
        </div>

        {/* Users Grid / Loading / Empty */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-neutral-200/80 shadow-xs">
              <div className="w-10 h-10 border-3 border-[#0057FF] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-neutral-500 font-mono">正在检索全站创作者数据...</p>
            </div>
          ) : displayUsers.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-neutral-200/80 p-8 space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-neutral-900">未找到匹配的创作者</p>
                <p className="text-xs text-neutral-500">请尝试使用不同的关键字或减少筛选约束</p>
              </div>
              {searchPerformed && (
                <button
                  onClick={handleClearSearch}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  重置搜索关键词
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayUsers.map((user, idx) => (
                <UserCard key={user.id} user={user} index={idx} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
