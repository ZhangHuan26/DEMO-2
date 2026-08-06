import { Article, Video, FileItem, User, Comment, Category, Notification, Report, Appeal, Message, Conversation, CreatorStats, SystemSettings, FreezeLog, ModerationLog } from '../types';
import { PRESET_AVATARS, PRESET_IMAGES } from '../config/presets';

export const mockUsers: User[] = [
  {
    id: 1,
    email: 'creator@leaplunar.com',
    nickName: 'LunarStudio',
    avatar: PRESET_AVATARS[0],
    role: 0,
    status: 0,
    gender: 1,
    signature: 'Behance UI/UX Specialist & Motion Designer',
    followerCount: 1240,
    followingCount: 88,
    workCount: 18,
    createdAt: '2026-01-10T10:00:00Z',
    isFollowing: false,
  },
  {
    id: 2,
    email: 'admin@leaplunar.com',
    nickName: 'SystemAdmin',
    avatar: PRESET_AVATARS[1],
    role: 1,
    status: 0,
    gender: 2,
    signature: 'LeapLunar04 Chief Security & Moderation Admin',
    followerCount: 9800,
    followingCount: 12,
    workCount: 5,
    createdAt: '2026-01-01T08:00:00Z',
    isFollowing: true,
  },
  {
    id: 3,
    email: 'artisan@leaplunar.com',
    nickName: 'CyberArtisan',
    avatar: PRESET_AVATARS[2],
    role: 0,
    status: 0,
    gender: 0,
    signature: 'Generative AI Artist & 3D Environment Specialist',
    followerCount: 3410,
    followingCount: 230,
    workCount: 32,
    createdAt: '2026-02-15T12:30:00Z',
    isFollowing: false,
  },
];

export const mockCategories: Category[] = [
  { id: 1, name: 'UI/UX Design', type: 'article', count: 42, coverImage: PRESET_IMAGES[0] },
  { id: 2, name: '3D Art & CGI', type: 'article', count: 28, coverImage: PRESET_IMAGES[1] },
  { id: 3, name: 'Motion & Animation', type: 'video', count: 19, coverImage: PRESET_IMAGES[2] },
  { id: 4, name: 'Branding & Identity', type: 'article', count: 35, coverImage: PRESET_IMAGES[3] },
  { id: 5, name: 'Design Assets & PSD', type: 'file', count: 50, coverImage: PRESET_IMAGES[4] },
  { id: 6, name: 'Code & Web Apps', type: 'file', count: 24, coverImage: PRESET_IMAGES[5] },
];

export const mockArticles: Article[] = [
  {
    id: 101,
    userId: 1,
    author: mockUsers[0],
    title: 'Neon Horizon: Next-Gen Futuristic Interface Exploration',
    summary: 'A deep dive into high-contrast dark mode aesthetics, spatial grid layouts, and micro-interactions designed for immersive desktop applications.',
    content: `# Neon Horizon Design System

Welcome to the **Neon Horizon** project documentation. In this study, we explored how high-density dark canvas interfaces can maintain high readability while delivering immersive futuristic visuals.

## Key Design Principles

1. **High Contrast Typography**: Utilizing crisp white headings with subtle neutral grays for body copy.
2. **Precision Grid**: 8px spatial grid system for consistent margins and padding.
3. **Subtle Glassmorphism**: Controlled blur backdrops without distracting glows.

![Neon Horizon Design Concept](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop)

### Color Palette Matrix

* Primary Dark: \`#050505\`
* Accent Blue: \`#0057FF\`
* Neutral Border: \`#262626\`

> "Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs

Thank you for reviewing this work. Feel free to leave your thoughts in the discussion section below!`,
    coverImage: PRESET_IMAGES[0],
    categoryId: 1,
    categoryName: 'UI/UX Design',
    status: 0,
    isHidden: 0,
    viewCount: 4280,
    likeCount: 312,
    favoriteCount: 154,
    commentCount: 18,
    isLiked: true,
    isFavorited: false,
    createdAt: '2026-08-01T14:20:00Z',
  },
  {
    id: 102,
    userId: 3,
    author: mockUsers[2],
    title: 'Cyberpunk Cybernetics 3D Character Rendering',
    summary: 'Procedural texturing and volumetric lighting showcase in Blender 4.2 & Octane Render.',
    content: `# Cyberpunk Cybernetics 3D Rendering

Exploring hard-surface mechanical sculpting and subsurface scattering materials in Octane Render.

![3D Art](https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop)

Created entirely with Octane Render and Substance Painter.`,
    coverImage: PRESET_IMAGES[1],
    categoryId: 2,
    categoryName: '3D Art & CGI',
    status: 0,
    isHidden: 0,
    viewCount: 2940,
    likeCount: 215,
    favoriteCount: 98,
    commentCount: 9,
    isLiked: false,
    isFavorited: true,
    createdAt: '2026-08-03T09:15:00Z',
  },
];

export const mockVideos: Video[] = [
  {
    id: 201,
    userId: 1,
    author: mockUsers[0],
    title: 'Lunar Motion Graphics Showreel 2026',
    description: 'A 60 FPS compilation of keyframe animations, 3D particle simulations, and dynamic typography created for international brands.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    coverImage: PRESET_IMAGES[2],
    duration: '04:35',
    categoryId: 3,
    categoryName: 'Motion & Animation',
    status: 0,
    isHidden: 0,
    allowDownload: 1,
    viewCount: 8900,
    likeCount: 740,
    favoriteCount: 320,
    commentCount: 24,
    isLiked: true,
    isFavorited: true,
    createdAt: '2026-07-28T16:00:00Z',
  }
];

export const mockFiles: FileItem[] = [
  {
    id: 301,
    userId: 3,
    author: mockUsers[2],
    title: 'Behance UI Kit & Design Token Package v2.4',
    description: 'Complete Figma & PSD source file package containing over 120 vector UI components, auto-layout cards, and typography tokens.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Behance_UI_Kit_2026.zip',
    fileSize: '45.2 MB',
    fileType: 'zip',
    coverImage: PRESET_IMAGES[4],
    categoryId: 5,
    categoryName: 'Design Assets & PSD',
    status: 0,
    isHidden: 0,
    allowDownload: 1,
    downloadCount: 1420,
    likeCount: 512,
    favoriteCount: 380,
    commentCount: 14,
    isLiked: false,
    isFavorited: true,
    createdAt: '2026-07-20T11:45:00Z',
  }
];

export const mockComments: Comment[] = [
  {
    id: 501,
    targetId: 101,
    userId: 3,
    author: mockUsers[2],
    content: 'Stunning visual layout! The typography hierarchy and spatial proportions match Behance standards impeccably.',
    likeCount: 14,
    isLiked: true,
    isHidden: 0,
    createdAt: '2026-08-02T10:11:00Z',
    children: [
      {
        id: 502,
        targetId: 101,
        userId: 1,
        author: mockUsers[0],
        content: 'Thank you! Glad you liked the contrast balance.',
        rootId: 501,
        replyToId: 501,
        replyToUser: mockUsers[2],
        likeCount: 5,
        isLiked: false,
        isHidden: 0,
        createdAt: '2026-08-02T11:00:00Z'
      }
    ]
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 701,
    userId: 1,
    type: 'like',
    title: 'New Like received',
    content: 'CyberArtisan appreciated your article "Neon Horizon: Next-Gen Futuristic Interface Exploration"',
    isRead: 0,
    sender: mockUsers[2],
    createdAt: '2026-08-04T18:20:00Z'
  },
  {
    id: 702,
    userId: 1,
    type: 'follow',
    title: 'New Follower',
    content: 'SystemAdmin started following you.',
    isRead: 0,
    sender: mockUsers[1],
    createdAt: '2026-08-04T12:00:00Z'
  }
];

export const mockReports: Report[] = [
  {
    id: 801,
    reporterId: 3,
    reporter: mockUsers[2],
    targetType: 0, // Article
    targetId: 101,
    reason: 'Inappropriate material or copyright infringement concern.',
    status: 0, // Pending
    createdAt: '2026-08-04T09:00:00Z'
  }
];

export const mockAppeals: Appeal[] = [
  {
    id: 901,
    userId: 1,
    user: mockUsers[0],
    targetType: 0,
    targetId: 0,
    freezeLogId: 12,
    reason: 'My account was accidentally flagged due to rapid file uploads. Requesting review.',
    status: 0, // Pending
    createdAt: '2026-08-03T15:00:00Z'
  }
];

export const mockSystemSettings: SystemSettings = {
  siteName: 'LeapLunar04 Creative Community',
  openRegistration: true,
  maxFileUploadSizeMb: 100,
  allowPublicComments: true,
  announcement: 'Welcome to LeapLunar04! 100% Behance-styled design platform.'
};

export const mockModerationLogs: ModerationLog[] = [
  {
    id: 1001,
    adminId: 2,
    adminName: 'SystemAdmin',
    targetType: 'article',
    targetId: 101,
    action: 'unhide',
    reason: 'Reviewed appeal, restored normal public visibility.',
    createdAt: '2026-08-02T16:00:00Z'
  }
];

export const mockFreezeLogs: FreezeLog[] = [
  {
    id: 12,
    userId: 1,
    user: mockUsers[0],
    adminId: 2,
    reason: 'Security flag trigger during batch upload test.',
    createdAt: '2026-08-03T14:30:00Z'
  }
];
