import { apiClient } from './client';
import { PRESET_IMAGES } from '../config/presets';

export interface CategoryItem {
  id: number;
  name: string;
  description?: string;
  coverImage?: string;
  sortOrder?: number;
  articleCount?: number;
  fileCount?: number;
  videoCount?: number;
  type?: 'article' | 'file' | 'video';
}

export interface AllCategoriesData {
  articles: CategoryItem[];
  files: CategoryItem[];
  videos: CategoryItem[];
}

export const categoriesApi = {
  // GET /categories/all
  getAllCategories: async (): Promise<AllCategoriesData> => {
    try {
      const res = await apiClient.get('/categories/all');
      const data = res.data?.data || res.data;
      return {
        articles: Array.isArray(data?.articles) ? data.articles : [],
        files: Array.isArray(data?.files) ? data.files : [],
        videos: Array.isArray(data?.videos) ? data.videos : [],
      };
    } catch {
      // Fallback mock categories with rich cover images
      return {
        articles: [
          { id: 1, name: 'UI/UX 设计', description: '界面与交互设计', coverImage: PRESET_IMAGES[0], sortOrder: 1, articleCount: 42, type: 'article' },
          { id: 2, name: '3D 艺术', description: '三维建模与CG渲染', coverImage: PRESET_IMAGES[1], sortOrder: 2, articleCount: 28, type: 'article' },
          { id: 3, name: '平面视觉', description: '品牌与海报设计', coverImage: PRESET_IMAGES[3], sortOrder: 3, articleCount: 35, type: 'article' },
          { id: 4, name: '艺术摄影', description: '灵感与光影写真', coverImage: PRESET_IMAGES[6], sortOrder: 4, articleCount: 19, type: 'article' },
        ],
        files: [
          { id: 10, name: '设计素材包', description: 'PSD与矢量UI组件', coverImage: PRESET_IMAGES[4], sortOrder: 1, fileCount: 50, type: 'file' },
          { id: 11, name: '代码与模板', description: '前端组件与网页源码', coverImage: PRESET_IMAGES[5], sortOrder: 2, fileCount: 24, type: 'file' },
        ],
        videos: [
          { id: 20, name: '动效教程', description: 'AE与视频剪辑实战', coverImage: PRESET_IMAGES[2], sortOrder: 1, videoCount: 19, type: 'video' },
          { id: 21, name: '3D渲染教程', description: 'C4D与Blender进阶', coverImage: PRESET_IMAGES[7], sortOrder: 2, videoCount: 15, type: 'video' },
        ],
      };
    }
  },
};
