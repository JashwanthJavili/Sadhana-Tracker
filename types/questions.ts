// Public Q&A Types

export interface Question {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  title: string;
  content: string;
  category: 'spiritual' | 'sadhana' | 'scripture' | 'lifestyle' | 'general';
  tags: string[];
  timestamp: number;
  upvotes: string[]; // Array of user IDs who upvoted
  viewCount: number;
  answerCount: number;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  timestamp: number;
  upvotes: string[]; // Array of user IDs who upvoted
  isAccepted: boolean;
  replies: Reply[];
}

export interface Reply {
  id: string;
  answerId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  timestamp: number;
}
