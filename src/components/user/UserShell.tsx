import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Plus, Bell, MessageSquare, User as UserIcon, Bookmark, BarChart3, Settings, LogOut, Folder, ShieldAlert, Compass, Users, ChevronDown, ChevronRight } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { CreateWorkModal } from '../common/CreateWorkModal';
import { NoticeModal } from '../common/NoticeModal';
import { ChatDrawer } from './ChatDrawer';
import { User } from '../../types';
import { resolveImageUrl } from '../../config/env';
import { LegalModal, LegalTab } from '../common/LegalModal';


export const UserShell: React.FC = () => {
  const { user, logout, unreadNotifications, unreadChats } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('terms');

  const openLegal = (tab: LegalTab) => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  // 监听打开聊天的自定义事件
  useEffect(() => {
    const handleOpenChat = (e: CustomEvent<{ user: User }>) => {
      if (e.detail?.user) {
        setChatTargetUser(e.detail.user);
        setIsChatOpen(true);
      }
    };
    
    window.addEventListener('open-chat-with-user' as any, handleOpenChat as any);
    return () => {
      window.removeEventListener('open-chat-with-user' as any, handleOpenChat as any);
    };
  }, []);

  useEffect(() => {
    const handleOpenAuthorModal = (e: CustomEvent<{ userId: number }>) => {
      if (e.detail?.userId) {
        navigate(`/users/${e.detail.userId}`);
      }
    };
    window.addEventListener('open-author-modal' as any, handleOpenAuthorModal as any);
    return () => {
      window.removeEventListener('open-author-modal' as any, handleOpenAuthorModal as any);
    };
  }, [navigate]);

  const navTabs = [
    { label: '探索发现', path: '/' },
    { label: '图文作品', path: '/articles' },
    { label: '视频广场', path: '/videos' },
    { label: '设计资源库', path: '/files' },
    { label: '灵感脉搏', path: '/feed' },
    { label: '创作工坊', path: '/me/works' },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-[#0057FF] selection:text-white">
      {/* Behance Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-[20px] py-3.5 shadow-xs">
        <div className="w-full flex items-center justify-between gap-5">
          {/* Left: Brand Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center group">
              <span className="text-xl font-black tracking-tight text-neutral-900 group-hover:text-[#0057FF] transition-colors">
                LeapLunar04
              </span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-2">
              {navTabs.map((tab) => {
                const active = location.pathname === tab.path || (tab.path === '/' && location.pathname === '/explore');
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`relative px-3.5 py-2 text-sm font-bold transition-colors ${
                      active ? 'text-black font-extrabold' : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {active && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute bottom-[-14px] left-0 right-0 h-[3px] bg-black rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3.5">
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
              {/* Overlay to close menu on click outside */}
              {isUserMenuOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
              )}

              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border transition-all cursor-pointer relative z-40 ${
                  isUserMenuOpen
                    ? 'bg-neutral-100 border-neutral-300 shadow-xs'
                    : 'bg-transparent border-neutral-200/80 hover:bg-neutral-100/80 hover:border-neutral-300'
                }`}
              >
                <div className="relative">
                  <img
                    src={
                      resolveImageUrl(user.avatar) ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                    }
                    alt={user.nickName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <span className="text-xs font-bold text-neutral-800 max-w-[90px] truncate hidden sm:inline-block">
                  {user.nickName}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180 text-neutral-700' : ''
                  }`}
                />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl border border-neutral-200/90 rounded-3xl shadow-2xl shadow-neutral-900/15 p-2 z-50 text-xs overflow-hidden"
                  >
                    {/* User Header Profile Banner */}
                    <div className="p-3.5 bg-gradient-to-br from-neutral-900 via-neutral-900 to-blue-950 text-white rounded-2xl mb-1.5 shadow-xs relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#0057FF]/20 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-center gap-3 relative z-10">
                        <img
                          src={
                            resolveImageUrl(user.avatar) ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                          }
                          alt={user.nickName}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/20 shrink-0 shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-white text-sm truncate">
                              {user.nickName}
                            </span>
                            {(user.role === 1 ||
                              (user.role as unknown) === 'admin' ||
                              (user.role as unknown) === '1') && (
                              <span className="px-1.5 py-0.2 bg-amber-400 text-neutral-950 font-black text-[9px] rounded-md tracking-wider uppercase">
                                管理员
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-300 truncate font-mono mt-0.5">
                            {user.email || `@${user.username || user.nickName}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="space-y-0.5 py-1">
                      <Link
                        to="/me/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="px-3 py-2 hover:bg-neutral-100/80 text-neutral-700 hover:text-neutral-900 rounded-xl flex items-center justify-between transition-all font-bold group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-blue-50 text-[#0057FF] rounded-lg group-hover:scale-105 transition-transform">
                            <UserIcon className="w-3.5 h-3.5" />
                          </div>
                          <span>个人信息与档案</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        to="/discover-friends"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="px-3 py-2 hover:bg-neutral-100/80 text-neutral-700 hover:text-neutral-900 rounded-xl flex items-center justify-between transition-all font-bold group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-105 transition-transform">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <span>发现与寻找好友</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        to="/me/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="px-3 py-2 hover:bg-neutral-100/80 text-neutral-700 hover:text-neutral-900 rounded-xl flex items-center justify-between transition-all font-bold group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-105 transition-transform">
                            <Bookmark className="w-3.5 h-3.5" />
                          </div>
                          <span>我的收藏灵感</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        to="/creator"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="px-3 py-2 hover:bg-neutral-100/80 text-neutral-700 hover:text-neutral-900 rounded-xl flex items-center justify-between transition-all font-bold group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform">
                            <BarChart3 className="w-3.5 h-3.5" />
                          </div>
                          <span>创作者数据中心</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        to="/me/files"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="px-3 py-2 hover:bg-neutral-100/80 text-neutral-700 hover:text-neutral-900 rounded-xl flex items-center justify-between transition-all font-bold group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-105 transition-transform">
                            <Folder className="w-3.5 h-3.5" />
                          </div>
                          <span>我的云端文件</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        to="/me/appeals"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="px-3 py-2 hover:bg-neutral-100/80 text-neutral-700 hover:text-neutral-900 rounded-xl flex items-center justify-between transition-all font-bold group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg group-hover:scale-105 transition-transform">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                          <span>服务申诉记录</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      {(user.role === 1 ||
                        (user.role as unknown) === 'admin' ||
                        (user.role as unknown) === '1') && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="px-3 py-2 hover:bg-amber-500/10 text-amber-800 rounded-xl flex items-center justify-between transition-all font-bold group cursor-pointer border border-amber-200/60 bg-amber-50/40 my-0.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg group-hover:scale-105 transition-transform">
                              <Compass className="w-3.5 h-3.5" />
                            </div>
                            <span>管理后台控制中心</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      )}

                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="px-3 py-2 hover:bg-neutral-100/80 text-neutral-700 hover:text-neutral-900 rounded-xl flex items-center justify-between transition-all font-bold group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-neutral-100 text-neutral-600 rounded-lg group-hover:scale-105 transition-transform">
                            <Settings className="w-3.5 h-3.5" />
                          </div>
                          <span>账号与安全设置</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>

                    <div className="pt-1.5 mt-1 border-t border-neutral-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full px-3 py-2 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-xl font-bold text-left flex items-center justify-between transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-rose-100/60 text-rose-600 rounded-lg group-hover:scale-105 transition-transform">
                            <LogOut className="w-3.5 h-3.5" />
                          </div>
                          <span>退出登录</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-rose-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
      <footer className="border-t border-neutral-200 bg-neutral-50 px-6 py-6 text-center text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 LeapLunar04 创意设计与作品分享社区。版权所有，保留所有权利。</p>
        <div className="flex items-center gap-6 text-neutral-600 font-medium">
          <button onClick={() => openLegal('terms')} className="hover:text-black transition-colors cursor-pointer">使用条款</button>
          <button onClick={() => openLegal('cookies')} className="hover:text-black transition-colors cursor-pointer">Cookie 偏好设置</button>
          <button onClick={() => openLegal('privacy')} className="hover:text-black transition-colors cursor-pointer">隐私政策</button>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <NoticeModal />
      <CreateWorkModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} targetUser={chatTargetUser} />
      <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} defaultTab={legalTab} />
    </div>
  );
};
