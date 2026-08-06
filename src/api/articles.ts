import { apiClient } from './client';
import { Article, Comment, Category } from '../types';
import { mockArticles, mockCategories, mockComments } from './mockData';

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
      return mockCategories.filter(c => c.type === 'article');
    } catch {
      return mockCategories.filter(c => c.type === 'article');
    }
  },

  // 4.2 POST /admin/article-categories
  createCategory: async (data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    try {
      const res = await apiClient.post('/admin/article-categories', data);
      return res.data;
    } catch {
      const newCat: Category = { id: Date.now(), name: data.name, coverImage: data.coverImage, type: 'article', count: 0, sortOrder: data.sortOrder, description: data.description };
      mockCategories.push(newCat);
      return newCat;
    }
  },

  // 4.3 PUT /admin/article-categories/{id}
  updateCategory: async (id: number, data: { name: string; coverImage?: string; sortOrder?: number; description?: string }) => {
    try {
      const res = await apiClient.put(`/admin/article-categories/${id}`, data);
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

  // 4.4 DELETE /admin/article-categories/{id}
  deleteCategory: async (id: number) => {
    try {
      const res = await apiClient.delete(`/admin/article-categories/${id}`);
      return res.data;
    } catch {
      const idx = mockCategories.findIndex(c => c.id === id);
      if (idx !== -1) mockCategories.splice(idx, 1);
      return { success: true };
    }
  },

  // 5.1 GET /articles
  getArticles: async (params?: { page?: number; limit?: number; userId?: number; categoryId?: number; search?: string }) => {
    try {
      // 将前端 limit 映射为后端 size 参数
      const { limit, ...rest } = params || {};
      const queryParams: any = { ...rest };
      if (limit !== undefined) queryParams.size = limit;
      const res = await apiClient.get('/articles', { params: queryParams });
      // 后端返回 Result<T> 包装：{ code, data, message }，列表在 res.data.data.list 或 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return { total: Array.isArray(data) ? data.length : (data?.total ?? (Array.isArray(list) ? list.length : 0)), list: Array.isArray(list) ? list : [] };
    } catch {
      let filtered = [...mockArticles];
      if (params?.userId) {
        filtered = filtered.filter(a => a.userId === Number(params.userId));
      }
      if (params?.categoryId) {
        filtered = filtered.filter(a => a.categoryId === Number(params.categoryId));
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q));
      }
      return { total: filtered.length, list: filtered };
    }
  },



  // 5.2 GET /articles/feed
  getFeedArticles: async () => {
    try {
      const res = await apiClient.get('/articles/feed');
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockArticles;
    }
  },

  // 5.3 GET /articles/{id}
  getArticleById: async (id: number): Promise<Article> => {
    try {
      const res = await apiClient.get(`/articles/${id}`);
      // 后端返回 Result<T> 包装：{ code, data, message }，文章对象在 res.data.data.article 或 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const article = data?.article ?? data;
      return article && typeof article === 'object' && 'title' in article ? article : (mockArticles.find(a => a.id === id) || mockArticles[0]);
    } catch {
      const found = mockArticles.find(a => a.id === id) || mockArticles[0];
      found.viewCount += 1;
      return found;
    }
  },

  // 5.4 POST /articles
  createArticle: async (data: { title: string; content: string; summary?: string; coverImage: string; categoryId: number; status?: number }) => {
    try {
      const res = await apiClient.post('/articles', data);
      return res.data;
    } catch {
      const newArticle: Article = {
        id: Date.now(),
        userId: 1,
        title: data.title,
        content: data.content,
        summary: data.summary || data.content.slice(0, 100),
        coverImage: data.coverImage,
        categoryId: data.categoryId,
        categoryName: mockCategories.find(c => c.id === data.categoryId)?.name || 'General',
        status: data.status ?? 0,
        isHidden: 0,
        viewCount: 1,
        likeCount: 0,
        favoriteCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString()
      };
      mockArticles.unshift(newArticle);
      return newArticle;
    }
  },

  // 5.5 PUT /articles/{id}
  updateArticle: async (id: number, data: Partial<Article>) => {
    try {
      const res = await apiClient.put(`/articles/${id}`, data);
      return res.data;
    } catch {
      const item = mockArticles.find(a => a.id === id);
      if (item) {
        Object.assign(item, data);
      }
      return item;
    }
  },

  // 5.6 DELETE /articles/{id}
  deleteArticle: async (id: number) => {
    try {
      const res = await apiClient.delete(`/articles/${id}`);
      return res.data;
    } catch {
      const idx = mockArticles.findIndex(a => a.id === id);
      if (idx !== -1) mockArticles.splice(idx, 1);
      return { success: true };
    }
  },

  // 5.7 PUT /articles/{id}/status
  updateArticleStatus: async (id: number, status: number) => {
    try {
      const res = await apiClient.put(`/articles/${id}/status`, { status });
      return res.data;
    } catch {
      const item = mockArticles.find(a => a.id === id);
      if (item) item.status = status;
      return item;
    }
  },

  // 5.8 GET /admin/articles
  getAdminArticles: async (params?: any) => {
    try {
      const res = await apiClient.get('/admin/articles', { params });
      // 后端返回 Result<PageResult>：{ code, data, message }，分页数据在 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      return data && typeof data === 'object' && 'list' in data ? data : { total: 0, list: [] };
    } catch {
      return { total: mockArticles.length, list: mockArticles };
    }
  },

  // 5.9 PUT /admin/articles/{id}/hide
  hideArticle: async (id: number, reason: string) => {
    try {
      const res = await apiClient.put(`/admin/articles/${id}/hide`, { reason });
      return res.data;
    } catch {
      const item = mockArticles.find(a => a.id === id);
      if (item) item.isHidden = 1;
      return { success: true };
    }
  },

  // 5.10 PUT /admin/articles/{id}/unhide
  unhideArticle: async (id: number) => {
    try {
      const res = await apiClient.put(`/admin/articles/${id}/unhide`);
      return res.data;
    } catch {
      const item = mockArticles.find(a => a.id === id);
      if (item) item.isHidden = 0;
      return { success: true };
    }
  },

  // 6.1 POST /articles/{id}/like
  likeArticle: async (id: number) => {
    try {
      const res = await apiClient.post(`/articles/${id}/like`);
      return res.data;
    } catch {
      const item = mockArticles.find(a => a.id === id);
      if (item) {
        item.isLiked = true;
        item.likeCount += 1;
      }
      return { isLiked: true, likeCount: item?.likeCount || 1 };
    }
  },

  // 6.2 DELETE /articles/{id}/like
  unlikeArticle: async (id: number) => {
    try {
      const res = await apiClient.delete(`/articles/${id}/like`);
      return res.data;
    } catch {
      const item = mockArticles.find(a => a.id === id);
      if (item) {
        item.isLiked = false;
        item.likeCount = Math.max(0, item.likeCount - 1);
      }
      return { isLiked: false, likeCount: item?.likeCount || 0 };
    }
  },

  // 6.3 POST /articles/{id}/favorite
  favoriteArticle: async (id: number) => {
    try {
      const res = await apiClient.post(`/articles/${id}/favorite`);
      return res.data;
    } catch {
      const item = mockArticles.find(a => a.id === id);
      if (item) {
        item.isFavorited = true;
        item.favoriteCount += 1;
      }
      return { isFavorited: true };
    }
  },

  // 6.4 DELETE /articles/{id}/favorite
  unfavoriteArticle: async (id: number) => {
    try {
      const res = await apiClient.delete(`/articles/${id}/favorite`);
      return res.data;
    } catch {
      const item = mockArticles.find(a => a.id === id);
      if (item) {
        item.isFavorited = false;
        item.favoriteCount = Math.max(0, item.favoriteCount - 1);
      }
      return { isFavorited: false };
    }
  },

  // 6.5 GET /users/me/favorite-articles
  getFavoriteArticles: async () => {
    try {
      const res = await apiClient.get('/users/me/favorite-articles');
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockArticles.filter(a => a.isFavorited);
    }
  },

  // 7.1 GET /articles/{id}/comments
  getComments: async (articleId: number): Promise<Comment[]> => {
    try {
      const res = await apiClient.get(`/articles/${articleId}/comments`);
      // 后端返回 Result<T> 包装：{ code, data, message }，列表在 res.data.data.list 或 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockComments.filter(c => c.targetId === articleId);
    }
  },

  // 7.2 POST /articles/{id}/comments
  createComment: async (articleId: number, data: { content: string; rootId?: number; replyToId?: number }) => {
    try {
      const res = await apiClient.post(`/articles/${articleId}/comments`, data);
      return res.data;
    } catch {
      const newComment: Comment = {
        id: Date.now(),
        targetId: articleId,
        userId: 1,
        content: data.content,
        rootId: data.rootId,
        replyToId: data.replyToId,
        likeCount: 0,
        isHidden: 0,
        createdAt: new Date().toISOString()
      };
      if (data.rootId) {
        const root = mockComments.find(c => c.id === data.rootId);
        if (root) {
          root.children = root.children || [];
          root.children.push(newComment);
        }
      } else {
        mockComments.unshift(newComment);
      }
      return newComment;
    }
  },

  // 7.3 DELETE /article-comments/{id}
  deleteComment: async (id: number) => {
    try {
      const res = await apiClient.delete(`/article-comments/${id}`);
      return res.data;
    } catch {
      const idx = mockComments.findIndex(c => c.id === id);
      if (idx !== -1) mockComments.splice(idx, 1);
      return { success: true };
    }
  },

  // 7.4 POST /article-comments/{id}/like
  likeComment: async (id: number) => {
    try {
      const res = await apiClient.post(`/article-comments/${id}/like`);
      return res.data;
    } catch {
      const c = mockComments.find(com => com.id === id);
      if (c) {
        c.isLiked = true;
        c.likeCount += 1;
      }
      return { success: true };
    }
  },

  // 7.5 DELETE /article-comments/{id}/like
  unlikeComment: async (id: number) => {
    try {
      const res = await apiClient.delete(`/article-comments/${id}/like`);
      return res.data;
    } catch {
      const c = mockComments.find(com => com.id === id);
      if (c) {
        c.isLiked = false;
        c.likeCount = Math.max(0, c.likeCount - 1);
      }
      return { success: true };
    }
  },

  // 7.6 PUT /admin/article-comments/{id}/hide
  hideCommentFloor: async (id: number) => {
    try {
      const res = await apiClient.put(`/admin/article-comments/${id}/hide`);
      return res.data;
    } catch {
      const c = mockComments.find(com => com.id === id);
      if (c) {
        c.isHidden = 1;
        if (c.children) c.children.forEach(ch => ch.isHidden = 1);
      }
      return { success: true };
    }
  },

  // 7.7 PUT /admin/article-comments/{id}/unhide
  unhideCommentFloor: async (id: number) => {
    try {
      const res = await apiClient.put(`/admin/article-comments/${id}/unhide`);
      return res.data;
    } catch {
      const c = mockComments.find(com => com.id === id);
      if (c) {
        c.isHidden = 0;
        if (c.children) c.children.forEach(ch => ch.isHidden = 0);
      }
      return { success: true };
    }
  },

  // 7.8 GET /admin/article-comments
  getAdminComments: async (params?: any) => {
    try {
      const res = await apiClient.get('/admin/article-comments', { params });
      return res.data;
    } catch {
      return { total: mockComments.length, list: mockComments };
    }
  }
};
