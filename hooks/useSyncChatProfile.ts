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
        // Check if user already has a chat profile
        const existingProfile = await getUserProfile(user.uid);

        // Get user settings from storage
        const settings = await getSettings(user.uid);

        if (!existingProfile || !existingProfile.userName) {
          // Create or update chat profile if missing or incomplete
          if (settings.userName && settings.guruName && settings.iskconCenter) {
            // Build profile object without undefined values (Firebase update() rejects undefined)
            const profileData: any = {
              userName: settings.userName,
              guruName: settings.guruName,
              iskconCenter: settings.iskconCenter,
              email: user.email || '', // Store email from auth
            };

            if (user.photoURL) profileData.photoURL = user.photoURL;

            await createUserProfile(user.uid, profileData);
          }
        } else {
          // Check if profile needs updating (settings changed or profile has old default values)
          const needsUpdate =
            existingProfile.userName !== settings.userName ||
            existingProfile.guruName !== settings.guruName ||
            existingProfile.iskconCenter !== settings.iskconCenter ||
            existingProfile.userName === 'Bhakta' || // Force update if still using old default
            existingProfile.guruName === 'HG Pranavananda Das Prabhu' || // Old default
            existingProfile.iskconCenter === 'Local Center'; // Old default

          if (needsUpdate && settings.userName && settings.guruName) {
            const profileData: any = {
              userName: settings.userName,
              guruName: settings.guruName,
              iskconCenter: settings.iskconCenter || '',
              email: user.email || '', // Store email from auth
            };

            if (user.photoURL) profileData.photoURL = user.photoURL;

            await createUserProfile(user.uid, profileData);
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
