import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  Layers, 
  BellRing, 
  ArrowRight
} from 'lucide-react';
import { notificationsApi } from '../../api/notifications';
import { Notification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../config/env';

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

const formatFullDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const NotificationsPage: React.FC = () => {
  const { refreshCounts } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'like' | 'comment' | 'follow' | 'system'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const list = await notificationsApi.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.isRead === 0).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'unread') return n.isRead === 0;
      if (activeTab === 'like') return n.type === 0 || n.type === 4;
      if (activeTab === 'comment') return n.type === 1 || n.type === 2;
      if (activeTab === 'follow') return n.type === 3;
      if (activeTab === 'system') return n.type !== 0 && n.type !== 1 && n.type !== 2 && n.type !== 3 && n.type !== 4;
      return true;
    });
  }, [notifications, activeTab]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
      await refreshCounts();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n)));
      await refreshCounts();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await refreshCounts();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationBadge = (type: number) => {
    switch (type) {
      case 0:
      case 4:
        return {
          icon: Heart,
          label: '赞与收藏',
          bg: 'bg-rose-50 text-rose-600 border-rose-200/80',
          iconColor: 'text-rose-500 fill-rose-500',
        };
      case 1:
      case 2:
        return {
          icon: MessageSquare,
          label: '评论互动',
          bg: 'bg-blue-50 text-[#0057FF] border-blue-200/80',
          iconColor: 'text-[#0057FF]',
        };
      case 3:
        return {
          icon: UserPlus,
          label: '新增关注',
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
          iconColor: 'text-emerald-500',
        };
      default:
        return {
          icon: ShieldAlert,
          label: '系统通知',
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          iconColor: 'text-amber-500',
        };
    }
  };

  const handleOpenAuthor = (userId?: number) => {
    if (userId) {
      const event = new CustomEvent('open-author-modal', { detail: { userId } });
      window.dispatchEvent(event);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white min-h-screen pb-24 font-sans"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-neutral-900 via-neutral-900 to-blue-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#0057FF] text-white text-[10px] font-extrabold uppercase rounded tracking-wider flex items-center gap-1.5 shadow-xs">
                <Bell className="w-3 h-3 text-white" /> Notification Center
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {unreadCount} 条未读
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-[#0057FF]" />
              消息通知中心
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed">
              实时接收社区创作者的点赞、评论、关注与系统重要通知
            </p>
          </div>

          {notifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold rounded-2xl border border-white/20 transition-all cursor-pointer backdrop-blur-md shadow-xs shrink-0"
            >
              <CheckCheck className="w-4 h-4 text-blue-400" />
              全部标记已读
            </button>
          )}
        </div>

        {/* Filter Switcher Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-neutral-100/80 rounded-2xl border border-neutral-200/80 overflow-x-auto text-xs font-bold scrollbar-none">
          {[
            { id: 'all', label: '全部', icon: Layers, count: notifications.length },
            { id: 'unread', label: '未读', icon: BellRing, count: unreadCount },
            { id: 'like', label: '赞与收藏', icon: Heart },
            { id: 'comment', label: '评论', icon: MessageSquare },
            { id: 'follow', label: '新增关注', icon: UserPlus },
            { id: 'system', label: '系统通知', icon: ShieldAlert },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative z-10 px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  isActive ? 'text-white font-extrabold' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNotifTab"
                    className="absolute inset-0 bg-neutral-900 rounded-xl -z-10 shadow-xs"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#0057FF]' : ''}`} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.id === 'unread'
                        ? 'bg-rose-500 text-white'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification Cards Stream */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-5 animate-pulse flex items-center gap-4"
              >
                <div className="w-11 h-11 bg-neutral-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  <div className="h-3 bg-neutral-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center space-y-4 bg-neutral-50 rounded-3xl border border-neutral-200"
          >
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <Bell className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-800">
                {activeTab === 'unread' ? '太棒了，暂无未读消息！' : '暂无消息通知'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {activeTab === 'all'
                  ? '当有人与您的作品互动或关注您时，通知将显示在这里。'
                  : '切换分类标签以查看更多历史通知记录。'}
              </p>
            </div>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center gap-1.5 text-xs text-[#0057FF] font-bold hover:underline cursor-pointer pt-2"
              >
                查看全部通知 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((item) => {
                const badge = getNotificationBadge(item.type);
                const BadgeIcon = badge.icon;
                const isUnread = item.isRead === 0;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 flex items-start justify-between gap-4 relative group ${
                      isUnread
                        ? 'bg-blue-50/30 border-blue-200/90 shadow-2xs hover:border-blue-300'
                        : 'bg-white border-neutral-200/90 hover:border-neutral-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Sender Avatar or Icon */}
                      <div className="relative shrink-0 pt-0.5">
                        {item.sender ? (
                          <button
                            onClick={() => handleOpenAuthor(item.sender?.id)}
                            className="cursor-pointer group/avatar relative block"
                            title={item.sender.nickName || item.sender.username}
                          >
                            <img
                              src={
                                resolveImageUrl(item.sender.avatar) ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                              }
                              alt={item.sender.nickName || item.sender.username}
                              className="w-11 h-11 rounded-full object-cover border-2 border-white ring-2 ring-neutral-200 group-hover/avatar:ring-[#0057FF] shadow-2xs transition-all"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                              }}
                            />
                            <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-white border border-neutral-100 shadow-2xs`}>
                              <BadgeIcon className={`w-3 h-3 ${badge.iconColor}`} />
                            </div>
                          </button>
                        ) : (
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${badge.bg}`}>
                            <BadgeIcon className={`w-5 h-5 ${badge.iconColor}`} />
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.sender && (
                            <button
                              onClick={() => handleOpenAuthor(item.sender?.id)}
                              className="font-bold text-neutral-900 hover:text-[#0057FF] transition-colors cursor-pointer text-sm"
                            >
                              {item.sender.nickName || item.sender.username}
                            </button>
                          )}
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${badge.bg}`}>
                            {badge.label}
                          </span>

                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#0057FF] animate-ping" title="未读提醒" />
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-neutral-800 font-medium leading-relaxed break-words">
                          {item.content}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono pt-0.5">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{formatRelativeTime(item.createdAt)}</span>
                          <span className="hidden sm:inline text-neutral-300">·</span>
                          <span className="hidden sm:inline">{formatFullDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 self-center">
                      {isUnread && (
                        <button
                          onClick={() => handleMarkRead(item.id)}
                          title="标记为已读"
                          className="p-2 text-neutral-400 hover:text-[#0057FF] hover:bg-blue-50 transition-colors rounded-xl cursor-pointer"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="删除通知"
                        className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

