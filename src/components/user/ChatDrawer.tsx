import React, { useEffect, useState, useRef } from 'react';
import { X, Send, MessageSquare, User as UserIcon, Users, Smile } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'temp' | 'friends'>('temp');
  const [friends, setFriends] = useState<ChatFriend[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<User | null>(targetUser || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tempChats, setTempChats] = useState<User[]>(() => {
    // 从localStorage加载临时会话列表
    try {
      const saved = localStorage.getItem('tempChats');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // 常用表情列表
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵',
    '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟',
    '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
    '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
    '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡',
    '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡',
    '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻',
    '😼', '😽', '🙀', '😿', '😾', '❤️', '🧡', '💛',
    '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️',
    '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍',
    '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟',
    '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇',
    '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪',
    '🦾', '🖕', '✍️', '🙏', '🦶', '🦵', '👂', '🦻',
  ];

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 消息更新后滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 监听tempChats变化，保存到localStorage
  useEffect(() => {
    if (tempChats.length > 0) {
      localStorage.setItem('tempChats', JSON.stringify(tempChats));
    } else {
      // 如果列表为空，删除localStorage中的数据
      localStorage.removeItem('tempChats');
    }
  }, [tempChats]);

  // 消息更新后滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 点击外部关闭表情选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen]);

  useEffect(() => {
    if (targetUser) {
      setSelectedPeer(targetUser);
      setActiveTab('temp');
      
      // 添加或更新临时会话列表
      setTempChats(prev => {
        // 查找是否已存在该用户
        const existingIndex = prev.findIndex(u => u.id === targetUser.id);
        
        if (existingIndex !== -1) {
          // 已存在：使用旧数据，将其移到最前面
          const existingUser = prev[existingIndex];
          const updated = [
            existingUser, // 保留旧数据
            ...prev.slice(0, existingIndex),
            ...prev.slice(existingIndex + 1)
          ];
          localStorage.setItem('tempChats', JSON.stringify(updated));
          return updated;
        } else {
          // 不存在：添加新用户到最前面
          const updated = [targetUser, ...prev];
          localStorage.setItem('tempChats', JSON.stringify(updated));
          return updated;
        }
      });
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
      
      // 刷新好友列表（异步执行）
      loadFriends();
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

  const loadFriends = async () => {
    try {
      const list = await chatApi.getFriends();
      setFriends(list);
    } catch (err) {
      console.error('Failed to load friends:', err);
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
      // 重新加载好友列表以更新未读数
      loadFriends();
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
    setShowEmojiPicker(false); // 发送后关闭表情选择器

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

  const handleSelectFriend = (friend: ChatFriend | User) => {
    const peerUser: User = 'role' in friend ? {
      id: friend.id,
      nickName: friend.nickName,
      avatar: friend.avatar,
      signature: friend.signature || '',
      role: friend.role,
      status: friend.status,
      gender: friend.gender,
      followerCount: friend.followerCount,
      followingCount: friend.followingCount,
    } : friend;
    
    setSelectedPeer(peerUser);
  };

  // 插入表情到输入框
  const handleEmojiClick = (emoji: string) => {
    setInputContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // 删除临时会话
  const handleRemoveTempChat = (userId: number) => {
    setTempChats(prev => {
      const updated = prev.filter(u => u.id !== userId);
      // 更新localStorage
      if (updated.length === 0) {
        localStorage.removeItem('tempChats');
      } else {
        localStorage.setItem('tempChats', JSON.stringify(updated));
      }
      return updated;
    });
    
    // 如果删除的是当前选中的用户，清空选中状态
    if (selectedPeer?.id === userId) {
      setSelectedPeer(null);
      setMessages([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[200] flex justify-end">
      <div className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#0057FF]" />
            <h2 className="text-lg font-bold text-neutral-900">
              {selectedPeer ? `与 ${selectedPeer.nickName} 私信对话` : '私信会话消息'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-neutral-200 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-neutral-200 bg-neutral-50 text-xs">
              <button
                onClick={() => setActiveTab('temp')}
                className={`flex-1 py-3 font-semibold transition-colors cursor-pointer ${
                  activeTab === 'temp' ? 'text-[#0057FF] border-b-2 border-[#0057FF] bg-white' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline-block mr-1" />
                临时会话
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-3 font-semibold transition-colors cursor-pointer ${
                  activeTab === 'friends' ? 'text-[#0057FF] border-b-2 border-[#0057FF] bg-white' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Users className="w-4 h-4 inline-block mr-1" />
                好友
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'temp' && (
                <>
                  {tempChats.length === 0 ? (
                    <div className="p-4 text-center text-sm text-neutral-400 mt-8">
                      暂无临时会话<br />
                      <span className="text-xs">从作品详情页点击"私信作者"开始聊天</span>
                    </div>
                  ) : (
                    <>
                      {tempChats.map((chat) => {
                        const isSelected = selectedPeer?.id === chat.id;
                        return (
                          <button
                            key={chat.id}
                            onClick={() => setSelectedPeer(chat)}
                            className={`w-full p-3.5 text-left border-b border-neutral-100 flex items-center gap-3 transition-colors cursor-pointer ${
                              isSelected ? 'bg-blue-100 border-l-4 border-l-[#0057FF]' : 'hover:bg-neutral-50'
                            }`}
                          >
                            <img
                              src={resolveImageUrl(chat.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                              alt={chat.nickName}
                              className="w-11 h-11 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sm text-neutral-900 truncate">{chat.nickName}</div>
                              <div className="text-xs text-neutral-400 truncate mt-1">{chat.signature || '临时会话'}</div>
                            </div>
                            {/* 删除按钮 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTempChat(chat.id);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除临时会话"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </button>
                        );
                      })}
                    </>
                  )}
                </>
              )}

              {activeTab === 'friends' && (
                <>
                  {friends.length === 0 ? (
                    <div className="p-4 text-center text-sm text-neutral-400 mt-8">暂无聊天好友<br />（互相关注的用户）</div>
                  ) : (
                    friends.map((friend) => {
                      const isSelected = selectedPeer?.id === friend.id;
                      return (
                        <button
                          key={friend.id}
                          onClick={() => handleSelectFriend(friend)}
                          className={`w-full p-3.5 text-left border-b border-neutral-100 flex items-center gap-3 transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-100 border-l-4 border-l-[#0057FF]' : 'hover:bg-neutral-50'
                          }`}
                        >
                          <img
                            src={friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                            alt={friend.nickName}
                            className="w-11 h-11 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-neutral-900 truncate">{friend.nickName}</div>
                            <div className="text-xs text-neutral-400 truncate mt-1">{friend.signature || '暂无签名'}</div>
                          </div>
                          {friend.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{friend.unreadCount}</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </>
              )}

              {activeTab === 'search' && (
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="输入用户昵称搜索..."
                      className="flex-1 bg-neutral-100 border border-transparent rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0057FF]"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2.5 bg-[#0057FF] text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#0046CC]"
                    >
                      搜索
                    </button>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="text-center text-sm text-neutral-400 mt-8">
                      {searchKeyword ? '未找到匹配的用户' : '输入昵称搜索用户'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSelectFriend(result)}
                          className="w-full p-3 text-left border border-neutral-200 rounded-lg flex items-center gap-3 transition-colors cursor-pointer hover:border-[#0057FF] hover:bg-blue-50/30"
                        >
                          <img
                            src={result.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                            alt={result.nickName}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-neutral-900 truncate">{result.nickName}</div>
                            <div className="text-xs text-neutral-400 truncate mt-1">{result.signature || '暂无签名'}</div>
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
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-sm text-neutral-400">正在加载聊天记录...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-sm text-neutral-400">还没有任何交流，发送一条招呼吧</div>
                  ) : (
                    <>
                      {messages.map((m) => {
                        const isMe = m.senderId === user?.id;
                        const avatarUrl = isMe 
                          ? resolveImageUrl(user?.avatar) 
                          : resolveImageUrl(selectedPeer?.avatar);
                        
                        return (
                          <div key={m.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* 头像 */}
                            <img
                              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                              alt={isMe ? user?.nickName : selectedPeer?.nickName}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            
                            {/* 消息气泡 */}
                            <div
                              className={`max-w-[65%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed break-words ${
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
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-200">
                  <div className="flex items-end gap-2 relative">
                    {/* 表情选择器按钮 */}
                    <div className="relative" ref={emojiPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2.5 text-neutral-500 hover:text-[#0057FF] hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                        title="选择表情"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      
                      {/* 表情选择器面板 */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white border border-neutral-200 rounded-xl shadow-2xl p-3 w-80 max-h-64 overflow-y-auto z-50">
                          <div className="text-xs font-semibold text-neutral-600 mb-2">选择表情</div>
                          <div className="grid grid-cols-8 gap-1">
                            {emojis.map((emoji, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleEmojiClick(emoji)}
                                className="w-9 h-9 flex items-center justify-center text-2xl hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 输入框 */}
                    <input
                      type="text"
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder="输入私信内容..."
                      className="flex-1 bg-neutral-100 border border-transparent rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0057FF]"
                    />
                    
                    {/* 发送按钮 */}
                    <button
                      type="submit"
                      disabled={!inputContent.trim()}
                      className="p-2.5 bg-[#0057FF] hover:bg-[#0046CC] disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400 space-y-2">
                <UserIcon className="w-10 h-10 stroke-1" />
                <p className="text-xs">选择左侧临时会话或好友开始聊天</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
