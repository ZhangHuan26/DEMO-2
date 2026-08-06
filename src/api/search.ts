import { apiClient } from './client';

/**
 * 全局搜索模块。
 * 对应后端接口：22.1 GET /search（query: keyword/type/page/pageSize）。
 */
export const searchApi = {
    // 22.1 GET /search
    globalSearch: async (q: string, type?: string) => {
        try {
            const res = await apiClient.get('/search', { params: { keyword: q, type } });
            return res.data;
        } catch {
            return {
                articles: [],
                videos: [],
                files: [],
                users: []
            };
        }
    },
};
