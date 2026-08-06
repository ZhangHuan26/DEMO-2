import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = false,
  requireAdmin = false 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 等待认证状态加载
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#0057FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-neutral-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 需要登录但未登录
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 需要管理员权限但不是管理员
  if (requireAdmin && (!user || (user.role !== 1 && (user.role as unknown) !== 'admin'))) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <div className="text-6xl">🚫</div>
          <h2 className="text-xl font-bold text-neutral-900">无权限访问</h2>
          <p className="text-sm text-neutral-600">您需要管理员权限才能访问此页面</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2.5 bg-[#0057FF] text-white text-sm font-bold rounded-full hover:bg-[#0046CC] transition-colors"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
