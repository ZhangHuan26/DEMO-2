import { apiClient } from './client';
import { FileItem, Comment, Category } from '../types';
import { normalizeComment } from '../utils/normalize';

export const filesApi = {
  // 8.1 GET /file-categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await apiClient.get('/file-categories');
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

  // 8.2 POST /admin/file-categories
  createCategory: async (data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    const res = await apiClient.post('/admin/file-categories', data);
    return res.data;
  },

  // 8.3 PUT /admin/file-categories/{id}
  updateCategory: async (id: number, data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    const res = await apiClient.put(`/admin/file-categories/${id}`, data);
    return res.data;
  },

  // 8.4 DELETE /admin/file-categories/{id}
  deleteCategory: async (id: number) => {
    const res = await apiClient.delete(`/admin/file-categories/${id}`);
    return res.data;
  },

  // 9.1 POST /files
  createFile: async (data: { title: string; description?: string; fileUrl: string; fileName: string; fileSize: string; fileType: string; coverImage: string; categoryId: number; allowDownload?: number; status?: number }) => {
    const res = await apiClient.post('/files', data);
    return res.data;
  },

  // 9.2 GET /files
  getFiles: async (params?: { page?: number; limit?: number; userId?: number; categoryId?: number; search?: string }) => {
    try {
      const { limit, ...rest } = params || {};
      const queryParams: any = { ...rest };
      if (limit !== undefined) queryParams.size = limit;
      const res = await apiClient.get('/files', { params: queryParams });
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return { total: Array.isArray(data) ? data.length : (data?.total ?? (Array.isArray(list) ? list.length : 0)), list: Array.isArray(list) ? list : [] };
    } catch {
      return { total: 0, list: [] };
    }
  },

  // 9.2.1 GET /users/me/files
  getMyFiles: async () => {
    try {
      const res = await apiClient.get('/users/me/files');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 9.3 GET /files/{id}
  getFileById: async (id: number): Promise<FileItem> => {
    const res = await apiClient.get(`/files/${id}`);
    return res.data.file || res.data?.data || res.data;
  },

  // 9.4 GET /files/{id}/download
  downloadFile: async (id: number, currentUserId?: number) => {
    const res = await apiClient.get(`/files/${id}/download`);
    return res.data;
  },

  // 9.4.1 PUT /files/{id}
  updateFile: async (id: number, data: Partial<FileItem>) => {
    const res = await apiClient.put(`/files/${id}`, data);
    return res.data;
  },

  // 9.5 DELETE /files/{id}
  deleteFile: async (id: number) => {
    const res = await apiClient.delete(`/files/${id}`);
    return res.data;
  },

  // 9.5.1 PUT /files/{id}/status
  updateFileStatus: async (id: number, status: number) => {
    const res = await apiClient.put(`/files/${id}/status`, { status });
    return res.data;
  },

  // 9.6 PUT /admin/files/{id}/hide
  hideFile: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/files/${id}/hide`, { reason });
    return res.data;
  },

  // 9.7 PUT /admin/files/{id}/allow-download
  toggleAllowDownload: async (id: number, allowDownload: number) => {
    const res = await apiClient.put(`/admin/files/${id}/allow-download`, { allowDownload });
    return res.data;
  },

  // 9.8 GET /admin/files
  getAdminFiles: async (params?: any) => {
    try {
      const res = await apiClient.get('/admin/files', { params });
      const result = res.data;
      const data = result?.data ?? result;
      return data && typeof data === 'object' && 'list' in data ? data : { total: 0, list: [] };
    } catch {
      return { total: 0, list: [] };
    }
  },

  // 10.1 POST /files/{id}/like
  likeFile: async (id: number) => {
    const res = await apiClient.post(`/files/${id}/like`);
    return res.data;
  },

  // 10.2 POST /files/{id}/favorite
  favoriteFile: async (id: number) => {
    const res = await apiClient.post(`/files/${id}/favorite`);
    return res.data;
  },

  // 10.3 GET /users/me/favorite-files
  getFavoriteFiles: async () => {
    try {
      const res = await apiClient.get('/users/me/favorite-files');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 11.1 GET /files/{id}/comments
  getComments: async (fileId: number): Promise<Comment[]> => {
    try {
      const res = await apiClient.get(`/files/${fileId}/comments`);
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

  // 11.2 POST /files/{id}/comments
  createComment: async (fileId: number, data: { content: string; rootId?: number; replyToId?: number; parentId?: number }) => {
    const payload: any = { content: data.content };
    if (data.parentId || data.replyToId || data.rootId) {
      payload.parentId = data.parentId ?? data.replyToId ?? data.rootId;
    }
    const res = await apiClient.post(`/files/${fileId}/comments`, payload);
    const result = res.data;
    const rawObj = result?.data ?? result;
    return normalizeComment(rawObj);
  },

  // 11.3 DELETE /file-comments/{id}
  deleteComment: async (id: number) => {
    const res = await apiClient.delete(`/file-comments/${id}`);
    return res.data;
  }
};
