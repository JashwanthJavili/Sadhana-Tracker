// Chat and Community Types

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
