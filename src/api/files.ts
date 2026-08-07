import { apiClient } from './client';
import { FileItem, Comment, Category } from '../types';
import { normalizeComment } from '../utils/normalize';
import { resolveImageUrl } from '../config/env';

// 后端 FileVO 的 fileType 是整数分类(0-5)，前端需要显示为字符串
const FILE_TYPE_MAP: Record<number, string> = {
  0: '其他',
  1: '图片',
  2: '文档',
  3: '视频',
  4: '音频',
  5: '压缩包',
};

// 将后端 fileSize（字节数 Long）转换为前端字符串格式 "12.4 MB"
export const formatBytesToString = (bytes: number | string | undefined): string => {
  if (bytes === undefined || bytes === null || bytes === '') return '';
  const num = typeof bytes === 'string' ? Number(bytes) : bytes;
  if (isNaN(num) || num <= 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return (num / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};

// 将后端 fileType（Integer 0-5）映射为前端可读字符串
export const mapFileTypeToString = (fileType: number | string | undefined): string => {
  if (fileType === undefined || fileType === null) return '';
  const num = typeof fileType === 'string' ? Number(fileType) : fileType;
  return FILE_TYPE_MAP[num] || '';
};

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
  // 根据API文档，POST /files 只接受: file, articleId, categoryId, status, coverImage
  // title, description, allowDownload 需要在上传后通过 PUT /files/{id} 更新
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

    // 只传API文档中支持的参数
    if (params.categoryId !== undefined && params.categoryId !== 0) {
      formData.append('categoryId', String(params.categoryId));
    }
    if (params.articleId !== undefined) {
      formData.append('articleId', String(params.articleId));
    }
    if (params.status !== undefined) {
      formData.append('status', String(params.status));
    }
    if (params.coverImage) {
      formData.append('coverImage', params.coverImage);
    }
    // 文件简介直接通过 formData 提交（API 文档 10.3 支持 description 字段）
    if (params.description) {
      formData.append('description', params.description);
    }

    const res = await apiClient.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // 获取上传后的文件信息
    const uploadedFile = res.data?.data || res.data;

    // 如果返回的文件路径是相对路径，添加公共路径前缀
    if (uploadedFile?.fileUrl && !uploadedFile.fileUrl.startsWith('http')) {
      uploadedFile.fileUrl = resolveImageUrl(uploadedFile.fileUrl);
    }
    if (uploadedFile?.coverImage && !uploadedFile.coverImage.startsWith('http')) {
      uploadedFile.coverImage = resolveImageUrl(uploadedFile.coverImage);
    }

    // 如果有 title 或 allowDownload，上传后通过 PUT /files/{id} 更新（description 已通过 formData 提交）
    if (uploadedFile?.id && (params.title || params.allowDownload !== undefined)) {
      const updateData: any = {};
      if (params.title) updateData.originalName = params.title;
      if (params.allowDownload !== undefined) updateData.allowDownload = params.allowDownload;

      await apiClient.put(`/files/${uploadedFile.id}`, updateData);
    }

    return uploadedFile;
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

      // 处理返回的文件列表，为相对路径添加公共路径前缀
      const normalizedList = Array.isArray(list) ? list.map((file: any) => {
        if (file.fileUrl && !file.fileUrl.startsWith('http')) {
          file.fileUrl = resolveImageUrl(file.fileUrl);
        }
        if (file.coverImage && !file.coverImage.startsWith('http')) {
          file.coverImage = resolveImageUrl(file.coverImage);
        }
        const statusVal = file.visibility !== undefined ? file.visibility : (file.status ?? 0);
        file.status = statusVal;
        file.visibility = statusVal;
        // 后端 FileVO 只有 originalName，映射到前端的 title 和 fileName
        const originalName = file.originalName || file.original_name || file.fileName || file.title || '';
        file.title = file.title || originalName;
        file.fileName = file.fileName || originalName;
        // 后端 fileSize 是字节数(Long)，映射为前端字符串；fileType 是整数(0-5)，映射为字符串
        file.fileSize = file.fileSize !== undefined && typeof file.fileSize !== 'string' ? formatBytesToString(file.fileSize) : (file.fileSize || '');
        file.fileType = file.fileType !== undefined && typeof file.fileType !== 'string' ? mapFileTypeToString(file.fileType) : (file.fileType || '');
        return file;
      }) : [];

      return {
        total: Array.isArray(data) ? data.length : (data?.total ?? normalizedList.length),
        list: normalizedList
      };
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

      // 处理返回的文件列表，为相对路径添加公共路径前缀
      const normalizedList = Array.isArray(list) ? list.map((file: any) => {
        if (file.fileUrl && !file.fileUrl.startsWith('http')) {
          file.fileUrl = resolveImageUrl(file.fileUrl);
        }
        if (file.coverImage && !file.coverImage.startsWith('http')) {
          file.coverImage = resolveImageUrl(file.coverImage);
        }
        const statusVal = file.visibility !== undefined ? file.visibility : (file.status ?? 0);
        file.status = statusVal;
        file.visibility = statusVal;
        // 后端 FileVO 只有 originalName，映射到前端的 title 和 fileName
        const originalName = file.originalName || file.original_name || file.fileName || file.title || '';
        file.title = file.title || originalName;
        file.fileName = file.fileName || originalName;
        // 后端 fileSize 是字节数(Long)，映射为前端字符串；fileType 是整数(0-5)，映射为字符串
        file.fileSize = file.fileSize !== undefined && typeof file.fileSize !== 'string' ? formatBytesToString(file.fileSize) : (file.fileSize || '');
        file.fileType = file.fileType !== undefined && typeof file.fileType !== 'string' ? mapFileTypeToString(file.fileType) : (file.fileType || '');
        return file;
      }) : [];

      return normalizedList;
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

    console.log('[Files API] getFileById raw response:', { result, data, file });

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

    console.log('[Files API] Author object:', authorObj);
    console.log('[Files API] Extracted isFollowing:', isFollowing);

    const normalizedAuthor = authorObj ? {
      ...authorObj,
      isFollowing: Boolean(isFollowing),
      nickName: authorObj.nickName || authorObj.nickname || authorObj.username || authorObj.name || '创作者',
      avatar: authorObj.avatar || authorObj.avatarUrl || authorObj.headImg || '',
    } : undefined;

    console.log('[Files API] Normalized author:', normalizedAuthor);

    // 处理文件路径，为相对路径添加公共路径前缀
    const fileUrl = file?.fileUrl;
    const coverImage = file?.coverImage;
    const statusVal = file?.visibility !== undefined ? file.visibility : (file?.status ?? 0);
    // 后端 FileVO 只有 originalName，映射到前端的 title 和 fileName
    const originalName = file?.originalName || file?.original_name || file?.fileName || file?.title || '';
    // 描述字段映射：后端可能返回 description / summary / fileDesc
    const descriptionVal = file?.description ?? file?.summary ?? file?.fileDesc ?? '';

    return {
      ...file,
      author: normalizedAuthor,
      status: statusVal,
      visibility: statusVal,
      viewCount: file?.viewCount ?? file?.view_count ?? file?.views ?? 0,
      categoryName: file?.category?.name || file?.categoryName || file?.category_name,
      title: file?.title || originalName,
      fileName: file?.fileName || originalName,
      description: descriptionVal,
      // 后端 fileSize 是字节数(Long)，映射为前端字符串；fileType 是整数(0-5)，映射为字符串
      fileSize: file?.fileSize !== undefined && typeof file?.fileSize !== 'string' ? formatBytesToString(file?.fileSize) : (file?.fileSize || ''),
      fileType: file?.fileType !== undefined && typeof file?.fileType !== 'string' ? mapFileTypeToString(file?.fileType) : (file?.fileType || ''),
      fileUrl: fileUrl && !fileUrl.startsWith('http') ? resolveImageUrl(fileUrl) : fileUrl,
      coverImage: coverImage && !coverImage.startsWith('http') ? resolveImageUrl(coverImage) : coverImage,
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
  // 后端 PUT /files/{id} 按 API 文档接受 originalName/description/categoryId/articleId
  // 前端 title/fileName 需要映射为 originalName
  updateFile: async (id: number, data: Partial<FileItem>) => {
    const payload: any = { ...data };
    // 将前端 title/fileName 映射为后端 originalName
    const originalNameVal = (data as any).originalName;
    if (data.title !== undefined && originalNameVal === undefined) payload.originalName = data.title;
    if (data.fileName !== undefined && originalNameVal === undefined) payload.originalName = data.fileName;
    // 删除后端不接受的字段
    delete payload.title;
    delete payload.fileName;
    delete payload.fileSize;
    delete payload.fileType;
    delete payload.downloadCount;
    delete payload.viewCount;
    delete payload.likeCount;
    delete payload.favoriteCount;
    delete payload.commentCount;
    delete payload.isLiked;
    delete payload.isFavorited;
    delete payload.author;
    delete payload.category;
    delete payload.categoryName;
    delete payload.isHidden;
    if (data.status !== undefined && data.visibility === undefined) payload.visibility = data.status;
    if (data.visibility !== undefined && data.status === undefined) payload.status = data.visibility;
    const res = await apiClient.put(`/files/${id}`, payload);
    return res.data;
  },

  // 9.5 DELETE /files/{id}
  deleteFile: async (id: number) => {
    const res = await apiClient.delete(`/files/${id}`);
    return res.data;
  },

  // 9.5.1 PUT /files/{id}/status
  updateFileStatus: async (id: number, status: number) => {
    try {
      const res = await apiClient.put(`/files/${id}/status`, { status, visibility: status });
      return res.data;
    } catch {
      const res = await apiClient.put(`/files/${id}`, { status, visibility: status });
      return res.data;
    }
  },

  // 9.6 PUT /admin/files/{id}/hide
  hideFile: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/files/${id}/hide`, { reason });
    return res.data;
  },

  // 9.6.1 PUT /admin/files/{id}/unhide
  unhideFile: async (id: number, reason?: string) => {
    const res = await apiClient.put(`/admin/files/${id}/unhide`, { reason: reason || '恢复正常' });
    return res.data;
  },

  // 9.7 PUT /files/{id} 或 /admin/files/{id}/allow-download
  toggleAllowDownload: async (id: number, allowDownload: number) => {
    try {
      const res = await apiClient.put(`/files/${id}`, { allowDownload });
      return res.data;
    } catch {
      const res = await apiClient.put(`/admin/files/${id}/allow-download`, { allowDownload });
      return res.data;
    }
  },

  updateAllowDownload: async (id: number, allowDownload: number) => {
    try {
      const res = await apiClient.put(`/files/${id}`, { allowDownload });
      return res.data;
    } catch {
      const res = await apiClient.put(`/admin/files/${id}/allow-download`, { allowDownload });
      return res.data;
    }
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

      // 处理返回的文件列表，为相对路径添加公共路径前缀
      const normalizedList = Array.isArray(list) ? list.map((file: any) => {
        if (file.fileUrl && !file.fileUrl.startsWith('http')) {
          file.fileUrl = resolveImageUrl(file.fileUrl);
        }
        if (file.coverImage && !file.coverImage.startsWith('http')) {
          file.coverImage = resolveImageUrl(file.coverImage);
        }
        // 后端 FileVO 只有 originalName，映射到前端的 title 和 fileName
        const originalName = file.originalName || file.original_name || file.fileName || file.title || '';
        file.title = file.title || originalName;
        file.fileName = file.fileName || originalName;
        // 后端 fileSize 是字节数(Long)，映射为前端字符串；fileType 是整数(0-5)，映射为字符串
        file.fileSize = file.fileSize !== undefined && typeof file.fileSize !== 'string' ? formatBytesToString(file.fileSize) : (file.fileSize || '');
        file.fileType = file.fileType !== undefined && typeof file.fileType !== 'string' ? mapFileTypeToString(file.fileType) : (file.fileType || '');
        return file;
      }) : [];

      return normalizedList;
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
  },

  // 11.4 POST /file-comments/{id}/like
  likeComment: async (id: number) => {
    const res = await apiClient.post(`/file-comments/${id}/like`);
    return res.data;
  },

  // 11.5 DELETE /file-comments/{id}/like
  unlikeComment: async (id: number) => {
    const res = await apiClient.delete(`/file-comments/${id}/like`);
    return res.data;
  },

  // 24.1 GET /files/{id}/likes - 点赞该文件的用户列表
  getFileLikes: async (id: number) => {
    try {
      const res = await apiClient.get(`/files/${id}/likes`);
      const result = res.data;
      const data = result?.data ?? result;
      return Array.isArray(data) ? data : (data?.list || []);
    } catch {
      return [];
    }
  },

  // 24.2 GET /files/{id}/favorites - 收藏该文件的用户列表
  getFileFavorites: async (id: number) => {
    try {
      const res = await apiClient.get(`/files/${id}/favorites`);
      const result = res.data;
      const data = result?.data ?? result;
      return Array.isArray(data) ? data : (data?.list || []);
    } catch {
      return [];
    }
  },

  // 24.3 GET /files/{id}/duplicates - 既点赞又收藏该文件的用户列表
  getFileDuplicates: async (id: number) => {
    try {
      const res = await apiClient.get(`/files/${id}/duplicates`);
      const result = res.data;
      const data = result?.data ?? result;
      return Array.isArray(data) ? data : (data?.list || []);
    } catch {
      return [];
    }
  }
};
