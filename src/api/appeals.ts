import { apiClient } from './client';

/**
 * 申诉模块 API
 * 对应后端接口：19. 申诉模块
 */

export interface Appeal {
  id: number;
  userId: number;
  userName?: string;
  appealType: number; // 1-账号冻结 2-内容隐藏
  targetType?: number; // 1-文章 2-视频 3-文件 4-评论
  targetId?: number;
  reason: string;
  status: number; // 0-待处理 1-已通过 2-已驳回
  handleResult?: string;
  handledBy?: number;
  handledByName?: string;
  handledAt?: string;
  createdAt: string;
}

export const appealsApi = {
  /**
   * 19.1 提交申诉
   * POST /appeals
   */
  submitAppeal: async (data: {
    appealType: number;
    targetType?: number;
    targetId?: number;
    reason: string;
  }) => {
    const res = await apiClient.post('/appeals', data);
    return res.data;
  },

  /**
   * 19.2 我的申诉列表
   * GET /users/me/appeals
   */
  getMyAppeals: async (params?: { page?: number; size?: number }) => {
    try {
      const res = await apiClient.get('/users/me/appeals', { params });
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
   * 19.3 管理员-申诉列表
   * GET /admin/appeals
   */
  getAdminAppeals: async (params?: {
    appealType?: number;
    status?: number;
    keyword?: string;
    page?: number;
    size?: number;
  }) => {
    try {
      const res = await apiClient.get('/admin/appeals', { params });
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
   * 19.4 管理员-处理申诉
   * PUT /admin/appeals/{id}/handle
   */
  handleAppeal: async (id: number, data: {
    status: number; // 1-已通过 2-已驳回
    handleResult: string;
  }) => {
    const res = await apiClient.put(`/admin/appeals/${id}/handle`, data);
    return res.data;
  }
};
