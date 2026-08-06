import { apiClient } from './client';
import { Conversation, Message } from '../types';
import { LOCAL_WS_HOST } from '../config/env';
import { mockUsers } from './mockData';

let mockMessagesStore: Message[] = [
  {
    id: 1,
    senderId: 2,
    receiverId: 1,
    content: 'Hi LunarStudio! Love your Neon Horizon interface project on LeapLunar04!',
    isRead: 1,
    createdAt: '2026-08-04T10:00:00Z'
  },
  {
    id: 2,
    senderId: 1,
    receiverId: 2,
    content: 'Thank you SystemAdmin! Appreciate the feedback.',
    isRead: 1,
    createdAt: '2026-08-04T10:05:00Z'
  }
];

export const chatApi = {
  // 26.2 GET /chat/conversations/{peerId}
  getPeerMessages: async (peerId: number): Promise<Message[]> => {
    try {
      const res = await apiClient.get(`/chat/conversations/${peerId}`);
      // 后端返回 Result<T> 包装：{ code, data, message }，列表在 res.data.data.list 或 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return mockMessagesStore.filter(
        m => (m.senderId === peerId && m.receiverId === 1) || (m.senderId === 1 && m.receiverId === peerId)
      );
    }
  },

  // 26.3 GET /chat/conversations
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const res = await apiClient.get('/chat/conversations');
      // 后端返回 Result<T> 包装：{ code, data, message }，列表在 res.data.data.list 或 res.data.data
      const result = res.data;
      const data = result?.data ?? result;
      const list = Array.isArray(data) ? data : data?.list;
      return Array.isArray(list) ? list : [];
    } catch {
      return [
        {
          peerUser: mockUsers[1],
          lastMessage: mockMessagesStore[mockMessagesStore.length - 1],
          unreadCount: 0
        },
        {
          peerUser: mockUsers[2],
          lastMessage: {
            id: 3,
            senderId: 3,
            receiverId: 1,
            content: 'Hello! Would like to collaborate on 3D renders.',
            isRead: 0,
            createdAt: '2026-08-04T16:00:00Z'
          },
          unreadCount: 1
        }
      ];
    }
  },

  // 26.4 PUT /chat/conversations/{peerId}/read
  markConversationRead: async (peerId: number) => {
    try {
      const res = await apiClient.put(`/chat/conversations/${peerId}/read`);
      return res.data;
    } catch {
      mockMessagesStore.forEach(m => {
        if (m.senderId === peerId) m.isRead = 1;
      });
      return { success: true };
    }
  },

  // 26.5 GET /chat/unread-count
  getUnreadChatCount: async (): Promise<number> => {
    try {
      const res = await apiClient.get('/chat/unread-count');
      return res.data.count ?? res.data;
    } catch {
      return mockMessagesStore.filter(m => m.receiverId === 1 && m.isRead === 0).length;
    }
  },

  // Send message helper
  sendMessage: (receiverId: number, content: string) => {
    const msg: Message = {
      id: Date.now(),
      senderId: 1,
      receiverId,
      content,
      isRead: 0,
      createdAt: new Date().toISOString()
    };
    mockMessagesStore.push(msg);
    return msg;
  }
};

// WebSocket Service with 3s auto-reconnect
export class ChatWebSocketService {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private reconnectInterval = 3000;
  private isExplicitClose = false;
  private onMessageCallback?: (msg: Message) => void;
  private onStatusCallback?: (connected: boolean) => void;

  constructor(onMessage?: (msg: Message) => void, onStatus?: (connected: boolean) => void) {
    this.onMessageCallback = onMessage;
    this.onStatusCallback = onStatus;
  }

  get isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  connect(token: string) {
    this.token = token;
    this.isExplicitClose = false;
    // 优先使用传入 token，否则回退到 localStorage 中的 token
    const authToken = token || localStorage.getItem('token') || '';
    const wsUrl = `${LOCAL_WS_HOST}/ws/chat?token=${encodeURIComponent(authToken)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Chat WS] Connected successfully');
        if (this.onStatusCallback) this.onStatusCallback(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (e) {
          console.error('[Chat WS] Message parse error:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.warn('[Chat WS] Error encounter:', error);
      };

      this.ws.onclose = () => {
        if (this.onStatusCallback) this.onStatusCallback(false);
        if (!this.isExplicitClose) {
          console.log(`[Chat WS] Connection closed. Reconnecting in ${this.reconnectInterval / 1000}s...`);
          setTimeout(() => {
            if (this.token && !this.isExplicitClose) {
              this.connect(this.token);
            }
          }, this.reconnectInterval);
        }
      };
    } catch {
      if (this.onStatusCallback) this.onStatusCallback(false);
    }
  }

  /**
   * 发送私信消息。
   * 若 WebSocket 已连接则通过 WS 发送并返回乐观消息（用于本地即时展示）；
   * 否则回退到 REST 接口发送。
   */
  send(receiverId: number, content: string, senderId: number): Message {
    const optimistic: Message = {
      id: Date.now(),
      senderId,
      receiverId,
      content,
      isRead: 0,
      createdAt: new Date().toISOString()
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ receiverId, content }));
    } else {
      // Fallback via REST engine
      chatApi.sendMessage(receiverId, content);
    }
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
