import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Send, MessageSquare, User as UserIcon, Users, Smile, Search, ExternalLink, Clock, Sparkles } from 'lucide-react';
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
      localStorage.removeItem('tempChats');
    }
  }, [tempChats]);

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
        const existingIndex = prev.findIndex(u => u.id === targetUser.id);
        
        if (existingIndex !== -1) {
          const existingUser = prev[existingIndex];
          const updated = [
            existingUser,
            ...prev.slice(0, existingIndex),
            ...prev.slice(existingIndex + 1)
          ];
          localStorage.setItem('tempChats', JSON.stringify(updated));
          return updated;
        } else {
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
      loadFriends();
      refreshCounts();
      
      if (selectedPeer && (msg.senderId === selectedPeer.id || msg.receiverId === selectedPeer.id)) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === msg.id);
          if (exists) return prev;
          return [...prev, msg];
        });
        
        if (msg.senderId === selectedPeer.id && user) {
          chatApi.markConversationRead(selectedPeer.id).catch(err => {
            console.error('Failed to mark as read:', err);
          });
        }
      }
    };

    chatWs.addMessageListener(handleNewMessage);
    
    return () => {
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
      const sortedMessages = list.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
      await chatApi.markConversationRead(peerId);
      await refreshCounts();
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

    if (selectedPeer.id === user.id) {
      alert('不能给自己发送私信');
      return;
    }

    const content = inputContent.trim();
    setInputContent('');
    setShowEmojiPicker(false);

    try {
      if (chatWs && chatWs.isConnected) {
        const optimisticMsg = chatWs.send(selectedPeer.id, content, user.id);
        setMessages((prev) => [...prev, optimisticMsg]);
      } else {
        alert('WebSocket未连接，无法发送消息。请刷新页面重试。');
        setInputContent(content);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('发送消息失败，请检查网络连接。');
      setInputContent(content);
    }
  };

  const handleSelectFriend = (friend: ChatFriend | User) => {
    const peerUser: User = 'role' in friend ? {
      id: friend.id,
      nickName: friend.nickName,
      avatar: friend.avatar,
      signature: friend.signature || '',
      role: friend.role as any,
      status: friend.status as any,
      gender: friend.gender,
      followerCount: friend.followerCount,
      followingCount: friend.followingCount,
    } : friend;
    
    setSelectedPeer(peerUser);
  };

  const handleEmojiClick = (emoji: string) => {
    setInputContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleRemoveTempChat = (userId: number) => {
    setTempChats(prev => {
      const updated = prev.filter(u => u.id !== userId);
      if (updated.length === 0) {
        localStorage.removeItem('tempChats');
      } else {
        localStorage.setItem('tempChats', JSON.stringify(updated));
      }
      return updated;
    });
    
    if (selectedPeer?.id === userId) {
      setSelectedPeer(null);
      setMessages([]);
    }
  };

  const handleOpenAuthorModal = (userId: number) => {
    const event = new CustomEvent('open-author-modal', { detail: { userId } });
    window.dispatchEvent(event);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs"
        />

        {/* Drawer Window */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col relative z-10 border-l border-neutral-200"
        >
          {/* Drawer Top Header */}
          <div className="px-6 py-4 border-b border-neutral-200/80 bg-neutral-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0057FF] flex items-center justify-center text-white shadow-xs">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  私信聊天室
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono border border-blue-400/30">
                    Real-time
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  {selectedPeer ? `正在与 ${selectedPeer.nickName} 沟通` : '选择会话开启交流'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Main Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Chat List */}
            <div className="w-72 sm:w-80 border-r border-neutral-200/80 bg-neutral-50/60 flex flex-col shrink-0">
              {/* Tab Switcher */}
              <div className="p-2 border-b border-neutral-200/80 bg-white grid grid-cols-3 gap-1">
                {[
                  { id: 'temp', label: '临时', icon: MessageSquare, count: tempChats.length },
                  { id: 'friends', label: '好友', icon: Users, count: friends.length },
                  { id: 'search', label: '查找', icon: Search },
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`relative py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isActive ? 'text-[#0057FF] bg-blue-50/80' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {typeof tab.count === 'number' && tab.count > 0 && (
                        <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${isActive ? 'bg-[#0057FF] text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Stream */}
              <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
                {activeTab === 'temp' && (
                  <>
                    {tempChats.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-400 space-y-2 mt-6">
                        <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto stroke-1" />
                        <p className="font-bold text-neutral-600">暂无临时会话</p>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">可在作品页面点击“私信作者”发起即时沟通</p>
                      </div>
                    ) : (
                      tempChats.map((chat) => {
                        const isSelected = selectedPeer?.id === chat.id;
                        return (
                          <button
                            key={chat.id}
                            onClick={() => setSelectedPeer(chat)}
                            className={`w-full p-3.5 text-left flex items-center gap-3 transition-all cursor-pointer group relative ${
                              isSelected
                                ? 'bg-white border-l-4 border-l-[#0057FF] shadow-xs'
                                : 'hover:bg-white/80'
                            }`}
                          >
                            <img
                              src={resolveImageUrl(chat.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                              alt={chat.nickName}
                              className="w-11 h-11 rounded-full object-cover shrink-0 border border-neutral-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sm text-neutral-900 truncate group-hover:text-[#0057FF] transition-colors">
                                {chat.nickName}
                              </div>
                              <div className="text-xs text-neutral-400 truncate mt-0.5">
                                {chat.signature || '临时私信会话'}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTempChat(chat.id);
                              }}
                              className="p-1.5 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="移除该会话"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </button>
                        );
                      })
                    )}
                  </>
                )}

                {activeTab === 'friends' && (
                  <>
                    {friends.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-400 space-y-2 mt-6">
                        <Users className="w-8 h-8 text-neutral-300 mx-auto stroke-1" />
                        <p className="font-bold text-neutral-600">暂无互关好友</p>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">与您互相关注的创作者将自动显示在此列表中</p>
                      </div>
                    ) : (
                      friends.map((friend) => {
                        const isSelected = selectedPeer?.id === friend.id;
                        return (
                          <button
                            key={friend.id}
                            onClick={() => handleSelectFriend(friend)}
                            className={`w-full p-3.5 text-left flex items-center gap-3 transition-all cursor-pointer group ${
                              isSelected
                                ? 'bg-white border-l-4 border-l-[#0057FF] shadow-xs'
                                : 'hover:bg-white/80'
                            }`}
                          >
                            <img
                              src={resolveImageUrl(friend.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                              alt={friend.nickName}
                              className="w-11 h-11 rounded-full object-cover shrink-0 border border-neutral-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sm text-neutral-900 truncate group-hover:text-[#0057FF] transition-colors">
                                {friend.nickName}
                              </div>
                              <div className="text-xs text-neutral-400 truncate mt-0.5">
                                {friend.signature || '暂无签名'}
                              </div>
                            </div>
                            {friend.unreadCount > 0 && (
                              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                {friend.unreadCount}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </>
                )}
              </div>
            </div>

          {/* Chat Messages Area */}
          <div className="flex-1 flex flex-col bg-neutral-50/50">
              {selectedPeer ? (
                <>
                  {/* Chat Partner Bar Header */}
                  <div className="px-6 py-3.5 bg-white border-b border-neutral-200/80 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveImageUrl(selectedPeer.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                        alt={selectedPeer.nickName}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-neutral-900">{selectedPeer.nickName}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="在线" />
                        </div>
                        <p className="text-xs text-neutral-400 truncate max-w-xs">
                          {selectedPeer.signature || '创作者'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAuthorModal(selectedPeer.id)}
                      className="px-3 py-1.5 text-xs font-bold text-[#0057FF] bg-blue-50 hover:bg-blue-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>主页</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Messages Stream Container */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {loading ? (
                      <div className="text-center py-12 text-xs text-neutral-400 space-y-2">
                        <Clock className="w-6 h-6 animate-spin mx-auto text-neutral-300" />
                        <p>正在拉取私信记录...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-16 text-xs text-neutral-400 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                          <Sparkles className="w-6 h-6 text-[#0057FF]" />
                        </div>
                        <p className="font-bold text-neutral-700 text-sm">灵感交流第一步</p>
                        <p className="text-neutral-400 max-w-xs mx-auto">友好礼貌的沟通有助于建立创作合作关系，快发一条消息招呼吧！</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((m) => {
                          const isMe = m.senderId === user?.id;
                          const avatarUrl = isMe 
                            ? resolveImageUrl(user?.avatar) 
                            : resolveImageUrl(selectedPeer?.avatar);
                          
                          return (
                            <motion.div 
                              key={m.id} 
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                              <img
                                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                                alt={isMe ? user?.nickName : selectedPeer?.nickName}
                                className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-200 mt-0.5 shadow-2xs"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                                }}
                              />
                              
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed break-words shadow-2xs ${
                                  isMe 
                                    ? 'bg-[#0057FF] text-white rounded-tr-xs font-medium' 
                                    : 'bg-white border border-neutral-200/90 text-neutral-900 rounded-tl-xs font-medium'
                                }`}
                              >
                                {m.content}
                              </div>
                            </motion.div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Input Toolbar */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-200/80">
                    <div className="flex items-center gap-2 relative">
                      <div className="relative" ref={emojiPickerRef}>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-2.5 text-neutral-500 hover:text-[#0057FF] hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                          title="表情符号"
                        >
                          <Smile className="w-5 h-5" />
                        </button>
                        
                        {showEmojiPicker && (
                          <div className="absolute bottom-full left-0 mb-3 bg-white border border-neutral-200 rounded-2xl shadow-xl p-3 w-72 max-h-60 overflow-y-auto z-50">
                            <div className="text-[11px] font-bold text-neutral-500 mb-2 px-1">选择表情</div>
                            <div className="grid grid-cols-7 gap-1">
                              {emojis.map((emoji, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleEmojiClick(emoji)}
                                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <input
                        type="text"
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        placeholder={`给 ${selectedPeer.nickName} 发送私信...`}
                        className="flex-1 bg-neutral-100/90 border border-transparent rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/20 transition-all"
                      />
                      
                      <button
                        type="submit"
                        disabled={!inputContent.trim()}
                        className="p-2.5 bg-[#0057FF] hover:bg-[#0046CC] disabled:opacity-40 disabled:hover:bg-[#0057FF] text-white rounded-2xl transition-all cursor-pointer shrink-0 shadow-xs"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                    <UserIcon className="w-8 h-8 stroke-1" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-neutral-700">私信会话面板</h3>
                    <p className="text-xs text-neutral-400 max-w-xs">从左侧选择某个临时会话或好友，即可在此开启专属沟通</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

