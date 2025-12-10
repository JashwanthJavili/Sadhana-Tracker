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
    setIsVisible(!isChatPage);
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <>
      {/* Fixed round message icon button with badge number - Mobile Only, positioned below music icon */}
      <button
        onClick={() => navigate('/chats')}
        className="md:hidden fixed bottom-6 right-6 z-[55] bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg active:scale-95 transition-all duration-300"
      >
        <MessageCircle size={24} className="relative z-10" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-6 flex items-center justify-center border-2 border-orange-600 shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </>
  );
};

export default FloatingMessageBadge;
