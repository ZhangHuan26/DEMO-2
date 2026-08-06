import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth';
import { notificationsApi } from '../api/notifications';
import { chatApi } from '../api/chat';


interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  unreadNotifications: number;
  unreadChats: number;
  login: (email: string, pass: string) => Promise<{ token: string; user: User }>;
  register: (data: { email: string; password: string; nickName?: string; phone?: string; avatar?: string }) => Promise<{ token: string; user: User }>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  refreshCounts: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [unreadChats, setUnreadChats] = useState<number>(0);

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
    setUser(null);
    setToken(null);
    setUnreadNotifications(0);
    setUnreadChats(0);
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
        login,
        register,
        logout,
        updateUser,
        refreshCounts
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
