import { apiClient } from './client';
import { resolveImageUrl } from '../config/env';

/**
 * 内容聚合模块
 * 
 * API文档说明：
 * - GET /content/feed - 内容广场聚合列表（混合展示文章/视频/文件）
 *   登录态下会优先返回关注用户的内容，未登录显示全站内容
 *   支持参数：type, keyword, sort, page, size
 * 
 * - GET /content/user/{userId} - 用户作品列表（某个用户的全部作品聚合）
 *   支持参数：type, sort, page, size
 */
export const feedApi = {
    /**
     * 内容广场聚合列表
     * 登录态下优先返回关注用户的内容，未登录显示全站内容
     * @param params.type - 内容类型：article/video/file，不传则返回所有类型
     * @param params.keyword - 搜索关键词
     * @param params.sort - 排序：latest/hot/view
     * @param params.page - 页码
     * @param params.size - 每页数量
     */
    getContentFeed: async (params?: { 
        type?: string; 
        keyword?: string; 
        sort?: string; 
        page?: number; 
        size?: number;
    }) => {
        try {
            const res = await apiClient.get('/content/feed', { params });
            const result = res.data;
            const data = result?.data ?? result;
            const list = Array.isArray(data) ? data : data?.list;
            
            // 处理返回的内容列表，为相对路径添加公共路径前缀
            const normalizedList = Array.isArray(list) ? list.map((item: any) => {
                // 处理封面图路径
                if (item.coverImage && !item.coverImage.startsWith('http')) {
                    item.coverImage = resolveImageUrl(item.coverImage);
                }
                // 处理作者头像路径
                if (item.authorAvatar && !item.authorAvatar.startsWith('http')) {
                    item.authorAvatar = resolveImageUrl(item.authorAvatar);
                }
                // 处理分类封面路径
                if (item.categoryCover && !item.categoryCover.startsWith('http')) {
                    item.categoryCover = resolveImageUrl(item.categoryCover);
                }
                // 处理文件路径（如果是文件类型）
                if (item.filePath && !item.filePath.startsWith('http')) {
                    item.filePath = resolveImageUrl(item.filePath);
                }
                return item;
            }) : [];
            
            return { 
                list: normalizedList,
                total: data?.total ?? 0
            };
        } catch (error) {
            console.error('获取内容广场失败:', error);
            return { list: [], total: 0 };
        }
    },

    /**
     * 用户作品列表（某个用户的全部作品聚合）
     * @param userId - 用户ID
     * @param params.type - 内容类型：article/video/file，不传则返回所有类型
     * @param params.sort - 排序：latest/hot/view
     * @param params.page - 页码
     * @param params.size - 每页数量
     */
    getUserWorks: async (userId: number, params?: { 
        type?: string; 
        sort?: string; 
        page?: number; 
        size?: number;
    }) => {
        try {
            const res = await apiClient.get(`/content/user/${userId}`, { params });
            const result = res.data;
            const data = result?.data ?? result;
            const list = Array.isArray(data) ? data : data?.list;
            
            // 处理返回的内容列表，为相对路径添加公共路径前缀
            const normalizedList = Array.isArray(list) ? list.map((item: any) => {
                // 处理封面图路径
                if (item.coverImage && !item.coverImage.startsWith('http')) {
                    item.coverImage = resolveImageUrl(item.coverImage);
                }
                // 处理作者头像路径
                if (item.authorAvatar && !item.authorAvatar.startsWith('http')) {
                    item.authorAvatar = resolveImageUrl(item.authorAvatar);
                }
                // 处理分类封面路径
                if (item.categoryCover && !item.categoryCover.startsWith('http')) {
                    item.categoryCover = resolveImageUrl(item.categoryCover);
                }
                // 处理文件路径（如果是文件类型）
                if (item.filePath && !item.filePath.startsWith('http')) {
                    item.filePath = resolveImageUrl(item.filePath);
                }
                return item;
            }) : [];
            
            return { 
                list: normalizedList,
                total: data?.total ?? 0
            };
        } catch (error) {
            console.error('获取用户作品失败:', error);
            return { list: [], total: 0 };
        }
    },
};
