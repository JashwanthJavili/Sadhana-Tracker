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
        
        if (!existingProfile) {
          // Get user settings from storage
          const settings = await getSettings(user.uid);
          
          // Create chat profile if user has completed onboarding
          if (settings.userName && settings.guruName && settings.iskconCenter) {
            await createUserProfile(user.uid, {
              userName: settings.userName,
              guruName: settings.guruName,
              iskconCenter: settings.iskconCenter,
              photoURL: user.photoURL || undefined,
              bio: settings.customFields?.bio || undefined,
            });
            
            console.log('Chat profile created for existing user:', user.uid);
          }
        } else {
          // Set online status for existing profile
          await setUserOnlineStatus(user.uid, true);
        }
      } catch (error) {
        console.error('Error syncing chat profile:', error);
      }
    };

    syncProfile();
  }, [user]);
};
