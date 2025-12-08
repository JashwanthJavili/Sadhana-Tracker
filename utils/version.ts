/**
 * App Version Manager
 * Handles version updates and notifications
 */

export const APP_VERSION = '1.2.1'; // Update this when releasing new version
export const VERSION_HISTORY = [
  {
    version: '1.2.1',
    date: '2025-12-09',
    features: [
      'Enhanced notification system with centered modal on desktop',
      'Vibrant orange notification bell icon matching chat style',
      'Optimized notification panel positioning and sizing',
      'Fixed Firebase permission rules for announcements',
      'Improved mobile and desktop notification experience'
    ]
  },
  {
    version: '1.2.0',
    date: '2025-12-09',
    features: [
      'Visual bead counter with customizable shapes',
      'Enhanced japa counter with improved settings',
      'Enhanced translation UI with language pills',
      'Improved user experience and notifications',
      'Vibration and sound feedback options',
      'Better performance and responsiveness'
    ]
  },
  {
    version: '1.1.0',
    date: '2025-12-01',
    features: [
      'Questions & Answers forum',
      'Admin panel with analytics',
      'Festival and Sloka requests',
      'User feedback system'
    ]
  },
  {
    version: '1.0.0',
    date: '2025-11-15',
    features: [
      'Initial release',
      'Japa counter',
      'Daily planner',
      'Festivals calendar',
      'Slokas library'
    ]
  }
];

/**
 * Check if there's a new version
 */
export const checkForUpdates = (): {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  latestFeatures: string[];
} => {
  const storedVersion = localStorage.getItem('app_version');
  const hasUpdate = storedVersion !== APP_VERSION;
  
  return {
    hasUpdate,
    currentVersion: storedVersion || '1.0.0',
    latestVersion: APP_VERSION,
    latestFeatures: VERSION_HISTORY[0].features
  };
};

/**
 * Mark version as seen
 */
export const markVersionSeen = (): void => {
  localStorage.setItem('app_version', APP_VERSION);
  localStorage.setItem('version_seen_at', Date.now().toString());
};

/**
 * Get version update message
 */
export const getUpdateMessage = (): string => {
  const latest = VERSION_HISTORY[0];
  return `New version ${latest.version} is now available! Check out the latest features.`;
};

/**
 * Should show version update notification
 */
export const shouldShowUpdateNotification = (): boolean => {
  const storedVersion = localStorage.getItem('app_version');
  const lastSeenTimestamp = localStorage.getItem('version_seen_at');
  
  // Show if never seen before or version changed
  if (!storedVersion || storedVersion !== APP_VERSION) {
    return true;
  }
  
  // Don't show if seen within last 24 hours
  if (lastSeenTimestamp) {
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    if (parseInt(lastSeenTimestamp) > dayAgo) {
      return false;
    }
  }
  
  return false;
};
