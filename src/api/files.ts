import { apiClient } from './client';
import { FileItem, Comment, Category } from '../types';
import { mockFiles, mockCategories, mockComments } from './mockData';

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
      return mockCategories.filter(c => c.type === 'file');
    } catch {
      return mockCategories.filter(c => c.type === 'file');
    }
  },

  // 8.2 POST /admin/file-categories
  createCategory: async (data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    try {
      const res = await apiClient.post('/admin/file-categories', data);
      return res.data;
    } catch {
      const newCat: Category = { id: Date.now(), name: data.name, coverImage: data.coverImage, type: 'file', count: 0, sortOrder: data.sortOrder, description: data.description };
      mockCategories.push(newCat);
      return newCat;
    }
  },

  // 8.3 PUT /admin/file-categories/{id}
  updateCategory: async (id: number, data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    try {
      const res = await apiClient.put(`/admin/file-categories/${id}`, data);
      return res.data;
    } catch {
      const cat = mockCategories.find(c => c.id === id);
      if (cat) Object.assign(cat, data);
      return cat;
    }
  },

  // 8.4 DELETE /admin/file-categories/{id}
  deleteCategory: async (id: number) => {
    try {
      const res = await apiClient.delete(`/admin/file-categories/${id}`);
      return res.data;
    } catch {
      const idx = mockCategories.findIndex(c => c.id === id);
      if (idx !== -1) mockCategories.splice(idx, 1);
      return { success: true };
    }
  },

  // 9.1 POST /files
  createFile: async (data: { title: string; description?: string; fileUrl: string; fileName: string; fileSize: string; fileType: string; coverImage: string; categoryId: number; allowDownload?: number; status?: number }) => {
    try {
      const res = await apiClient.post('/files', data);
      return res.data;
    } catch {
      const newFile: FileItem = {
        id: Date.now(),
        userId: 1,
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        coverImage: data.coverImage,
        categoryId: data.categoryId,
        categoryName: mockCategories.find(c => c.id === data.categoryId)?.name || 'Resource',
        status: data.status ?? 0,
        isHidden: 0,
        allowDownload: data.allowDownload ?? 1,
        downloadCount: 0,
        likeCount: 0,
        favoriteCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString()
      };
      mockFiles.unshift(newFile);
      return newFile;
    }
  },

  // 9.2 GET /files
  getFiles: async (params?: { page?: number; limit?: number; userId?: number; categoryId?: number; search?: string }) => {
    try {
      // 将前端 limit 映射为后端 size 参数
      const { limit, ...rest } = params || {};
      const queryParams: any = { ...rest };
      if (limit !== undefined) queryParams.size = limit;
      const res = await apiClient.get('/files', { params: queryParams });
      // 后端返回 Result<T> 包装：{ code, data, message }，列表在 res.data.data.list 或 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return { total: Array.isArray(data) ? data.length : (data?.total ?? (Array.isArray(list) ? list.length : 0)), list: Array.isArray(list) ? list : [] };
    } catch {
      let list = [...mockFiles];
      if (params?.userId) {
        list = list.filter(f => f.userId === Number(params.userId));
      }
      if (params?.categoryId) {
        list = list.filter(f => f.categoryId === Number(params.categoryId));
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(f => f.title.toLowerCase().includes(q) || f.fileName.toLowerCase().includes(q));
      }
      return { total: list.length, list };
    }
  },



  // 9.2.1 GET /users/me/files
  getMyFiles: async () => {
    try {
      const res = await apiClient.get('/users/me/files');
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockFiles;
    }
  },

  // 9.3 GET /files/{id}
  getFileById: async (id: number): Promise<FileItem> => {
    try {
      const res = await apiClient.get(`/files/${id}`);
      return res.data.file || res.data;
    } catch {
      return mockFiles.find(f => f.id === id) || mockFiles[0];
    }
  },

  // 9.4 GET /files/{id}/download
  downloadFile: async (id: number, currentUserId?: number) => {
    try {
      const res = await apiClient.get(`/files/${id}/download`);
      return res.data;
    } catch {
      const f = mockFiles.find(item => item.id === id) || mockFiles[0];
      if (f.isHidden === 1) {
        throw new Error('该资源已被管理员下架隐藏，暂不可下载');
      }
      if (f.allowDownload === 0) {
        throw new Error('该资源禁止下载（已被管理员或上传者限制）');
      }
      if (f.status === 1 && currentUserId !== undefined && currentUserId !== f.userId) {
        throw new Error('无权下载私有资源文件');
      }
      f.downloadCount += 1;
      return { downloadUrl: f.fileUrl, fileName: f.fileName };
    }
  },

  // 9.4.1 PUT /files/{id}
  updateFile: async (id: number, data: Partial<FileItem>) => {
    try {
      const res = await apiClient.put(`/files/${id}`, data);
      return res.data;
    } catch {
      const item = mockFiles.find(f => f.id === id);
      if (item) {
        Object.assign(item, data);
      }
      return item;
    }
  },

  // 9.5 DELETE /files/{id}
  deleteFile: async (id: number) => {
    try {
      const res = await apiClient.delete(`/files/${id}`);
      return res.data;
    } catch {
      const idx = mockFiles.findIndex(f => f.id === id);
      if (idx !== -1) mockFiles.splice(idx, 1);
      return { success: true };
    }
  },


  // 9.5.1 PUT /files/{id}/status
  updateFileStatus: async (id: number, status: number) => {
    try {
      const res = await apiClient.put(`/files/${id}/status`, { status });
      return res.data;
    } catch {
      const f = mockFiles.find(item => item.id === id);
      if (f) f.status = status;
      return f;
    }
  },


  // 9.6 PUT /admin/files/{id}/hide
  hideFile: async (id: number, reason: string) => {
    try {
      const res = await apiClient.put(`/admin/files/${id}/hide`, { reason });
      return res.data;
    } catch {
      const f = mockFiles.find(item => item.id === id);
      if (f) f.isHidden = 1;
      return { success: true };
    }
  },

  // 9.7 PUT /admin/files/{id}/allow-download
  toggleAllowDownload: async (id: number, allowDownload: number) => {
    try {
      const res = await apiClient.put(`/admin/files/${id}/allow-download`, { allowDownload });
      return res.data;
    } catch {
      const f = mockFiles.find(item => item.id === id);
      if (f) f.allowDownload = allowDownload;
      return { success: true, allowDownload };
    }
  },

  // 9.8 GET /admin/files
  getAdminFiles: async (params?: any) => {
    try {
      const res = await apiClient.get('/admin/files', { params });
      // 后端返回 Result<PageResult>：{ code, data, message }，分页数据在 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      return data && typeof data === 'object' && 'list' in data ? data : { total: 0, list: [] };
    } catch {
      return { total: mockFiles.length, list: mockFiles };
    }
  },

  // 10.1 POST /files/{id}/like
  likeFile: async (id: number) => {
    try {
      const res = await apiClient.post(`/files/${id}/like`);
      return res.data;
    } catch {
      const f = mockFiles.find(item => item.id === id);
      if (f) {
        f.isLiked = true;
        f.likeCount += 1;
      }
      return { isLiked: true };
    }
  },

  // 10.2 POST /files/{id}/favorite
  favoriteFile: async (id: number) => {
    try {
      const res = await apiClient.post(`/files/${id}/favorite`);
      return res.data;
    } catch {
      const f = mockFiles.find(item => item.id === id);
      if (f) {
        f.isFavorited = true;
        f.favoriteCount += 1;
      }
      return { isFavorited: true };
    }
  },

  // 10.3 GET /users/me/favorite-files
  getFavoriteFiles: async () => {
    try {
      const res = await apiClient.get('/users/me/favorite-files');
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockFiles.filter(f => f.isFavorited);
    }
  },

  // 11.1 GET /files/{id}/comments
  getComments: async (fileId: number): Promise<Comment[]> => {
    try {
      const res = await apiClient.get(`/files/${fileId}/comments`);
      // 后端返回 Result<T> 包装：{ code, data, message }，列表在 res.data.data.list 或 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockComments.filter(c => c.targetId === fileId);
    }
  },

  // 11.2 POST /files/{id}/comments
  createComment: async (fileId: number, data: { content: string; rootId?: number; replyToId?: number }) => {
    try {
      const res = await apiClient.post(`/files/${fileId}/comments`, data);
      return res.data;
    } catch {
      const newComment: Comment = {
        id: Date.now(),
        targetId: fileId,
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
  },

  // 11.3 DELETE /file-comments/{id}
  deleteComment: async (id: number) => {
    try {
      const res = await apiClient.delete(`/file-comments/${id}`);
      return res.data;
    } catch {
      return { success: true };
    }
  }
};
