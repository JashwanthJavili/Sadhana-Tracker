import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types/chat';
import { getAllUsers, searchUsers, createOrGetChat } from '../services/chat';
import { useAuth } from '../contexts/AuthContext';
import { Users, Search, MessageCircle, Wifi, WifiOff, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Community: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    onlineOnly: false,
    guruName: 'All',
    iskconCenter: 'All',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getAllUsers((fetchedUsers) => {
      console.log('✅ Fetched users with profiles:', fetchedUsers);
      // Exclude current user (getAllUsers already filters for valid profiles)
      const validUsers = fetchedUsers.filter(u => u.uid !== user.uid);
      setUsers(validUsers);
      setFilteredUsers(validUsers);
      setLoading(false);
    });

    // Set a timeout to stop loading even if data doesn't arrive
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [user]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...users];

      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter(u =>
          u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.guruName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.iskconCenter?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply online filter
      if (filters.onlineOnly) {
        filtered = filtered.filter(u => u.isOnline);
      }

      // Apply guru filter
      if (filters.guruName && filters.guruName !== 'All') {
        filtered = filtered.filter(u => u.guruName === filters.guruName);
      }

      // Apply ISKCON center filter
      if (filters.iskconCenter && filters.iskconCenter !== 'All') {
        if (filters.iskconCenter === 'Not Specified') {
          filtered = filtered.filter(u => !u.iskconCenter || u.iskconCenter === '' || u.iskconCenter.toLowerCase() === 'n/a');
        } else {
          filtered = filtered.filter(u => u.iskconCenter === filters.iskconCenter);
        }
      }

      setFilteredUsers(filtered);
    };

    applyFilters();
  }, [searchTerm, filters, users]);

  const handleStartChat = async (otherUserId: string) => {
    if (!user) return;

    try {
      const chatId = await createOrGetChat(user.uid, otherUserId);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Unable to start chat. Please make sure you have completed your profile settings.');
    }
  };

  const uniqueGurus = Array.from(new Set(users.map(u => u.guruName))).filter(Boolean).filter((g): g is string => typeof g === 'string' && g.toLowerCase() !== 'n/a');
  const uniqueCenters = Array.from(new Set(users.map(u => u.iskconCenter))).filter(Boolean).filter((c): c is string => typeof c === 'string' && c.toLowerCase() !== 'n/a');
  const hasUsersWithoutCenter = users.some(u => !u.iskconCenter || u.iskconCenter === '' || u.iskconCenter.toLowerCase() === 'n/a');

  const getOnlineCount = () => filteredUsers.filter(u => u.isOnline).length;
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
          <p className="text-stone-600 font-medium text-lg">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 rounded-2xl p-8 shadow-2xl border-2 border-orange-400">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-serif font-bold text-white mb-2 flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Users className="text-white" size={36} />
              </div>
              Devotee Community
            </h2>
            <p className="text-orange-100 text-lg font-medium">
              Connect with {filteredUsers.length} fellow devotees • {getOnlineCount()} online
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg transform hover:scale-105 active:scale-95 ${
              showFilters ? 'bg-white text-orange-600' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={24} />
          <input
            type="text"
            placeholder="Search by name, guru, or ISKCON center..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-4 py-4 border-3 border-stone-300 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none text-base font-semibold shadow-md"
          />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-stone-200 p-6 space-y-4 animate-slideDown">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-stone-900">Filter Devotees</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Online Status Filter */}
              <label className="flex items-center gap-3 p-4 border-2 border-stone-200 rounded-lg hover:bg-orange-50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={filters.onlineOnly}
                  onChange={(e) => setFilters({ ...filters, onlineOnly: e.target.checked })}
                  className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                />
                <Wifi className="text-green-600" size={20} />
                <span className="font-semibold text-stone-700">Online Only</span>
              </label>

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
                {hasUsersWithoutCenter && (
                  <option value="Not Specified">Not Specified</option>
                )}
              </select>
            </div>

            {/* Clear Filters */}
            {(filters.onlineOnly || (filters.guruName && filters.guruName !== 'All') || (filters.iskconCenter && filters.iskconCenter !== 'All')) && (
              <button
                onClick={() => setFilters({ onlineOnly: false, guruName: 'All', iskconCenter: 'All' })}
                className="text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-stone-300">
          <Users className="mx-auto mb-4 text-stone-400" size={64} />
          <p className="text-stone-600 text-lg font-medium">No devotees found matching your filters</p>
          <p className="text-stone-400 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((profile) => (
            <div
              key={profile.uid}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-stone-200 hover:border-orange-300 overflow-hidden group transform hover:scale-105"
            >
              {/* User Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        {profile.photoURL ? (
                          <img
                            src={profile.photoURL}
                            alt={profile.userName || 'User'}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-orange-600">
                            {profile.userName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      {/* Online Indicator */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white ${
                          profile.isOnline ? 'bg-green-500' : 'bg-stone-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{profile.userName || 'Unknown User'}</h3>
                      <p className="text-orange-100 text-sm font-medium flex items-center gap-1">
                        {profile.isOnline ? (
                          <>
                            <Wifi size={14} />
                            Online
                          </>
                        ) : (
                          <>
                            <WifiOff size={14} />
                            {getTimeAgo(profile.lastSeen)}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="p-6 space-y-3">
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                    Spiritual Guide
                  </p>
                  <p className="text-base font-semibold text-stone-900">{profile.guruName && profile.guruName.toLowerCase() !== 'n/a' ? profile.guruName : 'N/A'}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                    ISKCON Center
                  </p>
                  <p className="text-base font-semibold text-stone-900">{profile.iskconCenter && profile.iskconCenter.toLowerCase() !== 'n/a' ? profile.iskconCenter : 'N/A'}</p>
                </div>

                {profile.bio && (
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                      About
                    </p>
                    <p className="text-sm text-stone-700 italic">{profile.bio}</p>
                  </div>
                )}

                {/* Chat Button */}
                <button
                  onClick={() => handleStartChat(profile.uid)}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 px-4 rounded-lg font-bold hover:from-orange-700 hover:to-amber-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  <MessageCircle size={20} />
                  Start Conversation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
