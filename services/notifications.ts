import { ref, onValue, off, update, get } from 'firebase/database';
import { db } from './firebase';

export interface UserNotification {
  id: string;
  type: 'festival_approved' | 'festival_rejected' | 'sloka_approved' | 'sloka_rejected';
  title: string;
  message: string;
  requestId: string;
  requestTitle: string;
  adminComment?: string;
  timestamp: number;
  read: boolean;
}

// Listen to user's notifications
export const getUserNotifications = (
  userId: string,
  callback: (notifications: UserNotification[]) => void
) => {
  const notificationsRef = ref(db, `userNotifications/${userId}`);
  
  const unsubscribe = onValue(notificationsRef, (snapshot) => {
    const notifications: UserNotification[] = [];
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours
    
    snapshot.forEach((childSnapshot) => {
      const notificationData = childSnapshot.val();
      const notificationAge = now - notificationData.timestamp;
      
      // Only include notifications less than 24 hours old
      if (notificationAge <= oneDayInMs) {
        notifications.push({
          id: childSnapshot.key!,
          ...notificationData,
        });
      }
    });
    // Sort by timestamp, newest first
    notifications.sort((a, b) => b.timestamp - a.timestamp);
    callback(notifications);
  });

  return () => off(notificationsRef, 'value', unsubscribe);
};

// Get unread count
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  const notificationsRef = ref(db, `userNotifications/${userId}`);
  const snapshot = await get(notificationsRef);
  
  let unreadCount = 0;
  snapshot.forEach((childSnapshot) => {
    const notification = childSnapshot.val();
    if (!notification.read) {
      unreadCount++;
    }
  });
  
  return unreadCount;
};

// Mark notification as read
export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  try {
    const notificationRef = ref(db, `userNotifications/${userId}/${notificationId}`);
    await update(notificationRef, { read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notificationsRef = ref(db, `userNotifications/${userId}`);
    const snapshot = await get(notificationsRef);
    
    const updates: { [key: string]: any } = {};
    snapshot.forEach((childSnapshot) => {
      updates[`${childSnapshot.key}/read`] = true;
    });
    
    await update(notificationsRef, updates);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// Clean up notifications older than 24 hours
const cleanupOldNotifications = async (userId: string) => {
  try {
    const notificationsRef = ref(db, `userNotifications/${userId}`);
    const snapshot = await get(notificationsRef);
    
    if (!snapshot.exists()) return;

    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours
    const updates: { [key: string]: null } = {};

    snapshot.forEach((childSnapshot) => {
      const notification = childSnapshot.val();
      const notificationAge = now - notification.timestamp;
      
      // Delete if older than 24 hours
      if (notificationAge > oneDayInMs) {
        updates[`userNotifications/${userId}/${childSnapshot.key}`] = null;
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
      console.log(`Cleaned up ${Object.keys(updates).length} old notifications for user ${userId}`);
    }
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
  }
};

// Create notification for user (called by admin when reviewing request)
export const createUserNotification = async (
  userId: string,
  notification: Omit<UserNotification, 'id' | 'timestamp' | 'read'>
) => {
  try {
    // Clean up old notifications first
    await cleanupOldNotifications(userId);
    const notificationsRef = ref(db, `userNotifications/${userId}`);
    const notificationId = `notif_${Date.now()}`;
    const notificationRef = ref(db, `userNotifications/${userId}/${notificationId}`);
    
    await update(notificationRef, {
      ...notification,
      timestamp: Date.now(),
      read: false,
    });
  } catch (error) {
    console.error('Error creating user notification:', error);
  }
};
