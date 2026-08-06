import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Heart, MessageSquare, UserPlus, ShieldAlert } from 'lucide-react';
import { Notification } from '../../types';
import { notificationsApi } from '../../api/notifications';
import { useAuth } from '../../context/AuthContext';

import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, refreshCounts } = useAuth();
  const navigate = useNavigate();

  // 如果未登录，显示提示
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <div className="text-6xl">🔒</div>
          <h2 className="text-xl font-bold text-neutral-900">请先登录</h2>
          <p className="text-sm text-neutral-600">您需要登录后才能查看消息通知</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2.5 bg-[#0057FF] text-white text-sm font-bold rounded-full hover:bg-[#0046CC] transition-colors"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadNotifs = async () => {
      setLoading(true);
      try {
        const list = await notificationsApi.getNotifications();

        setNotifications(list);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    loadNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markNotificationRead(id);

      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: 1 } : n));
      refreshCounts();
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllNotificationsRead();

      setNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })));
      refreshCounts();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationsApi.deleteNotification(id);

      setNotifications(prev => prev.filter(n => n.id !== id));
      refreshCounts();
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#0057FF]" />
          <h1 className="text-lg font-bold text-neutral-900">消息通知中心</h1>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs text-[#0057FF] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <CheckCheck className="w-4 h-4" /> 全部标记为已读
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-neutral-500">正在加载消息通知...</div>
      ) : notifications.length === 0 ? (
        <div className="py-20 text-center text-sm text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">暂无任何消息通知</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                n.isRead === 0
                  ? 'bg-blue-50/60 border-[#0057FF]/30 shadow-lg'
                  : 'bg-neutral-50 border-neutral-200 opacity-80'
              }`}
            >
              <div className="p-2 bg-neutral-100 rounded-lg text-[#0057FF] mt-0.5">
                {n.type === 'like' && <Heart className="w-4 h-4 text-rose-500" />}
                {n.type === 'follow' && <UserPlus className="w-4 h-4 text-emerald-500" />}
                {n.type === 'comment' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                {n.type === 'system' && <ShieldAlert className="w-4 h-4 text-amber-500" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-neutral-900">{n.title}</h4>
                  <span className="text-xs text-neutral-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">{n.content}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(n.id);
                }}
                className="text-neutral-400 hover:text-rose-500 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
