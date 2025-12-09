import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Chat, UserProfile } from '../types/chat';
import { getUserChats, getTotalUnreadCount } from '../services/chat';
import { MessageCircle, Search, Users, Wifi, WifiOff, Filter, X } from 'lucide-react';

const ChatsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    iskconCenter: 'All',
    guruName: 'All',
  });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getUserChats(user.uid, (fetchedChats) => {
      setChats(fetchedChats);
      setLoading(false);
    });

    // Load total unread count with error handling
    const loadUnreadCount = async () => {
      try {
        const count = await getTotalUnreadCount(user.uid);
        setTotalUnread(count);
      } catch (error) {
        console.warn('Failed to load unread count:', error);
        setTotalUnread(0);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 5000); // Update every 5 seconds

    // Set timeout to stop loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [user]);

  const filteredChats = chats.filter((chat) => {
    const otherParticipant = chat.participants.find((p) => p !== user?.uid);
    if (!otherParticipant) return false;

    const otherUser = chat.participantDetails[otherParticipant];
    
    // Search term filter
    const matchesSearch = !searchTerm || 
      otherUser.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser.guruName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser.iskconCenter.toLowerCase().includes(searchTerm.toLowerCase());
    
    // ISKCON center filter
    const matchesCenter = filters.iskconCenter === 'All' || 
      (filters.iskconCenter === 'Not Specified' && (!otherUser.iskconCenter || otherUser.iskconCenter === '' || otherUser.iskconCenter.toLowerCase() === 'n/a')) ||
      otherUser.iskconCenter === filters.iskconCenter;
    
    // Guru name filter
    const matchesGuru = filters.guruName === 'All' || 
      otherUser.guruName === filters.guruName;
    
    return matchesSearch && matchesCenter && matchesGuru;
  });

  const getOtherParticipant = (chat: Chat) => {
    const otherParticipantId = chat.participants.find((p) => p !== user?.uid);
    return otherParticipantId ? chat.participantDetails[otherParticipantId] : null;
  };

  // Get unique ISKCON centers and gurus from chats
  const uniqueCenters = Array.from(new Set(
    chats.map(chat => {
      const otherUser = getOtherParticipant(chat);
      return otherUser?.iskconCenter;
    }).filter(Boolean).filter((c): c is string => typeof c === 'string' && c.toLowerCase() !== 'n/a')
  ));

  const uniqueGurus = Array.from(new Set(
    chats.map(chat => {
      const otherUser = getOtherParticipant(chat);
      return otherUser?.guruName;
    }).filter(Boolean).filter((g): g is string => typeof g === 'string' && g.toLowerCase() !== 'n/a')
  ));

  const hasChatsWithoutCenter = chats.some(chat => {
    const otherUser = getOtherParticipant(chat);
    return !otherUser?.iskconCenter || otherUser.iskconCenter === '' || otherUser.iskconCenter.toLowerCase() === 'n/a';
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
          <p className="text-stone-600 font-medium text-lg">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-orange-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <MessageCircle className="text-white" size={24} />
              </div>
              Messages
            </h2>
            <p className="text-orange-100 text-sm sm:text-base md:text-lg font-medium">
              {chats.length} conversation{chats.length !== 1 ? 's' : ''}
              {totalUnread > 0 && ` • ${totalUnread} unread`}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all shadow-lg transform hover:scale-105 active:scale-95 ${
                showFilters ? 'bg-white text-orange-600' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Filter size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              onClick={() => navigate('/community')}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-orange-600 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-orange-50 transition-all shadow-lg transform hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Users size={20} />
              Find Devotees
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={24} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-4 py-4 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none text-base font-semibold shadow-md"
          />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-stone-200 p-6 space-y-4 animate-slideDown">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-stone-900">Filter Conversations</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spiritual Guide Filter */}
              <select
                value={filters.guruName}
                onChange={(e) => setFilters({ ...filters, guruName: e.target.value })}
                className="p-4 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-semibold"
              >
                <option value="All">All Spiritual Guides</option>
                {uniqueGurus.map(guru => (
                  <option key={guru} value={guru}>{guru}</option>
                ))}
              </select>

              {/* ISKCON Center Filter */}
              <select
                value={filters.iskconCenter}
                onChange={(e) => setFilters({ ...filters, iskconCenter: e.target.value })}
                className="p-4 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-semibold"
              >
                <option value="All">All ISKCON Centers</option>
                {uniqueCenters.map(center => (
                  <option key={center} value={center}>{center}</option>
                ))}
                {hasChatsWithoutCenter && (
                  <option value="Not Specified">Not Specified</option>
                )}
              </select>
            </div>

            {/* Clear Filters */}
            {((filters.guruName && filters.guruName !== 'All') || (filters.iskconCenter && filters.iskconCenter !== 'All')) && (
              <button
                onClick={() => setFilters({ guruName: 'All', iskconCenter: 'All' })}
                className="text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chats List */}
      {filteredChats.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-stone-300">
          <MessageCircle className="mx-auto mb-4 text-stone-400" size={64} />
          <p className="text-stone-600 text-lg font-medium mb-2">
            {chats.length === 0 ? 'No conversations yet' : 'No matching conversations'}
          </p>
          <p className="text-stone-400 mb-4">
            {chats.length === 0
              ? 'Start connecting with fellow devotees'
              : 'Try a different search term'}
          </p>
          {chats.length === 0 && (
            <button
              onClick={() => navigate('/community')}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-lg font-bold hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg transform hover:scale-105 active:scale-95"
            >
              Browse Community
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChats.map((chat) => {
            const otherUser = getOtherParticipant(chat);
            if (!otherUser) return null;

            const unreadCount = chat.unreadCount[user?.uid || ''] || 0;
            const isUnread = unreadCount > 0;

            return (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
                  isUnread ? 'border-orange-400 bg-orange-50/50' : 'border-stone-200 hover:border-orange-300'
                } p-5 transform hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      {otherUser.photoURL ? (
                        <img
                          src={otherUser.photoURL}
                          alt={otherUser.userName}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = iskconLogo;
                            e.currentTarget.classList.remove('rounded-full');
                            e.currentTarget.classList.add('rounded-full', 'p-1.5');
                          }}
                        />
                      ) : (
                        <img
                          src={iskconLogo}
                          alt="ISKCON"
                          className="w-full h-full object-contain p-1.5"
                        />
                      )}
                    </div>
                    {/* Online indicator would go here if we track it in chat context */}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold text-lg ${isUnread ? 'text-orange-900' : 'text-stone-900'}`}>
                        {otherUser.userName}
                      </h3>
                      {chat.lastMessage && (
                        <span className={`text-sm ${isUnread ? 'text-orange-600 font-bold' : 'text-stone-500'}`}>
                          {formatTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-stone-600 mb-1">
                      {otherUser.guruName && otherUser.guruName.toLowerCase() !== 'n/a' ? otherUser.guruName : 'N/A'} • {otherUser.iskconCenter && otherUser.iskconCenter.toLowerCase() !== 'n/a' ? otherUser.iskconCenter : 'N/A'}
                    </p>

                    <div className="flex items-center justify-between">
                      {chat.lastMessage ? (
                        <p className={`text-sm truncate flex-1 ${isUnread ? 'font-bold text-stone-900' : 'text-stone-500'}`}>
                          {chat.lastMessage.senderId === user?.uid && 'You: '}
                          {chat.lastMessage.text === '[Encrypted Message]' ? '🔒 Encrypted Message' : chat.lastMessage.text}
                        </p>
                      ) : (
                        <p className="text-sm text-stone-400 italic">No messages yet</p>
                      )}

                      {isUnread && (
                        <div className="ml-2 flex-shrink-0 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredChats.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-12 border-2 border-orange-200 max-w-md mx-auto">
            <MessageCircle size={64} className="text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-stone-800 mb-3">No Messages Yet</h3>
            <p className="text-stone-600 mb-6">
              {searchTerm
                ? 'No conversations match your search.'
                : 'Start connecting with devotees from the Community page!'}
            </p>
            <button
              onClick={() => navigate('/community')}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-bold hover:from-orange-700 hover:to-amber-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Browse Community
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsList;
