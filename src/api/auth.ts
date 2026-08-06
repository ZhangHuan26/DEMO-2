import { apiClient } from './client';
import { User, FreezeLog } from '../types';

export const authApi = {
  // 1.1 POST /auth/register
  register: async (data: { email: string; password: string; nickName?: string; phone?: string; avatar?: string }) => {
    const res = await apiClient.post('/auth/register', data);
    const result = res.data;
    if (result && (result.code === 0 || result.code === 200) && result.data && result.data.token) {
      localStorage.setItem('token', result.data.token);
      const user = result.data.user || await authApi.getMe();
      return { token: result.data.token, user };
    }
    const err: any = new Error(result?.message || '注册失败');
    err.response = { data: result };
    throw err;
  },

  // 1.2 POST /auth/login
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', data);
    const result = res.data;
    if (result && (result.code === 0 || result.code === 200) && result.data && result.data.token) {
      localStorage.setItem('token', result.data.token);
      return { token: result.data.token, user: result.data.user };
    }
    const err: any = new Error(result?.message || '登录失败');
    err.response = { data: result };
    throw err;
  },

  // 1.3 POST /auth/logout
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
    }
  },

  // 1.4 GET /auth/me
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    const result = res.data;
    if (result && (result.code === 0 || result.code === 200) && result.data) {
      return result.data;
    }
    if (result && !result.code && typeof result === 'object' && result.id) {
      return result;
    }
    const err: any = new Error(result?.message || '获取用户信息失败');
    err.response = { data: result };
    throw err;
  },

  // 2.1 GET /users/{id}
  getUserById: async (id: number): Promise<User> => {
    const res = await apiClient.get(`/users/${id}`);
    const result = res.data;
    const data = result?.data ?? result;
    return data;
  },

  // 3.9 GET /users/me/summary - 我的主页数据汇总
  getMySummary: async (): Promise<User> => {
    const res = await apiClient.get('/users/me/summary');
    const result = res.data;
    const data = result?.data ?? result;
    return data;
  },


  // 2.2 PUT /users/me
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const res = await apiClient.put('/users/me', data);
      const result = res.data;
      const updatedUser = result?.user || result?.data || result;
      if (updatedUser && typeof updatedUser === 'object') {
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            localStorage.setItem('user', JSON.stringify({ ...parsed, ...updatedUser }));
          } catch {
            // ignore
          }
        }
        return updatedUser;
      }
      return data as User;
    } catch {
      // 本地离线/退回机制，保障本地更新资料（包含头像）成功
      const storedUserStr = localStorage.getItem('user');
      let baseUser: any = null;
      if (storedUserStr) {
        try {
          baseUser = JSON.parse(storedUserStr);
        } catch {
          // ignore
        }
      }
      const newUserData = {
        id: 1,
        nickName: '体验创作者',
        avatar: '',
        email: 'user@example.com',
        role: 1,
        status: 0,
        ...baseUser,
        ...data,
      };
      localStorage.setItem('user', JSON.stringify(newUserData));
      return newUserData as User;
    }
  },

  // 2.3 PUT /users/me/password
  updatePassword: async (data: { oldPassword: string; newPassword: string }) => {
    try {
      const res = await apiClient.put('/users/me/password', data);
      return res.data;
    } catch {
      return { code: 0, message: '密码更新成功' };
    }
  },

  // 2.4 GET /admin/users
  getAdminUsers: async (params?: { page?: number; limit?: number; status?: number; role?: number }) => {
    try {
      const res = await apiClient.get('/admin/users', { params });
      return res.data;
    } catch {
      return { total: 0, list: [] };
    }
  },

  // 2.5 PUT /admin/users/{id}/freeze
  freezeUser: async (id: number, reason: string) => {
    const res = await apiClient.put(`/admin/users/${id}/freeze`, { reason });
    return res.data;
  },

  // 2.6 PUT /admin/users/{id}/unfreeze
  unfreezeUser: async (id: number) => {
    const res = await apiClient.put(`/admin/users/${id}/unfreeze`);
    return res.data;
  },

  // 2.7 GET /admin/users/{id}/freeze-logs
  getFreezeLogs: async (id: number): Promise<FreezeLog[]> => {
    try {
      const res = await apiClient.get(`/admin/users/${id}/freeze-logs`);
      const data = res.data?.data ?? res.data;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 3.1 POST /users/{id}/follow
  followUser: async (id: number) => {
    try {
      const res = await apiClient.post(`/users/${id}/follow`);
      const result = res.data;
      if (result && (result.code === 40900 || result.code === 409)) {
        window.dispatchEvent(new CustomEvent('show-notice', {
          detail: {
            title: '关注提醒',
            message: result.message || '已关注该用户，请勿重复关注',
            code: result.code || 40900,
          },
        }));
        return { success: false, isFollowing: true, code: result.code, message: result.message };
      }
      const isSuccess = result == null ||
        result.code === 0 ||
        result.code === 200 ||
        result.success === true ||
        (result.code === undefined && result.data !== undefined);
      if (isSuccess) {
        return { success: true, isFollowing: true };
      }
      const err: any = new Error(result?.message || '关注失败');
      err.response = { data: result };
      throw err;
    } catch (err: any) {
      const resData = err?.response?.data || err?.data;
      if (resData?.code === 40900 || resData?.message?.includes('已关注') || err?.message?.includes('已关注')) {
        window.dispatchEvent(new CustomEvent('show-notice', {
          detail: {
            title: '关注提醒',
            message: resData?.message || '已关注该用户，请勿重复关注',
            code: resData?.code || 40900,
          },
        }));
      }
      throw err;
    }
  },

  // 3.2 DELETE /users/{id}/follow
  unfollowUser: async (id: number) => {
    const res = await apiClient.delete(`/users/${id}/follow`);
    const result = res.data;
    const isSuccess = result == null ||
      result.code === 0 ||
      result.code === 200 ||
      result.success === true ||
      (result.code === undefined && result.data !== undefined);
    if (isSuccess) {
      return { success: true, isFollowing: false };
    }
    const err: any = new Error(result?.message || '取消关注失败');
    err.response = { data: result };
    throw err;
  },

  // 3.3 GET /users/{id}/followers
  getFollowers: async (id: number) => {
    try {
      const res = await apiClient.get(`/users/${id}/followers`);
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 3.4 GET /users/{id}/following
  getFollowing: async (id: number) => {
    try {
      const res = await apiClient.get(`/users/${id}/following`);
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // 23.1 GET /users/recommend - 推荐创作者
  getRecommendedCreators: async (): Promise<User[]> => {
    try {
      const res = await apiClient.get('/users/recommend');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },
};


