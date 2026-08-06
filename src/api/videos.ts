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
  getVideos: async (params?: { page?: number; limit?: number; userId?: number; categoryId?: number; search?: string }) => {
    try {
      const { limit, ...rest } = params || {};
      const queryParams: any = { ...rest };
      if (limit !== undefined) queryParams.size = limit;
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
    return res.data.video || res.data?.data || res.data;
  },

  // 13.3 POST /videos
  createVideo: async (data: { title: string; description?: string; videoUrl: string; coverImage: string; duration?: string; categoryId: number; allowDownload?: number; status?: number }) => {
    const res = await apiClient.post('/videos', data);
    return res.data;
  },

  // 13.4 PUT /videos/{id}
  updateVideo: async (id: number, data: Partial<Video>) => {
    const res = await apiClient.put(`/videos/${id}`, data);
    return res.data;
  },

  // 13.5 DELETE /videos/{id}
  deleteVideo: async (id: number) => {
    const res = await apiClient.delete(`/videos/${id}`);
    return res.data;
  },

  // 13.5.1 PUT /videos/{id}/status
  updateVideoStatus: async (id: number, status: number) => {
    const res = await apiClient.put(`/videos/${id}/status`, { status });
    return res.data;
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

  // 14.2 POST /videos/{id}/favorite
  favoriteVideo: async (id: number) => {
    const res = await apiClient.post(`/videos/${id}/favorite`);
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
  }
};
