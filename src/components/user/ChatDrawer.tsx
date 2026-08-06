import React, { useEffect, useState } from 'react';
import { X, Send, MessageSquare, User as UserIcon, Users, Search } from 'lucide-react';
import { chatApi, ChatFriend } from '../../api/chat';
import { Conversation, Message, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../config/env';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, targetUser }) => {
  const { user, refreshCounts, chatWs } = useAuth();
  const [activeTab, setActiveTab] = useState<'conversations' | 'friends' | 'search'>('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<ChatFriend[]>([]);
  const [searchResults, setSearchResults] = useState<ChatFriend[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPeer, setSelectedPeer] = useState<User | null>(targetUser || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 消息更新后滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      loadFriends();
    }
  }, [isOpen]);

  useEffect(() => {
    if (targetUser) {
      setSelectedPeer(targetUser);
      setActiveTab('conversations');
    }
  }, [targetUser]);

  useEffect(() => {
    if (selectedPeer) {
      loadMessages(selectedPeer.id);
    }
  }, [selectedPeer]);

  // 监听WebSocket消息
  useEffect(() => {
    if (!chatWs || !isOpen) return;

    const handleNewMessage = (msg: Message) => {
      console.log('[ChatDrawer] Received WebSocket message:', msg);
      
      // 无论是否是当前聊天对象，都刷新会话列表
      loadConversations();
      refreshCounts();
      
      // 如果是当前聊天对象的消息，添加到消息列表
      if (selectedPeer && (msg.senderId === selectedPeer.id || msg.receiverId === selectedPeer.id)) {
        console.log('[ChatDrawer] Message is for current peer (selectedPeer.id:', selectedPeer.id, ', senderId:', msg.senderId, ', receiverId:', msg.receiverId, ')');
        setMessages(prev => {
          // 避免重复添加（检查是否已存在相同ID的消息）
          const exists = prev.some(m => m.id === msg.id);
          if (exists) {
            console.log('[ChatDrawer] Message already exists, skipping');
            return prev;
          }
          console.log('[ChatDrawer] Adding new message to list');
          return [...prev, msg];
        });
        
        // 如果是对方发来的消息，标记为已读
        if (msg.senderId === selectedPeer.id && user) {
          console.log('[ChatDrawer] Marking message as read');
          chatApi.markConversationRead(selectedPeer.id).catch(err => {
            console.error('Failed to mark as read:', err);
          });
        }
      } else {
        console.log('[ChatDrawer] Message not for current peer (selectedPeer:', selectedPeer?.id, ', senderId:', msg.senderId, ', receiverId:', msg.receiverId, ')');
      }
    };

    console.log('[ChatDrawer] Adding message listener, selectedPeer:', selectedPeer?.id);
    // 添加消息监听器
    chatWs.addMessageListener(handleNewMessage);
    
    // 组件卸载或依赖变化时移除监听器
    return () => {
      console.log('[ChatDrawer] Removing message listener');
      if (chatWs) {
        chatWs.removeMessageListener(handleNewMessage);
      }
    };
  }, [chatWs, isOpen, selectedPeer, user]);

  const loadConversations = async () => {
    try {
      const list = await chatApi.getConversations();
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadFriends = async () => {
    try {
      const list = await chatApi.getFriends();
      setFriends(list);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await chatApi.searchUsers(searchKeyword.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('Failed to search users:', err);
    }
  };

  const loadMessages = async (peerId: number) => {
    setLoading(true);
    try {
      const list = await chatApi.getPeerMessages(peerId, { page: 1, size: 100 });
      // 按时间正序排列（旧消息在上，新消息在下）
      const sortedMessages = list.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
      await chatApi.markConversationRead(peerId);
      await refreshCounts();
      // 重新加载会话列表以更新未读数
      loadConversations();
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !selectedPeer || !user) return;

    // 防止给自己发消息
    if (selectedPeer.id === user.id) {
      alert('不能给自己发送私信');
      return;
    }

    const content = inputContent.trim();
    setInputContent('');

    // 仅通过WebSocket发送消息
    try {
      if (chatWs && chatWs.isConnected) {
        const optimisticMsg = chatWs.send(selectedPeer.id, content, user.id);
        setMessages((prev) => [...prev, optimisticMsg]);
      } else {
        alert('WebSocket未连接，无法发送消息。请刷新页面重试。');
        console.error('Cannot send message: WebSocket not connected');
        setInputContent(content); // 恢复输入内容
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('发送消息失败，请检查网络连接。');
      setInputContent(content); // 恢复输入内容
    }
  };

  const handleSelectFriend = (friend: ChatFriend) => {
    setSelectedPeer({
      id: friend.id,
      nickName: friend.nickName,
      avatar: friend.avatar,
      signature: friend.signature || '',
      role: friend.role,
      status: friend.status,
      gender: friend.gender,
      followerCount: friend.followerCount,
      followingCount: friend.followingCount,
    });
    // 点击好友后保持在当前Tab，不切换到会话Tab
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
          {/* Left Sidebar */}
          <div className="w-1/3 border-r border-neutral-200 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-neutral-200 bg-neutral-50 text-[10px]">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 py-2.5 font-semibold transition-colors cursor-pointer ${
                  activeTab === 'conversations' ? 'text-[#0057FF] border-b-2 border-[#0057FF] bg-white' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 inline-block mr-1" />
                会话
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-2.5 font-semibold transition-colors cursor-pointer ${
                  activeTab === 'friends' ? 'text-[#0057FF] border-b-2 border-[#0057FF] bg-white' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 inline-block mr-1" />
                好友
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-2.5 font-semibold transition-colors cursor-pointer ${
                  activeTab === 'search' ? 'text-[#0057FF] border-b-2 border-[#0057FF] bg-white' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Search className="w-3.5 h-3.5 inline-block mr-1" />
                搜索
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'conversations' && (
                <>
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
                            src={resolveImageUrl(peer?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                            alt={peer?.nickName}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-neutral-900 truncate">{peer?.nickName}</div>
                            <div className="text-[11px] text-neutral-400 truncate mt-0.5">{c.lastMessage?.content || '最新私信消息'}</div>
                          </div>
                          {c.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{c.unreadCount}</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </>
              )}

              {activeTab === 'friends' && (
                <>
                  {friends.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400 mt-8">暂无聊天好友<br />（互相关注的用户）</div>
                  ) : (
                    friends.map((friend) => (
                      <button
                        key={friend.id}
                        onClick={() => handleSelectFriend(friend)}
                        className="w-full p-3 text-left border-b border-neutral-100 flex items-center gap-2.5 transition-colors cursor-pointer hover:bg-neutral-50"
                      >
                        <img
                          src={friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                          alt={friend.nickName}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-neutral-900 truncate">{friend.nickName}</div>
                          <div className="text-[11px] text-neutral-400 truncate mt-0.5">{friend.signature || '暂无签名'}</div>
                        </div>
                        {friend.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{friend.unreadCount}</span>
                        )}
                      </button>
                    ))
                  )}
                </>
              )}

              {activeTab === 'search' && (
                <div className="p-3 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="输入用户昵称搜索..."
                      className="flex-1 bg-neutral-100 border border-transparent rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0057FF]"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-3 py-2 bg-[#0057FF] text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-[#0046CC]"
                    >
                      搜索
                    </button>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="text-center text-xs text-neutral-400 mt-8">
                      {searchKeyword ? '未找到匹配的用户' : '输入昵称搜索用户'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSelectFriend(result)}
                          className="w-full p-2.5 text-left border border-neutral-200 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer hover:border-[#0057FF] hover:bg-blue-50/30"
                        >
                          <img
                            src={result.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                            alt={result.nickName}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-neutral-900 truncate">{result.nickName}</div>
                            <div className="text-[10px] text-neutral-400 truncate mt-0.5">{result.signature || '暂无签名'}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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
                    <>
                      {messages.map((m) => {
                        const isMe = m.senderId === user?.id;
                        const avatarUrl = isMe 
                          ? resolveImageUrl(user?.avatar) 
                          : resolveImageUrl(selectedPeer?.avatar);
                        
                        return (
                          <div key={m.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* 头像 */}
                            <img
                              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                              alt={isMe ? user?.nickName : selectedPeer?.nickName}
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                            />
                            
                            {/* 消息气泡 */}
                            <div
                              className={`max-w-[65%] rounded-lg px-3 py-2 text-xs leading-relaxed break-words ${
                                isMe 
                                  ? 'bg-[#95EC69] text-neutral-900' 
                                  : 'bg-white border border-neutral-200 text-neutral-800 shadow-sm'
                              }`}
                            >
                              {m.content}
                            </div>
                          </div>
                        );
                      })}
                      {/* 滚动锚点 */}
                      <div ref={messagesEndRef} />
                    </>
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
                <p className="text-xs">选择左侧会话、好友或搜索用户开始聊天</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
