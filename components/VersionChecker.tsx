import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

/**
 * VersionChecker - Automatically checks for app updates and forces reload
 * Checks every 60 seconds for version changes
 * Shows update banner with countdown when new version detected
 */
const VersionChecker: React.FC = () => {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [latestVersion, setLatestVersion] = useState<string>('');

  // Check version on mount and every 60 seconds
  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Fetch version.json with cache busting
        const timestamp = new Date().getTime();
        const response = await fetch(`/version.json?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const versionData = await response.json();
          const latestVer = versionData.version;
          
          // Get current version from localStorage or set it
          const storedVersion = localStorage.getItem('app_version');
          
          if (!storedVersion) {
            // First time - store current version
            localStorage.setItem('app_version', latestVer);
            setCurrentVersion(latestVer);
          } else {
            setCurrentVersion(storedVersion);
            
            // Compare versions
            if (storedVersion !== latestVer) {
              console.log(`🔄 New version detected: ${storedVersion} → ${latestVer}`);
              setLatestVersion(latestVer);
              setNewVersionAvailable(true);
            }
          }
        }
      } catch (error) {
        console.error('Version check failed:', error);
      }
    };

    // Check immediately on mount
    checkVersion();

    // Check every 60 seconds
    const interval = setInterval(checkVersion, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer when update detected
  useEffect(() => {
    if (newVersionAvailable && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (newVersionAvailable && countdown === 0) {
      handleUpdate();
    }
  }, [newVersionAvailable, countdown]);

  const handleUpdate = async () => {
    try {
      // Update stored version
      localStorage.setItem('app_version', latestVersion);
      
      // Clear service worker caches
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Clear caches
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          
          // Update service worker
          await registration.update();
          
          // Skip waiting and activate new SW
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }
      
      // Force hard reload
      window.location.reload();
    } catch (error) {
      console.error('Update failed:', error);
      // Force reload anyway
      window.location.reload();
    }
  };

  const handleUpdateNow = () => {
    setCountdown(0);
  };

  if (!newVersionAvailable) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] animate-slideDown">
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full animate-pulse">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base">
                  New Update Available! 🎉
                </div>
                <div className="text-xs sm:text-sm opacity-90">
                  v{currentVersion} → v{latestVersion}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-xs sm:text-sm font-medium bg-white/20 px-3 py-1.5 rounded-full">
                Auto-updating in {countdown}s
              </div>
              <button
                onClick={handleUpdateNow}
                className="bg-white text-orange-600 px-4 py-2 rounded-full font-bold text-xs sm:text-sm hover:bg-orange-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                Update Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionChecker;
