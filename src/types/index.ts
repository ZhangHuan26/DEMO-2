export type Role = 0 | 1; // 0 = Normal User, 1 = Admin
export type UserStatus = 0 | 1; // 0 = Normal, 1 = Frozen

export interface User {
  id: number;
  email: string;
  phone?: string;
  nickName: string;
  avatar: string;
  role: Role;
  status: UserStatus;
  frozenReason?: string;
  frozenAt?: string;
  gender: number; // 0: Secret, 1: Male, 2: Female
  birthday?: string;
  signature?: string;
  followerCount: number;
  followingCount: number;
  workCount?: number;
  createdAt?: string;
  isFollowing?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  coverImage?: string;
  count?: number;
  type?: 'article' | 'video' | 'file';
  sortOrder?: number;
}

export interface AllCategoriesResponse {
  articleCategories: Category[];
  videoCategories: Category[];
  fileCategories: Category[];
}

export interface Article {
  id: number;
  userId: number;
  author?: User;
  title: string;
  summary?: string;
  content: string; // Markdown or Rich Text
  coverImage: string;
  categoryId: number;
  categoryName?: string;
  status: number; // 0: Public, 1: Private
  isHidden: number; // 0: Normal, 1: Hidden by Admin
  allowDownload?: number; // 0: Forbidden, 1: Allowed
  isPinned?: number; // 0: Normal, 1: Pinned
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Video {
  id: number;
  userId: number;
  author?: User;
  title: string;
  description?: string;
  videoUrl: string;
  coverImage: string;
  duration: string; // e.g., "04:35"
  categoryId: number;
  categoryName?: string;
  status: number; // 0: Public, 1: Private
  isHidden: number; // 0: Normal, 1: Hidden
  allowDownload: number; // 0: Forbidden, 1: Allowed
  isPinned?: number; // 0: Normal, 1: Pinned
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt: string;
}

export interface FileItem {
  id: number;
  userId: number;
  author?: User;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: string; // e.g. "12.4 MB"
  fileType: string; // e.g. "zip", "pdf", "psd"
  coverImage: string;
  categoryId: number;
  categoryName?: string;
  status: number; // 0: Public, 1: Private
  isHidden: number; // 0: Normal, 1: Hidden
  allowDownload: number; // 0: Forbidden, 1: Allowed
  isPinned?: number; // 0: Normal, 1: Pinned
  downloadCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt: string;
}

export interface Comment {
  id: number;
  targetId: number; // articleId, videoId, or fileId
  userId: number;
  author?: User;
  content: string;
  rootId?: number; // Primary comment floor ID
  replyToId?: number;
  replyToUser?: User;
  likeCount: number;
  isLiked?: boolean;
  isHidden: number; // 0: Normal, 1: Hidden
  createdAt: string;
  children?: Comment[];
}

export interface Notification {
  id: number;
  userId: number;
  type: 'like' | 'favorite' | 'comment' | 'follow' | 'system' | 'report';
  title: string;
  content: string;
  isRead: number; // 0: Unread, 1: Read
  targetType?: string;
  targetId?: number;
  sender?: User;
  createdAt: string;
}

export interface Report {
  id: number;
  reporterId: number;
  reporter?: User;
  targetType: number; // 0: Article, 1: Video, 2: File, 3: ArticleComment, 4: VideoComment, 5: FileComment, 6: User
  targetId: number;
  targetUser?: User;
  reason: string;
  evidenceImages?: string[];
  status: number; // 0: Pending, 1: Processed (Violation), 2: Dismissed
  handleResult?: string;
  createdAt: string;
  handledAt?: string;
}

export interface Appeal {
  id: number;
  userId: number;
  user?: User;
  targetType: number; // 0: Account Freeze, 1: Article, 2: Video, 3: File, 4: ArticleComment, 5: VideoComment, 6: FileComment
  targetId: number;
  freezeLogId?: number;
  moderationLogId?: number;
  reason: string;
  status: number; // 0: Pending, 1: Approved, 2: Rejected
  reply?: string;
  handleResult?: string;
  createdAt: string;
  handledAt?: string;
}

export interface FreezeLog {
  id: number;
  userId: number;
  user?: User;
  adminId: number;
  reason: string;
  reportId?: number;
  createdAt: string;
}

export interface ModerationLog {
  id: number;
  adminId: number;
  adminName?: string;
  targetType: 'article' | 'video' | 'file' | 'comment';
  targetId: number;
  action: 'hide' | 'unhide' | 'allow_download' | 'disallow_download';
  reason: string;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: number;
  createdAt: string;
}

export interface Conversation {
  peerUser: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface CreatorStats {
  totalViews: number;
  totalLikes: number;
  totalFavorites: number;
  totalFollowers: number;
  followerGrowth: { date: string; count: number }[];
  contentDistribution: { category: string; count: number }[];
  likesSnapshot: { date: string; likes: number; favorites: number }[];
}

export interface SystemSettings {
  siteName: string;
  openRegistration: boolean;
  maxFileUploadSizeMb: number;
  allowPublicComments: boolean;
  announcement?: string;
}
