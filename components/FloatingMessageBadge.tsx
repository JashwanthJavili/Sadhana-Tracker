import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getTotalUnreadCount } from '../services/chat';
import { useAuth } from '../contexts/AuthContext';

const FloatingMessageBadge: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = async () => {
      try {
        const count = await getTotalUnreadCount(user.uid);
        setUnreadCount(count);
      } catch (error) {
        console.warn('Failed to load unread count:', error);
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 5000); // Update every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // Hide on ChatsList and ChatWindow pages
  useEffect(() => {
    const isChatPage = location.pathname === '/chats' || location.pathname.startsWith('/chat/');
    setIsVisible(!isChatPage && unreadCount > 0);
  }, [location.pathname, unreadCount]);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => navigate('/chats')}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-full shadow-2xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center gap-2 px-4 py-3 animate-bounce-slow"
      style={{
        animation: 'bounce-gentle 2s ease-in-out infinite'
      }}
    >
      <div className="relative">
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-white shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      <span className="font-bold text-sm">
        {unreadCount === 1 ? '1 Unread Message' : `${unreadCount} Unread Messages`}
      </span>
      
      <style>{`
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </button>
  );
};

export default FloatingMessageBadge;
