import { ref, remove } from 'firebase/database';
import { database } from '../services/firebase';

/**
 * Clear all chats between users
 * This script removes all chat messages and chat lists from Firebase
 * WARNING: This action cannot be undone!
 */
export async function clearAllChats(): Promise<void> {
  try {
    console.log('Starting to clear all chats...');

    // Remove all chat messages
    const messagesRef = ref(database, 'chatMessages');
    await remove(messagesRef);
    console.log('✓ Cleared all chat messages');

    // Remove all chat lists
    const chatsRef = ref(database, 'chats');
    await remove(chatsRef);
    console.log('✓ Cleared all chat lists');

    console.log('Successfully cleared all chats!');
  } catch (error) {
    console.error('Error clearing chats:', error);
    throw error;
  }
}
