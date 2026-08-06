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
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthenticated, clear token if expired
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
