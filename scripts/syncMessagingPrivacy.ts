/**
 * Script to sync messagingPrivacy from settings to user profile level
 * This is a one-time migration script
 */

import { ref, get, update } from 'firebase/database';
import { database } from '../services/firebase';

export const syncMessagingPrivacyForAllUsers = async () => {
  try {
    console.log('🔄 Starting messagingPrivacy sync...');
    
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('No users found');
      return;
    }
    
    let synced = 0;
    let skipped = 0;
    
    const updates: { [key: string]: any } = {};
    
    snapshot.forEach((childSnapshot) => {
      const userId = childSnapshot.key;
      const userData = childSnapshot.val();
      
      if (userData && userId) {
        // Check if messagingPrivacy exists in settings
        const settingsPrivacy = userData.settings?.messagingPrivacy;
        const topLevelPrivacy = userData.messagingPrivacy;
        
        // If settings has it but top level doesn't, or they're different, sync it
        if (settingsPrivacy && (!topLevelPrivacy || settingsPrivacy !== topLevelPrivacy)) {
          updates[`users/${userId}/messagingPrivacy`] = settingsPrivacy;
          synced++;
          console.log(`✅ Syncing ${userData.userName || userId}: ${settingsPrivacy}`);
        } else if (!settingsPrivacy && !topLevelPrivacy) {
          // Set default
          updates[`users/${userId}/messagingPrivacy`] = 'connections-only';
          updates[`users/${userId}/settings/messagingPrivacy`] = 'connections-only';
          synced++;
          console.log(`📝 Setting default for ${userData.userName || userId}`);
        } else {
          skipped++;
        }
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
      console.log(`✅ Sync complete! Synced: ${synced}, Skipped: ${skipped}`);
    } else {
      console.log('✅ All users already synced!');
    }
    
  } catch (error) {
    console.error('❌ Error syncing messagingPrivacy:', error);
    throw error;
  }
};
