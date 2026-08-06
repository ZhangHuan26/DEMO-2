import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../config/env';


export const CreatorsPage: React.FC = () => {
  const { user } = useAuth();
  const [creators, setCreators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCreators = async () => {
      setLoading(true);
      try {
        const list = await authApi.getRecommendedCreators();
        // GET /users/recommend 登录态下返回的 UserBriefVO 已含 isFollowing 字段，
        // 无需再逐个发起 getFollowStatus 查询（该接口不存在，会 404）
        const base = Array.isArray(list) ? list : [];
        setCreators(base);
      } catch {
        setCreators([]);
      } finally {
        setLoading(false);
      }
    };
    loadCreators();
  }, [user]);


  const handleToggleFollow = async (c: User) => {
    try {
      if (c.isFollowing) {
        await authApi.unfollowUser(c.id);
        setCreators(prev => prev.map(u => u.id === c.id ? { ...u, isFollowing: false, followerCount: Math.max(0, u.followerCount - 1) } : u));
      } else {
        await authApi.followUser(c.id);
        setCreators(prev => prev.map(u => u.id === c.id ? { ...u, isFollowing: true, followerCount: u.followerCount + 1 } : u));
      }
    } catch (err: any) {
      // 关注失败时给出提示，避免静默失败
      const msg = err?.response?.data?.message || err?.message || '操作失败，请稍后重试';
      alert(msg);
    }
  };

  return (
    <div className="max-w-[1700px] mx-auto px-4 lg:px-10 py-8 space-y-6">
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-4">
        <Sparkles className="w-5 h-5 text-[#0057FF]" />
        <h1 className="text-lg font-bold text-neutral-900">推荐创作者榜单</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-60 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {creators.map((c, idx) => (
            <div key={`creator-${c.id ?? idx}-${idx}`} className="bg-white border border-neutral-200 rounded-2xl p-6 text-center space-y-4 hover:border-neutral-300 hover:shadow-xl transition-all">
              <Link to={`/users/${c.id}`}>
                {c.avatar ? (
                  <img src={resolveImageUrl(c.avatar)} alt={c.nickName} className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-[#0057FF]" />
                ) : (

                  <div className="w-20 h-20 rounded-full mx-auto border-2 border-[#0057FF] bg-[#0057FF]/10 flex items-center justify-center text-[#0057FF] font-bold text-xl">
                    {(c.nickName || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <div>
                <Link to={`/users/${c.id}`} className="font-bold text-neutral-900 text-sm hover:text-[#0057FF] transition-colors">{c.nickName}</Link>
                <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{c.signature || '数字艺术家与资深设计师'}</p>
              </div>

              <div className="flex justify-center gap-4 text-xs font-mono text-neutral-600 py-2 border-y border-neutral-200">
                <div><span className="font-bold text-neutral-900 block">{Number(c.followerCount) || 0}</span> 粉丝数</div>
                <div><span className="font-bold text-neutral-900 block">{Number(c.workCount) || 12}</span> 作品数</div>
              </div>

              <button
                onClick={() => handleToggleFollow(c)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  c.isFollowing ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' : 'bg-[#0057FF] hover:bg-[#0046CC] text-white shadow-lg shadow-[#0057FF]/30'
                }`}
              >
                {c.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {c.isFollowing ? '已关注' : '关注创作者'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
