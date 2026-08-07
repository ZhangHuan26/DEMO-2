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
          bg: 'bg-rose-50/90 text-rose-700 border-rose-200/70',
          iconBg: 'bg-rose-50/80 border-rose-200/60',
          iconColor: 'text-rose-500',
        };
      case 1:
      case 2:
        return {
          icon: MessageSquare,
          label: '评论互动',
          bg: 'bg-blue-50/90 text-blue-700 border-blue-200/70',
          iconBg: 'bg-blue-50/80 border-blue-200/60',
          iconColor: 'text-[#0057FF]',
        };
      case 3:
        return {
          icon: UserPlus,
          label: '新增关注',
          bg: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/70',
          iconBg: 'bg-emerald-50/80 border-emerald-200/60',
          iconColor: 'text-emerald-600',
        };
      default:
        return {
          icon: ShieldAlert,
          label: '系统通知',
          bg: 'bg-amber-50/90 text-amber-800 border-amber-200/70',
          iconBg: 'bg-amber-50/80 border-amber-200/60',
          iconColor: 'text-amber-600',
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-[#FAFAFB] min-h-screen pb-24 font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-16 space-y-8">
        
        {/* Editorial Minimal Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-200/80">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 font-sans">
                消息提醒
              </h1>
              {unreadCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-neutral-900 text-white tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {unreadCount} 未读
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-neutral-500 bg-neutral-100 border border-neutral-200">
                  <Sparkles className="w-3 h-3 text-neutral-400" />
                  已全部处理
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 font-normal">
              实时关注互动、互动反馈与系统更新通知
            </p>
          </div>

          {notifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-neutral-900 text-neutral-700 hover:text-white text-xs font-semibold rounded-xl border border-neutral-200 shadow-2xs transition-all duration-200 cursor-pointer shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>全部标记为已读</span>
            </button>
          )}
        </div>

        {/* Minimal Underline / Segmented Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-neutral-200/80 pb-px overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: '全部消息', count: notifications.length },
            { id: 'unread', label: '未读提醒', count: unreadCount },
            { id: 'like', label: '赞与收藏' },
            { id: 'comment', label: '评论互动' },
            { id: 'follow', label: '新增关注' },
            { id: 'system', label: '系统通知' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'text-neutral-900 font-extrabold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                      isActive
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 border border-neutral-200/70'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="notifTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Notification Stream - Refined Minimal Architectural Cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white border border-neutral-200/70 rounded-2xl p-5 animate-pulse flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-neutral-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-100 rounded w-1/4" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 px-6 text-center space-y-4 bg-white rounded-3xl border border-neutral-200/80 shadow-2xs"
          >
            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto text-neutral-400 border border-neutral-200/60">
              <Bell className="w-6 h-6 text-neutral-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-neutral-900">
                {activeTab === 'unread' ? '暂无未读消息' : '暂无相关通知'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                {activeTab === 'all'
                  ? '当有人与您的作品互动或关注您时，通知将在此呈现。'
                  : '当前分类下暂无新的动态通知。'}
              </p>
            </div>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-900 font-bold hover:underline cursor-pointer pt-2"
              >
                <span>查看所有消息</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((item) => {
                const badge = getNotificationBadge(item.type);
                const BadgeIcon = badge.icon;
                const isUnread = item.isRead === 0;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 group ${
                      isUnread
                        ? 'bg-white border-neutral-300 shadow-2xs ring-1 ring-neutral-900/5'
                        : 'bg-white/70 border-neutral-200/80 hover:bg-white hover:border-neutral-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Sender Avatar or Category Icon */}
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
                              className="w-10 h-10 rounded-xl object-cover border border-neutral-200/80 group-hover/avatar:border-neutral-900 transition-all"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                              }}
                            />
                            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-md bg-white border border-neutral-200 shadow-2xs">
                              <BadgeIcon className={`w-2.5 h-2.5 ${badge.iconColor}`} />
                            </div>
                          </button>
                        ) : (
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${badge.iconBg}`}>
                            <BadgeIcon className={`w-4 h-4 ${badge.iconColor}`} />
                          </div>
                        )}
                      </div>

                      {/* Main Message Body */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.sender && (
                            <button
                              onClick={() => handleOpenAuthor(item.sender?.id)}
                              className="font-bold text-neutral-900 hover:text-blue-600 transition-colors cursor-pointer text-xs sm:text-sm"
                            >
                              {item.sender.nickName || item.sender.username}
                            </button>
                          )}
                          
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border ${badge.bg}`}>
                            {badge.label}
                          </span>

                          {isUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" title="未读" />
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-neutral-800 font-normal leading-relaxed break-words">
                          {item.content}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono pt-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{formatRelativeTime(item.createdAt)}</span>
                          <span className="text-neutral-300">•</span>
                          <span>{formatFullDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0 self-start pt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {isUnread && (
                        <button
                          onClick={() => handleMarkRead(item.id)}
                          title="标记已读"
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors rounded-lg cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="删除通知"
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition-colors rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

