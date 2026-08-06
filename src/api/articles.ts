import { apiClient } from './client';
import { Article, Comment, Category } from '../types';
import { normalizeComment } from '../utils/normalize';

export const articlesApi = {
  // 4.1 GET /article-categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await apiClient.get('/article-categories');
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

  // 4.2 POST /admin/article-categories
  createCategory: async (data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    const res = await apiClient.post('/admin/article-categories', data);
    return res.data;
  },

  // 4.3 PUT /admin/article-categories/{id}
  updateCategory: async (id: number, data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    const res = await apiClient.put(`/admin/article-categories/${id}`, data);
    return res.data;
  },

  // 4.4 DELETE /admin/article-categories/{id}
  deleteCategory: async (id: number) => {
    const res = await apiClient.delete(`/admin/article-categories/${id}`);
    return res.data;
  },

  // 5.1 GET /articles
  getArticles: async (params?: { page?: number; limit?: number; userId?: number; categoryId?: number; search?: string }) => {
    try {
      const { limit, ...rest } = params || {};
      const queryParams: any = { ...rest };
      if (limit !== undefined) queryParams.size = limit;
      const res = await apiClient.get('/articles', { params: queryParams });
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return { total: Array.isArray(data) ? data.length : (data?.total ?? (Array.isArray(list) ? list.length : 0)), list: Array.isArray(list) ? list : [] };
    } catch {
      return { total: 0, list: [] };
    }
  },

  // 5.2 GET /articles/feed
  getFeedArticles: async () => {
    try {
      const res = await apiClient.get('/articles/feed');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 5.3 GET /articles/{id}
  getArticleById: async (id: number): Promise<Article> => {
    const res = await apiClient.get(`/articles/${id}`);
    const result = res.data;
    const data = result?.data ?? result;
    const article = data?.article ?? data;
    return article;
  },

  // 5.4 POST /articles
  createArticle: async (data: { title: string; content: string; summary?: string; coverImage: string; categoryId: number; status?: number }) => {
    const res = await apiClient.post('/articles', data);
    return res.data;
  },

  // 5.5 PUT /articles/{id}
  updateArticle: async (id: number, data: Partial<Article>) => {
    const res = await apiClient.put(`/articles/${id}`, data);
    return res.data;
  },

  // 5.6 DELETE /articles/{id}
  deleteArticle: async (id: number) => {
    const res = await apiClient.delete(`/articles/${id}`);
    return res.data;
  },

  // 5.7 PUT /articles/{id}/status
  updateArticleStatus: async (id: number, status: number) => {
    const res = await apiClient.put(`/articles/${id}/status`, { status });
    return res.data;
  },

  // 5.8 GET /admin/articles
  getAdminArticles: async (params?: any) => {
    try {
      const res = await apiClient.get('/admin/articles', { params });
      const result = res.data;
      const data = result?.data ?? result;
      return data && typeof data === 'object' && 'list' in data ? data : { total: 0, list: [] };
    } catch {
      return { total: 0, list: [] };
    }
  },

  // 5.9 PUT /admin/articles/{id}/hide
  hideArticle: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/articles/${id}/hide`, { reason });
    return res.data;
  },

  // 5.10 PUT /admin/articles/{id}/unhide
  unhideArticle: async (id: number) => {
    const res = await apiClient.put(`/admin/articles/${id}/unhide`);
    return res.data;
  },

  // 6.1 POST /articles/{id}/like
  likeArticle: async (id: number) => {
    const res = await apiClient.post(`/articles/${id}/like`);
    return res.data;
  },

  // 6.2 DELETE /articles/{id}/like
  unlikeArticle: async (id: number) => {
    const res = await apiClient.delete(`/articles/${id}/like`);
    return res.data;
  },

  // 6.3 POST /articles/{id}/favorite
  favoriteArticle: async (id: number) => {
    const res = await apiClient.post(`/articles/${id}/favorite`);
    return res.data;
  },

  // 6.4 DELETE /articles/{id}/favorite
  unfavoriteArticle: async (id: number) => {
    const res = await apiClient.delete(`/articles/${id}/favorite`);
    return res.data;
  },

  // 6.5 GET /users/me/favorite-articles
  getFavoriteArticles: async () => {
    try {
      const res = await apiClient.get('/users/me/favorite-articles');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 7.1 GET /articles/{id}/comments
  getComments: async (articleId: number): Promise<Comment[]> => {
    try {
      const res = await apiClient.get(`/articles/${articleId}/comments`);
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

  // 7.2 POST /articles/{id}/comments
  createComment: async (articleId: number, data: { content: string; rootId?: number; replyToId?: number; parentId?: number }) => {
    const payload: any = { content: data.content };
    if (data.parentId || data.replyToId || data.rootId) {
      payload.parentId = data.parentId ?? data.replyToId ?? data.rootId;
    }
    const res = await apiClient.post(`/articles/${articleId}/comments`, payload);
    const result = res.data;
    const rawObj = result?.data ?? result;
    return normalizeComment(rawObj);
  },

  // 7.3 DELETE /article-comments/{id}
  deleteComment: async (id: number) => {
    const res = await apiClient.delete(`/article-comments/${id}`);
    return res.data;
  },

  // 7.4 POST /article-comments/{id}/like
  likeComment: async (id: number) => {
    const res = await apiClient.post(`/article-comments/${id}/like`);
    return res.data;
  },

  // 7.5 DELETE /article-comments/{id}/like
  unlikeComment: async (id: number) => {
    const res = await apiClient.delete(`/article-comments/${id}/like`);
    return res.data;
  },

  // 7.6 PUT /admin/article-comments/{id}/hide
  hideCommentFloor: async (id: number) => {
    const res = await apiClient.put(`/admin/article-comments/${id}/hide`);
    return res.data;
  },

  // 7.7 PUT /admin/article-comments/{id}/unhide
  unhideCommentFloor: async (id: number) => {
    const res = await apiClient.put(`/admin/article-comments/${id}/unhide`);
    return res.data;
  },

  // 7.8 GET /admin/article-comments
  getAdminComments: async (params?: any) => {
    try {
      const res = await apiClient.get('/admin/article-comments', { params });
      return res.data;
    } catch {
      return { total: 0, list: [] };
    }
  }
};
