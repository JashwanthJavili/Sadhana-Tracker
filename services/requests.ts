import { ref, push, set, get, update, onValue, off } from 'firebase/database';
import { db } from './firebase';
import emailjs from '@emailjs/browser';
import { createUserNotification } from './notifications';

export interface FestivalRequest {
  id?: string;
  name: string;
  date: string;
  description: string;
  category: string;
  significance?: string;
  observances?: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  reviewedBy?: string;
  reviewedAt?: number;
}

export interface SlokaRequest {
  id?: string;
  title: string;
  sanskrit: string;
  transliteration: string;
  translation: string;
  category: string;
  purport?: string;
  reference?: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  reviewedBy?: string;
  reviewedAt?: number;
}

export interface AdminNotification {
  id?: string;
  type: 'festival_request' | 'sloka_request';
  requestId: string;
  requesterName: string;
  title: string;
  timestamp: number;
  read: boolean;
}

// Festival Requests
export const submitFestivalRequest = async (request: Omit<FestivalRequest, 'id' | 'timestamp' | 'status'>) => {
  try {
    const requestsRef = ref(db, 'festivalRequests');
    const newRequestRef = push(requestsRef);
    
    const festivalRequest: FestivalRequest = {
      ...request,
      timestamp: Date.now(),
      status: 'pending',
    };

    await set(newRequestRef, festivalRequest);

    // Create notification for all admins
    await notifyAdmins({
      type: 'festival_request',
      requestId: newRequestRef.key!,
      requesterName: request.requesterName,
      title: request.name,
      timestamp: Date.now(),
      read: false,
    });

    // Send email to admins (you'll need to set up a backend endpoint for this)
    await sendEmailToAdmins({
      type: 'festival',
      title: request.name,
      requesterName: request.requesterName,
      requestId: newRequestRef.key!,
    });

    return newRequestRef.key;
  } catch (error) {
    console.error('Error submitting festival request:', error);
    throw error;
  }
};

// Sloka Requests
export const submitSlokaRequest = async (request: Omit<SlokaRequest, 'id' | 'timestamp' | 'status'>) => {
  try {
    const requestsRef = ref(db, 'slokaRequests');
    const newRequestRef = push(requestsRef);
    
    const slokaRequest: SlokaRequest = {
      ...request,
      timestamp: Date.now(),
      status: 'pending',
    };

    await set(newRequestRef, slokaRequest);

    // Create notification for all admins
    await notifyAdmins({
      type: 'sloka_request',
      requestId: newRequestRef.key!,
      requesterName: request.requesterName,
      title: request.title,
      timestamp: Date.now(),
      read: false,
    });

    // Send email to admins
    await sendEmailToAdmins({
      type: 'sloka',
      title: request.title,
      requesterName: request.requesterName,
      requestId: newRequestRef.key!,
    });

    return newRequestRef.key;
  } catch (error) {
    console.error('Error submitting sloka request:', error);
    throw error;
  }
};

// Get all festival requests (for admins)
export const getAllFestivalRequests = (callback: (requests: FestivalRequest[]) => void) => {
  const requestsRef = ref(db, 'festivalRequests');
  
  const unsubscribe = onValue(requestsRef, (snapshot) => {
    const requests: FestivalRequest[] = [];
    snapshot.forEach((childSnapshot) => {
      requests.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });
    // Sort by timestamp, newest first
    requests.sort((a, b) => b.timestamp - a.timestamp);
    callback(requests);
  });

  return () => off(requestsRef, 'value', unsubscribe);
};

// Get all sloka requests (for admins)
export const getAllSlokaRequests = (callback: (requests: SlokaRequest[]) => void) => {
  const requestsRef = ref(db, 'slokaRequests');
  
  const unsubscribe = onValue(requestsRef, (snapshot) => {
    const requests: SlokaRequest[] = [];
    snapshot.forEach((childSnapshot) => {
      requests.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });
    // Sort by timestamp, newest first
    requests.sort((a, b) => b.timestamp - a.timestamp);
    callback(requests);
  });

  return () => off(requestsRef, 'value', unsubscribe);
};

// Get user's requests
export const getUserFestivalRequests = (userId: string, callback: (requests: FestivalRequest[]) => void) => {
  const requestsRef = ref(db, 'festivalRequests');
  
  const unsubscribe = onValue(requestsRef, (snapshot) => {
    const requests: FestivalRequest[] = [];
    snapshot.forEach((childSnapshot) => {
      const request = childSnapshot.val();
      if (request.requesterId === userId) {
        requests.push({
          id: childSnapshot.key!,
          ...request,
        });
      }
    });
    requests.sort((a, b) => b.timestamp - a.timestamp);
    callback(requests);
  });

  return () => off(requestsRef, 'value', unsubscribe);
};

export const getUserSlokaRequests = (userId: string, callback: (requests: SlokaRequest[]) => void) => {
  const requestsRef = ref(db, 'slokaRequests');
  
  const unsubscribe = onValue(requestsRef, (snapshot) => {
    const requests: SlokaRequest[] = [];
    snapshot.forEach((childSnapshot) => {
      const request = childSnapshot.val();
      if (request.requesterId === userId) {
        requests.push({
          id: childSnapshot.key!,
          ...request,
        });
      }
    });
    requests.sort((a, b) => b.timestamp - a.timestamp);
    callback(requests);
  });

  return () => off(requestsRef, 'value', unsubscribe);
};

// Approve/Reject festival request (admin only)
export const reviewFestivalRequest = async (
  requestId: string,
  status: 'approved' | 'rejected',
  adminComment: string,
  adminId: string,
  adminName: string
) => {
  try {
    const requestRef = ref(db, `festivalRequests/${requestId}`);
    const snapshot = await get(requestRef);
    
    if (!snapshot.exists()) {
      throw new Error('Request not found');
    }

    const request = snapshot.val();

    // Update request status
    await update(requestRef, {
      status,
      adminComment,
      reviewedBy: adminName,
      reviewedAt: Date.now(),
    });

    // If approved, add to festivals collection
    if (status === 'approved') {
      const festivalsRef = ref(db, 'festivals');
      const newFestivalRef = push(festivalsRef);
      
      await set(newFestivalRef, {
        name: request.name,
        date: request.date,
        description: request.description,
        category: request.category,
        significance: request.significance || '',
        observances: request.observances || '',
        contributedBy: request.requesterName,
        contributorId: request.requesterId,
        createdAt: Date.now(),
      });
    }

    // Create user notification
    await createUserNotification(request.requesterId, {
      type: status === 'approved' ? 'festival_approved' : 'festival_rejected',
      title: status === 'approved' ? 'Festival Request Approved' : 'Festival Request Declined',
      message: status === 'approved' 
        ? `Your festival "${request.name}" has been approved and is now live in the Festivals section.`
        : `Your festival request "${request.name}" was not approved. ${adminComment || 'Please review the details and resubmit if needed.'}`,
      requestId,
      requestTitle: request.name,
      adminComment: adminComment || '',
    });

    return true;
  } catch (error) {
    console.error('Error reviewing festival request:', error);
    throw error;
  }
};

// Approve/Reject sloka request (admin only)
export const reviewSlokaRequest = async (
  requestId: string,
  status: 'approved' | 'rejected',
  adminComment: string,
  adminId: string,
  adminName: string
) => {
  try {
    const requestRef = ref(db, `slokaRequests/${requestId}`);
    const snapshot = await get(requestRef);
    
    if (!snapshot.exists()) {
      throw new Error('Request not found');
    }

    const request = snapshot.val();

    // Update request status
    await update(requestRef, {
      status,
      adminComment,
      reviewedBy: adminName,
      reviewedAt: Date.now(),
    });

    // If approved, add to slokas collection
    if (status === 'approved') {
      const slokasRef = ref(db, 'slokas');
      const newSlokaRef = push(slokasRef);
      
      await set(newSlokaRef, {
        title: request.title,
        sanskrit: request.sanskrit,
        transliteration: request.transliteration,
        translation: request.translation,
        category: request.category,
        purport: request.purport || '',
        reference: request.reference || '',
        contributedBy: request.requesterName,
        contributorId: request.requesterId,
        createdAt: Date.now(),
      });
    }

    // Create user notification
    await createUserNotification(request.requesterId, {
      type: status === 'approved' ? 'sloka_approved' : 'sloka_rejected',
      title: status === 'approved' ? 'Sloka Request Approved' : 'Sloka Request Declined',
      message: status === 'approved' 
        ? `Your sloka "${request.title}" has been approved and is now available in the Slokas Library.`
        : `Your sloka request "${request.title}" was not approved. ${adminComment || 'Please review the details and resubmit if needed.'}`,
      requestId,
      requestTitle: request.title,
      adminComment: adminComment || '',
    });

    return true;
  } catch (error) {
    console.error('Error reviewing sloka request:', error);
    throw error;
  }
};

// Admin notifications
const notifyAdmins = async (notification: AdminNotification) => {
  try {
    const notificationsRef = ref(db, 'adminNotifications');
    const newNotificationRef = push(notificationsRef);
    await set(newNotificationRef, notification);
  } catch (error) {
    console.error('Error creating admin notification:', error);
  }
};

export const getAdminNotifications = (callback: (notifications: AdminNotification[]) => void) => {
  const notificationsRef = ref(db, 'adminNotifications');
  
  const unsubscribe = onValue(notificationsRef, (snapshot) => {
    const notifications: AdminNotification[] = [];
    snapshot.forEach((childSnapshot) => {
      notifications.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });
    // Sort by timestamp, newest first
    notifications.sort((a, b) => b.timestamp - a.timestamp);
    callback(notifications);
  });

  return () => off(notificationsRef, 'value', unsubscribe);
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = ref(db, `adminNotifications/${notificationId}`);
    await update(notificationRef, { read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Email notification function (EmailJS integration)
const sendEmailToAdmins = async (data: {
  type: 'festival' | 'sloka';
  title: string;
  requesterName: string;
  requestId: string;
}) => {
  try {
    // EmailJS configuration
    const SERVICE_ID = 'SadhanaSanga';
    const TEMPLATE_ID = 'template_21wihlc';
    const PUBLIC_KEY = 'UsENRggR23-o1HO_F';

    // Prepare email parameters
    const templateParams = {
      to_email: 'jashwanthjavili7@gmail.com',
      from_name: data.requesterName,
      request_type: data.type === 'festival' ? 'Festival' : 'Sloka/Mantra',
      request_title: data.title,
      message: `A new ${data.type === 'festival' ? 'festival' : 'sloka/mantra'} request has been submitted and is waiting for your review.\n\nRequested by: ${data.requesterName}\nTitle: ${data.title}\n\nPlease log in to the Admin Panel to review and approve/reject this request.`,
    };

    // Send email via EmailJS
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log('✅ Email sent successfully:', response.status, response.text);
    return true;
  } catch (error) {
    console.error('❌ Error sending email notification:', error);
    // Don't throw - email is not critical, request should still be saved
    return false;
  }
};
