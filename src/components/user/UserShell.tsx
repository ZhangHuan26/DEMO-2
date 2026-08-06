import React, { useState } from 'react';


import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Plus, Bell, MessageSquare, User as UserIcon, Bookmark, BarChart3, Settings, LogOut, Folder, ShieldAlert, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CreateWorkModal } from '../common/CreateWorkModal';
import { ChatDrawer } from './ChatDrawer';
import { User } from '../../types';
import { resolveImageUrl } from '../../config/env';


export const UserShell: React.FC = () => {
  const { user, logout, unreadNotifications, unreadChats } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navTabs = [
    { label: '探索发现', path: '/' },
    { label: '图文作品', path: '/articles' },
    { label: '视频广场', path: '/videos' },
    { label: '设计资源库', path: '/files' },
    { label: '推荐创作者', path: '/creators' },
    { label: '关注动态', path: '/feed' },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-[#0057FF] selection:text-white">
      {/* Behance Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 lg:px-10 py-3.5 shadow-xs">


        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-5 w-full">

          {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-7">
          <Link to="/" className="flex items-center gap-1.5 group">
            <div className="bg-black text-white px-3 py-1.5 font-black text-base tracking-tighter rounded-md group-hover:bg-[#0057FF] transition-colors">
              Leap
            </div>
            <div className="border-2 border-black text-black px-3 py-1.5 font-bold text-base tracking-tighter rounded-md group-hover:bg-neutral-100 transition-all">
              Lunar04
            </div>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navTabs.map((tab) => {
              const active = location.pathname === tab.path || (tab.path === '/' && location.pathname === '/explore');
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    active
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3.5">
          {/* Create Work Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-sm font-bold rounded-full transition-all flex items-center gap-2 shadow-md shadow-[#0057FF]/20 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>发布新作品</span>
          </button>

          {/* Notifications Bell */}
          <Link
            to="/notifications"
            className="relative p-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black rounded-full transition-colors"
            title="消息通知"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </Link>

          {/* Chat Messenger */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="relative p-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black rounded-full transition-colors cursor-pointer"
            title="私信消息"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadChats > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-[#0057FF] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadChats}
              </span>
            )}
          </button>

          {/* User Avatar & Dropdown Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <img
                  src={resolveImageUrl(user.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt={user.nickName}
                  className="w-9.5 h-9.5 rounded-full object-cover border border-neutral-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                  }}
                />

              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <div className="font-bold text-neutral-900 text-sm truncate">{user.nickName}</div>
                    <div className="text-[10px] text-neutral-500 truncate">{user.email}</div>
                  </div>

                  <div className="py-1">
                    <Link
                      to={`/users/${user.id}`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2 hover:bg-neutral-50 text-neutral-700 hover:text-black flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-[#0057FF]" /> 我的作品与个人主页
                    </Link>
                    <Link
                      to="/me/favorites"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2 hover:bg-neutral-50 text-neutral-700 hover:text-black flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Bookmark className="w-4 h-4 text-amber-500" /> 我的收藏夹
                    </Link>
                    <Link
                      to="/creator"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2 hover:bg-neutral-50 text-neutral-700 hover:text-black flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <BarChart3 className="w-4 h-4 text-emerald-500" /> 创作者数据中心
                    </Link>
                    <Link
                      to="/me/files"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2 hover:bg-neutral-50 text-neutral-700 hover:text-black flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Folder className="w-4 h-4 text-purple-500" /> 我的上传资源
                    </Link>
                    <Link
                      to="/me/appeals"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2 hover:bg-neutral-50 text-neutral-700 hover:text-black flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-500" /> 我的申诉记录
                    </Link>
                    {(user.role === 1 || (user.role as unknown) === 'admin' || (user.role as unknown) === '1') && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="px-4 py-2 hover:bg-amber-50 text-amber-700 font-bold flex items-center gap-2.5 transition-colors"
                      >
                        <Compass className="w-4 h-4 text-amber-600" /> 管理后台中心
                      </Link>
                    )}
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2 hover:bg-neutral-50 text-neutral-700 hover:text-black flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Settings className="w-4 h-4 text-neutral-500" /> 账号与安全设置
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full px-4 py-2 hover:bg-rose-50 text-rose-600 font-medium text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> 退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-full transition-colors"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold rounded-full transition-colors"
              >
                注册账号
              </Link>
            </div>
          )}
        </div>
        </div>
      </header>

      {/* Main Page Container */}
      <main className="flex-1 bg-white">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 px-6 py-8 text-center text-xs text-neutral-500">
        <p>© 2026 LeapLunar04 创意设计与作品分享社区。版权所有，保留所有权利。</p>
      </footer>



      {/* Modals & Drawers */}
      <CreateWorkModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} targetUser={chatTargetUser} />
    </div>
  );
};
