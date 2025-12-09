
export interface TimelineSlot {
  time: string;
  activity: string;
  focus: number; // 0-100%
}

export interface Commitment {
  id: number;
  text: string;
  done: boolean;
}

export interface DailyMetrics {
  wakeUpTime: string;
  sleepTime: string;
  totalSleep: number;
  emotionalStability: number; // 1-10
  disciplineScore: number; // 1-5
  deepStudyHours: number;
  lightStudyHours: number;
  wastedHours: number;
  phoneUsage: number; // minutes
  chantingRounds: number;
  gitaReading: boolean;
  sadhanaQuality: number; // 1-10
  sevaPerformed: string;
  overallPerformance: number; // 1-10
  waterIntake: number; // Liters
  foodDiscipline: number; // 0-10
  energyLevel: number; // 1-10
  mood: number; // 1-10
}

export interface Reflections {
  didWell: string;
  heldBack: string;
  improveTomorrow: string;
  avoidTomorrow: string;
  victory: string;
  lostControl: string;
}

export interface DailyEntry {
  id: string; // YYYY-MM-DD
  date: string;
  commitments: Commitment[];
  reasonNotCompleted: string;
  timeline: TimelineSlot[];
  metrics: DailyMetrics;
  reflections: Reflections;
  lastUpdated: number;
}

export interface Quote {
  id: string;
  text: string;
  source: string;
}

export interface UserSettings {
  userName: string;
  gender: 'male' | 'female';
  guruName: string;
  iskconCenter: string;
  themeColor: 'orange' | 'blue' | 'rose';
  language: 'en' | 'hi' | 'te';
  isFirstTime: boolean;
  tourCompleted?: boolean;
  // Privacy settings
  showGuruName?: boolean;
  showIskconCenter?: boolean;
  showLastSeen?: boolean;
  showEmail?: boolean;
  // Messaging privacy
  messagingPrivacy?: 'everyone' | 'connections-only';
}

export const INITIAL_METRICS: DailyMetrics = {
  wakeUpTime: '',
  sleepTime: '',
  totalSleep: 0,
  emotionalStability: 5,
  disciplineScore: 3,
  deepStudyHours: 0,
  lightStudyHours: 0,
  wastedHours: 0,
  phoneUsage: 0,
  chantingRounds: 0,
  gitaReading: false,
  sadhanaQuality: 5,
  sevaPerformed: '',
  overallPerformance: 5,
  waterIntake: 0,
  foodDiscipline: 5,
  energyLevel: 5,
  mood: 5,
};

export const INITIAL_REFLECTIONS: Reflections = {
  didWell: '',
  heldBack: '',
  improveTomorrow: '',
  avoidTomorrow: '',
  victory: '',
  lostControl: '',
};

export const DEFAULT_QUOTES: Quote[] = [
  { id: '1', text: 'Therefore, STAND UP, O Arjuna! A command from Krishna Himself — get up, rise, act.', source: 'Gita' },
  { id: '2', text: 'The soul does not act, nor cause action, nor enjoy the results.', source: 'Gita' },
  { id: '3', text: 'Lift yourself by your own mind. Krishna will guide you, but YOU must rise first.', source: 'Gita 6.5' },
];

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Devotee',
  gender: 'male',
  guruName: '',
  iskconCenter: '',
  themeColor: 'orange',
  language: 'en',
  isFirstTime: true,
  tourCompleted: false,
};
