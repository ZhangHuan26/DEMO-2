import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Users, FileText, Video, Folder, Flag, MessageSquare, ArrowRight } from 'lucide-react';
import { adminApi } from '../../api/admin';

export const AdminDashboardHome: React.FC = () => {
  const [stats, setStats] = useState<{
    totalUsers: number;
    frozenUsers: number;
    totalArticles: number;
    totalVideos: number;
    totalFiles: number;
    pendingReports: number;
    pendingAppeals: number;
  }>({
    totalUsers: 0,
    frozenUsers: 0,
    totalArticles: 0,
    totalVideos: 0,
    totalFiles: 0,
    pendingReports: 0,
    pendingAppeals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getAdminDashboardStats();
        setStats(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="text-sm text-neutral-500 py-10">正在加载控制台数据...</div>;
  }

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-[#0057FF]" />
          系统控制台概览
        </h1>
        <p className="text-sm text-neutral-500 mt-1">系统全量资产统计与实时违规风控监控中心</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 space-y-3 shadow-xs hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between text-neutral-600 text-sm font-bold">
            <span>注册用户总量</span>
            <Users className="w-5 h-5 text-[#0057FF]" />
          </div>
          <div className="text-3xl font-black text-neutral-900 font-mono">{stats.totalUsers || 0}</div>
          <div className="text-xs text-rose-600 font-medium">其中已封禁: {stats.frozenUsers || 0} 人</div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 space-y-3 shadow-xs hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between text-neutral-600 text-sm font-bold">
            <span>待处理违规举报</span>
            <Flag className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono">{stats.pendingReports || 0}</div>
          <Link to="/admin/reports" className="text-xs text-[#0057FF] font-bold hover:underline flex items-center gap-1">
            立即审核 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 space-y-3 shadow-xs hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between text-neutral-600 text-sm font-bold">
            <span>待复核申诉单</span>
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono">{stats.pendingAppeals || 0}</div>
          <Link to="/admin/appeals" className="text-xs text-[#0057FF] font-bold hover:underline flex items-center gap-1">
            审理申诉 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 space-y-3 shadow-xs hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between text-neutral-600 text-sm font-bold">
            <span>全站作品与资源</span>
            <Folder className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-neutral-900 font-mono">
            {(stats.totalArticles || 0) + (stats.totalVideos || 0) + (stats.totalFiles || 0)}
          </div>
          <div className="text-xs text-neutral-500 font-mono">
            图文:{stats.totalArticles || 0} | 视频:{stats.totalVideos || 0} | 资源:{stats.totalFiles || 0}
          </div>
        </div>
      </div>

      {/* Quick Access Matrix */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">快捷管理通道</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/users" className="p-5 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl border border-neutral-200/80 transition-all block group">
            <Users className="w-6 h-6 text-[#0057FF] mb-2 group-hover:scale-105 transition-transform" />
            <div className="font-bold text-sm text-neutral-900">用户封禁与解封</div>
            <div className="text-xs text-neutral-500 mt-1">设置1-30天或永久封禁，解封操作</div>
          </Link>
          <Link to="/admin/articles" className="p-5 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl border border-neutral-200/80 transition-all block group">
            <FileText className="w-6 h-6 text-[#0057FF] mb-2 group-hover:scale-105 transition-transform" />
            <div className="font-bold text-sm text-neutral-900">作品置顶与软删除</div>
            <div className="text-xs text-neutral-500 mt-1">管理首页精选置顶及违规下架</div>
          </Link>
          <Link to="/admin/files" className="p-5 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl border border-neutral-200/80 transition-all block group">
            <Folder className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-105 transition-transform" />
            <div className="font-bold text-sm text-neutral-900">资源下载权限控制</div>
            <div className="text-xs text-neutral-500 mt-1">一键开关 `allow_download` 保护安全</div>
          </Link>
        </div>
      </div>
    </div>
  );
};
