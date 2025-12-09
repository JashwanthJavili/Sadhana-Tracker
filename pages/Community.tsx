import React, { useEffect, useState } from 'react';
import { UserProfile, ConnectionStatus } from '../types/chat';
import { getAllUsers, searchUsers, createOrGetChat } from '../services/chat';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { Users, Search, MessageCircle, Wifi, WifiOff, Filter, X, UserPlus, Clock, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserProfileModal from '../components/UserProfileModal';
import iskconLogo from '../utils/Images/Iscon_LOgo-removebg-preview.png';
import { 
  getConnectionStatus, 
  sendConnectionRequest, 
  getUserConnections,
  getPendingRequests,
  removeConnection,
  listenToUserConnections
} from '../services/connections';
import { useToast } from '../contexts/ToastContext';

const Community: React.FC = () => {
  const { user } = useAuth();
  const { userSettings } = useUserData();
  const navigate = useNavigate();
  const { showToast } = useToast();
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
  const [view, setView] = useState<'connected' | 'explore'>('connected');
  const [connectionStatuses, setConnectionStatuses] = useState<{ [key: string]: ConnectionStatus }>({});
  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [removingConnection, setRemovingConnection] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getAllUsers((fetchedUsers) => {
      console.log('✅ Fetched users with profiles:', fetchedUsers.length, 'users');
      console.log('📋 User details:', fetchedUsers.map(u => ({ uid: u.uid, name: u.userName, guru: u.guruName, center: u.iskconCenter })));
      
      // Exclude current user (getAllUsers already filters for valid profiles)
      const validUsers = fetchedUsers.filter(u => u.uid !== user.uid);
      console.log('👥 Valid users (excluding current user):', validUsers.length);
      
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
        if (filters.guruName === 'Not Specified') {
          filtered = filtered.filter(u => !u.guruName || u.guruName === 'Not Specified' || u.guruName === '' || u.guruName.toLowerCase() === 'n/a');
        } else {
          filtered = filtered.filter(u => u.guruName === filters.guruName);
        }
      }

      // Apply ISKCON center filter
      if (filters.iskconCenter && filters.iskconCenter !== 'All') {
        if (filters.iskconCenter === 'Not Specified') {
          filtered = filtered.filter(u => !u.iskconCenter || u.iskconCenter === 'Not Specified' || u.iskconCenter === '' || u.iskconCenter.toLowerCase() === 'n/a');
        } else {
          filtered = filtered.filter(u => u.iskconCenter === filters.iskconCenter);
        }
      }

      console.log(`🔍 Filters applied: ${filtered.length} users match criteria (from ${users.length} total)`);
      setFilteredUsers(filtered);
    };

    applyFilters();
  }, [searchTerm, filters, users, connectedUserIds]);

  // Load connections and statuses
  useEffect(() => {
    if (!user?.uid) return;

    // Listen to connections in real-time
    const unsubscribeConnections = listenToUserConnections(user.uid, (connectionIds) => {
      setConnectedUserIds(connectionIds);
      
      // Also refresh connection statuses when connections change
      if (users.length > 0) {
        const loadStatuses = async () => {
          const statuses: { [key: string]: ConnectionStatus } = {};
          for (const u of users) {
            const status = await getConnectionStatus(user.uid, u.uid);
            statuses[u.uid] = status;
          }
          setConnectionStatuses(statuses);
        };
        loadStatuses();
      }
    });

    // Get pending requests count
    const unsubscribePending = getPendingRequests(user.uid, (requests) => {
      setPendingRequestCount(requests.length);
    });

    return () => {
      unsubscribeConnections();
      unsubscribePending();
    };
  }, [user?.uid, users]);

  // Load connection status for each user
  useEffect(() => {
    if (!user?.uid || users.length === 0) return;

    const loadStatuses = async () => {
      const statuses: { [key: string]: ConnectionStatus } = {};
      for (const u of users) {
        const status = await getConnectionStatus(user.uid, u.uid);
        statuses[u.uid] = status;
      }
      setConnectionStatuses(statuses);
    };

    loadStatuses();
  }, [user?.uid, users]);

  const handleStartChat = async (otherUserId: string) => {
    if (!user) return;

    try {
      const chatId = await createOrGetChat(user.uid, otherUserId);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      showToast({ type: 'error', title: 'Unable to start chat. Please make sure you are connected with this devotee.' });
    }
  };

  const handleConnect = async (otherUserId: string, otherUserName: string, otherUserPhoto?: string) => {
    if (!user?.uid || !userSettings?.userName) return;

    try {
      await sendConnectionRequest(
        user.uid,
        userSettings.userName,
        user.photoURL || undefined,
        otherUserId,
        otherUserName,
        undefined // optional message
      );
      showToast({ type: 'success', title: 'Connection request sent!' });
      
      // Update status locally for immediate UI feedback
      setConnectionStatuses(prev => ({
        ...prev,
        [otherUserId]: 'pending'
      }));
    } catch (error) {
      console.error('Error sending connection request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send connection request';
      showToast({ type: 'error', title: errorMessage });
    }
  };

  const handleRemoveConnection = async (otherUserId: string, otherUserName: string) => {
    if (!user?.uid) return;

    const confirmed = confirm(`Are you sure you want to remove ${otherUserName} from your connections?`);
    if (!confirmed) return;

    setRemovingConnection(otherUserId);

    try {
      await removeConnection(user.uid, otherUserId);
      showToast({ type: 'info', title: 'Connection removed.' });
      
      // Update local state
      setConnectedUserIds(prev => prev.filter(id => id !== otherUserId));
      setConnectionStatuses(prev => ({
        ...prev,
        [otherUserId]: 'none'
      }));
    } catch (error) {
      console.error('Error removing connection:', error);
      showToast({ type: 'error', title: 'Failed to remove connection. Please try again.' });
    } finally {
      setRemovingConnection(null);
    }
  };

  const uniqueGurus = Array.from(new Set(users.map(u => u.guruName)))
    .filter(Boolean)
    .filter((g): g is string => typeof g === 'string' && g !== 'Not Specified' && g.toLowerCase() !== 'n/a');
  
  const uniqueCenters = Array.from(new Set(users.map(u => u.iskconCenter)))
    .filter(Boolean)
    .filter((c): c is string => typeof c === 'string' && c !== 'Not Specified' && c.toLowerCase() !== 'n/a');
  
  const hasUsersWithoutGuru = users.some(u => !u.guruName || u.guruName === 'Not Specified' || u.guruName === '' || u.guruName.toLowerCase() === 'n/a');
  const hasUsersWithoutCenter = users.some(u => !u.iskconCenter || u.iskconCenter === 'Not Specified' || u.iskconCenter === '' || u.iskconCenter.toLowerCase() === 'n/a');

  const getOnlineCount = () => filteredUsers.filter(u => u.isOnline).length;
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const renderConnectionButton = (userId: string, userName: string, userPhoto?: string) => {
    const status = connectionStatuses[userId];

    if (status === 'connected') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleStartChat(userId)}
            className="flex-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-md text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Message</span>
          </button>
          <button
            onClick={() => handleRemoveConnection(userId, userName)}
            disabled={removingConnection === userId}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title="Remove Connection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <button
          disabled
          className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg cursor-not-allowed flex items-center gap-2 text-sm"
        >
          <Clock className="w-4 h-4" />
          Pending
        </button>
      );
    }

    // status === 'none' or 'rejected' - both show Connect button
    return (
      <button
        onClick={() => handleConnect(userId, userName, userPhoto)}
        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 shadow-md text-sm"
      >
        <UserPlus className="w-4 h-4" />
        Connect
      </button>
    );
  };

  // ACID-compliant filtering: ensure consistency and isolation
  // Connected: users who ARE in connectedUserIds (with search/filters applied)
  // Explore: users who are NOT in connectedUserIds (with search/filters applied)
  const connectedUsers = filteredUsers.filter(u => connectedUserIds.includes(u.uid));
  const exploreUsers = filteredUsers.filter(u => !connectedUserIds.includes(u.uid));
  
  // Atomically determine which list to display based on view
  const displayUsers = view === 'connected' ? connectedUsers : exploreUsers;

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
    <div className="min-h-full space-y-4 sm:space-y-5 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-2 border-orange-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
              <div className="bg-white/20 p-2 sm:p-2.5 rounded-lg sm:rounded-xl">
                <Users className="text-white" size={24} />
              </div>
              Devotee Community
            </h2>
            <p className="text-orange-100 text-sm sm:text-base font-medium">
              {users.length} fellow devotees • {connectedUserIds.length} connected • {getOnlineCount()} online
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Pending Requests Badge */}
            {pendingRequestCount > 0 && (
              <button
                onClick={() => navigate('/connection-requests')}
                className="relative flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                title="Connection Requests"
              >
                <UserPlus size={18} />
                <span className="hidden sm:inline text-sm font-semibold">Requests</span>
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                  {pendingRequestCount}
                </span>
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all shadow-lg transform hover:scale-105 active:scale-95 ${
                showFilters ? 'bg-white text-orange-600' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 sm:space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, guru, or center..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-stone-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-500 outline-none text-sm sm:text-base font-medium shadow-md"
          />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-stone-200 p-6 space-y-4 animate-slideDown">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Filter Devotees</h3>
                <p className="text-sm text-stone-600 mt-1">
                  Showing {displayUsers.length} of {users.length} devotees
                </p>
              </div>
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
                {hasUsersWithoutGuru && (
                  <option value="Not Specified">Not Specified</option>
                )}
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

      {/* View Toggle */}
      <div className="flex gap-3 bg-white rounded-xl p-2 shadow-md w-full sm:w-auto">
        <button
          onClick={() => setView('connected')}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold transition-all ${
            view === 'connected'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Connected ({connectedUsers.length})
        </button>
        <button
          onClick={() => setView('explore')}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold transition-all ${
            view === 'explore'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Explore ({exploreUsers.length})
        </button>
      </div>

      {/* Users Grid */}
      {displayUsers.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-lg sm:rounded-xl border-2 border-dashed border-stone-300">
          <Users className="mx-auto mb-3 sm:mb-4 text-stone-400" size={48} />
          {view === 'connected' ? (
            <>
              <p className="text-stone-600 text-base sm:text-lg font-medium mb-4">Not connected with any devotees yet</p>
              <button
                onClick={() => setView('explore')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
              >
                Explore Devotees
              </button>
            </>
          ) : (
            <>
              <p className="text-stone-600 text-base sm:text-lg font-medium">No devotees found matching your filters</p>
              <p className="text-stone-400 text-sm mt-2">Try adjusting your search or filters</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {displayUsers.map((profile) => (
            <div
              key={profile.uid}
              onClick={() => {
                setSelectedProfile(profile);
                setShowProfileModal(true);
              }}
              className="bg-white rounded-xl border border-orange-200 shadow-md hover:shadow-xl transition-all duration-300 hover:border-orange-300 overflow-hidden group transform hover:scale-[1.02] cursor-pointer"
            >
              {/* User Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 sm:p-6 relative">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                      {profile.photoURL ? (
                        <img
                          src={profile.photoURL}
                          alt={profile.userName || 'User'}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = iskconLogo;
                            e.currentTarget.classList.remove('rounded-full');
                            e.currentTarget.classList.add('rounded-full', 'p-1');
                          }}
                        />
                      ) : (
                        <img
                          src={iskconLogo}
                          alt="ISKCON"
                          className="w-full h-full object-contain p-1"
                        />
                      )}
                    </div>
                    {/* Online Indicator */}
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                        profile.isOnline ? 'bg-green-500' : 'bg-stone-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white truncate">{profile.userName || 'Unknown User'}</h3>
                    <p className="text-orange-100 text-xs sm:text-sm font-medium flex items-center gap-1">
                      {profile.isOnline ? (
                        <>
                          <Wifi size={12} />
                          Online
                        </>
                      ) : (
                        <>
                          <WifiOff size={12} />
                          {getTimeAgo(profile.lastSeen)}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div>
                  <p className="text-[0.65rem] sm:text-xs font-bold text-stone-500 uppercase tracking-wide mb-0.5">
                    Spiritual Guide
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-stone-900 truncate">{profile.guruName && profile.guruName.toLowerCase() !== 'n/a' ? profile.guruName : 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[0.65rem] sm:text-xs font-bold text-stone-500 uppercase tracking-wide mb-0.5">
                    ISKCON Center
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-stone-900 truncate">{profile.iskconCenter && profile.iskconCenter.toLowerCase() !== 'n/a' ? profile.iskconCenter : 'N/A'}</p>
                </div>

                {profile.bio && (
                  <div>
                    <p className="text-[0.65rem] sm:text-xs font-bold text-stone-500 uppercase tracking-wide mb-0.5">
                      About
                    </p>
                    <p className="text-xs sm:text-sm text-stone-700 italic line-clamp-2">{profile.bio}</p>
                  </div>
                )}

                {/* Connection Action Button */}
                <div className="mt-2 sm:mt-3" onClick={(e) => e.stopPropagation()}>
                  {renderConnectionButton(profile.uid, profile.userName || 'Unknown', profile.photoURL)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Profile Modal */}
      {selectedProfile && (
        <UserProfileModal
          profile={selectedProfile}
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedProfile(null);
          }}
          showChatButton={connectionStatuses[selectedProfile.uid] === 'connected'}
          onStartChat={connectionStatuses[selectedProfile.uid] === 'connected' ? () => {
            handleStartChat(selectedProfile.uid);
            setShowProfileModal(false);
          } : undefined}
        />
      )}
    </div>
  );
};

export default Community;
