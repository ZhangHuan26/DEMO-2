import { apiClient } from './client';

/**
 * 上传模块 API
 * 对应后端接口：通用上传接口
 */

export const uploadsApi = {
  /**
   * 上传图片
   * POST /uploads/image
   * 用于头像、封面、文章配图等
   */
  uploadImage: async (file: File | Blob, scene?: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (scene) {
      formData.append('scene', scene);
    }

    try {
      const res = await apiClient.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data?.data || res.data;
      if (data && data.url) return { url: data.url };
      if (typeof data === 'string') return { url: data };
      return res.data;
    } catch (error) {
      console.error('Image upload failed:', error);
      // 降级方案：使用本地 URL
      return { url: URL.createObjectURL(file) };
    }
  },

  /**
   * 上传视频
   * POST /uploads/video
   */
  uploadVideo: async (file: File | Blob): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/uploads/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data?.data || res.data;
      if (data && data.url) return { url: data.url };
      if (typeof data === 'string') return { url: data };
      return res.data;
    } catch (error) {
      console.error('Video upload failed:', error);
      // 降级方案：使用本地 URL
      if (file instanceof File) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({ url: reader.result as string });
          };
          reader.onerror = () => {
            resolve({ url: URL.createObjectURL(file) });
          };
          reader.readAsDataURL(file);
        });
      }
      return { url: URL.createObjectURL(file) };
    }
  },

  /**
   * 上传通用文件
   * POST /uploads/file
   */
  uploadFile: async (file: File | Blob): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/uploads/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data?.data || res.data;
      if (data && data.url) return { url: data.url };
      if (typeof data === 'string') return { url: data };
      return res.data;
    } catch (error) {
      console.error('File upload failed:', error);
      // 降级方案：使用本地 URL
      return { url: URL.createObjectURL(file) };
    }
  }
};
