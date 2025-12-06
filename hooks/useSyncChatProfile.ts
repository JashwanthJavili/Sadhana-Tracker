import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSettings } from '../services/storage';
import { createUserProfile, getUserProfile, setUserOnlineStatus } from '../services/chat';

/**
 * Hook to sync user settings with chat profile system
 * This ensures existing users get their profiles created in the chat system
 */
export const useSyncChatProfile = () => {
  const { user } = useAuth();

  useEffect(() => {
    const syncProfile = async () => {
      if (!user || user.uid === 'guest') return;

      try {
        console.log('[useSyncChatProfile] Checking profile for:', user.uid);
        // Check if user already has a chat profile
        const existingProfile = await getUserProfile(user.uid);
        console.log('[useSyncChatProfile] Existing profile:', existingProfile);
        console.log('[useSyncChatProfile] Has userName?', existingProfile?.userName);
        
        // Get user settings from storage
        const settings = await getSettings(user.uid);
        console.log('[useSyncChatProfile] User settings:', settings);
        
        if (!existingProfile || !existingProfile.userName) {
          console.log('[useSyncChatProfile] Condition check - !existingProfile:', !existingProfile, '!existingProfile.userName:', !existingProfile?.userName);
          // Create or update chat profile if missing or incomplete
          if (settings.userName && settings.guruName && settings.iskconCenter) {
            console.log('[useSyncChatProfile] Creating chat profile...');
            
            // Build profile object without undefined values (Firebase update() rejects undefined)
            const profileData: any = {
              userName: settings.userName,
              guruName: settings.guruName,
              iskconCenter: settings.iskconCenter,
            };
            
            if (user.photoURL) profileData.photoURL = user.photoURL;
            
            console.log('[useSyncChatProfile] Profile data being created:', profileData);
            await createUserProfile(user.uid, profileData);
            
            console.log('✅ Chat profile created for existing user:', user.uid);
          } else {
            console.log('[useSyncChatProfile] User has not completed onboarding yet');
          }
        } else {
          console.log('[useSyncChatProfile] Profile exists, checking if update needed...');
          console.log('[useSyncChatProfile] Current profile userName:', existingProfile.userName);
          console.log('[useSyncChatProfile] Settings userName:', settings.userName);
          console.log('[useSyncChatProfile] Current profile guruName:', existingProfile.guruName);
          console.log('[useSyncChatProfile] Settings guruName:', settings.guruName);
          console.log('[useSyncChatProfile] Current profile iskconCenter:', existingProfile.iskconCenter);
          console.log('[useSyncChatProfile] Settings iskconCenter:', settings.iskconCenter);
          
          // Check if profile needs updating (settings changed or profile has old default values)
          const needsUpdate = 
            existingProfile.userName !== settings.userName ||
            existingProfile.guruName !== settings.guruName ||
            existingProfile.iskconCenter !== settings.iskconCenter ||
            existingProfile.userName === 'Bhakta' || // Force update if still using old default
            existingProfile.guruName === 'HG Pranavananda Das Prabhu' || // Old default
            existingProfile.iskconCenter === 'Local Center'; // Old default
          
          console.log('[useSyncChatProfile] Needs update?', needsUpdate);
          
          if (needsUpdate && settings.userName && settings.guruName) {
            console.log('[useSyncChatProfile] Updating profile with settings...');
            const profileData: any = {
              userName: settings.userName,
              guruName: settings.guruName,
              iskconCenter: settings.iskconCenter || '',
            };
            
            if (user.photoURL) profileData.photoURL = user.photoURL;
            
            console.log('[useSyncChatProfile] Updating with:', profileData);
            await createUserProfile(user.uid, profileData);
            console.log('✅ Profile updated with new settings');
          } else {
            console.log('[useSyncChatProfile] No update needed or settings incomplete');
          }
          
          // Set online status for existing profile
          await setUserOnlineStatus(user.uid, true);
        }
      } catch (error) {
        console.error('❌ Error syncing chat profile:', error);
      }
    };

    syncProfile();
  }, [user]);
};
