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
    
    // 处理业务错误码：40001（参数错误）、40100（未登录或token失效）
    if (resData && (resData.code === 40001 || resData.code === 40100)) {
      // 未登录或token失效，清除token并跳转登录页
      if (resData.message?.includes('未登录') || resData.message?.includes('登录已过期') || resData.message?.includes('token') || resData.code === 40100) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 跳转到登录页
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(new Error(resData.message || '登录已过期，请重新登录'));
      }
    }
    
    // 处理40900（资源冲突，如重复关注）
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
    
    // 处理业务错误码
    if (resData) {
      // 40001 或 40100：未登录或token失效
      if (resData.code === 40001 || resData.code === 40100) {
        if (resData.message?.includes('未登录') || resData.message?.includes('登录已过期') || resData.message?.includes('token') || resData.code === 40100) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // 跳转到登录页
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
          
          return Promise.reject(new Error(resData.message || '登录已过期，请重新登录'));
        }
      }
      
      // 40900：资源冲突（重复关注等）
      if (resData.code === 40900 || resData.message?.includes('已关注')) {
        window.dispatchEvent(new CustomEvent('show-notice', {
          detail: {
            title: '关注提示',
            message: resData.message || '已关注该用户，请勿重复关注',
            code: resData.code || 40900,
          },
        }));
      }
    }
    
    // HTTP 401状态码：未认证
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 跳转到登录页
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
