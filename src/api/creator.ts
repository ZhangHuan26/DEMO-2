import { apiClient } from './client';

/**
 * 创作者数据统计模块 API
 * 对应后端接口：21. 创作者数据统计模块
 */

export interface CreatorStatsOverview {
  totalArticles: number;
  totalVideos: number;
  totalFiles: number;
  totalWorks: number;
  totalViews: number;
  totalLikes: number;
  totalFavorites: number;
  totalFollowers: number;
}

export interface FollowerGrowth {
  date: string;
  newFollowers: number;
}

export interface ContentTrend {
  date: string;
  articles: number;
  videos: number;
  files: number;
}

export interface FavoriteStats {
  totalLikes: number;
  totalFavorites: number;
}

export const creatorApi = {
  /**
   * 21.1 内容总览
   * GET /creator/statistics/overview
   */
  getOverview: async (): Promise<CreatorStatsOverview> => {
    try {
      const res = await apiClient.get('/creator/statistics/overview');
      const result = res.data;
      return result?.data ?? result;
    } catch (error) {
      console.error('Failed to load creator overview:', error);
      return {
        totalArticles: 0,
        totalVideos: 0,
        totalFiles: 0,
        totalWorks: 0,
        totalViews: 0,
        totalLikes: 0,
        totalFavorites: 0,
        totalFollowers: 0
      };
    }
  },

  /**
   * 21.2 粉丝增长趋势
   * GET /creator/statistics/followers
   */
  getFollowerTrend: async (range: string = '30d'): Promise<FollowerGrowth[]> => {
    try {
      const res = await apiClient.get('/creator/statistics/followers', {
        params: { range }
      });
      const result = res.data;
      const data = result?.data ?? result;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to load follower trend:', error);
      return [];
    }
  },

  /**
   * 21.3 内容产出趋势
   * GET /creator/statistics/content
   */
  getContentTrend: async (): Promise<ContentTrend[]> => {
    try {
      const res = await apiClient.get('/creator/statistics/content');
      const result = res.data;
      const data = result?.data ?? result;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to load content trend:', error);
      return [];
    }
  },

  /**
   * 21.4 获赞与收藏统计
   * GET /creator/statistics/favorites
   */
  getFavoriteStats: async (): Promise<FavoriteStats> => {
    try {
      const res = await apiClient.get('/creator/statistics/favorites');
      const result = res.data;
      return result?.data ?? result;
    } catch (error) {
      console.error('Failed to load favorite stats:', error);
      return {
        totalLikes: 0,
        totalFavorites: 0
      };
    }
  }
};
