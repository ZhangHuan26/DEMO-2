import { apiClient } from './client';
import { Video, Comment, Category, AllCategoriesResponse } from '../types';
import { mockVideos, mockCategories, mockComments } from './mockData';

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
      return mockCategories.filter(c => c.type === 'video');
    } catch {
      return mockCategories.filter(c => c.type === 'video');
    }
  },

  // 12.5 GET /categories/all (pulls all 3 sets of categories and counts)
  getAllCategories: async (): Promise<AllCategoriesResponse> => {
    try {
      const res = await apiClient.get('/categories/all');
      // 后端返回 Result<AllCategoriesVO>：{ code, data: { articles, files, videos }, message }
      const result = res.data;
      const data = result?.data ?? result;
      return {
        articleCategories: Array.isArray(data?.articles) ? data.articles : [],
        videoCategories: Array.isArray(data?.videos) ? data.videos : [],
        fileCategories: Array.isArray(data?.files) ? data.files : []
      };
    } catch {
      return {
        articleCategories: mockCategories.filter(c => c.type === 'article' || !c.type),
        videoCategories: mockCategories.filter(c => c.type === 'video'),
        fileCategories: mockCategories.filter(c => c.type === 'file')
      };
    }
  },


  // 12.2 POST /admin/video-categories
  createCategory: async (data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    try {
      const res = await apiClient.post('/admin/video-categories', data);
      return res.data;
    } catch {
      const newCat: Category = { id: Date.now(), name: data.name, coverImage: data.coverImage, type: 'video', count: 0, sortOrder: data.sortOrder, description: data.description };
      mockCategories.push(newCat);
      return newCat;
    }
  },

  // 12.3 PUT /admin/video-categories/{id}
  updateCategory: async (id: number, data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    try {
      const res = await apiClient.put(`/admin/video-categories/${id}`, data);
      return res.data;
    } catch {
      const cat = mockCategories.find(c => c.id === id);
      if (cat) {
        cat.name = data.name;
        if (data.coverImage) cat.coverImage = data.coverImage;
        if (data.sortOrder !== undefined) cat.sortOrder = data.sortOrder;
        if (data.description !== undefined) cat.description = data.description;
      }
      return cat;
    }
  },

  // 12.4 DELETE /admin/video-categories/{id}
  deleteCategory: async (id: number) => {
    try {
      const res = await apiClient.delete(`/admin/video-categories/${id}`);
      return res.data;
    } catch {
      const idx = mockCategories.findIndex(c => c.id === id);
      if (idx !== -1) mockCategories.splice(idx, 1);
      return { success: true };
    }
  },

  // 13.1 GET /videos
  getVideos: async (params?: { page?: number; limit?: number; userId?: number; categoryId?: number; search?: string }) => {
    try {
      // 将前端 limit 映射为后端 size 参数
      const { limit, ...rest } = params || {};
      const queryParams: any = { ...rest };
      if (limit !== undefined) queryParams.size = limit;
      const res = await apiClient.get('/videos', { params: queryParams });
      // 后端返回 Result<T> 包装：{ code, data, message }，列表在 res.data.data.list 或 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return { total: Array.isArray(data) ? data.length : (data?.total ?? (Array.isArray(list) ? list.length : 0)), list: Array.isArray(list) ? list : [] };
    } catch {
      let list = [...mockVideos];
      if (params?.userId) {
        list = list.filter(v => v.userId === Number(params.userId));
      }
      if (params?.categoryId) {
        list = list.filter(v => v.categoryId === Number(params.categoryId));
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(v => v.title.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q));
      }
      return { total: list.length, list };
    }
  },



  // 13.2 GET /videos/{id}
  getVideoById: async (id: number): Promise<Video> => {
    try {
      const res = await apiClient.get(`/videos/${id}`);
      return res.data.video || res.data;
    } catch {
      const found = mockVideos.find(v => v.id === id) || mockVideos[0];
      found.viewCount += 1;
      return found;
    }
  },

  // 13.3 POST /videos
  createVideo: async (data: { title: string; description?: string; videoUrl: string; coverImage: string; duration?: string; categoryId: number; allowDownload?: number; status?: number }) => {
    try {
      const res = await apiClient.post('/videos', data);
      return res.data;
    } catch {
      const newVid: Video = {
        id: Date.now(),
        userId: 1,
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        coverImage: data.coverImage,
        duration: data.duration || '03:15',
        categoryId: data.categoryId,
        categoryName: mockCategories.find(c => c.id === data.categoryId)?.name || 'Motion',
        status: data.status ?? 0,
        isHidden: 0,
        allowDownload: data.allowDownload ?? 1,
        viewCount: 1,
        likeCount: 0,
        favoriteCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString()
      };
      mockVideos.unshift(newVid);
      return newVid;
    }
  },

  // 13.4 PUT /videos/{id}
  updateVideo: async (id: number, data: Partial<Video>) => {
    try {
      const res = await apiClient.put(`/videos/${id}`, data);
      return res.data;
    } catch {
      const v = mockVideos.find(item => item.id === id);
      if (v) Object.assign(v, data);
      return v;
    }
  },

  // 13.5 DELETE /videos/{id}
  deleteVideo: async (id: number) => {
    try {
      const res = await apiClient.delete(`/videos/${id}`);
      return res.data;
    } catch {
      const idx = mockVideos.findIndex(v => v.id === id);
      if (idx !== -1) mockVideos.splice(idx, 1);
      return { success: true };
    }
  },

  // 13.5.1 PUT /videos/{id}/status
  updateVideoStatus: async (id: number, status: number) => {
    try {
      const res = await apiClient.put(`/videos/${id}/status`, { status });
      return res.data;
    } catch {
      const v = mockVideos.find(item => item.id === id);
      if (v) v.status = status;
      return v;
    }
  },


  // 13.6 GET /admin/videos
  getAdminVideos: async (params?: any) => {
    try {
      const res = await apiClient.get('/admin/videos', { params });
      // 后端返回 Result<PageResult>：{ code, data, message }，分页数据在 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      return data && typeof data === 'object' && 'list' in data ? data : { total: 0, list: [] };
    } catch {
      return { total: mockVideos.length, list: mockVideos };
    }
  },

  // 13.7 PUT /admin/videos/{id}/hide
  hideVideo: async (id: number, reason: string) => {
    try {
      const res = await apiClient.put(`/admin/videos/${id}/hide`, { reason });
      return res.data;
    } catch {
      const v = mockVideos.find(item => item.id === id);
      if (v) v.isHidden = 1;
      return { success: true };
    }
  },

  // 14.1 POST /videos/{id}/like
  likeVideo: async (id: number) => {
    try {
      const res = await apiClient.post(`/videos/${id}/like`);
      return res.data;
    } catch {
      const v = mockVideos.find(item => item.id === id);
      if (v) {
        v.isLiked = true;
        v.likeCount += 1;
      }
      return { isLiked: true };
    }
  },

  // 14.2 POST /videos/{id}/favorite
  favoriteVideo: async (id: number) => {
    try {
      const res = await apiClient.post(`/videos/${id}/favorite`);
      return res.data;
    } catch {
      const v = mockVideos.find(item => item.id === id);
      if (v) {
        v.isFavorited = true;
        v.favoriteCount += 1;
      }
      return { isFavorited: true };
    }
  },

  // 14.3 GET /users/me/favorite-videos
  getFavoriteVideos: async () => {
    try {
      const res = await apiClient.get('/users/me/favorite-videos');
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockVideos.filter(v => v.isFavorited);
    }
  },

  // 15.1 GET /videos/{id}/comments
  getComments: async (videoId: number): Promise<Comment[]> => {
    try {
      const res = await apiClient.get(`/videos/${videoId}/comments`);
      // 后端返回 Result<T> 包装：{ code, data, message }，列表在 res.data.data.list 或 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockComments.filter(c => c.targetId === videoId);
    }
  },

  // 15.2 POST /videos/{id}/comments
  createComment: async (videoId: number, data: { content: string; rootId?: number; replyToId?: number }) => {
    try {
      const res = await apiClient.post(`/videos/${videoId}/comments`, data);
      return res.data;
    } catch {
      const newComment: Comment = {
        id: Date.now(),
        targetId: videoId,
        userId: 1,
        content: data.content,
        rootId: data.rootId,
        replyToId: data.replyToId,
        likeCount: 0,
        isHidden: 0,
        createdAt: new Date().toISOString()
      };
      mockComments.unshift(newComment);
      return newComment;
    }
  }
};
