import { apiClient } from './client';
import { FileItem, Comment, Category } from '../types';
import { normalizeComment } from '../utils/normalize';
import { resolveImageUrl } from '../config/env';

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

  // 10.3 POST /files
  uploadFile: async (params: {
    file: File | Blob;
    articleId?: number;
    categoryId?: number;
    status?: number;
    title?: string;
    description?: string;
    coverImage?: string;
    allowDownload?: number;
  }) => {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.categoryId !== undefined && params.categoryId !== 0) {
      formData.append('categoryId', String(params.categoryId));
    }
    if (params.articleId !== undefined) {
      formData.append('articleId', String(params.articleId));
    }
    if (params.status !== undefined) {
      formData.append('status', String(params.status));
    }
    if (params.title) {
      formData.append('title', params.title);
    }
    if (params.description) {
      formData.append('description', params.description);
    }
    if (params.coverImage) {
      formData.append('coverImage', params.coverImage);
    }
    if (params.allowDownload !== undefined) {
      formData.append('allowDownload', String(params.allowDownload));
    }

    const res = await apiClient.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  createFile: async (data: {
    file?: File | Blob;
    title?: string;
    description?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    coverImage?: string;
    categoryId?: number;
    allowDownload?: number;
    status?: number;
    articleId?: number;
  }) => {
    if (data.file instanceof File || data.file instanceof Blob) {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.categoryId) formData.append('categoryId', String(data.categoryId));
      if (data.articleId) formData.append('articleId', String(data.articleId));
      if (data.status !== undefined) formData.append('status', String(data.status));
      const res = await apiClient.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } else {
      const res = await apiClient.post('/files', data);
      return res.data;
    }
  },

  // 10.1 GET /files
  getFiles: async (params?: { page?: number; limit?: number; size?: number; userId?: number; articleId?: number; categoryId?: number; fileType?: number; search?: string; keyword?: string; sort?: string }) => {
    try {
      const { limit, size, search, keyword, ...rest } = params || {};
      const queryParams: any = { ...rest };
      if (limit !== undefined || size !== undefined) queryParams.size = limit ?? size;
      if (search || keyword) queryParams.keyword = search || keyword;
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
    const result = res.data;
    const data = result?.data ?? result;
    const file = data?.file ?? data;

    const authorObj = file?.author || file?.user || file?.creator || data?.author || data?.user;
    const isFollowing = 
      authorObj?.isFollowing ??
      authorObj?.is_following ??
      authorObj?.isFollowed ??
      authorObj?.is_followed ??
      authorObj?.isFollow ??
      file?.isFollowingAuthor ??
      file?.is_following_author ??
      file?.isFollowing ??
      file?.is_following ??
      file?.isFollowed ??
      data?.isFollowing ??
      data?.is_following ??
      false;

    const normalizedAuthor = authorObj ? {
      ...authorObj,
      isFollowing: Boolean(isFollowing),
      nickName: authorObj.nickName || authorObj.nickname || authorObj.username || authorObj.name || '创作者',
      avatar: authorObj.avatar || authorObj.avatarUrl || authorObj.headImg || '',
    } : undefined;

    return {
      ...file,
      author: normalizedAuthor,
      viewCount: file?.viewCount ?? file?.view_count ?? file?.views ?? 0,
      categoryName: file?.category?.name || file?.categoryName || file?.category_name,
    };
  },

  // 9.4 GET /files/{id}/download
  downloadFile: async (id: number, customFileName?: string) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const downloadApiUrl = resolveImageUrl(`/files/${id}/download`);

    try {
      const response = await fetch(downloadApiUrl, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        let errorMsg = '下载资源失败';
        try {
          const json = await response.json();
          errorMsg = json.msg || json.message || errorMsg;
        } catch {
          // ignore
        }
        throw new Error(errorMsg);
      }

      // 检查 Content-Type
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        const rawUrl = json.data?.downloadUrl || json.downloadUrl || json.data?.url || json.url;
        if (rawUrl) {
          const realUrl = resolveImageUrl(rawUrl);
          const a = document.createElement('a');
          a.href = realUrl;
          a.target = '_blank';
          if (customFileName) a.download = customFileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          return json;
        } else if (json.code !== undefined && json.code !== 200 && json.code !== 0) {
          throw new Error(json.msg || json.message || '下载资源失败');
        }
      }

      // 默认处理二进制文件流 (Content-Disposition: attachment)
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;

      let finalFileName = customFileName || '';
      if (!finalFileName) {
        const disposition = response.headers.get('content-disposition');
        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename=["']?([^"';]+)["']?/);
          if (match && match[1]) {
            finalFileName = decodeURIComponent(match[1]);
          }
        }
      }

      a.download = finalFileName || `resource_${id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);

      return { success: true };
    } catch (error: any) {
      throw error;
    }
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

  // 10.1.2 DELETE /files/{id}/like
  unlikeFile: async (id: number) => {
    const res = await apiClient.delete(`/files/${id}/like`);
    return res.data;
  },

  // 10.2 POST /files/{id}/favorite
  favoriteFile: async (id: number) => {
    const res = await apiClient.post(`/files/${id}/favorite`);
    return res.data;
  },

  // 10.2.2 DELETE /files/{id}/favorite
  unfavoriteFile: async (id: number) => {
    const res = await apiClient.delete(`/files/${id}/favorite`);
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
