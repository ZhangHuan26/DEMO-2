import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { authApi } from '../api/auth';
import { notificationsApi } from '../api/notifications';
import { chatApi, ChatWebSocketService } from '../api/chat';


interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  unreadNotifications: number;
  unreadChats: number;
  wsConnected: boolean;
  login: (email: string, pass: string) => Promise<{ token: string; user: User }>;
  register: (data: { email: string; password: string; nickName?: string; phone?: string; avatar?: string }) => Promise<{ token: string; user: User }>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  refreshCounts: () => Promise<void>;
  chatWs: ChatWebSocketService | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [unreadChats, setUnreadChats] = useState<number>(0);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const chatWsRef = useRef<ChatWebSocketService | null>(null);

  const refreshCounts = async () => {
    if (!token) return;
    try {
      const [notifCount, chatCount] = await Promise.all([
        notificationsApi.getUnreadNotificationCount(),
        chatApi.getUnreadChatCount()
      ]);

      setUnreadNotifications(notifCount);
      setUnreadChats(chatCount);
    } catch {
      // ignore
    }
  };

  // 初始化WebSocket连接
  useEffect(() => {
    if (token && user) {
      // 创建WebSocket服务实例
      if (!chatWsRef.current) {
        chatWsRef.current = new ChatWebSocketService();
      }
      
      // 添加全局消息监听器（用于刷新未读数）
      const globalMessageListener = (msg: Message) => {
        console.log('[Auth] Received chat message (actual message object):', msg);
        
        // 收到新消息时刷新未读数
        refreshCounts();
      };
      
      const statusListener = (connected: boolean) => {
        console.log('[Auth] WebSocket status:', connected ? 'Connected' : 'Disconnected');
        setWsConnected(connected);
      };
      
      chatWsRef.current.addMessageListener(globalMessageListener);
      chatWsRef.current.addStatusListener(statusListener);
      
      // 连接WebSocket
      chatWsRef.current.connect(token);
      
      return () => {
        // 组件卸载时移除监听器并断开连接
        if (chatWsRef.current) {
          chatWsRef.current.removeMessageListener(globalMessageListener);
          chatWsRef.current.removeStatusListener(statusListener);
          chatWsRef.current.disconnect();
        }
      };
    } else {
      // 用户未登录，断开WebSocket
      if (chatWsRef.current) {
        chatWsRef.current.disconnect();
        chatWsRef.current = null;
      }
      setWsConnected(false);
    }
  }, [token, user]);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const u = await authApi.getMe();
          setUser(u);
          await refreshCounts();
        } catch (err) {
          console.warn('Auth token expired or invalid:', err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authApi.login({ email, password: pass });
    setToken(res.token);
    setUser(res.user);
    await refreshCounts();
    return res;
  };

  const register = async (data: { email: string; password: string; nickName?: string; phone?: string; avatar?: string }) => {
    const res = await authApi.register(data);
    setToken(res.token);
    setUser(res.user);
    await refreshCounts();
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    if (chatWsRef.current) {
      chatWsRef.current.disconnect();
      chatWsRef.current = null;
    }
    setUser(null);
    setToken(null);
    setUnreadNotifications(0);
    setUnreadChats(0);
    setWsConnected(false);
  };

  const updateUser = (updated: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updated } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        unreadNotifications,
        unreadChats,
        wsConnected,
        login,
        register,
        logout,
        updateUser,
        refreshCounts,
        chatWs: chatWsRef.current,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
