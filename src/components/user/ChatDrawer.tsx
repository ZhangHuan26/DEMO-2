import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Smile, Search, CheckCheck, MessageSquare } from 'lucide-react';
import { Conversation, Message, User } from '../../types';
import { chatApi, ChatWebSocketService } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
}

const COMMON_EMOJIS = ['😊', '🚀', '🔥', '💙', '👍', '🎨', '✨', '👏', '💡', '💯', '😍', '🙌', '🎉', '🌟', '💻', '😎'];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, targetUser }) => {
  const { user, token, refreshCounts } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePeer, setActivePeer] = useState<User | null>(targetUser || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const wsServiceRef = useRef<ChatWebSocketService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 用 ref 保存当前会话对象，避免 WebSocket 回调中的闭包过期问题
  const activePeerRef = useRef<User | null>(activePeer);

  // 同步 activePeer 到 ref
  useEffect(() => {
    activePeerRef.current = activePeer;
  }, [activePeer]);

  // Initialize WS and Conversations
  useEffect(() => {
    if (!isOpen || !token) return;

    // Load conversation list
    const loadConvs = async () => {
      try {
        const list = await chatApi.getConversations();
        // 防御：确保 conversations 始终是数组，避免 .map 崩溃
        const safeList = Array.isArray(list) ? list : [];
        setConversations(safeList);
        if (targetUser) {
          setActivePeer(targetUser);
        } else if (!activePeerRef.current && safeList.length > 0) {
          setActivePeer(safeList[0].peerUser);
        }
      } catch {
        // ignore
      }
    };
    loadConvs();

    // Connect WS
    const ws = new ChatWebSocketService(
      (newMsg) => {
        const peer = activePeerRef.current;
        if (peer && (newMsg.senderId === peer.id || newMsg.receiverId === peer.id)) {
          setMessages((prev) => [...prev, newMsg]);
        }
        refreshCounts();
      },
      (status) => setWsConnected(status)
    );
    ws.connect(token);
    wsServiceRef.current = ws;

    return () => {
      ws.disconnect();
    };
  }, [isOpen, token]);

  // Handle TargetUser prop changes
  useEffect(() => {
    if (targetUser) {
      setActivePeer(targetUser);
    }
  }, [targetUser]);

  // Load active peer messages
  useEffect(() => {
    if (!activePeer) return;
    const loadPeerChat = async () => {
      setLoadingMessages(true);
      try {
        const chatList = await chatApi.getPeerMessages(activePeer.id);
        // 防御：确保 messages 始终是数组，避免 .map 崩溃
        setMessages(Array.isArray(chatList) ? chatList : []);
        await chatApi.markConversationRead(activePeer.id);
        refreshCounts();
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadPeerChat();
  }, [activePeer]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !activePeer) return;
    if (inputContent.length > 2000) return alert('消息内容不能超过 2000 个字符');
    if (activePeer.id === user?.id) return alert('不能给本人发送私信消息');

    const contentToSend = inputContent.trim();
    setInputContent('');
    setShowEmojiPicker(false);

    try {
      if (wsServiceRef.current) {
        // 通过 WebSocket 发送，并乐观地在本地即时展示消息
        const optimistic = wsServiceRef.current.send(activePeer.id, contentToSend, user?.id || 1);
        setMessages((prev) => [...prev, optimistic]);
      } else {
        const msg = await chatApi.sendMessage(activePeer.id, contentToSend);
        setMessages((prev) => [...prev, msg]);
      }
    } catch {
      // fallback local append
      const msg: Message = {
        id: Date.now(),
        senderId: user?.id || 1,
        receiverId: activePeer.id,
        content: contentToSend,
        isRead: 1,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
    }
  };

  const addEmoji = (emoji: string) => {
    setInputContent((prev) => prev + emoji);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-neutral-950 border-l border-neutral-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0057FF]/20 text-[#0057FF] rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                LeapLunar04 实时私信消息中心
                <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500'}`} title={wsConnected ? '已连接 WebSocket' : '正在自动重连'} />
              </h2>
              <p className="text-[10px] text-neutral-400">100% 实时长连接私信系统</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Split Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List Sidebar */}
          <div className="w-56 border-r border-neutral-800 bg-neutral-950 flex flex-col">
            <div className="p-2.5 border-b border-neutral-800/80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="搜索联系人或私信..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-2 py-1.5 text-[11px] text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1 space-y-1">
              {(conversations || []).map((c) => (
                <button
                  key={c.peerUser.id}
                  onClick={() => setActivePeer(c.peerUser)}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 text-left transition-colors ${
                    activePeer?.id === c.peerUser.id ? 'bg-[#0057FF]/20 border border-[#0057FF]/40 text-white' : 'hover:bg-neutral-900/80 text-neutral-400'
                  }`}
                >
                  <img src={c.peerUser.avatar} alt={c.peerUser.nickName} className="w-8 h-8 rounded-full object-cover border border-neutral-800" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">{c.peerUser.nickName}</span>
                      {c.unreadCount > 0 && <span className="w-4 h-4 bg-[#0057FF] text-white rounded-full text-[9px] font-bold flex items-center justify-center">{c.unreadCount}</span>}
                    </div>
                    <p className="text-[10px] text-neutral-500 truncate">{c.lastMessage?.content || '暂无私信记录'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Area */}
          <div className="flex-1 flex flex-col bg-neutral-900/40">
            {activePeer ? (
              <>
                {/* Active Peer Bar */}
                <div className="p-3 border-b border-neutral-800/80 flex items-center gap-3 bg-neutral-950">
                  <img src={activePeer.avatar} alt={activePeer.nickName} className="w-9 h-9 rounded-full object-cover border border-neutral-800" />
                  <div>
                    <div className="text-xs font-bold text-white">{activePeer.nickName}</div>
                    <div className="text-[10px] text-neutral-400">{activePeer.signature || '社区活跃创作者'}</div>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {loadingMessages ? (
                    <div className="text-center text-xs text-neutral-500 py-8">正在加载聊天历史...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-xs text-neutral-500 py-12">开启与 {activePeer.nickName} 的私信对话吧！</div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === (user?.id || 1);
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                              isMe ? 'bg-[#0057FF] text-white rounded-br-none shadow-lg shadow-[#0057FF]/20' : 'bg-neutral-800 text-neutral-200 rounded-bl-none border border-neutral-700'
                            }`}
                          >
                            <p className="break-words">{m.content}</p>
                            <div className={`mt-1 text-[9px] flex items-center justify-end gap-1 ${isMe ? 'text-blue-200' : 'text-neutral-400'}`}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-3 border-t border-neutral-800 bg-neutral-950 relative">
                  {/* Emoji Picker Popup */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 left-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl grid grid-cols-8 gap-2 z-20">
                      {COMMON_EMOJIS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => addEmoji(e)}
                          className="w-7 h-7 hover:bg-neutral-800 rounded text-base flex items-center justify-center transition-colors"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    <input
                      type="text"
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder={`发送给 ${activePeer.nickName}...`}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#0057FF]"
                    />

                    <button
                      type="submit"
                      disabled={!inputContent.trim()}
                      className="p-2.5 bg-[#0057FF] hover:bg-[#0046CC] disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-[#0057FF]/30"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 text-xs">
                <MessageSquare className="w-12 h-12 text-neutral-700 mb-3" />
                请从左侧列表选择一位创作者开启私信对话
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
