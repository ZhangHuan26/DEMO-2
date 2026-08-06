import { apiClient } from './client';
import { mockArticles, mockVideos, mockFiles, mockUsers } from './mockData';

/**
 * 全局搜索模块。
 * 对应后端接口：22.1 GET /search（query: keyword/type/page/pageSize）。
 * 原实现位于 adminApi，现按职责拆分到独立模块。
 */
export const searchApi = {
    // 22.1 GET /search
    globalSearch: async (q: string, type?: string) => {
        try {
            const res = await apiClient.get('/search', { params: { keyword: q, type } });
            return res.data;
        } catch {
            const query = q.toLowerCase();
            return {
                articles: mockArticles.filter(a => a.title.toLowerCase().includes(query)),
                videos: mockVideos.filter(v => v.title.toLowerCase().includes(query)),
                files: mockFiles.filter(f => f.title.toLowerCase().includes(query)),
                users: mockUsers.filter(u => u.nickName.toLowerCase().includes(query))
            };
        }
    },
};
