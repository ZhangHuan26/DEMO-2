import { apiClient } from './client';
import { Conversation, Message } from '../types';
import { LOCAL_WS_HOST } from '../config/env';

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
      return [];
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
  },

  // Send message REST API
  sendMessage: async (receiverId: number, content: string) => {
    const res = await apiClient.post('/chat/messages', { receiverId, content });
    return res.data;
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
   * 若 WebSocket 已连接则通过 WS 发送并返回乐观消息；
   * 否则通过 REST 接口发送。
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
      chatApi.sendMessage(receiverId, content).catch(() => {});
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
