import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Calendar, BookOpen, X, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  UserNotification,
} from '../services/notifications';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || user.uid === 'guest') return;

    const unsubscribe = getUserNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
      const unread = notifs.filter((n) => !n.read).length;
      setUnreadCount(unread);
    });

    return unsubscribe;
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleNotificationClick = async (notification: UserNotification) => {
    if (!user) return;
    
    if (!notification.read) {
      await markNotificationAsRead(user.uid, notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'connection_request') {
      setShowDropdown(false);
      navigate('/connection-requests');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllNotificationsAsRead(user.uid);
  };

  const getNotificationIcon = (type: string) => {
    if (type === 'connection_request') {
      return <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />;
    }
    if (type === 'broadcast') {
      return <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />;
    }
    if (type.includes('festival')) {
      return <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />;
    }
    return <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />;
  };

  const getNotificationColor = (type: string) => {
    if (type === 'connection_request') {
      return 'bg-blue-100 border-2 border-blue-300';
    }
    if (type === 'broadcast') {
      return 'bg-orange-100 border-2 border-orange-300';
    }
    if (type.includes('approved')) {
      return 'bg-green-100 border-2 border-green-300';
    }
    return 'bg-red-100 border-2 border-red-300';
  };

  if (!user || user.uid === 'guest') return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-3 md:p-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full transition-all hover:scale-110 active:scale-95 shadow-2xl hover:shadow-orange-500/50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 md:w-6 md:h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse px-1.5 ring-2 ring-white shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop - Desktop only */}
          <div 
            className="hidden md:block fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Notification Panel - Unified with responsive positioning */}
          <div className="absolute top-12 right-0 w-[95vw] sm:w-[500px] md:fixed md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[750px] lg:w-[850px] md:right-auto bg-white rounded-xl shadow-2xl border-2 border-orange-200 z-[9999] max-h-[calc(100vh-80px)] md:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 border-b-2 border-orange-200 flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500">
              <div>
                <h3 className="font-bold text-white text-base md:text-xl flex items-center gap-2">
                  <Bell className="w-5 md:w-6 md:h-6 h-5" />
                  Notifications
                </h3>
                <p className="text-xs md:text-sm text-orange-100 mt-0.5">
                  {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs md:text-sm bg-white text-orange-600 hover:bg-orange-50 font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 transition-all shadow-md"
                  >
                    <CheckCheck size={16} className="md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="p-1.5 md:p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                >
                  <X className="w-4 md:w-5 md:h-5 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-[calc(90vh-130px)]">
              {notifications.length === 0 ? (
                <div className="p-12 md:p-16 text-center text-gray-500">
                  <Bell className="w-16 md:w-20 md:h-20 h-16 mx-auto mb-3 md:mb-4 text-gray-300" />
                  <p className="text-base md:text-lg font-semibold text-gray-700">No notifications yet</p>
                  <p className="text-sm text-gray-500 mt-1 md:mt-2">You'll see updates here</p>
                </div>
              ) : (
                <div className="divide-y-2 divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 md:p-6 hover:bg-orange-50 cursor-pointer transition-all ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3 md:gap-5">
                        <div
                          className={`p-2.5 md:p-3.5 rounded-xl flex-shrink-0 ${getNotificationColor(
                            notification.type
                          )}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 md:gap-3">
                            <h4
                              className={`text-sm md:text-lg font-bold ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2.5 md:w-3 md:h-3 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1 md:mt-1.5 animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-sm md:text-base text-gray-700 mt-1.5 md:mt-2 leading-relaxed">
                            {notification.message}
                          </p>
                          {notification.adminComment && (
                            <div className="mt-3 md:mt-4 p-3 md:p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                              <p className="text-xs md:text-sm text-gray-800">
                                <span className="font-bold text-amber-700">💬 Admin Note:</span>{' '}
                                {notification.adminComment}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3 md:mt-4">
                            <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1 md:gap-1.5">
                              <Calendar className="w-3 md:w-4 md:h-4 h-3" />
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                            {!notification.read && (
                              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
