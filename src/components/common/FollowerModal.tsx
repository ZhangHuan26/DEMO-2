import React, { useState, useEffect } from 'react';
import { X, UserMinus, MessageSquare } from 'lucide-react';
import { User } from '../../types';
import { authApi } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { showToast } from './Toast';

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
  const [chatTargetUser, setChatTargetUser] = useState<User | null>(null);

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

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const handleUnfollow = async (u: User) => {
    if (!confirm(`确定要取消关注 ${u.nickName} 吗？`)) return;
    try {
      await authApi.unfollowUser(u.id);
      // 从列表中移除该用户
      setUsers(prev => prev.filter(item => item.id !== u.id));
    } catch {
      showToast({ message: '取消关注失败，请稍后重试', type: 'error' });
    }
  };

  const handleOpenChat = (u: User) => {
    // 关闭当前弹窗
    onClose();
    
    // 延迟一点，确保弹窗关闭后再打开聊天
    setTimeout(() => {
      // 触发UserShell中的聊天抽屉打开
      window.dispatchEvent(new CustomEvent('open-chat-with-user', { 
        detail: { user: u } 
      }));
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* 头部 */}
        <div className="relative p-6 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 p-2 rounded-full hover:bg-neutral-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-neutral-900 mb-4">社交关系</h2>

          {/* Tabs */}
          <div className="flex border-b border-neutral-200">
            <button
              onClick={() => setTab('followers')}
              className={`pb-3 px-6 font-bold text-sm transition-all border-b-2 ${
                tab === 'followers' 
                  ? 'border-[#0057FF] text-[#0057FF]' 
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              粉丝列表
            </button>
            <button
              onClick={() => setTab('following')}
              className={`pb-3 px-6 font-bold text-sm transition-all border-b-2 ${
                tab === 'following' 
                  ? 'border-[#0057FF] text-[#0057FF]' 
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              关注列表
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-20 text-center text-neutral-500 text-sm">
              <div className="w-8 h-8 border-3 border-[#0057FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              正在加载...
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center text-neutral-500 text-sm">
              <div className="text-5xl mb-3">👥</div>
              暂无{tab === 'followers' ? '粉丝' : '关注的用户'}
            </div>
          ) : (
            users.map((u) => (
              <div 
                key={u.id} 
                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all"
              >
                <div
                  onClick={() => {
                    onClose();
                    navigate(`/users/${u.id}`);
                  }}
                  className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                >
                  <img 
                    src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} 
                    alt={u.nickName} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-neutral-200 group-hover:border-[#0057FF] transition-colors shrink-0" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors truncate">
                      {u.nickName}
                    </div>
                    <div className="text-xs text-neutral-500 line-clamp-1">{u.signature || '这位用户很神秘~'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {/* 私信按钮 */}
                  <button
                    onClick={() => handleOpenChat(u)}
                    className="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer group"
                    title="发送私信"
                  >
                    <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>

                  {/* 取消关注按钮 - 仅在关注列表中显示 */}
                  {tab === 'following' && (
                    <button
                      onClick={() => handleUnfollow(u)}
                      className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all bg-neutral-100 text-neutral-600 hover:bg-rose-50 hover:text-rose-600 border border-neutral-200 hover:border-rose-300 cursor-pointer"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      取消关注
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
