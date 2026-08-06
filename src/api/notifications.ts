import { apiClient } from './client';
import { Notification } from '../types';
import { mockNotifications } from './mockData';

/**
 * 通知模块。
 * 对应后端接口：16.1-16.5（GET/PUT/DELETE /notifications）。
 * 原实现位于 adminApi，现按职责拆分到独立模块。
 */
export const notificationsApi = {
    // 16.1 GET /notifications
    getNotifications: async (): Promise<Notification[]> => {
        try {
            const res = await apiClient.get('/notifications');
            // 后端返回 Result<PageResult>：{ code, data, message }，列表在 res.data.data.list
            const result = res.data;
            const data = result?.data ?? result;
            const list = Array.isArray(data) ? data : data?.list;
            return Array.isArray(list) ? list : [];
        } catch {
            return mockNotifications;
        }
    },

    // 16.2 GET /notifications/unread-count
    getUnreadNotificationCount: async (): Promise<number> => {
        try {
            const res = await apiClient.get('/notifications/unread-count');
            // 后端返回 Result<T>：{ code, data, message }，数量在 res.data.data.count
            const result = res.data;
            const data = result?.data ?? result;
            return data?.count ?? data ?? 0;
        } catch {
            return mockNotifications.filter(n => n.isRead === 0).length;
        }
    },

    // 16.3 PUT /notifications/{id}/read
    markNotificationRead: async (id: number) => {
        try {
            const res = await apiClient.put(`/notifications/${id}/read`);
            return res.data;
        } catch {
            const n = mockNotifications.find(item => item.id === id);
            if (n) n.isRead = 1;
            return { success: true };
        }
    },

    // 16.4 PUT /notifications/read-all
    markAllNotificationsRead: async () => {
        try {
            const res = await apiClient.put('/notifications/read-all');
            return res.data;
        } catch {
            mockNotifications.forEach(n => n.isRead = 1);
            return { success: true };
        }
    },

    // 16.5 DELETE /notifications/{id}
    deleteNotification: async (id: number) => {
        try {
            const res = await apiClient.delete(`/notifications/${id}`);
            return res.data;
        } catch {
            const idx = mockNotifications.findIndex(n => n.id === id);
            if (idx !== -1) mockNotifications.splice(idx, 1);
            return { success: true };
        }
    },
};
