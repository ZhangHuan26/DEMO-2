import { apiClient } from './client';

/**
 * 举报模块 API
 * 对应后端接口：18. 举报模块
 */

export interface Report {
  id: number;
  reporterId: number;
  reporterName?: string;
  targetType: number; // 1-文章 2-视频 3-文件 4-评论 5-用户
  targetId: number;
  reason: string;
  status: number; // 0-待处理 1-已处理 2-已驳回
  handleResult?: string;
  handledBy?: number;
  handledByName?: string;
  handledAt?: string;
  createdAt: string;
}

export const reportsApi = {
  /**
   * 18.1 提交举报
   * POST /reports
   */
  submitReport: async (data: {
    targetType: number;
    targetId: number;
    reason: string;
  }) => {
    const res = await apiClient.post('/reports', data);
    return res.data;
  },

  /**
   * 18.2 我的举报列表
   * GET /users/me/reports
   */
  getMyReports: async (params?: { page?: number; size?: number }) => {
    try {
      const res = await apiClient.get('/users/me/reports', { params });
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return {
        total: Array.isArray(data) ? data.length : (data?.total ?? (Array.isArray(list) ? list.length : 0)),
        list: Array.isArray(list) ? list : []
      };
    } catch {
      return { total: 0, list: [] };
    }
  },

  /**
   * 18.3 管理员-举报列表
   * GET /admin/reports
   */
  getAdminReports: async (params?: {
    targetType?: number;
    status?: number;
    keyword?: string;
    page?: number;
    size?: number;
  }) => {
    try {
      const res = await apiClient.get('/admin/reports', { params });
      const result = res.data;
      const data = result?.data ?? result;
      return data && typeof data === 'object' && 'list' in data
        ? data
        : { total: 0, list: [] };
    } catch {
      return { total: 0, list: [] };
    }
  },

  /**
   * 18.4 管理员-处理举报
   * PUT /admin/reports/{id}/handle
   */
  handleReport: async (id: number, data: {
    status: number; // 1-已处理 2-已驳回
    handleResult: string;
  }) => {
    const res = await apiClient.put(`/admin/reports/${id}/handle`, data);
    return res.data;
  }
};
