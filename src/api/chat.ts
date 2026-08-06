import { apiClient } from './client';
import { Conversation, Message, User } from '../types';
import { LOCAL_WS_HOST } from '../config/env';
import { resolveImageUrl } from '../config/env';

export interface ChatFriend {
  id: number;
  nickName: string;
  avatar: string;
  signature?: string;
  role: number;
  status: number;
  gender: number;
  followerCount: number;
  followingCount: number;
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
}

export const chatApi = {
  // 11.5 GET /chat/friends - 我的聊天好友列表
  getFriends: async (keyword?: string): Promise<ChatFriend[]> => {
    try {
      const params = keyword ? { keyword } : undefined;
      const res = await apiClient.get('/chat/friends', { params });
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      
      // 处理头像路径
      const normalizedList = Array.isArray(list) ? list.map((friend: any) => {
        if (friend.avatar && !friend.avatar.startsWith('http')) {
          friend.avatar = resolveImageUrl(friend.avatar);
        }
        return friend;
      }) : [];
      
      return normalizedList;
    } catch (error) {
      console.error('获取聊天好友列表失败:', error);
      return [];
    }
  },

  // 11.6 GET /chat/users - 搜索用户（用于单独找某个人聊天）
  searchUsers: async (keyword: string): Promise<ChatFriend[]> => {
    try {
      const res = await apiClient.get('/chat/users', { params: { keyword } });
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      
      // 处理头像路径
      const normalizedList = Array.isArray(list) ? list.map((user: any) => {
        if (user.avatar && !user.avatar.startsWith('http')) {
          user.avatar = resolveImageUrl(user.avatar);
        }
        return user;
      }) : [];
      
      return normalizedList;
    } catch (error) {
      console.error('搜索用户失败:', error);
      return [];
    }
  },

  // 11.2 GET /chat/conversations/{peerId} - 与某用户的聊天记录
  getPeerMessages: async (peerId: number, params?: { page?: number; size?: number }): Promise<Message[]> => {
    try {
      const res = await apiClient.get(`/chat/conversations/${peerId}`, { params });
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      
      // 处理头像路径
      const normalizedList = Array.isArray(list) ? list.map((msg: any) => {
        if (msg.senderAvatar && !msg.senderAvatar.startsWith('http')) {
          msg.senderAvatar = resolveImageUrl(msg.senderAvatar);
        }
        if (msg.receiverAvatar && !msg.receiverAvatar.startsWith('http')) {
          msg.receiverAvatar = resolveImageUrl(msg.receiverAvatar);
        }
        return msg;
      }) : [];
      
      return normalizedList;
    } catch (error) {
      console.error('获取聊天记录失败:', error);
      return [];
    }
  },

  // 11.1 GET /chat/conversations - 我的会话列表
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const res = await apiClient.get('/chat/conversations');
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      
      if (!Array.isArray(list)) return [];
      
      // 获取当前用户ID（从localStorage）
      const currentUserStr = localStorage.getItem('currentUser');
      let currentUserId = 0;
      if (currentUserStr) {
        try {
          const currentUser = JSON.parse(currentUserStr);
          currentUserId = currentUser.id;
        } catch {
          // ignore
        }
      }
      
      // 将PrivateMessage列表转换为Conversation列表
      const conversationsMap = new Map<number, { lastMsg: Message; messages: Message[] }>();
      
      // 按对端用户ID分组
      list.forEach((msg: Message) => {
        const peerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
        
        if (!conversationsMap.has(peerId)) {
          conversationsMap.set(peerId, { lastMsg: msg, messages: [msg] });
        } else {
          const conv = conversationsMap.get(peerId)!;
          conv.messages.push(msg);
          // 更新为最新消息
          if (new Date(msg.createdAt) > new Date(conv.lastMsg.createdAt)) {
            conv.lastMsg = msg;
          }
        }
      });
      
      // 构建Conversation对象
      const conversations: Conversation[] = [];
      conversationsMap.forEach((conv, peerId) => {
        const msg = conv.lastMsg;
        const isSender = msg.senderId === currentUserId;
        
        // 计算未读数（接收到的未读消息）
        const unreadCount = conv.messages.filter(m => 
          m.receiverId === currentUserId && m.isRead === 0
        ).length;
        
        const peerUser: User = {
          id: peerId,
          nickName: isSender ? (msg.receiverNickName || '用户') : (msg.senderNickName || '用户'),
          avatar: resolveImageUrl(isSender ? (msg.receiverAvatar || '') : (msg.senderAvatar || '')),
          signature: '',
          role: 0,
          status: 0,
          gender: 0,
          followerCount: 0,
          followingCount: 0,
        };
        
        conversations.push({
          id: msg.id,
          peerUser,
          targetUser: peerUser,
          lastMessage: msg,
          unreadCount,
        });
      });
      
      // 按最新消息时间排序
      conversations.sort((a, b) => {
        const timeA = a.lastMessage?.createdAt || '';
        const timeB = b.lastMessage?.createdAt || '';
        return timeB.localeCompare(timeA);
      });
      
      return conversations;
    } catch (error) {
      console.error('获取会话列表失败:', error);
      return [];
    }
  },

  // 26.4 PUT /chat/conversations/{peerId}/read
  markConversationRead: async (peerId: number) => {
    const res = await apiClient.put(`/chat/conversations/${peerId}/read`);
    return res.data;
  },

  // 26.5 GET /chat/unread-count
  getUnreadChatCount: async (): Promise<number> => {
    try {
      const res = await apiClient.get('/chat/unread-count');
      return res.data.count ?? res.data ?? 0;
    } catch {
      return 0;
    }
  }
};

// WebSocket Service with 3s auto-reconnect
export class ChatWebSocketService {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private reconnectInterval = 3000;
  private isExplicitClose = false;
  private messageListeners: ((msg: Message) => void)[] = [];
  private statusListeners: ((connected: boolean) => void)[] = [];

  constructor() {
    // 构造函数不再接收回调，改用监听器模式
  }

  get isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // 添加消息监听器
  addMessageListener(callback: (msg: Message) => void) {
    this.messageListeners.push(callback);
  }

  // 移除消息监听器
  removeMessageListener(callback: (msg: Message) => void) {
    this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
  }

  // 添加状态监听器
  addStatusListener(callback: (connected: boolean) => void) {
    this.statusListeners.push(callback);
  }

  // 移除状态监听器
  removeStatusListener(callback: (connected: boolean) => void) {
    this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
  }

  // 通知所有消息监听器
  private notifyMessageListeners(msg: Message) {
    this.messageListeners.forEach(cb => {
      try {
        cb(msg);
      } catch (e) {
        console.error('[Chat WS] Message listener error:', e);
      }
    });
  }

  // 通知所有状态监听器
  private notifyStatusListeners(connected: boolean) {
    this.statusListeners.forEach(cb => {
      try {
        cb(connected);
      } catch (e) {
        console.error('[Chat WS] Status listener error:', e);
      }
    });
  }

  connect(token: string) {
    this.token = token;
    this.isExplicitClose = false;
    const authToken = token || localStorage.getItem('token') || '';
    
    // 构建WebSocket URL
    let wsUrl = LOCAL_WS_HOST;
    // 确保移除末尾的斜杠
    wsUrl = wsUrl.replace(/\/$/, '');
    // 添加WebSocket路径和token
    wsUrl = `${wsUrl}/ws/chat?token=${encodeURIComponent(authToken)}`;
    
    console.log('[Chat WS] Connecting to:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Chat WS] Connected successfully');
        this.notifyStatusListeners(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[Chat WS] Received message:', data);
          
          // 检查消息类型
          if (data.type === 'error') {
            console.error('[Chat WS] Server error:', data.message);
            alert(`消息发送失败：${data.message}`);
            return;
          }
          
          // 处理连接确认消息
          if (data.type === 'connected') {
            console.log('[Chat WS] Connection confirmed for user:', data.nickName);
            return;
          }
          
          // 处理消息发送确认
          if (data.type === 'ack') {
            console.log('[Chat WS] Message delivery confirmed:', data.delivered);
            return;
          }
          
          // 处理实际的聊天消息
          if (data.type === 'message' && data.message) {
            console.log('[Chat WS] Chat message received:', data.message);
            // 通知所有消息监听器（传递实际的消息对象）
            this.notifyMessageListeners(data.message);
            return;
          }
          
          // 其他未知类型的消息
          console.warn('[Chat WS] Unknown message type:', data.type);
        } catch (e) {
          console.error('[Chat WS] Message parse error:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[Chat WS] Error encounter:', error);
        this.notifyStatusListeners(false);
      };

      this.ws.onclose = (event) => {
        console.log('[Chat WS] Connection closed. Code:', event.code, 'Reason:', event.reason);
        this.notifyStatusListeners(false);
        if (!this.isExplicitClose) {
          console.log(`[Chat WS] Will reconnect in ${this.reconnectInterval / 1000}s...`);
          setTimeout(() => {
            if (this.token && !this.isExplicitClose) {
              this.connect(this.token);
            }
          }, this.reconnectInterval);
        }
      };
    } catch (error) {
      console.error('[Chat WS] Failed to create WebSocket:', error);
      this.notifyStatusListeners(false);
    }
  }

  /**
   * 发送私信消息（仅通过WebSocket）。
   * 若 WebSocket 未连接则抛出错误。
   */
  send(receiverId: number, content: string, senderId: number): Message {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket未连接，无法发送消息');
    }

    const optimistic: Message = {
      id: Date.now(),
      senderId,
      receiverId,
      content,
      isRead: 0,
      createdAt: new Date().toISOString()
    };

    this.ws.send(JSON.stringify({ receiverId, content }));
    return optimistic;
  }

  disconnect() {
    this.isExplicitClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
