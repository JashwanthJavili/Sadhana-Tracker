/**
 * Script to identify and optionally fix corrupted chats in Firebase
 * Run this in the browser console or as a maintenance script
 */

import { ref, get, update, remove } from 'firebase/database';
import { database } from '../services/firebase';

export const findCorruptedChats = async () => {
  console.log('🔍 Scanning for corrupted chats...');
  
  const chatsRef = ref(database, 'chats');
  const snapshot = await get(chatsRef);
  
  if (!snapshot.exists()) {
    console.log('✅ No chats found in database');
    return [];
  }
  
  const corruptedChats: Array<{
    chatId: string;
    issue: string;
    data: any;
  }> = [];
  
  snapshot.forEach((childSnapshot) => {
    const chatId = childSnapshot.key!;
    const chat = childSnapshot.val();
    
    // Check for missing or invalid participants
    if (!chat) {
      corruptedChats.push({
        chatId,
        issue: 'Chat data is null or undefined',
        data: chat,
      });
    } else if (!chat.participants) {
      corruptedChats.push({
        chatId,
        issue: 'Missing participants field',
        data: chat,
      });
    } else if (!Array.isArray(chat.participants)) {
      corruptedChats.push({
        chatId,
        issue: 'Participants is not an array',
        data: chat,
      });
    } else if (chat.participants.length === 0) {
      corruptedChats.push({
        chatId,
        issue: 'Participants array is empty',
        data: chat,
      });
    } else if (chat.participants.length !== 2) {
      corruptedChats.push({
        chatId,
        issue: `Invalid participant count: ${chat.participants.length}`,
        data: chat,
      });
    }
  });
  
  if (corruptedChats.length === 0) {
    console.log('✅ No corrupted chats found!');
  } else {
    console.log(`⚠️ Found ${corruptedChats.length} corrupted chats:`);
    corruptedChats.forEach((item) => {
      console.log(`  - ${item.chatId}: ${item.issue}`);
      console.log('    Data:', item.data);
    });
  }
  
  return corruptedChats;
};

export const deleteCorruptedChats = async () => {
  const corrupted = await findCorruptedChats();
  
  if (corrupted.length === 0) {
    console.log('✅ Nothing to delete');
    return;
  }
  
  console.log(`🗑️ Deleting ${corrupted.length} corrupted chats...`);
  
  const deletePromises = corrupted.map((item) => {
    const chatRef = ref(database, `chats/${item.chatId}`);
    return remove(chatRef);
  });
  
  await Promise.all(deletePromises);
  
  console.log('✅ Deleted all corrupted chats');
};

// Usage:
// 1. In browser console: await findCorruptedChats()
// 2. To delete them: await deleteCorruptedChats()
