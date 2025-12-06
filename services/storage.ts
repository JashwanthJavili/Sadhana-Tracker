import { ref, get, set, child } from 'firebase/database';
import { db } from './firebase';
import { DailyEntry, UserSettings, INITIAL_METRICS, INITIAL_REFLECTIONS, INITIAL_SETTINGS } from '../types';

// Helper to generate default slots
export const generateTimeSlots = () => {
  const slots = [];
  const startHour = 4;
  const endHour = 23;

  for (let h = startHour; h <= endHour; h++) {
    const hour = h > 12 ? h - 12 : h;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const nextH = h === 23 ? 0 : h + 1; 
    
    slots.push({
      time: `${hour}:00 – ${hour}:30 ${ampm}`,
      activity: '',
      focus: 0,
    });
    
    const nextHourDisplay = h === 23 ? '12' : (hour === 12 ? '1' : (h === 11 ? '12' : hour));
    const nextAmPm = h === 11 ? 'PM' : (h === 23 ? 'AM' : ampm);

    slots.push({
      time: `${hour}:30 – ${nextHourDisplay}:00 ${nextAmPm === ampm ? '' : nextAmPm}`,
      activity: '',
      focus: 0,
    });
  }
  return slots;
};

// --- Storage Logic ---

const isGuest = (userId: string) => userId === 'guest';

// Create a default empty entry structure
const createDefaultEntry = (dateStr: string): DailyEntry => ({
  id: dateStr,
  date: dateStr,
  commitments: Array(5).fill(null).map((_, i) => ({ id: i + 1, text: '', done: false })),
  reasonNotCompleted: '',
  timeline: generateTimeSlots(),
  metrics: { ...INITIAL_METRICS },
  reflections: { ...INITIAL_REFLECTIONS },
  lastUpdated: Date.now(),
});

export const getEntry = async (userId: string, dateStr: string): Promise<DailyEntry> => {
  if (isGuest(userId)) {
    const localData = localStorage.getItem(`sl_entry_${dateStr}`);
    if (localData) {
      return JSON.parse(localData);
    }
    return createDefaultEntry(dateStr);
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${userId}/entries/${dateStr}`));
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return createDefaultEntry(dateStr);
    }
  } catch (error) {
    console.error("Error getting entry:", error);
    // Fallback to empty if offline/error
    return createDefaultEntry(dateStr);
  }
};

export const saveEntry = async (userId: string, entry: DailyEntry): Promise<void> => {
  if (isGuest(userId)) {
    localStorage.setItem(`sl_entry_${entry.date}`, JSON.stringify(entry));
    return;
  }

  try {
    await set(ref(db, `users/${userId}/entries/${entry.date}`), entry);
  } catch (error) {
    console.error("Error saving entry:", error);
    throw error;
  }
};

export const getAllEntries = async (userId: string): Promise<DailyEntry[]> => {
  if (isGuest(userId)) {
    const entries: DailyEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sl_entry_')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          if (entry.id) entries.push(entry);
        } catch (e) { console.error("Bad local entry", e); }
      }
    }
    return entries.sort((a, b) => b.id.localeCompare(a.id));
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${userId}/entries`));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return (Object.values(data) as DailyEntry[]).sort((a, b) => b.id.localeCompare(a.id));
    }
    return [];
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};

export const getSettings = async (userId: string): Promise<UserSettings> => {
  if (isGuest(userId)) {
    const local = localStorage.getItem('sl_settings');
    if (local) return { ...INITIAL_SETTINGS, ...JSON.parse(local) };
    return INITIAL_SETTINGS;
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${userId}/settings`));
    
    if (snapshot.exists()) {
      return { ...INITIAL_SETTINGS, ...snapshot.val() };
    }
    return INITIAL_SETTINGS;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = async (userId: string, settings: UserSettings): Promise<void> => {
  if (isGuest(userId)) {
    localStorage.setItem('sl_settings', JSON.stringify(settings));
    return;
  }

  try {
    await set(ref(db, `users/${userId}/settings`), settings);
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
};

export const seedDataIfEmpty = async (userId: string) => {
  const entries = await getAllEntries(userId);
  if (entries.length === 0) {
    const today = new Date();
    
    // Create 14 days of dummy data
    for (let i = 14; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const randomMetrics = { ...INITIAL_METRICS };
      randomMetrics.disciplineScore = 2 + Math.floor(Math.random() * 4);
      randomMetrics.mood = 3 + Math.floor(Math.random() * 8);
      randomMetrics.chantingRounds = 10 + Math.floor(Math.random() * 8);
      randomMetrics.deepStudyHours = Math.floor(Math.random() * 4);
      randomMetrics.totalSleep = 5 + Math.floor(Math.random() * 4);
      randomMetrics.energyLevel = 3 + Math.floor(Math.random() * 8);
      randomMetrics.phoneUsage = Math.floor(Math.random() * 120);

      const entry = {
        id: dateStr,
        date: dateStr,
        commitments: Array(5).fill(null).map((_, idx) => ({ id: idx + 1, text: `Commitment ${idx + 1}`, done: Math.random() > 0.4 })),
        reasonNotCompleted: '',
        timeline: generateTimeSlots(),
        metrics: randomMetrics,
        reflections: { ...INITIAL_REFLECTIONS },
        lastUpdated: Date.now(),
      };
      
      await saveEntry(userId, entry);
    }
  }
};