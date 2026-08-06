import React, { useState, useEffect } from 'react';
import { Search, UserPlus, UserCheck, Users, TrendingUp } from 'lucide-react';
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

  // 加载推荐创作者
  useEffect(() => {
    const loadRecommended = async () => {
      try {
        const users = await authApi.getRecommendedCreators();
        setRecommendedUsers(users);
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
      setSearchResults(results.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 关注/取消关注用户
  const handleToggleFollow = async (user: User) => {
    try {
      if (user.isFollowing) {
        await authApi.unfollowUser(user.id);
        // 更新列表中的关注状态
        setSearchResults(prev => prev.map(u => 
          u.id === user.id ? { ...u, isFollowing: false, followerCount: Math.max(0, (u.followerCount || 0) - 1) } : u
        ));
        setRecommendedUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, isFollowing: false, followerCount: Math.max(0, (u.followerCount || 0) - 1) } : u
        ));
      } else {
        await authApi.followUser(user.id);
        // 更新列表中的关注状态
        setSearchResults(prev => prev.map(u => 
          u.id === user.id ? { ...u, isFollowing: true, followerCount: (u.followerCount || 0) + 1 } : u
        ));
        setRecommendedUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, isFollowing: true, followerCount: (u.followerCount || 0) + 1 } : u
        ));
      }
    } catch (error) {
      console.error('关注操作失败:', error);
    }
  };

  // 渲染用户卡片
  const UserCard: React.FC<{ user: User }> = ({ user }) => (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 hover:shadow-xl transition-all">
      <div className="flex items-start gap-4">
        <div
          onClick={() => navigate(`/users/${user.id}`)}
          className="cursor-pointer shrink-0"
        >
          <img
            src={resolveImageUrl(user.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
            alt={user.nickName}
            className="w-16 h-16 rounded-full object-cover border-2 border-neutral-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div
            onClick={() => navigate(`/users/${user.id}`)}
            className="cursor-pointer"
          >
            <h3 className="text-base font-bold text-neutral-900 hover:text-[#0057FF] transition-colors truncate">
              {user.nickName}
            </h3>
            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
              {user.signature || '这位创作者很神秘，还没有个性签名~'}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-neutral-600">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {user.followerCount || 0} 粉丝
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {(user.worksCount || user.articleCount || 0) + (user.videoCount || 0) + (user.fileCount || 0)} 作品
            </span>
          </div>

          <button
            onClick={() => handleToggleFollow(user)}
            className={`mt-3 w-full py-2 px-4 font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              user.isFollowing
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
                : 'bg-[#0057FF] hover:bg-[#0046CC] text-white shadow-[#0057FF]/25'
            }`}
          >
            {user.isFollowing ? (
              <>
                <UserCheck className="w-4 h-4" />
                已关注
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                + 关注
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mb-2">
            发现好友
          </h1>
          <p className="text-sm text-neutral-500">
            搜索并关注你感兴趣的创作者，探索更多精彩内容
          </p>
        </div>

        {/* 搜索框 */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索用户昵称、邮箱或用户名..."
                className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/30 focus:border-[#0057FF] transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-3 bg-[#0057FF] hover:bg-[#0046CC] text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-md shadow-[#0057FF]/20"
            >
              <Search className="w-4 h-4" />
              搜索
            </button>
          </div>
        </div>

        {/* 搜索结果 */}
        {searchPerformed && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-[#0057FF]" />
                搜索结果
              </h2>
              <span className="text-sm text-neutral-500">
                找到 {searchResults.length} 位用户
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-3 border-[#0057FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span className="text-xs text-neutral-500">搜索中...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-neutral-200">
                <p className="text-sm text-neutral-500">未找到匹配的用户</p>
                <p className="text-xs text-neutral-400 mt-2">试试其他关键词吧</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 推荐创作者 */}
        {!searchPerformed && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0057FF]" />
                推荐创作者
              </h2>
              <span className="text-sm text-neutral-500">
                为你精选 {recommendedUsers.length} 位优质创作者
              </span>
            </div>

            {recommendedUsers.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-neutral-200">
                <p className="text-sm text-neutral-500">暂无推荐创作者</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommendedUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
