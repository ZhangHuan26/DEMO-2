import { apiClient } from './client';
import { Video, Comment, Category, AllCategoriesResponse } from '../types';
import { normalizeComment } from '../utils/normalize';

export const videosApi = {
  // 12.1 GET /video-categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await apiClient.get('/video-categories');
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.list)) return data.list;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && Array.isArray(data.categories)) return data.categories;
      if (data && data.data && Array.isArray(data.data.list)) return data.data.list;
      return [];
    } catch {
      return [];
    }
  },

  // 12.5 GET /categories/all (pulls all 3 sets of categories and counts)
  getAllCategories: async (): Promise<AllCategoriesResponse> => {
    try {
      const res = await apiClient.get('/categories/all');
      const result = res.data;
      const data = result?.data ?? result;
      return {
        articleCategories: Array.isArray(data?.articles) ? data.articles : [],
        videoCategories: Array.isArray(data?.videos) ? data.videos : [],
        fileCategories: Array.isArray(data?.files) ? data.files : []
      };
    } catch {
      return {
        articleCategories: [],
        videoCategories: [],
        fileCategories: []
      };
    }
  },

  // 12.2 POST /admin/video-categories
  createCategory: async (data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    const res = await apiClient.post('/admin/video-categories', data);
    return res.data;
  },

  // 12.3 PUT /admin/video-categories/{id}
  updateCategory: async (id: number, data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    const res = await apiClient.put(`/admin/video-categories/${id}`, data);
    return res.data;
  },

  // 12.4 DELETE /admin/video-categories/{id}
  deleteCategory: async (id: number) => {
    const res = await apiClient.delete(`/admin/video-categories/${id}`);
    return res.data;
  },

  // 13.1 GET /videos
  getVideos: async (params?: { page?: number; limit?: number; size?: number; userId?: number; categoryId?: number; search?: string; keyword?: string; sort?: string }) => {
    try {
      const { limit, size, search, keyword, ...rest } = params || {};
      const queryParams: any = { ...rest };
      if (limit !== undefined || size !== undefined) queryParams.size = limit ?? size;
      if (search || keyword) queryParams.keyword = search || keyword;
      const res = await apiClient.get('/videos', { params: queryParams });
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return { total: Array.isArray(data) ? data.length : (data?.total ?? (Array.isArray(list) ? list.length : 0)), list: Array.isArray(list) ? list : [] };
    } catch {
      return { total: 0, list: [] };
    }
  },

  // 13.2 GET /videos/{id}
  getVideoById: async (id: number): Promise<Video> => {
    const res = await apiClient.get(`/videos/${id}`);
    const result = res.data;
    const data = result?.data ?? result;
    const video = data?.video ?? data;

    console.log('[Videos API] getVideoById raw response:', { result, data, video });

    const authorObj = video?.author || video?.user || video?.creator || data?.author || data?.user;
    const isFollowing = 
      authorObj?.isFollowing ??
      authorObj?.is_following ??
      authorObj?.isFollowed ??
      authorObj?.is_followed ??
      authorObj?.isFollow ??
      video?.isFollowingAuthor ??
      video?.is_following_author ??
      video?.isFollowing ??
      video?.is_following ??
      video?.isFollowed ??
      data?.isFollowing ??
      data?.is_following ??
      false;

    console.log('[Videos API] Author object:', authorObj);
    console.log('[Videos API] Extracted isFollowing:', isFollowing);

    const normalizedAuthor = authorObj ? {
      ...authorObj,
      isFollowing: Boolean(isFollowing),
      nickName: authorObj.nickName || authorObj.nickname || authorObj.username || authorObj.name || '创作者',
      avatar: authorObj.avatar || authorObj.avatarUrl || authorObj.headImg || '',
    } : undefined;

    console.log('[Videos API] Normalized author:', normalizedAuthor);

    const statusVal = video?.visibility !== undefined ? video.visibility : (video?.status ?? 0);
    return {
      ...video,
      author: normalizedAuthor,
      status: statusVal,
      visibility: statusVal,
      viewCount: video?.viewCount ?? video?.view_count ?? video?.views ?? video?.playCount ?? video?.plays ?? 0,
      categoryName: video?.category?.name || video?.categoryName || video?.category_name,
    };
  },

  // 13.3 POST /videos
  createVideo: async (data: {
    title: string;
    description?: string;
    videoUrl: string;
    coverImage?: string;
    duration?: number | string;
    fileSize?: number;
    categoryId?: number;
    status?: number;
    visibility?: number;
    allowDownload?: number;
  }) => {
    // 解析时长：如果为字符串 (如 "04:35" 或 "01:10:20")，转换为秒整型 (API 文档 int)
    let durationSec: number | undefined = undefined;
    if (typeof data.duration === 'number') {
      durationSec = data.duration;
    } else if (typeof data.duration === 'string' && data.duration.trim()) {
      const parts = data.duration.trim().split(':').map(p => parseInt(p, 10));
      if (parts.every(p => !isNaN(p))) {
        if (parts.length === 3) {
          durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          durationSec = parts[0] * 60 + parts[1];
        } else if (parts.length === 1) {
          durationSec = parts[0];
        }
      }
    }

    const statusVal = data.visibility !== undefined ? data.visibility : (data.status !== undefined ? Number(data.status) : 0);
    const payload: Record<string, any> = {
      title: data.title,
      description: data.description ?? '',
      videoUrl: data.videoUrl,
      coverImage: data.coverImage ?? '',
      duration: durationSec !== undefined ? durationSec : (data.duration ?? 0),
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      status: statusVal,
      visibility: statusVal,
    };

    if (data.fileSize !== undefined) payload.fileSize = Number(data.fileSize);
    if (data.allowDownload !== undefined) payload.allowDownload = Number(data.allowDownload);

    const res = await apiClient.post('/videos', payload);
    return res.data;
  },

  // 22.2 POST /uploads/video
  uploadVideo: async (formData: FormData): Promise<{ url: string }> => {
    try {
      const res = await apiClient.post('/uploads/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data?.data || res.data;
      if (data && data.url) return { url: data.url };
      if (typeof data === 'string') return { url: data };
      return res.data;
    } catch {
      const file = formData.get('file') as File | null;
      if (file && file instanceof File) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({ url: reader.result as string });
          };
          reader.onerror = () => {
            resolve({ url: URL.createObjectURL(file) });
          };
          reader.readAsDataURL(file);
        });
      }
      return { url: '' };
    }
  },

  // 13.4 PUT /videos/{id}
  updateVideo: async (id: number, data: Partial<Video>) => {
    const payload: any = { ...data };
    if (data.status !== undefined && data.visibility === undefined) payload.visibility = data.status;
    if (data.visibility !== undefined && data.status === undefined) payload.status = data.visibility;
    const res = await apiClient.put(`/videos/${id}`, payload);
    return res.data;
  },

  // 13.5 DELETE /videos/{id}
  deleteVideo: async (id: number) => {
    const res = await apiClient.delete(`/videos/${id}`);
    return res.data;
  },

  // 13.5.1 PUT /videos/{id}/status
  updateVideoStatus: async (id: number, status: number) => {
    try {
      const res = await apiClient.put(`/videos/${id}/status`, { status, visibility: status });
      return res.data;
    } catch {
      const res = await apiClient.put(`/videos/${id}`, { status, visibility: status });
      return res.data;
    }
  },

  // 13.6 GET /admin/videos
  getAdminVideos: async (params?: any) => {
    try {
      const res = await apiClient.get('/admin/videos', { params });
      const result = res.data;
      const data = result?.data ?? result;
      return data && typeof data === 'object' && 'list' in data ? data : { total: 0, list: [] };
    } catch {
      return { total: 0, list: [] };
    }
  },

  // 13.7 PUT /admin/videos/{id}/hide
  hideVideo: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/videos/${id}/hide`, { reason });
    return res.data;
  },

  // 14.1 POST /videos/{id}/like
  likeVideo: async (id: number) => {
    const res = await apiClient.post(`/videos/${id}/like`);
    return res.data;
  },

  // 14.1.2 DELETE /videos/{id}/like
  unlikeVideo: async (id: number) => {
    const res = await apiClient.delete(`/videos/${id}/like`);
    return res.data;
  },

  // 14.2 POST /videos/{id}/favorite
  favoriteVideo: async (id: number) => {
    const res = await apiClient.post(`/videos/${id}/favorite`);
    return res.data;
  },

  // 14.2.2 DELETE /videos/{id}/favorite
  unfavoriteVideo: async (id: number) => {
    const res = await apiClient.delete(`/videos/${id}/favorite`);
    return res.data;
  },

  // 14.3 GET /users/me/favorite-videos
  getFavoriteVideos: async () => {
    try {
      const res = await apiClient.get('/users/me/favorite-videos');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 15.1 GET /videos/{id}/comments
  getComments: async (videoId: number): Promise<Comment[]> => {
    try {
      const res = await apiClient.get(`/videos/${videoId}/comments`);
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data)
        ? data
        : (data?.list || data?.records || data?.content || data?.items || []);
      if (!Array.isArray(list)) return [];
      return list.map(normalizeComment);
    } catch {
      return [];
    }
  },

  // 15.2 POST /videos/{id}/comments
  createComment: async (videoId: number, data: { content: string; rootId?: number; replyToId?: number; parentId?: number }) => {
    const payload: any = { content: data.content };
    if (data.parentId || data.replyToId || data.rootId) {
      payload.parentId = data.parentId ?? data.replyToId ?? data.rootId;
    }
    const res = await apiClient.post(`/videos/${videoId}/comments`, payload);
    const result = res.data;
    const rawObj = result?.data ?? result;
    return normalizeComment(rawObj);
  },

  // 15.3 DELETE /video-comments/{id}
  deleteComment: async (id: number) => {
    const res = await apiClient.delete(`/video-comments/${id}`);
    return res.data;
  },

  // 15.4 POST /video-comments/{id}/like
  likeComment: async (id: number) => {
    const res = await apiClient.post(`/video-comments/${id}/like`);
    return res.data;
  },

  // 15.5 DELETE /video-comments/{id}/like
  unlikeComment: async (id: number) => {
    const res = await apiClient.delete(`/video-comments/${id}/like`);
    return res.data;
  },

  // 视频下载功能
  /**
   * 下载视频
   * GET /videos/{id}/download
   */
  downloadVideo: async (id: number) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/videos/${id}/download`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const disposition = response.headers.get('content-disposition');
      let filename = `video_${id}.mp4`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename=["']?([^"';]+)["']?/);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * 修改视频下载权限
   * PUT /videos/{id}/allow-download
   */
  updateAllowDownload: async (id: number, allowDownload: number) => {
    const res = await apiClient.put(`/videos/${id}/allow-download`, { allowDownload });
    return res.data;
  },

  // 25.1 GET /videos/{id}/likes - 点赞该视频的用户列表
  getVideoLikes: async (id: number) => {
    try {
      const res = await apiClient.get(`/videos/${id}/likes`);
      const result = res.data;
      const data = result?.data ?? result;
      return Array.isArray(data) ? data : (data?.list || []);
    } catch {
      return [];
    }
  },

  // 25.2 GET /videos/{id}/favorites - 收藏该视频的用户列表
  getVideoFavorites: async (id: number) => {
    try {
      const res = await apiClient.get(`/videos/${id}/favorites`);
      const result = res.data;
      const data = result?.data ?? result;
      return Array.isArray(data) ? data : (data?.list || []);
    } catch {
      return [];
    }
  },

  // 25.3 GET /videos/{id}/duplicates - 既点赞又收藏该视频的用户列表
  getVideoDuplicates: async (id: number) => {
    try {
      const res = await apiClient.get(`/videos/${id}/duplicates`);
      const result = res.data;
      const data = result?.data ?? result;
      return Array.isArray(data) ? data : (data?.list || []);
    } catch {
      return [];
    }
  }
};
