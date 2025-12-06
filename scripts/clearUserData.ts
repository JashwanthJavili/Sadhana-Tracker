import { ref, remove } from 'firebase/database';
import { db } from '../services/firebase';

/**
 * Script to clear all data for a specific user
 * Usage: Modify USER_ID below and run this script
 */

const USER_ID = 'YOUR_USER_ID_HERE'; // Replace with actual user ID

async function clearUserData() {
  try {
    console.log(`🗑️ Clearing all data for user: ${USER_ID}`);
    
    // Clear all user data
    await remove(ref(db, `users/${USER_ID}`));
    
    console.log('✅ All user data cleared successfully!');
    console.log('You can now start fresh.');
    
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
  }
}

// Uncomment to run
// clearUserData();

console.log('⚠️ To clear user data:');
console.log('1. Replace USER_ID with your actual user ID');
console.log('2. Uncomment the clearUserData() call');
console.log('3. Run: npx ts-node scripts/clearUserData.ts');
