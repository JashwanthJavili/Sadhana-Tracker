/**
 * Permission Manager
 * Handles requesting and checking permissions for vibration, notifications, etc.
 */

export type PermissionType = 'vibration' | 'notifications';

export interface PermissionStatus {
  granted: boolean;
  available: boolean;
  error?: string;
}

/**
 * Check if vibration API is available
 */
export const checkVibrationSupport = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Request vibration permission (auto-granted if supported)
 */
export const requestVibrationPermission = async (): Promise<PermissionStatus> => {
  if (!checkVibrationSupport()) {
    return {
      granted: false,
      available: false,
      error: 'Vibration API not supported on this device'
    };
  }

  // Vibration doesn't require explicit permission in most browsers
  // Just test if it works
  try {
    navigator.vibrate(1);
    return {
      granted: true,
      available: true
    };
  } catch (error) {
    return {
      granted: false,
      available: true,
      error: 'Vibration permission denied or blocked'
    };
  }
};

/**
 * Trigger vibration with pattern
 */
export const vibrate = (pattern: number | number[]): boolean => {
  if (!checkVibrationSupport()) {
    return false;
  }

  try {
    return navigator.vibrate(pattern);
  } catch (error) {
    console.error('Vibration error:', error);
    return false;
  }
};

/**
 * Stop all vibrations
 */
export const stopVibration = (): void => {
  if (checkVibrationSupport()) {
    navigator.vibrate(0);
  }
};

/**
 * Check if notifications are supported
 */
export const checkNotificationSupport = (): boolean => {
  return 'Notification' in window;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<PermissionStatus> => {
  if (!checkNotificationSupport()) {
    return {
      granted: false,
      available: false,
      error: 'Notifications not supported on this browser'
    };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      granted: permission === 'granted',
      available: true,
      error: permission === 'denied' ? 'Notification permission denied' : undefined
    };
  } catch (error) {
    return {
      granted: false,
      available: true,
      error: 'Error requesting notification permission'
    };
  }
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission | null => {
  if (!checkNotificationSupport()) {
    return null;
  }
  return Notification.permission;
};

/**
 * Show a browser notification
 */
export const showNotification = (title: string, options?: NotificationOptions): Notification | null => {
  if (!checkNotificationSupport() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    return new Notification(title, options);
  } catch (error) {
    console.error('Notification error:', error);
    return null;
  }
};

/**
 * Request all necessary permissions for the app
 */
export const requestAllPermissions = async (): Promise<{
  vibration: PermissionStatus;
  notifications: PermissionStatus;
}> => {
  const [vibration, notifications] = await Promise.all([
    requestVibrationPermission(),
    requestNotificationPermission()
  ]);

  return { vibration, notifications };
};

/**
 * Check all permissions status
 */
export const checkAllPermissions = (): {
  vibration: PermissionStatus;
  notifications: PermissionStatus;
} => {
  const vibrationStatus: PermissionStatus = {
    granted: checkVibrationSupport(),
    available: checkVibrationSupport()
  };

  const notificationPermission = getNotificationPermission();
  const notificationsStatus: PermissionStatus = {
    granted: notificationPermission === 'granted',
    available: checkNotificationSupport()
  };

  return {
    vibration: vibrationStatus,
    notifications: notificationsStatus
  };
};
