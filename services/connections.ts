import { ref, push, set, get, onValue, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { database } from './firebase';
import { ConnectionRequest, UserConnection, ConnectionStatus } from '../types/chat';

// Send connection request
export const sendConnectionRequest = async (
  fromUserId: string,
  fromUserName: string,
  fromUserPhoto: string | undefined,
  toUserId: string,
  toUserName: string,
  message?: string
): Promise<void> => {
  try {
    // Check if request already exists
    const existingRequest = await getConnectionStatus(fromUserId, toUserId);
    if (existingRequest !== 'none') {
      throw new Error('Connection request already exists or users are connected');
    }

    const requestRef = push(ref(database, 'connectionRequests'));
    const requestId = requestRef.key!;

    const request: ConnectionRequest = {
      id: requestId,
      fromUserId,
      fromUserName,
      fromUserPhoto: fromUserPhoto || '',
      toUserId,
      toUserName,
      status: 'pending',
      message: message || '',
      timestamp: Date.now(),
    };

    await set(requestRef, request);

    // Create notification for the recipient
    const notificationRef = push(ref(database, `userNotifications/${toUserId}`));
    await set(notificationRef, {
      id: notificationRef.key,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${fromUserName} wants to connect with you`,
      fromUserId,
      fromUserName,
      requestId,
      timestamp: Date.now(),
      read: false,
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    throw error;
  }
};

// Get connection status between two users
export const getConnectionStatus = async (userId1: string, userId2: string): Promise<ConnectionStatus> => {
  try {
    // Check if already connected
    const connectionsRef = ref(database, `connections/${userId1}/${userId2}`);
    const snapshot = await get(connectionsRef);
    if (snapshot.exists()) {
      return 'connected';
    }

    // Check for pending requests (both directions)
    const requestsRef = ref(database, 'connectionRequests');
    const requestsSnapshot = await get(requestsRef);
    
    if (requestsSnapshot.exists()) {
      const allRequests = requestsSnapshot.val();
      
      for (const requestId in allRequests) {
        const request = allRequests[requestId];
        
        // Check requests from userId1 to userId2
        if (request.fromUserId === userId1 && request.toUserId === userId2 && request.status === 'pending') {
          return 'pending';
        }
        
        // Check requests from userId2 to userId1
        if (request.fromUserId === userId2 && request.toUserId === userId1 && request.status === 'pending') {
          return 'pending';
        }
      }
    }

    return 'none';
  } catch (error) {
    console.error('Error getting connection status:', error);
    return 'none';
  }
};

// Accept connection request
export const acceptConnectionRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = ref(database, `connectionRequests/${requestId}`);
    const snapshot = await get(requestRef);

    if (!snapshot.exists()) {
      throw new Error('Request not found');
    }

    const request = snapshot.val() as ConnectionRequest;

    // Add to connections (bidirectional) - update separately to avoid permission issues
    await set(ref(database, `connections/${request.fromUserId}/${request.toUserId}`), {
      userId: request.toUserId,
      userName: request.toUserName,
      connectedAt: Date.now(),
    });
    
    await set(ref(database, `connections/${request.toUserId}/${request.fromUserId}`), {
      userId: request.fromUserId,
      userName: request.fromUserName,
      connectedAt: Date.now(),
    });

    // Delete the request after successful connection
    await remove(requestRef);

    // Send notification to requester (person who sent the request)
    const notificationRef = push(ref(database, `userNotifications/${request.fromUserId}`));
    await set(notificationRef, {
      id: notificationRef.key,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `${request.toUserName} accepted your connection request`,
      fromUserId: request.toUserId,
      fromUserName: request.toUserName,
      timestamp: Date.now(),
      read: false,
    });
  } catch (error) {
    console.error('Error accepting connection request:', error);
    throw error;
  }
};

// Reject connection request
export const rejectConnectionRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = ref(database, `connectionRequests/${requestId}`);
    const snapshot = await get(requestRef);

    if (!snapshot.exists()) {
      throw new Error('Request not found');
    }

    // Delete the request - notifications will expire naturally (24h)
    await remove(requestRef);
  } catch (error) {
    console.error('Error rejecting connection request:', error);
    throw error;
  }
};

// Get pending requests for a user
export const getPendingRequests = (userId: string, callback: (requests: ConnectionRequest[]) => void) => {
  const requestsRef = ref(database, 'connectionRequests');
  
  return onValue(requestsRef, (snapshot) => {
    const requests: ConnectionRequest[] = [];
    const seenIds = new Set<string>();
    
    if (snapshot.exists()) {
      const allRequests = snapshot.val();
      for (const requestId in allRequests) {
        const request = allRequests[requestId];
        if (request.toUserId === userId && request.status === 'pending') {
          // Skip if we've already seen this ID
          if (seenIds.has(requestId)) {
            continue;
          }
          seenIds.add(requestId);
          
          // Ensure the request has an ID
          if (!request.id) {
            request.id = requestId;
          }
          requests.push(request);
        }
      }
    }
    // Sort by most recent first
    requests.sort((a, b) => b.timestamp - a.timestamp);
    callback(requests);
  });
};

// Get sent requests for a user
export const getSentRequests = (userId: string, callback: (requests: ConnectionRequest[]) => void) => {
  const requestsRef = ref(database, 'connectionRequests');
  
  return onValue(requestsRef, (snapshot) => {
    const requests: ConnectionRequest[] = [];
    const seenIds = new Set<string>();
    
    if (snapshot.exists()) {
      const allRequests = snapshot.val();
      for (const requestId in allRequests) {
        const request = allRequests[requestId];
        if (request.fromUserId === userId && request.status === 'pending') {
          // Skip if we've already seen this ID
          if (seenIds.has(requestId)) {
            continue;
          }
          seenIds.add(requestId);
          
          // Ensure the request has an ID
          if (!request.id) {
            request.id = requestId;
          }
          requests.push(request);
        }
      }
    }
    // Sort by most recent first
    requests.sort((a, b) => b.timestamp - a.timestamp);
    callback(requests);
  });
};

// Get user's connections
export const getUserConnections = async (userId: string): Promise<string[]> => {
  try {
    const connectionsRef = ref(database, `connections/${userId}`);
    const snapshot = await get(connectionsRef);
    
    if (snapshot.exists()) {
      return Object.keys(snapshot.val());
    }
    return [];
  } catch (error) {
    console.error('Error getting connections:', error);
    return [];
  }
};

// Listen to user's connections in real-time
export const listenToUserConnections = (userId: string, callback: (connectionIds: string[]) => void) => {
  const connectionsRef = ref(database, `connections/${userId}`);
  
  return onValue(connectionsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(Object.keys(snapshot.val()));
    } else {
      callback([]);
    }
  });
};

// Remove connection
export const removeConnection = async (userId1: string, userId2: string): Promise<void> => {
  try {
    // Remove bidirectional connections
    await remove(ref(database, `connections/${userId1}/${userId2}`));
    await remove(ref(database, `connections/${userId2}/${userId1}`));
  } catch (error) {
    console.error('Error removing connection:', error);
    throw error;
  }
};

// Cancel sent request
export const cancelConnectionRequest = async (requestId: string): Promise<void> => {
  try {
    // Just delete the request - notifications will expire naturally (24h)
    await remove(ref(database, `connectionRequests/${requestId}`));
  } catch (error) {
    console.error('Error canceling request:', error);
    throw error;
  }
};
