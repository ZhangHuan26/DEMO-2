import { apiClient } from './client';

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
      return {
        articles: [],
        files: [],
        videos: [],
      };
    }
  },

  // DELETE /admin/article-categories/{id}
  deleteArticleCategory: async (id: number) => {
    const res = await apiClient.delete(`/admin/article-categories/${id}`);
    return res.data;
  },

  // DELETE /admin/video-categories/{id}
  deleteVideoCategory: async (id: number) => {
    const res = await apiClient.delete(`/admin/video-categories/${id}`);
    return res.data;
  },

  // DELETE /admin/file-categories/{id}
  deleteFileCategory: async (id: number) => {
    const res = await apiClient.delete(`/admin/file-categories/${id}`);
    return res.data;
  },
};
