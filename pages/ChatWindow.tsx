import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Chat as ChatType, ChatMessage, UserProfile } from '../types/chat';
import {
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  getTypingStatus,
  setTypingStatus,
  getUserProfile,
} from '../services/chat';
import {
  ArrowLeft,
  Send,
  Smile,
  Image as ImageIcon,
  MoreVertical,
  Wifi,
  WifiOff,
  Quote,
} from 'lucide-react';

const ChatWindow: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Common emojis for quick access
  const quickEmojis = ['🙏', '🕉️', '📿', '🌺', '🔱', '❤️', '😊', '🌟', '✨', '🌸'];

  useEffect(() => {
    if (!chatId || !user) return;

    // Load messages
    const unsubscribeMessages = getChatMessages(chatId, (fetchedMessages) => {
      setMessages(fetchedMessages);
      scrollToBottom();
    });

    // Load typing status
    const unsubscribeTyping = getTypingStatus(chatId, setTypingUsers);

    // Mark messages as read
    markMessagesAsRead(chatId, user.uid);

    // Load other user's profile
    const loadOtherUser = async () => {
      // Get chat data to find other user
      const chatMessages = await new Promise<ChatMessage[]>((resolve) => {
        getChatMessages(chatId, (msgs) => {
          resolve(msgs);
        });
      });

      if (chatMessages.length > 0) {
        const otherUserId = chatMessages.find((msg) => msg.senderId !== user.uid)?.senderId;
        if (otherUserId) {
          const profile = await getUserProfile(otherUserId);
          setOtherUser(profile);
        }
      }
    };

    loadOtherUser();

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      if (chatId && user) {
        setTypingStatus(chatId, user.uid, false);
      }
    };
  }, [chatId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!chatId || !user) return;

    if (!isTyping) {
      setIsTyping(true);
      setTypingStatus(chatId, user.uid, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTypingStatus(chatId, user.uid, false);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !chatId || !user) return;

    try {
      await sendMessage(
        chatId,
        user.uid,
        user.displayName || 'Anonymous',
        messageText.trim(),
        'text',
        replyingTo
          ? {
              messageId: replyingTo.id,
              text: replyingTo.text,
              senderName: replyingTo.senderName,
            }
          : undefined
      );

      setMessageText('');
      setReplyingTo(null);
      setIsTyping(false);
      setTypingStatus(chatId, user.uid, false);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addEmoji = (emoji: string) => {
    setMessageText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };

  const isOtherUserTyping = Object.entries(typingUsers).some(
    ([userId, typing]) => userId !== user?.uid && typing
  );

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border-2 border-stone-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/chats')}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>

          {otherUser && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  {otherUser.photoURL ? (
                    <img
                      src={otherUser.photoURL}
                      alt={otherUser.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-orange-600">
                      {otherUser.userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    otherUser.isOnline ? 'bg-green-500' : 'bg-stone-400'
                  }`}
                />
              </div>

              <div>
                <h3 className="text-white font-bold text-lg">{otherUser.userName}</h3>
                <p className="text-orange-100 text-sm flex items-center gap-1">
                  {otherUser.isOnline ? (
                    <>
                      <Wifi size={14} />
                      Online
                    </>
                  ) : (
                    <>
                      <WifiOff size={14} />
                      Offline
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        <button className="p-2 hover:bg-white/20 rounded-lg transition-all">
          <MoreVertical className="text-white" size={24} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-orange-50/30 to-white">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId === user.uid;
          const showDateSeparator =
            index === 0 ||
            new Date(messages[index - 1].timestamp).toDateString() !==
              new Date(message.timestamp).toDateString();

          return (
            <div key={message.id}>
              {/* Date Separator */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-6">
                  <div className="bg-stone-200 text-stone-600 px-4 py-2 rounded-full text-sm font-semibold">
                    {new Date(message.timestamp).toDateString() === new Date().toDateString()
                      ? 'Today'
                      : new Date(message.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white' : 'bg-white border-2 border-stone-200'
                  } rounded-2xl shadow-md hover:shadow-lg transition-all group`}
                >
                  {/* Reply Preview */}
                  {message.replyTo && (
                    <div
                      className={`p-3 border-l-4 ${
                        isOwnMessage ? 'border-white/40 bg-white/10' : 'border-orange-400 bg-orange-50'
                      } rounded-t-2xl`}
                    >
                      <p className={`text-xs font-bold ${isOwnMessage ? 'text-white/80' : 'text-orange-600'}`}>
                        {message.replyTo.senderName}
                      </p>
                      <p className={`text-sm ${isOwnMessage ? 'text-white/90' : 'text-stone-600'} truncate`}>
                        {message.replyTo.text}
                      </p>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="p-4">
                    {!isOwnMessage && (
                      <p className="text-xs font-bold text-orange-600 mb-1">{message.senderName}</p>
                    )}
                    <p className={`text-base leading-relaxed whitespace-pre-wrap break-words ${isOwnMessage ? 'text-white' : 'text-stone-900'}`}>
                      {message.text}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <span className={`text-xs ${isOwnMessage ? 'text-white/80' : 'text-stone-500'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                      {isOwnMessage && (
                        <span className="text-xs text-white/80">
                          {message.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {!isOwnMessage && (
                    <button
                      onClick={() => setReplyingTo(message)}
                      className="opacity-0 group-hover:opacity-100 absolute -top-2 right-2 bg-orange-600 text-white p-1 rounded-full shadow-lg hover:bg-orange-700 transition-all"
                    >
                      <Quote size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isOtherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-stone-200 rounded-2xl px-6 py-4 shadow-md">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-6 py-3 bg-orange-50 border-t border-orange-200 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-bold text-orange-600">Replying to {replyingTo.senderName}</p>
            <p className="text-sm text-stone-600 truncate">{replyingTo.text}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-stone-400 hover:text-stone-600 p-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="px-6 py-3 bg-white border-t border-stone-200">
          <div className="flex flex-wrap gap-2">
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-orange-50 rounded-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-white border-t-2 border-stone-200">
        <div className="flex items-end gap-3">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-3 rounded-lg transition-all ${
              showEmojiPicker ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Smile size={24} />
          </button>

          <div className="flex-1">
            <textarea
              ref={messageInputRef}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none font-medium"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
