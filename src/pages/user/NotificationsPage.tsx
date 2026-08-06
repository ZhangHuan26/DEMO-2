import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2, Heart, MessageSquare, UserPlus, ShieldAlert } from 'lucide-react';
import { notificationsApi } from '../../api/notifications';
import { Notification } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const NotificationsPage: React.FC = () => {
  const { refreshCounts } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getNotificationIcon = (type: number) => {
    switch (type) {
      case 0:
      case 4:
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 1:
      case 2:
        return <MessageSquare className="w-4 h-4 text-[#0057FF]" />;
      case 3:
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="w-full px-[20px] py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#0057FF]" />
            消息通知中心
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            查看您在社区收到的互动提醒与系统通知
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            全部标记已读
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white border border-neutral-200 rounded-2xl p-4 animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 bg-neutral-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-1/3" />
                <div className="h-3 bg-neutral-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl p-8 space-y-3">
          <Bell className="w-12 h-12 text-neutral-400 mx-auto" />
          <p className="text-neutral-600 font-medium">暂无消息通知</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${
                item.isRead === 0 ? 'border-blue-200 bg-blue-50/20' : 'border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-neutral-100 rounded-xl shrink-0">
                  {getNotificationIcon(item.type)}
                </div>
                <div>
                  <p className="text-sm text-neutral-900 font-medium">{item.content}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.isRead === 0 && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    title="标记为已读"
                    className="p-2 text-neutral-400 hover:text-[#0057FF] transition-colors rounded-lg hover:bg-neutral-100 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  title="删除通知"
                  className="p-2 text-neutral-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-neutral-100 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
