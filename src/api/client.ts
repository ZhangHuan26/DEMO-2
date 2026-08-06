import axios from 'axios';
import { LOCAL_SERVER_HOST } from '../config/env';

export const apiClient = axios.create({
  baseURL: LOCAL_SERVER_HOST,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const resData = response.data;
    if (resData && resData.code === 40900) {
      window.dispatchEvent(new CustomEvent('show-notice', {
        detail: {
          title: '关注提示',
          message: resData.message || '已关注该用户，请勿重复关注',
          code: resData.code || 40900,
        },
      }));
    }
    return response;
  },
  (error) => {
    const resData = error.response?.data;
    if (resData && (resData.code === 40900 || resData.message?.includes('已关注'))) {
      window.dispatchEvent(new CustomEvent('show-notice', {
        detail: {
          title: '关注提示',
          message: resData.message || '已关注该用户，请勿重复关注',
          code: resData.code || 40900,
        },
      }));
    }
    if (error.response && error.response.status === 401) {
      // Unauthenticated, clear token if expired
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
