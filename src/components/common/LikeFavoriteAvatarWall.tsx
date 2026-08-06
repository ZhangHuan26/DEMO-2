import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, Star, Users } from 'lucide-react';
import { User } from '../../types';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { resolveImageUrl } from '../../config/env';
import { openAuthorModal } from './AuthorProfileModal';

interface InteractorUser {
  id: number;
  nickName: string;
  avatar?: string;
  signature?: string;
  actionType: 'like' | 'favorite' | 'both';
}

interface LikeFavoriteAvatarWallProps {
  contentId: number;
  contentType: 'article' | 'video' | 'file';
  likeCount?: number;
  favoriteCount?: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  currentUser?: User | null;
  workTitle?: string;
}

export const LikeFavoriteAvatarWall: React.FC<LikeFavoriteAvatarWallProps> = ({
  contentId,
  contentType,
  likeCount = 0,
  favoriteCount = 0,
  isLiked = false,
  isFavorited = false,
  currentUser,
  workTitle
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'like' | 'favorite'>('all');
  const [likeUsers, setLikeUsers] = useState<User[]>([]);
  const [favoriteUsers, setFavoriteUsers] = useState<User[]>([]);
  const [duplicateUsers, setDuplicateUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // 通过真实的 API 接口获取点赞/收藏用户列表
  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        let likesPromise, favoritesPromise, duplicatesPromise;
        
        // 根据内容类型调用不同的 API
        if (contentType === 'article') {
          likesPromise = articlesApi.getArticleLikes(contentId);
          favoritesPromise = articlesApi.getArticleFavorites(contentId);
          duplicatesPromise = articlesApi.getArticleDuplicates(contentId);
        } else if (contentType === 'video') {
          likesPromise = videosApi.getVideoLikes(contentId);
          favoritesPromise = videosApi.getVideoFavorites(contentId);
          duplicatesPromise = videosApi.getVideoDuplicates(contentId);
        } else {
          likesPromise = filesApi.getFileLikes(contentId);
          favoritesPromise = filesApi.getFileFavorites(contentId);
          duplicatesPromise = filesApi.getFileDuplicates(contentId);
        }

        const [likes, favorites, duplicates] = await Promise.all([
          likesPromise,
          favoritesPromise,
          duplicatesPromise
        ]);

        if (isMounted) {
          setLikeUsers(Array.isArray(likes) ? likes : []);
          setFavoriteUsers(Array.isArray(favorites) ? favorites : []);
          setDuplicateUsers(Array.isArray(duplicates) ? duplicates : []);
        }
      } catch (error) {
        console.error('[LikeFavoriteAvatarWall] 获取用户列表失败:', error);
        if (isMounted) {
          setLikeUsers([]);
          setFavoriteUsers([]);
          setDuplicateUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchUsers();
    return () => { isMounted = false; };
  }, [contentId, contentType]);

  // 构建互动人员列表
  const interactors: InteractorUser[] = [];

  // 1. 如果当前登录用户已点赞或已收藏，优先置于交互墙首位
  if (currentUser && (isLiked || isFavorited)) {
    interactors.push({
      id: currentUser.id,
      nickName: currentUser.nickName || '我',
      avatar: currentUser.avatar,
      signature: currentUser.signature || '创作爱好者',
      actionType: isLiked && isFavorited ? 'both' : isLiked ? 'like' : 'favorite',
    });
  }

  // 2. 添加既点赞又收藏的用户
  duplicateUsers.forEach((u) => {
    if (currentUser && u.id === currentUser.id) return; // 避免重复
    interactors.push({
      id: u.id,
      nickName: u.nickName || `用户_${u.id}`,
      avatar: u.avatar,
      signature: u.signature || '',
      actionType: 'both'
    });
  });

  // 3. 添加只点赞的用户
  likeUsers.forEach((u) => {
    if (currentUser && u.id === currentUser.id) return;
    if (duplicateUsers.some(d => d.id === u.id)) return; // 避免重复
    interactors.push({
      id: u.id,
      nickName: u.nickName || `用户_${u.id}`,
      avatar: u.avatar,
      signature: u.signature || '',
      actionType: 'like'
    });
  });

  // 4. 添加只收藏的用户
  favoriteUsers.forEach((u) => {
    if (currentUser && u.id === currentUser.id) return;
    if (duplicateUsers.some(d => d.id === u.id)) return; // 避免重复
    interactors.push({
      id: u.id,
      nickName: u.nickName || `用户_${u.id}`,
      avatar: u.avatar,
      signature: u.signature || '',
      actionType: 'favorite'
    });
  });

  // 根据当前 Filter 选项卡筛选
  const filteredInteractors = interactors.filter(item => {
    if (activeTab === 'like') return item.actionType === 'like' || item.actionType === 'both';
    if (activeTab === 'favorite') return item.actionType === 'favorite' || item.actionType === 'both';
    return true;
  });

  const displayLikeCount = Math.max(likeCount, likeUsers.length);
  const displayFavoriteCount = Math.max(favoriteCount, favoriteUsers.length);

  // 如果没有任何互动，不显示头像墙
  if (!loading && interactors.length === 0) {
    return null;
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5 shadow-xl text-white">
      {/* 头部标题与 Tab 切换 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0057FF]/20 text-[#0057FF] flex items-center justify-center font-bold border border-[#0057FF]/30">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              点赞与收藏创作者墙
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono">
                {displayLikeCount + displayFavoriteCount} 人参与互动
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              为该作品提供欣赏赞赏与收藏保存的创作者社群墙
            </p>
          </div>
        </div>

        {/* Tab 控制器 */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            全部 ({displayLikeCount + displayFavoriteCount})
          </button>
          <button
            onClick={() => setActiveTab('like')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'like'
                ? 'bg-[#0057FF] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5 fill-current" />
            <span>赞赏 ({displayLikeCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('favorite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'favorite'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>收藏 ({displayFavoriteCount})</span>
          </button>
        </div>
      </div>

      {/* 头像墙展示区 */}
      {loading ? (
        <div className="flex items-center gap-2 py-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 items-center pt-1">
          {filteredInteractors.length === 0 ? (
            <p className="text-sm text-neutral-400">暂无互动用户</p>
          ) : (
            filteredInteractors.map((person) => {
              const isSelf = currentUser && person.id === currentUser.id;
              const userAvatar = resolveImageUrl(person.avatar);
              return (
                <button
                  key={`wall-user-${person.id}`}
                  onClick={() => openAuthorModal(person.id)}
                  className="relative group shrink-0 cursor-pointer"
                  title={`${person.nickName}${person.signature ? ` - ${person.signature}` : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full overflow-hidden border transition-all group-hover:scale-110 relative shadow-xs ${
                    isSelf
                      ? 'border-[#0057FF] ring-2 ring-[#0057FF]/30'
                      : 'border-neutral-700 group-hover:border-[#0057FF]'
                  }`}>
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={person.nickName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center font-bold text-neutral-300 text-xs">
                        {(person.nickName || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* 右下角 Action 标识 Badge */}
                  <span className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full text-white shadow-xs border border-neutral-900 ${
                    person.actionType === 'both'
                      ? 'bg-gradient-to-r from-[#0057FF] to-amber-500'
                      : person.actionType === 'like'
                      ? 'bg-[#0057FF]'
                      : 'bg-amber-500'
                  }`}>
                    {person.actionType === 'favorite' ? (
                      <Star className="w-2 h-2 fill-current" />
                    ) : (
                      <ThumbsUp className="w-2 h-2 fill-current" />
                    )}
                  </span>

                  {/* Hover Tooltip Float Window */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 border border-neutral-800 text-white rounded-xl text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50 flex flex-col items-center">
                    <span className="font-bold text-white flex items-center gap-1">
                      {person.nickName}
                      {isSelf && <span className="text-[10px] text-[#0057FF] font-mono">(我)</span>}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">
                      {person.actionType === 'both' ? '❤️ 赞赏并 ⭐ 收藏了作品' : person.actionType === 'like' ? '❤️ 赞赏了作品' : '⭐ 收藏了作品'}
                    </span>
                    <div className="w-2 h-2 bg-neutral-900 border-r border-b border-neutral-800 rotate-45 -mb-3 mt-1" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
