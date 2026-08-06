import { apiClient } from './client';
import { Report, Appeal, ModerationLog, User, CreatorStats, SystemSettings, FreezeLog } from '../types';

export const adminApi = {
  // 17.1 POST /reports
  submitReport: async (data: { targetType: number; targetId: number; reasonType?: number; reasonDetail?: string; reason?: string; evidenceImages?: string[] }) => {
    const evidenceList = data.evidenceImages || [];
    const res = await apiClient.post('/reports', {
      targetType: Number(data.targetType),
      targetId: Number(data.targetId),
      reasonType: data.reasonType ?? 0,
      reasonDetail: data.reasonDetail || data.reason || '',
      evidenceImages: evidenceList,
      evidence_images: evidenceList,
    });
    return res.data;
  },

  // 17.2 GET /admin/reports
  getAdminReports: async () => {
    try {
      const res = await apiClient.get('/admin/reports');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  getReports: async () => {
    return adminApi.getAdminReports();
  },

  // Users management
  getUsers: async (params?: { keyword?: string; status?: number; role?: number; page?: number; pageSize?: number }) => {
    try {
      const res = await apiClient.get('/admin/users', { params });
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  freezeUser: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/users/${id}/freeze`, { reason });
    return res.data;
  },

  unfreezeUser: async (id: number) => {
    const res = await apiClient.put(`/admin/users/${id}/unfreeze`);
    return res.data;
  },

  // Articles Admin
  hideArticle: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/articles/${id}/hide`, { reason });
    return res.data;
  },

  unhideArticle: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/articles/${id}/unhide`, { reason });
    return res.data;
  },

  deleteArticle: async (id: number) => {
    const res = await apiClient.delete(`/admin/articles/${id}`);
    return res.data;
  },

  // Videos Admin
  hideVideo: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/videos/${id}/hide`, { reason });
    return res.data;
  },

  unhideVideo: async (id: number, reason?: string) => {
    const res = await apiClient.put(`/admin/videos/${id}/unhide`, { reason: reason || '恢复正常' });
    return res.data;
  },

  toggleVideoDownload: async (id: number, allowDownload: number, reason?: string) => {
    const res = await apiClient.put(`/admin/videos/${id}/allow-download`, { allowDownload, reason });
    return res.data;
  },

  deleteVideo: async (id: number) => {
    const res = await apiClient.delete(`/admin/videos/${id}`);
    return res.data;
  },

  // Files Admin
  hideFile: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/files/${id}/hide`, { reason });
    return res.data;
  },

  unhideFile: async (id: number, reason?: string) => {
    const res = await apiClient.put(`/admin/files/${id}/unhide`, { reason: reason || '恢复正常' });
    return res.data;
  },

  toggleFileDownload: async (id: number, allowDownload: number, reason?: string) => {
    const res = await apiClient.put(`/admin/files/${id}/allow-download`, { allowDownload, reason });
    return res.data;
  },

  deleteFile: async (id: number) => {
    const res = await apiClient.delete(`/admin/files/${id}`);
    return res.data;
  },

  // Video Comments Admin
  getVideoComments: async (params?: any) => {
    try {
      const res = await apiClient.get('/admin/video-comments', { params });
      const result = res.data;
      const data = result?.data ?? result;
      return data && typeof data === 'object' && 'list' in data ? data : { total: 0, list: [] };
    } catch {
      return { total: 0, list: [] };
    }
  },

  hideVideoComment: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/video-comments/${id}/hide`, { reason });
    return res.data;
  },

  unhideVideoComment: async (id: number, reason?: string) => {
    const res = await apiClient.put(`/admin/video-comments/${id}/unhide`, { reason: reason || '恢复正常' });
    return res.data;
  },

  // File Comments Admin
  getFileComments: async (params?: any) => {
    try {
      const res = await apiClient.get('/admin/file-comments', { params });
      const result = res.data;
      const data = result?.data ?? result;
      return data && typeof data === 'object' && 'list' in data ? data : { total: 0, list: [] };
    } catch {
      return { total: 0, list: [] };
    }
  },

  hideFileComment: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/file-comments/${id}/hide`, { reason });
    return res.data;
  },

  unhideFileComment: async (id: number, reason?: string) => {
    const res = await apiClient.put(`/admin/file-comments/${id}/unhide`, { reason: reason || '恢复正常' });
    return res.data;
  },

  // Appeals Admin
  getAppeals: async () => {
    try {
      const res = await apiClient.get('/admin/appeals');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // Freeze Logs
  getFreezeLogs: async (userId?: number) => {
    if (userId === undefined) {
      return [];
    }
    try {
      const res = await apiClient.get(`/admin/users/${userId}/freeze-logs`);
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // Categories CRUD
  createCategory: async (data: { name: string; sortOrder?: number; description?: string; coverImage?: string }) => {
    const res = await apiClient.post('/admin/article-categories', data);
    return res.data;
  },

  updateCategory: async (id: number, data: { name: string; sortOrder?: number; description?: string; coverImage?: string }) => {
    const res = await apiClient.put(`/admin/article-categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: number) => {
    const res = await apiClient.delete(`/admin/article-categories/${id}`);
    return res.data;
  },

  deleteArticleCategory: async (id: number) => {
    const res = await apiClient.delete(`/admin/article-categories/${id}`);
    return res.data;
  },

  deleteVideoCategory: async (id: number) => {
    const res = await apiClient.delete(`/admin/video-categories/${id}`);
    return res.data;
  },

  deleteFileCategory: async (id: number) => {
    const res = await apiClient.delete(`/admin/file-categories/${id}`);
    return res.data;
  },

  // 17.3 GET /admin/reports/{id}
  getAdminReportById: async (id: number): Promise<Report> => {
    const res = await apiClient.get(`/admin/reports/${id}`);
    return res.data.report || res.data?.data || res.data;
  },

  // 17.4 PUT /admin/reports/{id}/handle
  handleReport: async (id: number, data: { status: number; handleResult: string; hideTarget?: boolean }) => {
    const res = await apiClient.put(`/admin/reports/${id}/handle`, data);
    return res.data;
  },

  // 18.1 POST /appeals
  submitAppeal: async (data: { targetType: number; targetId: number; freezeLogId?: number; moderationLogId?: number; reason: string }) => {
    const res = await apiClient.post('/appeals', data);
    return res.data;
  },

  // 18.2 GET /appeals (My appeals)
  getMyAppeals: async () => {
    try {
      const res = await apiClient.get('/appeals');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 18.3 GET /admin/appeals
  getAdminAppeals: async () => {
    try {
      const res = await apiClient.get('/admin/appeals');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 18.4 GET /admin/appeals/{id}
  getAdminAppealById: async (id: number): Promise<Appeal> => {
    const res = await apiClient.get(`/admin/appeals/${id}`);
    return res.data.appeal || res.data?.data || res.data;
  },

  // 18.5 PUT /admin/appeals/{id}/handle
  handleAppeal: async (id: number, data: { status: number; handleResult: string }) => {
    const res = await apiClient.put(`/admin/appeals/${id}/handle`, data);
    return res.data;
  },

  // 19.1 GET /admin/moderation-logs
  getModerationLogs: async (): Promise<ModerationLog[]> => {
    try {
      const res = await apiClient.get('/admin/moderation-logs');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 19.2 GET /admin/dashboard
  getAdminDashboard: async () => {
    try {
      const res = await apiClient.get('/admin/dashboard');
      const result = res.data;
      return result?.data ?? result;
    } catch {
      return {
        totalUsers: 0,
        frozenUsers: 0,
        totalArticles: 0,
        totalVideos: 0,
        totalFiles: 0,
        pendingReports: 0,
        pendingAppeals: 0,
        recentLogs: []
      };
    }
  },

  getAdminDashboardStats: async () => {
    return adminApi.getAdminDashboard();
  },

  // 20.1 GET /admin/admins
  getAdmins: async () => {
    try {
      const res = await apiClient.get('/admin/admins');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 20.2 POST /admin/admins
  grantAdmin: async (data: { userId: number }) => {
    const res = await apiClient.post('/admin/admins', data);
    return res.data;
  },

  // 20.3 DELETE /admin/admins/{id}
  revokeAdmin: async (id: number) => {
    const res = await apiClient.delete(`/admin/admins/${id}`);
    return res.data;
  },

  // 21.1 POST /uploads/image
  uploadImage: async (formData: FormData): Promise<{ url: string }> => {
    try {
      const res = await apiClient.post('/uploads/image', formData, {
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

  // 24.1 GET /creator/statistics/overview
  getCreatorStats: async (): Promise<CreatorStats> => {
    try {
      const res = await apiClient.get('/creator/statistics/overview');
      const result = res.data;
      return result?.data ?? result;
    } catch {
      return {
        totalViews: 0,
        totalLikes: 0,
        totalFavorites: 0,
        totalFollowers: 0,
        followerGrowth: [],
        contentDistribution: [],
        likesSnapshot: []
      };
    }
  },

  // 24.2 GET /creator/statistics/followers
  getFollowerTrend: async (range: string = '30d'): Promise<{ date: string; newFollowers: number }[]> => {
    try {
      const res = await apiClient.get('/creator/statistics/followers', { params: { range } });
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 24.3 GET /creator/statistics/content
  getContentTrend: async (): Promise<{ date: string; articles: number; videos: number; files: number }[]> => {
    try {
      const res = await apiClient.get('/creator/statistics/content');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 24.4 GET /creator/statistics/favorites
  getFavoriteStats: async (): Promise<{ totalLikes: number; totalFavorites: number }> => {
    try {
      const res = await apiClient.get('/creator/statistics/favorites');
      const result = res.data;
      return result?.data ?? result;
    } catch {
      return { totalLikes: 0, totalFavorites: 0 };
    }
  },

  // 25.1 GET /admin/settings
  getSystemSettings: async (): Promise<SystemSettings> => {
    const res = await apiClient.get('/admin/settings');
    const result = res.data;
    return result?.data ?? result;
  },

  // 25.2 PUT /admin/settings
  updateSystemSettings: async (settings: Partial<SystemSettings>) => {
    const res = await apiClient.put('/admin/settings', settings);
    return res.data;
  }
};
