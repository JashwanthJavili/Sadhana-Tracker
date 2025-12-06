import { ref, get, update } from 'firebase/database';
import { database, auth } from '../services/firebase';

const ADMIN_EMAIL = 'jashwanthjavili7@gmail.com';

/**
 * One-time migration script to create chat profiles for all existing users
 * Run this once to populate profiles from settings data
 * ADMIN ONLY - Only jashwanthjavili7@gmail.com can execute this
 */
export const migrateAllUserProfiles = async () => {
  try {
    // Security check - only admin can run this
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
      throw new Error('⛔ Access Denied: This action requires admin privileges.');
    }
    
    console.log('🔄 Starting user profile migration...');
    console.log('✅ Admin authenticated:', currentUser.email);
    
    // Get all users
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No users found');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    const promises: Promise<void>[] = [];

    snapshot.forEach((childSnapshot) => {
      const uid = childSnapshot.key!;
      const userData = childSnapshot.val();

      // Check if user already has profile fields
      if (userData.userName && userData.guruName && userData.iskconCenter) {
        console.log(`✅ User ${uid} already has profile - skipping`);
        skippedCount++;
        return;
      }

      // Check if user has settings
      if (!userData.settings?.userName || !userData.settings?.guruName || !userData.settings?.iskconCenter) {
        console.log(`⚠️ User ${uid} missing settings - skipping`);
        skippedCount++;
        return;
      }

      // Create profile from settings
      const profileData = {
        uid: uid,
        userName: userData.settings.userName,
        guruName: userData.settings.guruName,
        iskconCenter: userData.settings.iskconCenter,
        isOnline: false,
        lastSeen: Date.now(),
        joinedDate: userData.usage?.firstLogin || Date.now(),
      };

      console.log(`📝 Creating profile for user: ${userData.settings.userName} (${uid})`);

      const promise = update(ref(database, `users/${uid}`), profileData)
        .then(() => {
          migratedCount++;
          console.log(`✅ Profile created for ${userData.settings.userName}`);
        })
        .catch((error) => {
          errorCount++;
          console.error(`❌ Error creating profile for ${uid}:`, error);
        });

      promises.push(promise);
    });

    // Wait for all updates to complete
    await Promise.all(promises);

    console.log('\n✨ Migration complete!');
    console.log(`📊 Stats: ${migratedCount} created, ${skippedCount} skipped, ${errorCount} errors`);
    
    return { migratedCount, skippedCount, errorCount };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};
