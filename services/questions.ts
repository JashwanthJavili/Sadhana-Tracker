import { ref, push, set, get, onValue, off, update, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from './firebase';
import { Question, Answer, Reply } from '../types/questions';

// ============= QUESTIONS =============

export const createQuestion = async (
  userId: string,
  userName: string,
  title: string,
  content: string,
  category: Question['category'],
  tags: string[],
  userPhoto?: string
): Promise<string> => {
  const questionsRef = ref(database, 'questions');
  const newQuestionRef = push(questionsRef);
  
  const question: Question = {
    id: newQuestionRef.key!,
    userId,
    userName,
    userPhoto,
    title,
    content,
    category,
    tags,
    timestamp: Date.now(),
    upvotes: [],
    viewCount: 0,
    answerCount: 0,
  };
  
  await set(newQuestionRef, question);
  return newQuestionRef.key!;
};

export const getAllQuestions = (callback: (questions: Question[]) => void, limit?: number) => {
  const questionsRef = limit 
    ? query(ref(database, 'questions'), orderByChild('timestamp'), limitToLast(limit))
    : ref(database, 'questions');
  
  onValue(questionsRef, (snapshot) => {
    const questions: Question[] = [];
    snapshot.forEach((childSnapshot) => {
      questions.push(childSnapshot.val());
    });
    // Sort by timestamp descending (newest first)
    questions.sort((a, b) => b.timestamp - a.timestamp);
    callback(questions);
  });
  
  return () => off(questionsRef);
};

export const getQuestionById = async (questionId: string): Promise<Question | null> => {
  const snapshot = await get(ref(database, `questions/${questionId}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const searchQuestions = async (searchTerm: string, category?: Question['category']): Promise<Question[]> => {
  const snapshot = await get(ref(database, 'questions'));
  
  if (!snapshot.exists()) return [];
  
  const questions: Question[] = [];
  snapshot.forEach((childSnapshot) => {
    questions.push(childSnapshot.val());
  });
  
  return questions.filter((q) => {
    const matchesSearch = !searchTerm || 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      q.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !category || q.category === category;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.timestamp - a.timestamp);
};

export const upvoteQuestion = async (questionId: string, userId: string) => {
  const questionRef = ref(database, `questions/${questionId}`);
  const snapshot = await get(questionRef);
  
  if (snapshot.exists()) {
    const question = snapshot.val() as Question;
    const upvotes = question.upvotes || [];
    
    if (upvotes.includes(userId)) {
      // Remove upvote
      await update(questionRef, {
        upvotes: upvotes.filter(id => id !== userId),
      });
    } else {
      // Add upvote
      await update(questionRef, {
        upvotes: [...upvotes, userId],
      });
    }
  }
};

export const incrementViewCount = async (questionId: string) => {
  const questionRef = ref(database, `questions/${questionId}`);
  const snapshot = await get(questionRef);
  
  if (snapshot.exists()) {
    const question = snapshot.val() as Question;
    await update(questionRef, {
      viewCount: (question.viewCount || 0) + 1,
    });
  }
};

// ============= ANSWERS =============

export const createAnswer = async (
  questionId: string,
  userId: string,
  userName: string,
  content: string,
  userPhoto?: string
): Promise<string> => {
  const answersRef = ref(database, `answers/${questionId}`);
  const newAnswerRef = push(answersRef);
  
  const answer: Answer = {
    id: newAnswerRef.key!,
    questionId,
    userId,
    userName,
    userPhoto,
    content,
    timestamp: Date.now(),
    upvotes: [],
    isAccepted: false,
    replies: [],
  };
  
  await set(newAnswerRef, answer);
  
  // Update question's answer count
  const questionRef = ref(database, `questions/${questionId}`);
  const snapshot = await get(questionRef);
  if (snapshot.exists()) {
    const question = snapshot.val() as Question;
    await update(questionRef, {
      answerCount: (question.answerCount || 0) + 1,
    });
  }
  
  return newAnswerRef.key!;
};

export const getAnswersForQuestion = (questionId: string, callback: (answers: Answer[]) => void) => {
  const answersRef = ref(database, `answers/${questionId}`);
  
  onValue(answersRef, (snapshot) => {
    const answers: Answer[] = [];
    snapshot.forEach((childSnapshot) => {
      answers.push(childSnapshot.val());
    });
    // Sort by accepted first, then by upvotes, then by timestamp
    answers.sort((a, b) => {
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      if (a.upvotes.length !== b.upvotes.length) {
        return b.upvotes.length - a.upvotes.length;
      }
      return a.timestamp - b.timestamp;
    });
    callback(answers);
  });
  
  return () => off(answersRef);
};

export const upvoteAnswer = async (questionId: string, answerId: string, userId: string) => {
  const answerRef = ref(database, `answers/${questionId}/${answerId}`);
  const snapshot = await get(answerRef);
  
  if (snapshot.exists()) {
    const answer = snapshot.val() as Answer;
    const upvotes = answer.upvotes || [];
    
    if (upvotes.includes(userId)) {
      // Remove upvote
      await update(answerRef, {
        upvotes: upvotes.filter(id => id !== userId),
      });
    } else {
      // Add upvote
      await update(answerRef, {
        upvotes: [...upvotes, userId],
      });
    }
  }
};

export const acceptAnswer = async (questionId: string, answerId: string, questionOwnerId: string, currentUserId: string) => {
  // Only question owner can accept answers
  if (questionOwnerId !== currentUserId) {
    throw new Error('Only question owner can accept answers');
  }
  
  // First, unaccept all other answers
  const answersRef = ref(database, `answers/${questionId}`);
  const snapshot = await get(answersRef);
  
  if (snapshot.exists()) {
    const updates: any = {};
    snapshot.forEach((childSnapshot) => {
      if (childSnapshot.key !== answerId) {
        updates[`${childSnapshot.key}/isAccepted`] = false;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(answersRef, updates);
    }
  }
  
  // Accept the selected answer
  await update(ref(database, `answers/${questionId}/${answerId}`), {
    isAccepted: true,
  });
};

// ============= REPLIES =============

export const addReply = async (
  questionId: string,
  answerId: string,
  userId: string,
  userName: string,
  content: string,
  userPhoto?: string
): Promise<string> => {
  const answerRef = ref(database, `answers/${questionId}/${answerId}`);
  const snapshot = await get(answerRef);
  
  if (!snapshot.exists()) {
    throw new Error('Answer not found');
  }
  
  const answer = snapshot.val() as Answer;
  const replies = answer.replies || [];
  
  const newReply: Reply = {
    id: Date.now().toString(),
    answerId,
    userId,
    userName,
    userPhoto,
    content,
    timestamp: Date.now(),
  };
  
  await update(answerRef, {
    replies: [...replies, newReply],
  });
  
  return newReply.id;
};

// ============= USER QUESTIONS =============

export const getUserQuestions = async (userId: string): Promise<Question[]> => {
  const snapshot = await get(ref(database, 'questions'));
  
  if (!snapshot.exists()) return [];
  
  const questions: Question[] = [];
  snapshot.forEach((childSnapshot) => {
    const question = childSnapshot.val() as Question;
    if (question.userId === userId) {
      questions.push(question);
    }
  });
  
  return questions.sort((a, b) => b.timestamp - a.timestamp);
};

export const getUserAnswers = async (userId: string): Promise<Answer[]> => {
  const snapshot = await get(ref(database, 'answers'));
  
  if (!snapshot.exists()) return [];
  
  const answers: Answer[] = [];
  snapshot.forEach((questionSnapshot) => {
    questionSnapshot.forEach((answerSnapshot) => {
      const answer = answerSnapshot.val() as Answer;
      if (answer.userId === userId) {
        answers.push(answer);
      }
    });
  });
  
  return answers.sort((a, b) => b.timestamp - a.timestamp);
};
