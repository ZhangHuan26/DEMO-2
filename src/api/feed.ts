import { apiClient } from './client';
import { Article, Video, FileItem } from '../types';
import { mockArticles, mockVideos, mockFiles } from './mockData';

export type FeedType = 'article' | 'video' | 'file';

/**
 * 关注动态模块。
 * 对应后端接口：GET /feed（v3 泛化，支持 type 参数切换文章/视频/文件三类关注动态）。
 * GET /articles/feed 保留作为 type=article 时的等价别名，兼容旧调用。
 */
export const feedApi = {
    /**
     * 获取关注动态（按 type 切换）。
     * @param type article(默认)/video/file
     * @param params 分页参数
     */
    getFeed: async (type: FeedType = 'article', params?: { page?: number; pageSize?: number }) => {
        try {
            const res = await apiClient.get('/feed', { params: { type, ...params } });
            // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
            const result = res.data;
            const data = result?.data ?? result;
            const list = Array.isArray(data) ? data : data?.list;
            return Array.isArray(list) ? list : [];
        } catch {
            // 网络异常时回退到本地 mock 数据
            if (type === 'video') return mockVideos;
            if (type === 'file') return mockFiles;
            return mockArticles;
        }
    },

    /**
     * 获取关注动态文章（等价于 GET /feed?type=article，兼容旧调用）。
     */
    getFeedArticles: async (): Promise<Article[]> => {
        try {
            const res = await apiClient.get('/articles/feed');
            const result = res.data;
            const data = result?.data ?? result;
            const list = Array.isArray(data) ? data : data?.list;
            return Array.isArray(list) ? list : [];
        } catch {
            return mockArticles;
        }
    },

    /**
     * 获取关注动态视频（GET /feed?type=video）。
     */
    getFeedVideos: async (): Promise<Video[]> => {
        try {
            const res = await apiClient.get('/feed', { params: { type: 'video' } });
            const result = res.data;
            const data = result?.data ?? result;
            const list = Array.isArray(data) ? data : data?.list;
            return Array.isArray(list) ? list : [];
        } catch {
            return mockVideos;
        }
    },

    /**
     * 获取关注动态文件（GET /feed?type=file）。
     */
    getFeedFiles: async (): Promise<FileItem[]> => {
        try {
            const res = await apiClient.get('/feed', { params: { type: 'file' } });
            const result = res.data;
            const data = result?.data ?? result;
            const list = Array.isArray(data) ? data : data?.list;
            return Array.isArray(list) ? list : [];
        } catch {
            return mockFiles;
        }
    },
};
