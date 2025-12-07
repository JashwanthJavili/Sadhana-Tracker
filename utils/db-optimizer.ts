/**
 * Database Optimization Layer
 * Handles caching, batching, and optimized queries for Firebase
 */

import { ref, get, set, update, remove, child, onValue, off, query, orderByChild, limitToLast, startAt, endAt } from 'firebase/database';
import { db } from '../services/firebase';
import { CacheWithExpiry, BatchQueue, retryWithBackoff } from './performance';
import { DailyEntry, UserSettings, JournalEntry } from '../types';

// Cache instances for different data types
const entryCache = new CacheWithExpiry<DailyEntry>();
const settingsCache = new CacheWithExpiry<UserSettings>();
const journalCache = new CacheWithExpiry<JournalEntry[]>();

// Batch queues for write operations
const entryBatchQueue = new BatchQueue<{ userId: string; entry: DailyEntry }>(
  async (items) => {
    const updates: { [key: string]: any } = {};
    items.forEach(({ userId, entry }) => {
      updates[`users/${userId}/entries/${entry.date}`] = entry;
    });
    await update(ref(db), updates);
  },
  5,  // Batch size
  500 // Delay in ms
);

/**
 * Optimized entry fetching with caching
 */
export async function getEntryOptimized(
  userId: string,
  dateStr: string
): Promise<DailyEntry | null> {
  const cacheKey = `${userId}_${dateStr}`;
  
  // Check cache first
  const cached = entryCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from database with retry logic
  const entry = await retryWithBackoff(async () => {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${userId}/entries/${dateStr}`));
    return snapshot.exists() ? snapshot.val() : null;
  });
  
  // Cache the result (5 minutes TTL)
  if (entry) {
    entryCache.set(cacheKey, entry, 5 * 60 * 1000);
  }
  
  return entry;
}

/**
 * Batch save entries (auto-batched)
 */
export function saveEntryBatched(userId: string, entry: DailyEntry): void {
  entryBatchQueue.add({ userId, entry });
  
  // Update cache immediately for optimistic UI
  entryCache.set(`${userId}_${entry.date}`, entry);
}

/**
 * Flush pending batches (call before app close/navigation)
 */
export async function flushPendingWrites(): Promise<void> {
  await entryBatchQueue.flush();
}

/**
 * Get entries with pagination
 */
export async function getEntriesPaginated(
  userId: string,
  limit: number = 20,
  startAfter?: string
): Promise<DailyEntry[]> {
  const entriesRef = ref(db, `users/${userId}/entries`);
  let entriesQuery = query(
    entriesRef,
    orderByChild('date'),
    limitToLast(limit)
  );
  
  if (startAfter) {
    entriesQuery = query(
      entriesRef,
      orderByChild('date'),
      endAt(startAfter),
      limitToLast(limit)
    );
  }
  
  const snapshot = await get(entriesQuery);
  
  if (!snapshot.exists()) return [];
  
  const entries: DailyEntry[] = [];
  snapshot.forEach((child) => {
    entries.push(child.val());
  });
  
  return entries.reverse();
}

/**
 * Get entries for date range (optimized)
 */
export async function getEntriesInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyEntry[]> {
  const cacheKey = `range_${userId}_${startDate}_${endDate}`;
  
  // Check cache
  const cached = journalCache.get(cacheKey) as any;
  if (cached) return cached;
  
  const entriesRef = ref(db, `users/${userId}/entries`);
  const rangeQuery = query(
    entriesRef,
    orderByChild('date'),
    startAt(startDate),
    endAt(endDate)
  );
  
  const snapshot = await get(rangeQuery);
  
  if (!snapshot.exists()) return [];
  
  const entries: DailyEntry[] = [];
  snapshot.forEach((child) => {
    entries.push(child.val());
  });
  
  // Cache for 2 minutes
  journalCache.set(cacheKey, entries as any, 2 * 60 * 1000);
  
  return entries;
}

/**
 * Real-time listener with automatic cleanup
 */
export function subscribeToEntry(
  userId: string,
  dateStr: string,
  callback: (entry: DailyEntry | null) => void
): () => void {
  const entryRef = ref(db, `users/${userId}/entries/${dateStr}`);
  
  const listener = onValue(entryRef, (snapshot) => {
    const entry = snapshot.exists() ? snapshot.val() : null;
    
    // Update cache
    if (entry) {
      entryCache.set(`${userId}_${dateStr}`, entry);
    }
    
    callback(entry);
  });
  
  // Return cleanup function
  return () => {
    off(entryRef, 'value', listener);
  };
}

/**
 * Bulk update multiple entries
 */
export async function bulkUpdateEntries(
  userId: string,
  entries: DailyEntry[]
): Promise<void> {
  const updates: { [key: string]: any } = {};
  
  entries.forEach(entry => {
    updates[`users/${userId}/entries/${entry.date}`] = entry;
    // Update cache
    entryCache.set(`${userId}_${entry.date}`, entry);
  });
  
  await update(ref(db), updates);
}

/**
 * Delete old entries (data cleanup)
 */
export async function deleteEntriesBefore(
  userId: string,
  beforeDate: string
): Promise<number> {
  const entriesRef = ref(db, `users/${userId}/entries`);
  const oldEntriesQuery = query(
    entriesRef,
    orderByChild('date'),
    endAt(beforeDate)
  );
  
  const snapshot = await get(oldEntriesQuery);
  
  if (!snapshot.exists()) return 0;
  
  const updates: { [key: string]: null } = {};
  let count = 0;
  
  snapshot.forEach((child) => {
    updates[`users/${userId}/entries/${child.key}`] = null;
    count++;
  });
  
  await update(ref(db), updates);
  
  return count;
}

/**
 * Get statistics (aggregated data)
 */
export async function getUserStats(userId: string): Promise<{
  totalEntries: number;
  streak: number;
  averageScore: number;
}> {
  const entries = await getEntriesPaginated(userId, 30);
  
  let streak = 0;
  let totalScore = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate streak
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const entry = entries.find(e => e.date === dateStr);
    
    if (entry) {
      streak++;
    } else {
      break;
    }
  }
  
  // Calculate average
  entries.forEach(entry => {
    totalScore += entry.metrics.overallPerformance || 0;
  });
  
  return {
    totalEntries: entries.length,
    streak,
    averageScore: entries.length > 0 ? totalScore / entries.length : 0
  };
}

/**
 * Prefetch likely-needed data
 */
export async function prefetchUserData(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Prefetch in parallel
  await Promise.all([
    getEntryOptimized(userId, today),
    getEntryOptimized(userId, yesterdayStr),
    // Settings are frequently accessed
    retryWithBackoff(() => 
      get(child(ref(db), `users/${userId}/settings`))
    )
  ]);
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  entryCache.clear();
  settingsCache.clear();
  journalCache.clear();
}

/**
 * Cleanup expired cache entries
 */
export function cleanupCaches(): void {
  entryCache.cleanup();
  settingsCache.cleanup();
  journalCache.cleanup();
}

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupCaches, 5 * 60 * 1000);
  
  // Flush pending writes before page unload
  window.addEventListener('beforeunload', () => {
    flushPendingWrites();
  });
}
