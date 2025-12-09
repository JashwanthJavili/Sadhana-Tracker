import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getPendingRequests, 
  getSentRequests, 
  acceptConnectionRequest, 
  rejectConnectionRequest,
  cancelConnectionRequest 
} from '../services/connections';
import { ConnectionRequest } from '../types/chat';
import { database } from '../services/firebase';
import { ref, get } from 'firebase/database';
import { UserCircle, CheckCircle, XCircle, Clock, ArrowLeft, Loader } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import iskconLogo from '../utils/Images/Iscon_LOgo-removebg-preview.png';

const ConnectionRequests: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [userDetails, setUserDetails] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);

    // Listen to pending requests (incoming)
    const unsubscribePending = getPendingRequests(currentUser.uid, (requests) => {
      // Remove duplicates based on request ID
      const uniqueRequests = requests.filter((request, index, self) =>
        index === self.findIndex(r => r.id === request.id)
      );
      setPendingRequests(uniqueRequests);
      // Load user details for each request
      uniqueRequests.forEach(request => {
        loadUserDetails(request.fromUserId);
      });
    });

    // Listen to sent requests (outgoing)
    const unsubscribeSent = getSentRequests(currentUser.uid, (requests) => {
      // Remove duplicates based on request ID
      const uniqueRequests = requests.filter((request, index, self) =>
        index === self.findIndex(r => r.id === request.id)
      );
      setSentRequests(uniqueRequests);
      // Load user details for each request
      uniqueRequests.forEach(request => {
        loadUserDetails(request.toUserId);
      });
      setLoading(false);
    });

    return () => {
      unsubscribePending();
      unsubscribeSent();
    };
  }, [currentUser?.uid]);

  const loadUserDetails = async (userId: string) => {
    if (userDetails[userId]) return;

    try {
      const userProfileRef = ref(database, `userProfiles/${userId}`);
      const profileSnapshot = await get(userProfileRef);
      
      if (profileSnapshot.exists()) {
        setUserDetails(prev => ({
          ...prev,
          [userId]: profileSnapshot.val()
        }));
      } else {
        // Fallback to users collection
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserDetails(prev => ({
            ...prev,
            [userId]: {
              userName: userData.settings?.userName || userData.displayName || 'Unknown User',
              photoURL: userData.photoURL || null,
              isOnline: false
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!currentUser?.uid) return;
    setProcessingId(requestId);

    try {
      await acceptConnectionRequest(requestId);
      showToast({ type: 'success', title: 'Connection request accepted! You can now chat with this devotee.' });
      
      // Requests will auto-update via the real-time listener
      // The accepted request will be filtered out automatically
    } catch (error) {
      console.error('Error accepting request:', error);
      showToast({ type: 'error', title: 'Failed to accept connection request. Please try again.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!currentUser?.uid) return;
    setProcessingId(requestId);

    try {
      await rejectConnectionRequest(requestId);
      showToast({ type: 'info', title: 'Connection request declined.' });
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToast({ type: 'error', title: 'Failed to decline connection request. Please try again.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    setProcessingId(requestId);

    try {
      await cancelConnectionRequest(requestId);
      showToast({ type: 'info', title: 'Connection request cancelled.' });
    } catch (error) {
      console.error('Error cancelling request:', error);
      showToast({ type: 'error', title: 'Failed to cancel connection request. Please try again.' });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/community')}
            className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Connection Requests
          </h1>
        </div>

        {/* Pending Requests (Incoming) */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Received Requests
            {pendingRequests.length > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </h2>

          {pendingRequests.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg">
              <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No pending connection requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(request => {
                const user = userDetails[request.fromUserId];
                const displayName = user?.userName || user?.displayName || 'Loading...';
                const photoURL = user?.photoURL;
                
                return (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                          {photoURL ? (
                            <img 
                              src={photoURL} 
                              alt={displayName} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = iskconLogo;
                                e.currentTarget.classList.add('p-1.5', 'object-contain');
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
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {displayName}
                          </h3>
                          {request.message && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              "{request.message}"
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(request.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:ml-4 w-full sm:w-auto">
                        <button
                          onClick={() => handleAccept(request.id)}
                          disabled={processingId === request.id}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {processingId === request.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={processingId === request.id}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {processingId === request.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sent Requests (Outgoing) */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Sent Requests
            {sentRequests.length > 0 && (
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {sentRequests.length}
              </span>
            )}
          </h2>

          {sentRequests.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg">
              <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No sent connection requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentRequests.map(request => {
                const user = userDetails[request.toUserId];
                const displayName = user?.userName || user?.displayName || 'Loading...';
                const photoURL = user?.photoURL;
                
                return (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                          {photoURL ? (
                            <img 
                              src={photoURL} 
                              alt={displayName} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = iskconLogo;
                                e.currentTarget.classList.add('p-1.5', 'object-contain');
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
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {displayName}
                          </h3>
                          {request.message && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              "{request.message}"
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(request.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancel(request.id)}
                        disabled={processingId === request.id}
                        className="w-full sm:w-auto sm:ml-4 px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {processingId === request.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionRequests;
