import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck } from 'lucide-react';
import { User } from '../../types';
import { authApi } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

interface FollowerModalProps {
  isOpen: boolean;
  userId: number;
  initialTab?: 'followers' | 'following';
  onClose: () => void;
}

export const FollowerModal: React.FC<FollowerModalProps> = ({
  isOpen,
  userId,
  initialTab = 'followers',
  onClose,
}) => {
  const [tab, setTab] = useState<'followers' | 'following'>(initialTab);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const loadList = async () => {
      setLoading(true);
      try {
        if (tab === 'followers') {
          const list = await authApi.getFollowers(userId);
          setUsers(list);
        } else {
          const list = await authApi.getFollowing(userId);
          setUsers(list);
        }
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadList();
  }, [isOpen, userId, tab]);

  if (!isOpen) return null;

  const handleToggleFollow = async (u: User) => {
    try {
      if (u.isFollowing) {
        await authApi.unfollowUser(u.id);
        setUsers(prev => prev.map(item => item.id === u.id ? { ...item, isFollowing: false } : item));
      } else {
        await authApi.followUser(u.id);
        setUsers(prev => prev.map(item => item.id === u.id ? { ...item, isFollowing: true } : item));
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative shadow-2xl flex flex-col max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 mb-4">
          <button
            onClick={() => setTab('followers')}
            className={`pb-3 px-4 font-semibold text-xs transition-colors border-b-2 ${
              tab === 'followers' ? 'border-[#0057FF] text-[#0057FF]' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            粉丝列表
          </button>
          <button
            onClick={() => setTab('following')}
            className={`pb-3 px-4 font-semibold text-xs transition-colors border-b-2 ${
              tab === 'following' ? 'border-[#0057FF] text-[#0057FF]' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            关注列表
          </button>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-neutral-500 text-xs">正在加载创作者列表...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">暂无符合条件的成员</div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-colors">
                <div
                  onClick={() => {
                    onClose();
                    navigate(`/users/${u.id}`);
                  }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img src={u.avatar} alt={u.nickName} className="w-10 h-10 rounded-full object-cover border border-neutral-800" />
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#0057FF] transition-colors">{u.nickName}</div>
                    <div className="text-[10px] text-neutral-500 line-clamp-1">{u.signature || '社区创作者'}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFollow(u)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                    u.isFollowing
                      ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-[#0057FF] text-white hover:bg-[#0046CC]'
                  }`}
                >
                  {u.isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" /> 已关注
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" /> 关注
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
