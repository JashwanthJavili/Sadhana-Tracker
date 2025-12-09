import { ref, push, set, get, onValue, off, update, query, orderByChild, serverTimestamp, onDisconnect, remove } from 'firebase/database';
import { database } from './firebase';
import { UserProfile, Chat, ChatMessage, TypingStatus } from '../types/chat';
import { encryptMessage, decryptMessage, isEncrypted } from './encryption';

// ============= USER PROFILES & PRESENCE =============

export const createUserProfile = async (uid: string, profile: Omit<UserProfile, 'uid' | 'isOnline' | 'lastSeen' | 'joinedDate'>) => {
  try {
    const userProfile: UserProfile = {
      ...profile,
      uid,
      isOnline: true,
      lastSeen: Date.now(),
      joinedDate: Date.now(),
    };
    
    // Use update() instead of set() to preserve child nodes (entries, settings, journal, usage)
    await update(ref(database, `users/${uid}`), userProfile);
    
    // Also sync messagingPrivacy to settings if provided
    if (profile.messagingPrivacy) {
      await update(ref(database, `users/${uid}/settings`), {
        messagingPrivacy: profile.messagingPrivacy
      });
    }
    
    await setUserOnlineStatus(uid, true);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error; // Re-throw to handle in calling code
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  await update(ref(database, `users/${uid}`), updates);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snapshot = await get(ref(database, `users/${uid}`));
    if (!snapshot.exists()) return null;
    
    const data = snapshot.val();
    // Check if it's a valid UserProfile (has userName field)
    // This prevents returning objects with only child nodes (entries, settings, etc.)
    if (!data.userName) return null;
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const getAllUsers = (callback: (users: UserProfile[]) => void) => {
  const usersRef = ref(database, 'users');
  
  onValue(usersRef, (snapshot) => {
    const users: UserProfile[] = [];
    let totalNodes = 0;
    let validProfiles = 0;
    
    snapshot.forEach((childSnapshot) => {
      totalNodes++;
      const data = childSnapshot.val();
      
      // Only require userName - other fields are optional
      // This ensures users with incomplete profiles are still visible
      if (data && data.userName) {
        validProfiles++;
        
        // Extract only the UserProfile fields, excluding child nodes
        const userProfile: UserProfile = {
          uid: data.uid,
          userName: data.userName,
          guruName: data.guruName || 'Not Specified',
          iskconCenter: data.iskconCenter || 'Not Specified',
          photoURL: data.photoURL,
          bio: data.bio,
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen || Date.now(),
          joinedDate: data.joinedDate || Date.now(),
          messagingPrivacy: data.messagingPrivacy || 'connections-only',
        };
        users.push(userProfile);
      }
    });
    
    console.log(`📊 getAllUsers: ${totalNodes} total nodes, ${validProfiles} valid profiles, returning ${users.length} users`);
    callback(users);
  }, (error) => {
    console.error('Error loading users:', error);
    callback([]); // Return empty array on error
  });
  
  return () => off(usersRef);
};

export const setUserOnlineStatus = async (uid: string, isOnline: boolean) => {
  try {
    const userStatusRef = ref(database, `users/${uid}`);
    
    await update(userStatusRef, {
      isOnline,
      lastSeen: Date.now(),
    });
    
    // Set up automatic offline detection when user disconnects
    if (isOnline) {
      const offlineData = {
        isOnline: false,
        lastSeen: Date.now(),
      };
      
      onDisconnect(userStatusRef).update(offlineData);
    }
  } catch (error) {
    console.warn('Unable to update online status:', error);
    // Don't throw - online status is not critical
  }
};

// ============= CHAT MANAGEMENT =============

export const createOrGetChat = async (currentUserId: string, otherUserId: string): Promise<string> => {
  try {
    // Check if chat already exists
    const chatsRef = ref(database, 'chats');
    const snapshot = await get(chatsRef);
    
    if (snapshot.exists()) {
      const chats = snapshot.val();
      for (const [chatId, chat] of Object.entries(chats as Record<string, Chat>)) {
        if (chat.participants.includes(currentUserId) && chat.participants.includes(otherUserId)) {
          return chatId;
        }
      }
    }
    
    // Create new chat
    const currentUser = await getUserProfile(currentUserId);
    const otherUser = await getUserProfile(otherUserId);
    
    if (!currentUser || !otherUser) {
      throw new Error('User profiles not found');
    }
    
    const newChatRef = push(ref(database, 'chats'));
    const chatId = newChatRef.key!;
    
    const newChat: Chat = {
      id: chatId,
      participants: [currentUserId, otherUserId],
      participantDetails: {
        [currentUserId]: {
          userName: currentUser.userName,
          photoURL: currentUser.photoURL,
          guruName: currentUser.guruName,
          iskconCenter: currentUser.iskconCenter,
        },
        [otherUserId]: {
          userName: otherUser.userName,
          photoURL: otherUser.photoURL,
          guruName: otherUser.guruName,
          iskconCenter: otherUser.iskconCenter,
        },
      },
      unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await set(newChatRef, newChat);
    return chatId;
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    throw error; // Re-throw to handle in UI
  }
};

export const getUserChats = (userId: string, callback: (chats: Chat[]) => void) => {
  const chatsRef = ref(database, 'chats');
  
  onValue(chatsRef, (snapshot) => {
    const chats: Chat[] = [];
    snapshot.forEach((childSnapshot) => {
      const chat = childSnapshot.val() as Chat;
      if (chat.participants.includes(userId)) {
        chats.push(chat);
      }
    });
    
    // Sort by most recent activity
    chats.sort((a, b) => (b.lastMessage?.timestamp || b.updatedAt) - (a.lastMessage?.timestamp || a.updatedAt));
    callback(chats);
  }, (error) => {
    console.error('Error loading chats:', error);
    callback([]); // Return empty array on error
  });
  
  return () => off(chatsRef);
};

// ============= MESSAGING =============

export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderName: string,
  text: string,
  type: 'text' | 'image' | 'quote' = 'text',
  replyTo?: ChatMessage['replyTo']
) => {
  const messagesRef = ref(database, `messages/${chatId}`);
  const newMessageRef = push(messagesRef);
  
  // Encrypt the message text before storing
  const encryptedText = await encryptMessage(text, senderId);
  
  const message: ChatMessage = {
    id: newMessageRef.key!,
    chatId,
    senderId,
    senderName,
    text: encryptedText, // Store encrypted text
    timestamp: Date.now(),
    read: false,
    type,
    ...(replyTo && { replyTo }), // Only include replyTo if it exists
  };
  
  await set(newMessageRef, message);
  
  // Update chat's last message and unread counts
  const chatRef = ref(database, `chats/${chatId}`);
  const chatSnapshot = await get(chatRef);
  
  if (chatSnapshot.exists()) {
    const chat = chatSnapshot.val() as Chat;
    const updates: any = {
      lastMessage: {
        text: '[Encrypted Message]', // Don't expose encrypted content in preview
        timestamp: Date.now(),
        senderId,
      },
      updatedAt: Date.now(),
    };
    
    // Increment unread count for other participants
    chat.participants.forEach((participantId) => {
      if (participantId !== senderId) {
        updates[`unreadCount/${participantId}`] = (chat.unreadCount[participantId] || 0) + 1;
      }
    });
    
    await update(chatRef, updates);
  }
  
  return message;
};

export const getChatMessages = (chatId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = query(ref(database, `messages/${chatId}`), orderByChild('timestamp'));
  
  onValue(messagesRef, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((childSnapshot) => {
      messages.push(childSnapshot.val());
    });
    callback(messages);
  });
  
  return () => off(messagesRef);
};

export const markMessagesAsRead = async (chatId: string, userId: string) => {
  // Reset unread count for this user
  await update(ref(database, `chats/${chatId}/unreadCount`), {
    [userId]: 0,
  });
  
  // Mark all messages in chat as read
  const messagesRef = ref(database, `messages/${chatId}`);
  const snapshot = await get(messagesRef);
  
  if (snapshot.exists()) {
    const updates: any = {};
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val() as ChatMessage;
      if (message.senderId !== userId && !message.read) {
        updates[`${childSnapshot.key}/read`] = true;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(messagesRef, updates);
    }
  }
};

// ============= TYPING INDICATOR =============

export const setTypingStatus = async (chatId: string, userId: string, isTyping: boolean) => {
  const typingRef = ref(database, `typing/${chatId}/${userId}`);
  
  if (isTyping) {
    await set(typingRef, {
      isTyping: true,
      timestamp: Date.now(),
    });
    
    // Auto-remove typing status after 3 seconds
    setTimeout(async () => {
      await remove(typingRef);
    }, 3000);
  } else {
    await remove(typingRef);
  }
};

export const getTypingStatus = (chatId: string, callback: (typingUsers: Record<string, boolean>) => void) => {
  const typingRef = ref(database, `typing/${chatId}`);
  
  onValue(typingRef, (snapshot) => {
    const typingUsers: Record<string, boolean> = {};
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.entries(data).forEach(([userId, status]: [string, any]) => {
        if (status.isTyping && Date.now() - status.timestamp < 5000) {
          typingUsers[userId] = true;
        }
      });
    }
    callback(typingUsers);
  });
  
  return () => off(typingRef);
};

// ============= SEARCH & FILTER =============

export const searchUsers = async (
  searchTerm: string,
  filters?: {
    guruName?: string;
    iskconCenter?: string;
    onlineOnly?: boolean;
  }
): Promise<UserProfile[]> => {
  const snapshot = await get(ref(database, 'users'));
  
  if (!snapshot.exists()) return [];
  
  const users: UserProfile[] = [];
  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    
    // Only include users with valid chat profiles (has userName)
    // This matches the validation in getAllUsers
    if (data.userName && data.guruName && data.iskconCenter) {
      // Extract only the UserProfile fields, excluding child nodes
      const userProfile: UserProfile = {
        uid: data.uid,
        userName: data.userName,
        guruName: data.guruName,
        iskconCenter: data.iskconCenter,
        photoURL: data.photoURL,
        bio: data.bio,
        isOnline: data.isOnline,
        lastSeen: data.lastSeen,
        joinedDate: data.joinedDate,
      };
      users.push(userProfile);
    }
  });
  
  return users.filter((user) => {
    const matchesSearch = !searchTerm || 
      user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.guruName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.iskconCenter?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGuru = !filters?.guruName || user.guruName === filters.guruName;
    const matchesCenter = !filters?.iskconCenter || user.iskconCenter === filters.iskconCenter;
    const matchesOnline = !filters?.onlineOnly || user.isOnline;
    
    return matchesSearch && matchesGuru && matchesCenter && matchesOnline;
  });
};

export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  try {
    const chatsRef = ref(database, 'chats');
    const snapshot = await get(chatsRef);
    
    if (!snapshot.exists()) return 0;
    
    let totalUnread = 0;
    snapshot.forEach((childSnapshot) => {
      const chat = childSnapshot.val() as Chat;
      if (chat.participants.includes(userId)) {
        totalUnread += chat.unreadCount[userId] || 0;
      }
    });
    
    return totalUnread;
  } catch (error) {
    console.warn('Unable to fetch unread count:', error);
    return 0; // Return 0 instead of throwing
  }
};

// ============= CHAT MANAGEMENT =============

/**
 * Clear all messages in a chat (keeps the chat but removes messages)
 */
export const clearChatMessages = async (chatId: string): Promise<void> => {
  try {
    const messagesRef = ref(database, `messages/${chatId}`);
    await remove(messagesRef);
    
    // Update chat's lastMessage
    const chatRef = ref(database, `chats/${chatId}`);
    await update(chatRef, {
      lastMessage: 'Chat cleared',
      lastMessageTime: Date.now()
    });
  } catch (error) {
    console.error('Error clearing chat messages:', error);
    throw error;
  }
};

/**
 * Delete entire chat and all its data
 */
export const deleteChat = async (chatId: string, userId: string): Promise<void> => {
  try {
    // Remove messages
    const messagesRef = ref(database, `messages/${chatId}`);
    await remove(messagesRef);
    
    // Remove typing indicators
    const typingRef = ref(database, `typing/${chatId}`);
    await remove(typingRef);
    
    // Remove chat
    const chatRef = ref(database, `chats/${chatId}`);
    await remove(chatRef);
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

/**
 * Export chat messages as text file
 */
export const exportChatMessages = async (chatId: string, currentUserId: string, otherUserName: string): Promise<void> => {
  try {
    const messagesRef = ref(database, `messages/${chatId}`);
    const snapshot = await get(messagesRef);
    
    if (!snapshot.exists()) {
      throw new Error('No messages to export');
    }
    
    const messages: ChatMessage[] = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({ id: childSnapshot.key!, ...childSnapshot.val() });
    });
    
    // Sort by timestamp
    messages.sort((a, b) => a.timestamp - b.timestamp);
    
    // Format as text
    let textContent = `Chat with ${otherUserName}\n`;
    textContent += `Exported on ${new Date().toLocaleString()}\n`;
    textContent += '='.repeat(50) + '\n\n';
    
    for (const msg of messages) {
      const date = new Date(msg.timestamp).toLocaleString();
      const sender = msg.senderId === currentUserId ? 'You' : otherUserName;
      
      // Decrypt message if encrypted
      let messageText = msg.text;
      if (isEncrypted(msg.text)) {
        try {
          messageText = await decryptMessage(msg.text, msg.senderId);
        } catch (error) {
          console.error('Failed to decrypt message for export:', error);
          messageText = '[Encrypted Message]';
        }
      }
      
      textContent += `[${date}] ${sender}:\n${messageText}\n\n`;
    }
    
    // Create and download file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-with-${otherUserName.replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting chat:', error);
    throw error;
  }
};
