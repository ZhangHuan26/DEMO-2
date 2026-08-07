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
            const result = res.data;
            const data = result?.data ?? result;
            // 兼容返回格式：{ code:0, data: { users: [...] } } 或 { users: [...] } 或直接数组
            if (Array.isArray(data)) {
                return { articles: [], videos: [], files: [], users: data };
            }
            return {
                articles: data?.articles?.list ?? data?.articles ?? [],
                videos: data?.videos?.list ?? data?.videos ?? [],
                files: data?.files?.list ?? data?.files ?? [],
                users: data?.users ?? []
            };
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
