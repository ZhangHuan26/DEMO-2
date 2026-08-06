import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { ShieldAlert, Users, FileText, Video, Folder, Flag, MessageSquare, History, Tag, Settings, LogOut, ArrowLeft, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../config/env';

export const AdminShell: React.FC = () => {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = (user?.role as unknown) === 'admin' || user?.role === 1 || (user?.role as unknown) === '1';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-center p-6 text-neutral-900 space-y-4">
        <div className="max-w-md bg-neutral-50 p-8 rounded-3xl border border-neutral-200/80 shadow-xs">
          <ShieldAlert className="w-12 h-12 text-[#0057FF] mx-auto mb-3" />
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">无权限访问 (403)</h2>
          <p className="text-sm text-neutral-500 mt-2">您需要具有超级管理员身份才能进入控制后台。</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-full shadow-md shadow-[#0057FF]/20 cursor-pointer transition-all">
            返回社区首页
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: '控制台概览', path: '/admin', icon: ShieldAlert },
    { label: '用户与封禁管理', path: '/admin/users', icon: Users },
    { label: '图文作品审查', path: '/admin/articles', icon: FileText },
    { label: '视频广场审查', path: '/admin/videos', icon: Video },
    { label: '资源文件控制', path: '/admin/files', icon: Folder },
    { label: '违规举报处理', path: '/admin/reports', icon: Flag },
    { label: '申诉复核队列', path: '/admin/appeals', icon: MessageSquare },
    { label: '审计日志轨迹', path: '/admin/logs', icon: History },
    { label: '分类标签设置', path: '/admin/categories', icon: Tag },
    { label: '后台系统设置', path: '/admin/settings', icon: Settings },
  ];

  const currentItem = menuItems.find((m) => m.path === location.pathname) || menuItems[0];

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-neutral-900 flex flex-col font-sans selection:bg-[#0057FF] selection:text-white">
      {/* Behance-Style Top Navigation Header */}
      <header className="h-16 bg-white border-b border-neutral-200/80 px-6 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-6">
          {/* Logo Badge */}
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-black text-lg tracking-tighter shadow-xs group-hover:bg-[#0057FF] transition-colors">
              Ad
            </div>
            <div>
              <div className="font-extrabold text-sm text-neutral-900 tracking-tight flex items-center gap-1.5">
                管理控制台 <span className="px-2 py-0.5 bg-[#0057FF]/10 text-[#0057FF] text-[10px] font-bold rounded-full font-mono">v2.4</span>
              </div>
              <div className="text-[11px] text-neutral-400 font-medium">Behance Admin Suite</div>
            </div>
          </Link>

          <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-neutral-500">
            <span>系统后台</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            <span className="text-neutral-900 font-extrabold">{currentItem.label}</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-bold rounded-full transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 返回社区大厅
          </Link>

          <div className="relative">
            <button className="p-2.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2 ring-2 ring-white" />
            </button>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
            <img
              src={resolveImageUrl(user?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.nickName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-200"
            />

            <div className="hidden lg:block text-left">
              <div className="text-xs font-extrabold text-neutral-900 line-clamp-1">{user?.nickName || '超级管理员'}</div>
              <div className="text-[10px] text-[#0057FF] font-bold">Admin Privileges</div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="退出登录"
              className="ml-2 p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Left Sidebar */}
      <div className="flex-1 flex w-full mx-auto px-5 py-6 gap-6">
        {/* Left Sidebar Menu */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-3 shadow-2xs sticky top-22">
            <div className="px-3 py-2 text-[11px] font-black text-neutral-400 uppercase tracking-wider font-mono">
              系统功能导航
            </div>
            <nav className="space-y-1 mt-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                      active
                        ? 'bg-[#0057FF] text-white shadow-md shadow-[#0057FF]/25'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Horizontal Menu Bar */}
        <div className="md:hidden w-full overflow-x-auto pb-2 flex gap-2">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  active ? 'bg-[#0057FF] text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
