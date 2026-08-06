import { apiClient } from './client';
import { Report, Appeal, ModerationLog, User, CreatorStats, SystemSettings, FreezeLog } from '../types';
import { mockReports, mockAppeals, mockModerationLogs, mockUsers, mockSystemSettings, mockArticles, mockVideos, mockFiles, mockFreezeLogs, mockComments } from './mockData';


export const adminApi = {
  // 17.1 POST /reports

  submitReport: async (data: { targetType: number; targetId: number; reasonType?: number; reasonDetail?: string; reason?: string; evidenceImages?: string[] }) => {
    try {
      const res = await apiClient.post('/reports', {
        targetType: data.targetType,
        targetId: data.targetId,
        reasonType: data.reasonType ?? 0,
        reasonDetail: data.reasonDetail || data.reason || '',
      });
      return res.data;
    } catch {
      const newRep: Report = {
        id: Date.now(),
        reporterId: 1,
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reasonDetail || data.reason || '',
        evidenceImages: data.evidenceImages,
        status: 0,
        createdAt: new Date().toISOString()
      };
      mockReports.unshift(newRep);
      return newRep;
    }
  },

  // 17.2 GET /admin/reports
  getAdminReports: async () => {
    try {
      const res = await apiClient.get('/admin/reports');
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockReports;
    }
  },

  getReports: async () => {
    try {
      const res = await apiClient.get('/admin/reports');
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockReports;
    }
  },

  // Users management (2.4 GET /admin/users, query: keyword/status/role/page/pageSize)
  getUsers: async (params?: { keyword?: string; status?: number; role?: number; page?: number; pageSize?: number }) => {
    try {
      const res = await apiClient.get('/admin/users', { params });
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      let list = [...mockUsers];
      if (params?.keyword) {
        const s = params.keyword.toLowerCase();
        list = list.filter(u => u.nickName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || String(u.id) === s);
      }
      if (params?.status !== undefined) list = list.filter(u => u.status === params.status);
      if (params?.role !== undefined) list = list.filter(u => u.role === params.role);
      return list;
    }
  },

  freezeUser: async (id: number, reason: string) => {
    try {
      const res = await apiClient.put(`/admin/users/${id}/freeze`, { reason });
      return res.data;
    } catch {
      const u = mockUsers.find(user => user.id === id);
      if (u) {
        u.status = 1;
      }
      mockFreezeLogs.unshift({
        id: Date.now(),
        userId: id,
        user: u,
        adminId: 2,
        reason,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    }
  },

  unfreezeUser: async (id: number) => {
    try {
      const res = await apiClient.put(`/admin/users/${id}/unfreeze`);
      return res.data;
    } catch {
      const u = mockUsers.find(user => user.id === id);
      if (u) u.status = 0;
      return { success: true };
    }
  },

  // Articles Admin (5.9/5.10 hide/unhide, 5.6 delete)
  hideArticle: async (id: number, reason: string) => {
    try { const res = await apiClient.put(`/admin/articles/${id}/hide`, { reason }); return res.data; }
    catch {
      const a = mockArticles.find(item => item.id === id);
      if (a) a.isHidden = 1;
      mockModerationLogs.unshift({
        id: Date.now(),
        adminId: 2,
        adminName: 'SystemAdmin',
        targetType: 'article',
        targetId: id,
        action: 'hide',
        reason,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    }
  },
  unhideArticle: async (id: number, reason: string) => {
    try { const res = await apiClient.put(`/admin/articles/${id}/unhide`, { reason }); return res.data; }
    catch {
      const a = mockArticles.find(item => item.id === id);
      if (a) a.isHidden = 0;
      mockModerationLogs.unshift({
        id: Date.now(),
        adminId: 2,
        adminName: 'SystemAdmin',
        targetType: 'article',
        targetId: id,
        action: 'unhide',
        reason,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    }
  },
  deleteArticle: async (id: number) => {
    try { const res = await apiClient.delete(`/admin/articles/${id}`); return res.data; }
    catch { const idx = mockArticles.findIndex(item => item.id === id); if (idx !== -1) mockArticles.splice(idx, 1); return { success: true }; }
  },

  // Videos Admin (13.7/13.8 hide/unhide, 13.9 allow-download, 13.5 delete)
  hideVideo: async (id: number, reason: string) => {
    try { const res = await apiClient.put(`/admin/videos/${id}/hide`, { reason }); return res.data; }
    catch {
      const v = mockVideos.find(item => item.id === id);
      if (v) v.isHidden = 1;
      mockModerationLogs.unshift({
        id: Date.now(),
        adminId: 2,
        adminName: 'SystemAdmin',
        targetType: 'video',
        targetId: id,
        action: 'hide',
        reason,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    }
  },
  unhideVideo: async (id: number, reason: string) => {
    try { const res = await apiClient.put(`/admin/videos/${id}/unhide`, { reason }); return res.data; }
    catch {
      const v = mockVideos.find(item => item.id === id);
      if (v) v.isHidden = 0;
      mockModerationLogs.unshift({
        id: Date.now(),
        adminId: 2,
        adminName: 'SystemAdmin',
        targetType: 'video',
        targetId: id,
        action: 'unhide',
        reason,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    }
  },
  toggleVideoDownload: async (id: number, allowDownload: number, reason?: string) => {
    try { const res = await apiClient.put(`/admin/videos/${id}/allow-download`, { allowDownload, reason }); return res.data; }
    catch {
      const v = mockVideos.find(item => item.id === id);
      if (v) v.allowDownload = allowDownload;
      return { success: true };
    }
  },
  deleteVideo: async (id: number) => {
    try { const res = await apiClient.delete(`/admin/videos/${id}`); return res.data; }
    catch { const idx = mockVideos.findIndex(item => item.id === id); if (idx !== -1) mockVideos.splice(idx, 1); return { success: true }; }
  },

  // Files Admin (9.6 hide, 9.7 allow-download, 9.5 delete)
  hideFile: async (id: number, reason: string) => {
    try { const res = await apiClient.put(`/admin/files/${id}/hide`, { reason }); return res.data; }
    catch {
      const f = mockFiles.find(item => item.id === id);
      if (f) f.isHidden = 1;
      mockModerationLogs.unshift({
        id: Date.now(),
        adminId: 2,
        adminName: 'SystemAdmin',
        targetType: 'file',
        targetId: id,
        action: 'hide',
        reason,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    }
  },
  unhideFile: async (id: number, reason: string) => {
    try { const res = await apiClient.put(`/admin/files/${id}/unhide`, { reason }); return res.data; }
    catch {
      const f = mockFiles.find(item => item.id === id);
      if (f) f.isHidden = 0;
      mockModerationLogs.unshift({
        id: Date.now(),
        adminId: 2,
        adminName: 'SystemAdmin',
        targetType: 'file',
        targetId: id,
        action: 'unhide',
        reason,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    }
  },
  toggleFileDownload: async (id: number, allowDownload: number, reason?: string) => {
    try { const res = await apiClient.put(`/admin/files/${id}/allow-download`, { allowDownload, reason }); return res.data; }
    catch {
      const f = mockFiles.find(item => item.id === id);
      if (f) f.allowDownload = allowDownload;
      return { success: true };
    }
  },
  deleteFile: async (id: number) => {
    try { const res = await apiClient.delete(`/admin/files/${id}`); return res.data; }
    catch { const idx = mockFiles.findIndex(item => item.id === id); if (idx !== -1) mockFiles.splice(idx, 1); return { success: true }; }
  },

  // Appeals Admin
  getAppeals: async () => {
    try {
      const res = await apiClient.get('/admin/appeals');
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    }
    catch { return mockAppeals; }
  },

  // Freeze Logs (2.7 GET /admin/users/{id}/freeze-logs)
  // userId is required by the API; when omitted (global audit view) fall back to mock data.
  getFreezeLogs: async (userId?: number) => {
    if (userId === undefined) {
      return [
        { id: 1, userId: 1001, adminId: 2, reason: 'Inappropriate spam content', createdAt: new Date().toISOString() },
        { id: 2, userId: 1002, adminId: 2, reason: 'Repeated violations', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ];
    }
    try {
      const res = await apiClient.get(`/admin/users/${userId}/freeze-logs`);
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    }
    catch {
      return [
        { id: 1, userId, adminId: 2, reason: 'Inappropriate spam content', createdAt: new Date().toISOString() }
      ];
    }
  },

  // Categories CRUD (4.2/4.3/4.4 article categories)
  createCategory: async (data: { name: string; sortOrder?: number; description?: string; coverImage?: string }) => {
    try { const res = await apiClient.post('/admin/article-categories', data); return res.data; }
    catch { return { id: Date.now(), ...data }; }
  },
  updateCategory: async (id: number, data: { name: string; sortOrder?: number; description?: string; coverImage?: string }) => {
    try { const res = await apiClient.put(`/admin/article-categories/${id}`, data); return res.data; }
    catch { return { id, ...data }; }
  },
  deleteCategory: async (id: number) => {
    try { const res = await apiClient.delete(`/admin/article-categories/${id}`); return res.data; }
    catch { return { success: true }; }
  },

  // 17.3 GET /admin/reports/{id}
  getAdminReportById: async (id: number): Promise<Report> => {
    try {
      const res = await apiClient.get(`/admin/reports/${id}`);
      return res.data.report || res.data;
    } catch {
      return mockReports.find(r => r.id === id) || mockReports[0];
    }
  },

  // 17.4 PUT /admin/reports/{id}/handle
  handleReport: async (id: number, data: { status: number; handleResult: string; hideTarget?: boolean }) => {
    try {
      const res = await apiClient.put(`/admin/reports/${id}/handle`, data);
      return res.data;
    } catch {
      const r = mockReports.find(rep => rep.id === id);
      if (r) {
        r.status = data.status;
        r.handleResult = data.handleResult;
        r.handledAt = new Date().toISOString();

        // 举报属实 -> 触发冻结或隐藏逻辑
        if (data.status === 1) {
          if (r.targetType === 6) {
            // 举报用户 -> 冻结账号并记录 user_freeze_log
            const u = mockUsers.find(user => user.id === r.targetId);
            if (u) {
              u.status = 1;
              u.frozenReason = data.handleResult;
            }
            mockFreezeLogs.unshift({
              id: Date.now(),
              userId: r.targetId,
              user: u,
              adminId: 2,
              reason: data.handleResult,
              reportId: r.id,
              createdAt: new Date().toISOString()
            });
          } else {
            // 举报内容 (0:文章, 1:视频, 2:文件, 3:文章评论, 4:视频评论, 5:文件评论)
            if (r.targetType === 0) {
              const item = mockArticles.find(a => a.id === r.targetId);
              if (item) item.isHidden = 1;
            } else if (r.targetType === 1) {
              const item = mockVideos.find(v => v.id === r.targetId);
              if (item) item.isHidden = 1;
            } else if (r.targetType === 2) {
              const item = mockFiles.find(f => f.id === r.targetId);
              if (item) item.isHidden = 1;
            } else if (r.targetType === 3 || r.targetType === 4 || r.targetType === 5) {
              // 评论隐藏：按 root_id 级联隐藏整棵楼层
              const targetComment = mockComments.find(c => c.id === r.targetId);
              if (targetComment) {
                targetComment.isHidden = 1;
                const rootId = targetComment.rootId || targetComment.id;
                mockComments.forEach(c => {
                  if (c.rootId === rootId || c.id === rootId) {
                    c.isHidden = 1;
                  }
                });
              }
            }

            const targetTypeMap: { [key: number]: 'article' | 'video' | 'file' | 'comment' } = {
              0: 'article', 1: 'video', 2: 'file', 3: 'comment', 4: 'comment', 5: 'comment'
            };
            mockModerationLogs.unshift({
              id: Date.now(),
              adminId: 2,
              adminName: 'SystemAdmin',
              targetType: targetTypeMap[r.targetType] || 'article',
              targetId: r.targetId,
              action: 'hide',
              reason: data.handleResult,
              createdAt: new Date().toISOString()
            });
          }
        }
      }
      return { success: true };
    }
  },

  // 18.1 POST /appeals
  submitAppeal: async (data: { targetType: number; targetId: number; freezeLogId?: number; moderationLogId?: number; reason: string }) => {
    try {
      const res = await apiClient.post('/appeals', data);
      return res.data;
    } catch {
      const newApp: Appeal = {
        id: Date.now(),
        userId: 1,
        targetType: data.targetType,
        targetId: data.targetId,
        freezeLogId: data.freezeLogId,
        moderationLogId: data.moderationLogId,
        reason: data.reason,
        status: 0,
        createdAt: new Date().toISOString()
      };
      mockAppeals.unshift(newApp);
      return newApp;
    }
  },

  // 18.2 GET /appeals (My appeals)
  getMyAppeals: async () => {
    try {
      const res = await apiClient.get('/appeals');
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockAppeals;
    }
  },

  // 18.3 GET /admin/appeals
  getAdminAppeals: async () => {
    try {
      const res = await apiClient.get('/admin/appeals');
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockAppeals;
    }
  },

  // 18.4 GET /admin/appeals/{id}
  getAdminAppealById: async (id: number): Promise<Appeal> => {
    try {
      const res = await apiClient.get(`/admin/appeals/${id}`);
      return res.data.appeal || res.data;
    } catch {
      return mockAppeals.find(a => a.id === id) || mockAppeals[0];
    }
  },

  // 18.5 PUT /admin/appeals/{id}/handle
  handleAppeal: async (id: number, data: { status: number; handleResult: string }) => {
    try {
      const res = await apiClient.put(`/admin/appeals/${id}/handle`, data);
      return res.data;
    } catch {
      const a = mockAppeals.find(app => app.id === id);
      if (a) {
        a.status = data.status;
        a.handleResult = data.handleResult;
        a.handledAt = new Date().toISOString();
      }
      return { success: true };
    }
  },

  // 19.1 GET /admin/moderation-logs
  getModerationLogs: async (): Promise<ModerationLog[]> => {
    try {
      const res = await apiClient.get('/admin/moderation-logs');
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockModerationLogs;
    }
  },

  // 19.2 GET /admin/dashboard
  getAdminDashboard: async () => {
    try {
      const res = await apiClient.get('/admin/dashboard');
      // 后端返回 Result<T>：{ code, data, message }，统计概览在 res.data.data
      const result = res.data;
      return result?.data ?? result;
    } catch {
      return {
        totalUsers: mockUsers.length,
        frozenUsers: mockUsers.filter(u => u.status === 1).length,
        totalArticles: mockArticles.length,
        totalVideos: mockVideos.length,
        totalFiles: mockFiles.length,
        pendingReports: mockReports.filter(r => r.status === 0).length,
        pendingAppeals: mockAppeals.filter(a => a.status === 0).length,
        recentLogs: mockModerationLogs
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
      // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockUsers.filter(u => u.role === 1);
    }
  },

  // 20.2 POST /admin/admins
  grantAdmin: async (data: { userId: number }) => {
    try {
      const res = await apiClient.post('/admin/admins', data);
      return res.data;
    } catch {
      const u = mockUsers.find(user => user.id === data.userId);
      if (u) u.role = 1;
      return { success: true };
    }
  },

  // 20.3 DELETE /admin/admins/{id}
  revokeAdmin: async (id: number) => {
    try {
      const res = await apiClient.delete(`/admin/admins/${id}`);
      return res.data;
    } catch {
      const u = mockUsers.find(user => user.id === id);
      if (u) u.role = 0;
      return { success: true };
    }
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
      return {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'
      };
    }
  },

  // 24.1 GET /creator/statistics/overview

  getCreatorStats: async (): Promise<CreatorStats> => {
    try {
      const res = await apiClient.get('/creator/statistics/overview');
      // 后端返回 Result<T>：{ code, data, message }，统计数据在 res.data.data
      const result = res.data;
      return result?.data ?? result;
    } catch {
      return {
        totalViews: 18450,
        totalLikes: 1268,
        totalFavorites: 632,
        totalFollowers: 1240,
        followerGrowth: [
          { date: '08-01', count: 1190 },
          { date: '08-02', count: 1205 },
          { date: '08-03', count: 1220 },
          { date: '08-04', count: 1232 },
          { date: '08-05', count: 1240 }
        ],
        contentDistribution: [
          { category: 'UI/UX Design', count: 12 },
          { category: '3D Art & CGI', count: 8 },
          { category: 'Motion & Animation', count: 5 }
        ],
        likesSnapshot: [
          { date: '08-01', likes: 210, favorites: 105 },
          { date: '08-02', likes: 280, favorites: 140 },
          { date: '08-03', likes: 350, favorites: 190 },
          { date: '08-04', likes: 420, favorites: 230 }
        ]
      };
    }
  },

  // 24.2 GET /creator/statistics/followers - 粉丝增长趋势
  // 返回 [{ "date": "2026-07-30", "newFollowers": 5 }, ...]
  getFollowerTrend: async (range: string = '30d'): Promise<{ date: string; newFollowers: number }[]> => {
    try {
      const res = await apiClient.get('/creator/statistics/followers', { params: { range } });
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [
        { date: '08-01', newFollowers: 5 },
        { date: '08-02', newFollowers: 8 },
        { date: '08-03', newFollowers: 3 },
        { date: '08-04', newFollowers: 12 },
        { date: '08-05', newFollowers: 7 }
      ];
    }
  },

  // 24.3 GET /creator/statistics/content - 内容产出趋势
  // 基于 article/video/file 各自的 created_at 按天分组统计新增产出数量
  getContentTrend: async (): Promise<{ date: string; articles: number; videos: number; files: number }[]> => {
    try {
      const res = await apiClient.get('/creator/statistics/content');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [
        { date: '08-01', articles: 2, videos: 1, files: 1 },
        { date: '08-02', articles: 1, videos: 2, files: 0 },
        { date: '08-03', articles: 3, videos: 0, files: 2 },
        { date: '08-04', articles: 1, videos: 1, files: 1 },
        { date: '08-05', articles: 2, videos: 2, files: 1 }
      ];
    }
  },

  // 24.4 GET /creator/statistics/favorites - 获赞与收藏统计（当前时刻快照）
  getFavoriteStats: async (): Promise<{ totalLikes: number; totalFavorites: number }> => {
    try {
      const res = await apiClient.get('/creator/statistics/favorites');
      const result = res.data;
      return result?.data ?? result;
    } catch {
      return { totalLikes: 1268, totalFavorites: 632 };
    }
  },


  // 25.1 GET /admin/settings
  getSystemSettings: async (): Promise<SystemSettings> => {
    try {
      const res = await apiClient.get('/admin/settings');
      // 后端返回 Result<T>：{ code, data, message }，设置数据在 res.data.data
      const result = res.data;
      return result?.data ?? result;
    } catch {
      return mockSystemSettings;
    }
  },

  // 25.2 PUT /admin/settings
  updateSystemSettings: async (settings: Partial<SystemSettings>) => {
    try {
      const res = await apiClient.put('/admin/settings', settings);
      return res.data;
    } catch {
      Object.assign(mockSystemSettings, settings);
      return mockSystemSettings;
    }
  }
};
