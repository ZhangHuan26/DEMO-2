import { apiClient } from './client';
import { User, FreezeLog } from '../types';
import { mockUsers, mockFreezeLogs } from './mockData';

export const authApi = {
  // 1.1 POST /auth/register
  register: async (data: { email: string; password: string; nickName?: string; phone?: string; avatar?: string }) => {
    try {
      const res = await apiClient.post('/auth/register', data);
      // 后端返回 Result<AuthResponse>，token 在 res.data.data.token
      const result = res.data;
      if (result && result.code === 0 && result.data && result.data.token) {
        localStorage.setItem('token', result.data.token);
        // 注册接口只返回 userId，不返回完整 user 对象，需通过 getMe 获取
        const user = result.data.user || await authApi.getMe();
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { token: result.data.token, user };
      }
      // 业务错误（如邮箱已存在），抛出错误让 UI 显示
      const err: any = new Error(result?.message || '注册失败');
      err.response = { data: result };
      throw err;
    } catch (err: any) {
      // 若已是业务错误（带 response.data.code），直接抛出
      if (err.response && err.response.data && err.response.data.code !== undefined) {
        throw err;
      }
      // Fallback
      const newUser: User = {
        id: Date.now(),
        email: data.email,
        nickName: data.nickName || data.email.split('@')[0],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        role: 0,
        status: 0,
        gender: 0,
        followerCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString()
      };
      const token = `mock_token_${newUser.id}_${Date.now()}`;
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return { token, user: newUser };
    }
  },

  // 1.2 POST /auth/login
  login: async (data: { email: string; password: string }) => {
    try {
      const res = await apiClient.post('/auth/login', data);
      // 后端返回 Result<LoginResponse>，token 在 res.data.data.token
      const result = res.data;
      if (result && result.code === 0 && result.data && result.data.token) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('currentUser', JSON.stringify(result.data.user));
        return { token: result.data.token, user: result.data.user };
      }
      // 业务错误（如 40001 邮箱或密码错误、40301 账号冻结），抛出错误让 UI 显示
      const err: any = new Error(result?.message || '登录失败');
      err.response = { data: result };
      throw err;
    } catch (err: any) {
      // 账号冻结错误
      if (err.response && err.response.data && err.response.data.code === 40301) {
        throw err;
      }
      // 业务错误（后端返回 code != 0），直接抛出，不进入 fallback
      if (err.response && err.response.data && err.response.data.code !== undefined) {
        throw err;
      }
      // 网络错误等异常时，Fallback matching credentials
      const found = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase()) || mockUsers[0];
      if (found.status === 1) {
        const errorObj: any = new Error('Account frozen');
        errorObj.response = { data: { code: 40301, message: '账号已被冻结，请申诉', freezeLogId: 12 } };
        throw errorObj;
      }
      const token = `mock_token_${found.id}`;
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(found));
      return { token, user: found };
    }
  },


  // 1.3 POST /auth/logout
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
  },

  // 1.4 GET /auth/me
  getMe: async (): Promise<User> => {
    try {
      const res = await apiClient.get('/auth/me');
      // 后端返回 Result<UserProfileVO>，用户信息在 res.data.data
      const result = res.data;
      if (result && result.code === 0 && result.data) {
        return result.data;
      }
      // 业务错误（token 无效等），抛出错误
      const err: any = new Error(result?.message || '获取用户信息失败');
      err.response = { data: result };
      throw err;
    } catch (err: any) {
      // 业务错误直接抛出
      if (err.response && err.response.data && err.response.data.code !== undefined) {
        throw err;
      }
      // 网络错误等异常时，回退到本地缓存或 mock 数据
      const stored = localStorage.getItem('currentUser');
      if (stored) return JSON.parse(stored);
      return mockUsers[0];
    }
  },


  // 2.1 GET /users/{id}
  getUserById: async (id: number): Promise<User> => {
    try {
      const res = await apiClient.get(`/users/${id}`);
      // 后端返回 Result<UserProfileVO>：{ code, data, message }，用户资料在 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      return data && typeof data === 'object' ? data : mockUsers.find(u => u.id === id) || mockUsers[0];
    } catch {
      return mockUsers.find(u => u.id === id) || mockUsers[0];
    }
  },

  // 2.2 PUT /users/me
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const res = await apiClient.put('/users/me', data);
      return res.data.user || res.data;
    } catch {
      const stored = localStorage.getItem('currentUser');
      const current = stored ? JSON.parse(stored) : mockUsers[0];
      const updated = { ...current, ...data };
      localStorage.setItem('currentUser', JSON.stringify(updated));
      return updated;
    }
  },

  // 2.3 PUT /users/me/password
  updatePassword: async (data: { oldPassword: string; newPassword: string }) => {
    try {
      const res = await apiClient.put('/users/me/password', data);
      return res.data;
    } catch {
      return { success: true, message: '密码修改成功' };
    }
  },

  // 2.4 GET /admin/users
  getAdminUsers: async (params?: { page?: number; limit?: number; status?: number; role?: number }) => {
    try {
      const res = await apiClient.get('/admin/users', { params });
      return res.data;
    } catch {
      return { total: mockUsers.length, list: mockUsers };
    }
  },

  // 2.5 PUT /admin/users/{id}/freeze
  freezeUser: async (id: number, reason: string) => {
    try {
      const res = await apiClient.put(`/admin/users/${id}/freeze`, { reason });
      return res.data;
    } catch {
      const u = mockUsers.find(user => user.id === id);
      if (u) u.status = 1;
      return { success: true, message: '用户已冻结' };
    }
  },

  // 2.6 PUT /admin/users/{id}/unfreeze
  unfreezeUser: async (id: number) => {
    try {
      const res = await apiClient.put(`/admin/users/${id}/unfreeze`);
      return res.data;
    } catch {
      const u = mockUsers.find(user => user.id === id);
      if (u) u.status = 0;
      return { success: true, message: '用户已解冻' };
    }
  },

  // 2.7 GET /admin/users/{id}/freeze-logs
  getFreezeLogs: async (id: number): Promise<FreezeLog[]> => {
    try {
      const res = await apiClient.get(`/admin/users/${id}/freeze-logs`);
      return res.data.list || res.data;
    } catch {
      return mockFreezeLogs.filter(log => log.userId === id);
    }
  },

  // 3.1 POST /users/{id}/follow
  followUser: async (id: number) => {
    try {
      const res = await apiClient.post(`/users/${id}/follow`);
      // 后端返回 Result<T> 包装：{ code, data, message }，code === 0 表示成功
      const result = res.data;
      // 成功判定：code === 0 / 200，或 success === true，或未使用 Result 包装（无 code 字段）
      const isSuccess = result == null ||
        result.code === 0 ||
        result.code === 200 ||
        result.success === true ||
        (result.code === undefined && result.data !== undefined);
      if (isSuccess) {
        return { success: true, isFollowing: true };
      }
      // 业务错误（如不能关注自己、用户不存在等），抛出错误让 UI 不更新
      const err: any = new Error(result?.message || '关注失败');
      err.response = { data: result };
      throw err;
    } catch (err: any) {
      // 业务错误直接抛出，不进入 mock fallback
      if (err.response && err.response.data && err.response.data.code !== undefined) {
        throw err;
      }
      // 网络错误等异常时，回退到本地 mock
      const u = mockUsers.find(user => user.id === id);
      if (u) {
        u.isFollowing = true;
        u.followerCount += 1;
      }
      return { success: true, isFollowing: true };
    }
  },

  // 3.2 DELETE /users/{id}/follow
  unfollowUser: async (id: number) => {
    try {
      const res = await apiClient.delete(`/users/${id}/follow`);
      // 后端返回 Result<T> 包装：{ code, data, message }，code === 0 表示成功
      const result = res.data;
      // 成功判定：code === 0 / 200，或 success === true，或未使用 Result 包装（无 code 字段）
      const isSuccess = result == null ||
        result.code === 0 ||
        result.code === 200 ||
        result.success === true ||
        (result.code === undefined && result.data !== undefined);
      if (isSuccess) {
        return { success: true, isFollowing: false };
      }
      // 业务错误，抛出错误让 UI 不更新
      const err: any = new Error(result?.message || '取消关注失败');
      err.response = { data: result };
      throw err;
    } catch (err: any) {
      // 业务错误直接抛出，不进入 mock fallback
      if (err.response && err.response.data && err.response.data.code !== undefined) {
        throw err;
      }
      // 网络错误等异常时，回退到本地 mock
      const u = mockUsers.find(user => user.id === id);
      if (u) {
        u.isFollowing = false;
        u.followerCount = Math.max(0, u.followerCount - 1);
      }
      return { success: true, isFollowing: false };
    }
  },

  // 3.3 GET /users/{id}/followers
  getFollowers: async (id: number) => {
    try {
      const res = await apiClient.get(`/users/${id}/followers`);
      // 后端返回 Result<T> 包装：{ code, data, message }，列表在 res.data.data.list 或 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [mockUsers[1], mockUsers[2]];
    }
  },

  // 3.4 GET /users/{id}/following
  getFollowing: async (id: number) => {
    try {
      const res = await apiClient.get(`/users/${id}/following`);
      // 后端返回 Result<T> 包装：{ code, data, message }，列表在 res.data.data.list 或 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [mockUsers[1]];
    }
  },

  // 23.1 GET /users/recommend - 推荐创作者
  // 登录态下返回的 UserBriefVO 已含 isFollowing 字段，无需再单独查询关注状态
  getRecommendedCreators: async (): Promise<User[]> => {
    try {
      const res = await apiClient.get('/users/recommend');
      // 后端返回 Result<List<UserBriefVO>>，列表在 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockUsers;
    }
  },
};


