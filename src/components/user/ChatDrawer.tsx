import React, { useEffect, useState } from 'react';
import { X, Send, MessageSquare, User as UserIcon } from 'lucide-react';
import { chatApi } from '../../api/chat';
import { Conversation, Message, User } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, targetUser }) => {
  const { user, refreshCounts } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<User | null>(targetUser || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (targetUser) {
      setSelectedPeer(targetUser);
    }
  }, [targetUser]);

  useEffect(() => {
    if (selectedPeer) {
      loadMessages(selectedPeer.id);
    }
  }, [selectedPeer]);

  const loadConversations = async () => {
    try {
      const list = await chatApi.getConversations();
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadMessages = async (peerId: number) => {
    setLoading(true);
    try {
      const list = await chatApi.getPeerMessages(peerId);
      setMessages(list);
      await chatApi.markConversationRead(peerId);
      await refreshCounts();
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !selectedPeer || !user) return;

    const content = inputContent.trim();
    setInputContent('');

    const optimisticMsg: Message = {
      id: Date.now(),
      senderId: user.id,
      receiverId: selectedPeer.id,
      content,
      isRead: 0,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await chatApi.sendMessage(selectedPeer.id, content);
      loadMessages(selectedPeer.id);
      loadConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[200] flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0057FF]" />
            <h2 className="text-base font-bold text-neutral-900">
              {selectedPeer ? `与 ${selectedPeer.nickName} 私信对话` : '私信会话消息'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List Sidebar */}
          <div className="w-1/3 border-r border-neutral-200 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400 mt-8">暂无私信记录</div>
            ) : (
              conversations.map((c) => {
                const peer = c.targetUser || c.peerUser;
                const isSelected = selectedPeer?.id === peer?.id;
                return (
                  <button
                    key={c.id || peer?.id}
                    onClick={() => setSelectedPeer(peer || null)}
                    className={`w-full p-3 text-left border-b border-neutral-100 flex items-center gap-2.5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <img
                      src={peer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                      alt={peer?.nickName}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-neutral-900 truncate">{peer?.nickName}</div>
                      <div className="text-[11px] text-neutral-400 truncate mt-0.5">{c.lastMessage?.content || '最新私信消息'}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 flex flex-col bg-neutral-50/50">
            {selectedPeer ? (
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-xs text-neutral-400">正在加载聊天记录...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-xs text-neutral-400">还没有任何交流，发送一条招呼吧</div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === user?.id;
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                              isMe ? 'bg-[#0057FF] text-white rounded-br-none' : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-none shadow-xs'
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="输入私信内容..."
                    className="flex-1 bg-neutral-100 border border-transparent rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0057FF]"
                  />
                  <button
                    type="submit"
                    disabled={!inputContent.trim()}
                    className="p-2 bg-[#0057FF] hover:bg-[#0046CC] disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400 space-y-2">
                <UserIcon className="w-10 h-10 stroke-1" />
                <p className="text-xs">选择左侧会话与对方聊天</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
