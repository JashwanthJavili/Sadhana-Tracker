import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSettings, saveSettings } from '../services/storage';
import { UserSettings } from '../types';
import { createUserProfile } from '../services/chat';

interface UserDataContextType {
  userSettings: UserSettings | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  updateUserSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firebase
  const refreshUserData = useCallback(async () => {
    if (!user || user.uid === 'guest') {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching user settings for:', user.uid);
      const settings = await getSettings(user.uid);
      
      // Auto-fill from auth if empty
      if (!settings.userName && user.displayName) {
        settings.userName = user.displayName;
      }
      
      setUserSettings(settings);
      console.log('✅ User settings loaded:', settings.userName || 'No name set');
    } catch (error) {
      console.error('❌ Error fetching user settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update settings with optimistic UI update + background sync
  const updateUserSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!user || user.uid === 'guest') return;

    try {
      // OPTIMISTIC UPDATE: Update UI immediately
      setUserSettings(prev => prev ? { ...prev, ...newSettings } : null);
      console.log('⚡ Optimistic UI update:', newSettings);

      // BACKGROUND SYNC: Save to Firebase
      const currentSettings = await getSettings(user.uid);
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      await saveSettings(user.uid, updatedSettings);
      console.log('💾 Settings saved to Firebase');

      // Update chat profile if identity data changed
      if (newSettings.userName || newSettings.guruName || newSettings.iskconCenter) {
        const profileData: any = {
          userName: updatedSettings.userName,
          guruName: updatedSettings.guruName,
          iskconCenter: updatedSettings.iskconCenter,
        };
        
        if (user.photoURL) profileData.photoURL = user.photoURL;
        
        await createUserProfile(user.uid, profileData);
        console.log('👤 Chat profile synchronized');
      }

      // VERIFY: Refresh from server to ensure consistency
      setTimeout(async () => {
        const verifiedSettings = await getSettings(user.uid);
        setUserSettings(verifiedSettings);
        console.log('✅ Settings verified from server');
      }, 1000);

    } catch (error) {
      console.error('❌ Error updating settings:', error);
      // ROLLBACK: Refresh from server on error
      await refreshUserData();
      throw error;
    }
  }, [user, refreshUserData]);

  // Load data on mount and user change
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('sl_') && user && user.uid !== 'guest') {
        console.log('🔔 Storage event detected, refreshing data');
        refreshUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, refreshUserData]);

  return (
    <UserDataContext.Provider value={{ userSettings, loading, refreshUserData, updateUserSettings }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  return context;
};
