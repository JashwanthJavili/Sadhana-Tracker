import { ref, remove, get, set } from 'firebase/database';
import { database, auth } from './firebase';

/**
 * Admin email - only this user has admin privileges
 */
export const ADMIN_EMAIL = 'jashwanthjavili7@gmail.com';

/**
 * Check if current user is admin
 */
export const isAdmin = async (): Promise<boolean> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;
  
  // Check if user is super admin
  if (currentUser.email === ADMIN_EMAIL) return true;
  
  // Check if user is in admins list
  const adminRef = ref(database, `admins/${currentUser.uid}`);
  const snapshot = await get(adminRef);
  return snapshot.exists() && snapshot.val() === true;
};

/**
 * Verify admin access - throws error if not admin
 */
const verifyAdminAccess = async () => {
  const adminStatus = await isAdmin();
  if (!adminStatus) {
    throw new Error('⛔ Access Denied: This action requires admin privileges.');
  }
};

/**
 * ADMIN ONLY: Grant admin privileges to a user
 */
export const grantAdminAccess = async (userId: string, userEmail: string): Promise<void> => {
  await verifyAdminAccess();
  
  // Only super admin can grant admin rights
  if (auth.currentUser?.email !== ADMIN_EMAIL) {
    throw new Error('⛔ Only the super admin can grant admin rights');
  }
  
  const adminRef = ref(database, `admins/${userId}`);
  await set(adminRef, {
    granted: true,
    grantedBy: auth.currentUser.uid,
    grantedAt: Date.now(),
    email: userEmail
  });
  
  console.log(`✅ Admin rights granted to ${userEmail}`);
};

/**
 * ADMIN ONLY: Revoke admin privileges from a user
 */
export const revokeAdminAccess = async (userId: string): Promise<void> => {
  await verifyAdminAccess();
  
  // Only super admin can revoke admin rights
  if (auth.currentUser?.email !== ADMIN_EMAIL) {
    throw new Error('⛔ Only the super admin can revoke admin rights');
  }
  
  // Cannot revoke super admin
  const userRef = ref(database, `users/${userId}`);
  const userSnap = await get(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.val();
    const userEmail = userData.settings?.email || userData.email;
    if (userEmail === ADMIN_EMAIL) {
      throw new Error('⛔ Cannot revoke super admin rights');
    }
  }
  
  const adminRef = ref(database, `admins/${userId}`);
  await remove(adminRef);
  
  console.log(`✅ Admin rights revoked from user ${userId}`);
};

/**
 * ADMIN ONLY: Get list of all admins
 */
export const getAllAdmins = async () => {
  await verifyAdminAccess();
  
  const adminsRef = ref(database, 'admins');
  const snapshot = await get(adminsRef);
  
  const admins: any[] = [
    {
      uid: 'super-admin',
      email: ADMIN_EMAIL,
      isSuperAdmin: true,
      grantedAt: 0
    }
  ];
  
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const adminData = childSnapshot.val();
      admins.push({
        uid: childSnapshot.key,
        email: adminData.email,
        isSuperAdmin: false,
        grantedBy: adminData.grantedBy,
        grantedAt: adminData.grantedAt
      });
    });
  }
  
  return admins;
};

/**
 * ADMIN ONLY: Permanently delete a user and all their data
 * This will remove:
 * - User profile
 * - All entries
 * - All journal entries
 * - Settings
 * - Usage data
 * - Chat messages (where user is participant)
 * - Questions and answers posted by user
 */
export const deleteUserPermanently = async (userId: string): Promise<void> => {
  verifyAdminAccess();
  
  try {
    console.log(`🗑️ Admin ${auth.currentUser?.email} deleting user: ${userId}`);
    
    // Get user data first to show confirmation
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnapshot.val();
    const userName = userData.userName || userData.settings?.userName || 'Unknown User';
    
    console.log(`Deleting user: ${userName} (${userId})`);
    
    // Delete user data
    await remove(userRef);
    
    // Delete chats where user is a participant
    const chatsRef = ref(database, 'chats');
    const chatsSnapshot = await get(chatsRef);
    if (chatsSnapshot.exists()) {
      const deleteChatPromises: Promise<void>[] = [];
      chatsSnapshot.forEach((chatSnapshot) => {
        const chat = chatSnapshot.val();
        if (chat.participants?.includes(userId)) {
          deleteChatPromises.push(remove(ref(database, `chats/${chatSnapshot.key}`)));
          deleteChatPromises.push(remove(ref(database, `messages/${chatSnapshot.key}`)));
        }
      });
      await Promise.all(deleteChatPromises);
    }
    
    // Delete questions posted by user
    const questionsRef = ref(database, 'questions');
    const questionsSnapshot = await get(questionsRef);
    if (questionsSnapshot.exists()) {
      const deleteQuestionPromises: Promise<void>[] = [];
      questionsSnapshot.forEach((questionSnapshot) => {
        const question = questionSnapshot.val();
        if (question.userId === userId) {
          deleteQuestionPromises.push(remove(ref(database, `questions/${questionSnapshot.key}`)));
          // Also delete associated answers
          deleteQuestionPromises.push(remove(ref(database, `answers/${questionSnapshot.key}`)));
        }
      });
      await Promise.all(deleteQuestionPromises);
    }
    
    // Delete answers posted by user
    const answersRef = ref(database, 'answers');
    const answersSnapshot = await get(answersRef);
    if (answersSnapshot.exists()) {
      const deleteAnswerPromises: Promise<void>[] = [];
      answersSnapshot.forEach((questionAnswersSnapshot) => {
        questionAnswersSnapshot.forEach((answerSnapshot) => {
          const answer = answerSnapshot.val();
          if (answer.userId === userId) {
            deleteAnswerPromises.push(
              remove(ref(database, `answers/${questionAnswersSnapshot.key}/${answerSnapshot.key}`))
            );
          }
        });
      });
      await Promise.all(deleteAnswerPromises);
    }
    
    console.log(`✅ User ${userName} (${userId}) permanently deleted`);
    
    return;
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }
};

/**
 * ADMIN ONLY: Get all users with their basic info
 */
export const getAllUsersAdmin = async () => {
  verifyAdminAccess();
  
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  
  if (!snapshot.exists()) return [];
  
  const users: any[] = [];
  snapshot.forEach((childSnapshot) => {
    const userData = childSnapshot.val();
    const feedbackData = userData.feedback || null;
    
    // Get email from multiple possible locations
    const userEmail = userData.email || userData.settings?.email || 'N/A';
    
    users.push({
      uid: childSnapshot.key,
      userName: userData.userName || userData.settings?.userName || 'Unknown',
      email: userEmail,
      guruName: userData.guruName || userData.settings?.guruName || 'N/A',
      iskconCenter: userData.iskconCenter || userData.settings?.iskconCenter || 'N/A',
      joinedDate: userData.usage?.firstLogin || userData.joinedDate || Date.now(),
      lastActive: userData.usage?.lastActive || userData.lastSeen || 0,
      loginCount: userData.usage?.loginCount || 0,
      feedbackRating: feedbackData?.rating || null,
      feedbackTimestamp: feedbackData?.timestamp || null
    });
  });
  
  return users.sort((a, b) => b.lastActive - a.lastActive);
};

/**
 * ADMIN ONLY: Get statistics about the app
 */
export const getAppStatistics = async () => {
  verifyAdminAccess();
  
  const [usersSnap, questionsSnap, answersSnap, chatsSnap] = await Promise.all([
    get(ref(database, 'users')),
    get(ref(database, 'questions')),
    get(ref(database, 'answers')),
    get(ref(database, 'chats')),
  ]);
  
  let totalUsers = 0;
  let activeUsers = 0;
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  if (usersSnap.exists()) {
    usersSnap.forEach((childSnap) => {
      totalUsers++;
      const user = childSnap.val();
      if (user.usage?.lastActive > oneDayAgo || user.lastSeen > oneDayAgo) {
        activeUsers++;
      }
    });
  }
  
  let totalQuestions = 0;
  if (questionsSnap.exists()) {
    questionsSnap.forEach(() => {
      totalQuestions++;
    });
  }
  
  let totalAnswers = 0;
  if (answersSnap.exists()) {
    answersSnap.forEach((questionAnswers) => {
      questionAnswers.forEach(() => {
        totalAnswers++;
      });
    });
  }
  
  let totalChats = 0;
  if (chatsSnap.exists()) {
    chatsSnap.forEach(() => {
      totalChats++;
    });
  }
  
  return {
    totalUsers,
    activeUsers,
    totalQuestions,
    totalAnswers,
    totalChats,
  };
};
