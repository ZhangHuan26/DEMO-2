import { Comment, User } from '../types';

export const normalizeComment = (raw: any): Comment => {
  if (!raw || typeof raw !== 'object') {
    return {
      id: Math.floor(Math.random() * 100000),
      targetId: 0,
      userId: 0,
      content: '',
      likeCount: 0,
      isHidden: 0,
      createdAt: new Date().toISOString()
    };
  }

  // Handle case where raw itself is wrapped in { code: 200, data: ... }
  const obj = (raw.code !== undefined && raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data))
    ? raw.data
    : raw;

  const rawUser = obj.author || obj.user || obj.commenter;
  const userObj: User | undefined = rawUser ? {
    id: rawUser.id ?? obj.userId ?? 0,
    email: rawUser.email ?? '',
    nickName: rawUser.nickName || rawUser.username || rawUser.name || '创作者',
    avatar: rawUser.avatar || '',
    role: rawUser.role ?? 0,
    status: rawUser.status ?? 0,
    gender: rawUser.gender ?? 0,
    followerCount: rawUser.followerCount ?? 0,
    followingCount: rawUser.followingCount ?? 0,
    signature: rawUser.signature ?? ''
  } : undefined;

  const rawChildren = Array.isArray(obj.children)
    ? obj.children
    : (Array.isArray(obj.replies) ? obj.replies : []);

  const rawReplyToUser = obj.replyToUser || obj.replyTo;
  const replyToUserObj: User | undefined = rawReplyToUser ? {
    id: rawReplyToUser.id ?? 0,
    email: rawReplyToUser.email ?? '',
    nickName: rawReplyToUser.nickName || rawReplyToUser.username || '创作者',
    avatar: rawReplyToUser.avatar || '',
    role: rawReplyToUser.role ?? 0,
    status: rawReplyToUser.status ?? 0,
    gender: rawReplyToUser.gender ?? 0,
    followerCount: rawReplyToUser.followerCount ?? 0,
    followingCount: rawReplyToUser.followingCount ?? 0
  } : undefined;

  return {
    id: obj.id ?? Math.floor(Math.random() * 100000),
    targetId: obj.articleId || obj.videoId || obj.fileId || obj.targetId || 0,
    userId: obj.userId || userObj?.id || 0,
    author: userObj,
    content: obj.content || obj.text || obj.comment || '',
    rootId: obj.rootId,
    replyToId: obj.replyToId || obj.parentId,
    replyToUser: replyToUserObj,
    likeCount: obj.likeCount || 0,
    isLiked: !!obj.isLiked,
    isHidden: obj.isHidden || 0,
    createdAt: obj.createdAt || obj.createTime || new Date().toISOString(),
    children: rawChildren.map(normalizeComment)
  };
};
