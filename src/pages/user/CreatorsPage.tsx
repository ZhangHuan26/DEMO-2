import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, UserPlus, Users, Sparkles } from 'lucide-react';
import { authApi } from '../../api/auth';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { openAuthorModal } from '../../components/common/AuthorProfileModal';

export const CreatorsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [creators, setCreators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      try {
        const list = await authApi.getRecommendedCreators();
        setCreators(list);
      } catch (err) {
        console.error('Failed to fetch creators:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

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

  return (
    <div className="w-full px-[20px] py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#0057FF]" />
            推荐创作者榜单
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            发现设计界、艺术领域的杰出创作者，关注他们获取灵感
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto" />
              <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto" />
              <div className="h-3 bg-neutral-200 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl p-8 space-y-3">
          <Users className="w-12 h-12 text-neutral-400 mx-auto" />
          <p className="text-neutral-600 font-medium">暂无推荐创作者</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {creators.map((creator) => (
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
                    src={creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
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
  );
};
