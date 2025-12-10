/**
 * App Version Manager
 * Handles version updates and notifications
 */

export const APP_VERSION = '1.3.4'; // Update this when releasing new version
export const VERSION_HISTORY = [
  {
    version: '1.3.4',
    date: '2025-12-10',
    features: [
      '🔄 Auto-Update System - Version checker checks every 60 seconds for updates',
      '⏱️ Smart Countdown - Automatic reload with 10-second countdown when update detected',
      '🚀 Faster Updates - Service worker checks every 2 minutes instead of 30 minutes',
      '💨 Cache Clearing - Aggressive cache clearing on updates for immediate changes',
      '🎯 Cache Busting - Hash-based filenames prevent stale content',
      '🔔 Update Banner - Clean notification with countdown timer and Update Now button',
      '📦 Manifest Generation - Better cache tracking for offline support',
      '🎵 Music Icon Fix - Removed all animations to keep constant 28px size',
      '✅ One-Time Notifications - Version updates show only once per version'
    ]
  },
  {
    version: '1.3.0',
    date: '2025-12-09',
    features: [
      '🔗 LinkedIn-Style Connection System - Professional networking for devotees',
      '✉️ Connection Requests - Send, accept, or decline connection requests',
      '💬 Chat Privacy - Clear messages, delete chats, export chat history',
      '🚫 Remove Connections - Disconnect from devotees when needed',
      '📱 Mobile Profile View - User profiles now open at top on mobile devices',
      '🔔 Pending Requests Badge - See incoming connection requests at a glance',
      '👥 Connected vs Explore Views - Toggle between connected devotees and all users',
      '🎨 Premium UI - Professional gradients and animations throughout',
      '📧 Developer Contact - Easy access to developer contact information in About page'
    ]
  },
  {
    version: '1.2.4',
    date: '2025-12-09',
    features: [
      'Fixed chat messaging issues',
      'Version history now scrollable and mobile-responsive',
      'Community section redesigned with simplified user cards',
      'Click devotee cards to view full profile in popup',
      'Chat header now shows loading state when username not yet loaded',
      'Click username in chat to view devotee profile',
      'Beautiful user profile modal with complete devotee information'
    ]
  },
  {
    version: '1.2.3',
    date: '2025-12-09',
    features: [
      'Much stronger vibration feedback - 100ms per tap (3x increase)',
      'Triple vibration pattern on round completion (300ms pulses)',
      'Realistic temple bell sound with multiple harmonics',
      'Longer bell ring duration (1.5 seconds)',
      'Rich C-E-G-C chord for authentic temple bell tone'
    ]
  },
  {
    version: '1.2.2',
    date: '2025-12-09',
    features: [
      'Enhanced vibration feedback - stronger and more noticeable (30ms)',
      'Improved bell sound - louder dual-tone for round completion',
      'Test vibration (3 pulses) when enabling in settings',
      'Test sound plays immediately when enabling',
      'Better user feedback with descriptive messages'
    ]
  },
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
