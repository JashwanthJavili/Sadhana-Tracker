// Chat and Community Types

export type ConnectionStatus = 'none' | 'pending' | 'connected' | 'rejected';

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserPhoto?: string;
  toUserId: string;
  toUserName: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  timestamp: number;
  respondedAt?: number;
}

export interface UserConnection {
  userId: string;
  connectedAt: number;
}

export interface UserProfile {
  uid: string;
  userName: string;
  guruName: string;
  iskconCenter: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen: number;
  bio?: string;
  joinedDate: number;
  createdAt?: number;
  email?: string;
  // Privacy settings
  showGuruName?: boolean;
  showIskconCenter?: boolean;
  showLastSeen?: boolean;
  showEmail?: boolean;
  messagingPrivacy?: 'everyone' | 'connections-only';
  // Connection info
  connections?: string[]; // Array of connected user IDs
  connectionCount?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  read: boolean;
  type: 'text' | 'image' | 'quote';
  replyTo?: {
    messageId: string;
    text: string;
    senderName: string;
  };
}

export interface Chat {
  id: string;
  participants: string[]; // Array of user IDs
  participantDetails: {
    [uid: string]: {
      userName: string;
      photoURL?: string;
      guruName: string;
      iskconCenter: string;
    };
  };
  lastMessage?: {
    text: string;
    timestamp: number;
    senderId: string;
  };
  unreadCount: {
    [uid: string]: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface TypingStatus {
  [chatId: string]: {
    [uid: string]: {
      isTyping: boolean;
      timestamp: number;
    };
  };
}
