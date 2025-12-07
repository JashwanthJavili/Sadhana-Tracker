import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../services/firebase';
import { ref, set, get, push, update } from 'firebase/database';
import { 
  Trophy, 
  TrendingUp, 
  Flame, 
  Calendar, 
  RefreshCw,
  Clock,
  Target,
  Award,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  X,
  CheckCircle,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

interface ChantingSession {
  id: string;
  count: number;
  rounds: number;
  date: string;
  timestamp: number;
  duration: number;
  mantraType?: string;
  goal?: number;
  completed?: boolean;
}

interface ChantingStats {
  totalRounds: number;
  totalBeads: number;
  currentStreak: number;
  bestStreak: number;
  sessions: ChantingSession[];
  totalTimeSpent: number;
  averageRoundsPerDay: number;
  favoriteMantra?: string;
}

interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  startDate: number;
  endDate: number;
}

const MANTRA_TYPES = [
  { id: 'hare-krishna', name: 'Hare Krishna Maha Mantra', beads: 108 },
  { id: 'gayatri', name: 'Gayatri Mantra', beads: 108 },
  { id: 'maha-mrityunjaya', name: 'Maha Mrityunjaya Mantra', beads: 108 },
  { id: 'om-namah-shivaya', name: 'Om Namah Shivaya', beads: 108 },
  { id: 'custom', name: 'Custom Mantra', beads: 108 }
];

const ChantingCounter: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [stats, setStats] = useState<ChantingStats | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [isChanting, setIsChanting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedDuration, setPausedDuration] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [selectedMantra, setSelectedMantra] = useState(MANTRA_TYPES[0]);
  const [customMantra, setCustomMantra] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoIncrement, setAutoIncrement] = useState(false);
  const [incrementSpeed, setIncrementSpeed] = useState(3000);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [beadSize, setBeadSize] = useState('large');
  const [theme, setTheme] = useState('orange');
  const [milestones, setMilestones] = useState<number[]>([]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneRounds, setMilestoneRounds] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showResetBeadsConfirm, setShowResetBeadsConfirm] = useState(false);
  const [showResetRoundsConfirm, setShowResetRoundsConfirm] = useState(false);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);
  const [showResetTimerConfirm, setShowResetTimerConfirm] = useState(false);

  useEffect(() => {
    loadStats();
    loadGoals();
    loadUserPreferences();
    checkDailyReset();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isChanting && !isPaused) {
      interval = setInterval(() => {
        setCurrentTime(getCurrentSessionTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isChanting, isPaused, sessionStartTime, pausedDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoIncrement && isChanting && !isPaused) {
      interval = setInterval(() => {
        handleBeadClick();
      }, incrementSpeed);
    }
    return () => clearInterval(interval);
  }, [autoIncrement, isChanting, isPaused, incrementSpeed, count]);

  const loadUserPreferences = async () => {
    if (!user || user.uid === 'guest') return;
    try {
      const prefsRef = ref(db, `users/${user.uid}/chantingPreferences`);
      const snapshot = await get(prefsRef);
      if (snapshot.exists()) {
        const prefs = snapshot.val();
        setSoundEnabled(prefs.soundEnabled ?? true);
        setBeadSize(prefs.beadSize || 'large');
        setTheme(prefs.theme || 'orange');
        setIncrementSpeed(prefs.incrementSpeed || 3000);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveUserPreferences = async () => {
    if (!user || user.uid === 'guest') return;
    try {
      await set(ref(db, `users/${user.uid}/chantingPreferences`), {
        soundEnabled,
        beadSize,
        theme,
        incrementSpeed
      });
      showSuccess('Preferences Saved', 'Your chanting settings have been updated');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const loadGoals = async () => {
    if (!user || user.uid === 'guest') return;
    try {
      const goalsRef = ref(db, `users/${user.uid}/chantingGoals`);
      const snapshot = await get(goalsRef);
      if (snapshot.exists()) {
        const goalsData: Goal[] = [];
        snapshot.forEach((child) => {
          goalsData.push({ id: child.key!, ...child.val() });
        });
        setGoals(goalsData.filter(g => g.endDate > Date.now()));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadStats = async () => {
    if (!user || user.uid === 'guest') return;

    try {
      const statsRef = ref(db, `users/${user.uid}/chantingStats`);
      const snapshot = await get(statsRef);
      
      if (snapshot.exists()) {
        const statsData = snapshot.val();
        setStats(statsData);
        
        const milestonesRef = ref(db, `users/${user.uid}/chantingMilestones`);
        const milestonesSnapshot = await get(milestonesRef);
        if (milestonesSnapshot.exists()) {
          setMilestones(Object.values(milestonesSnapshot.val()));
        }
      } else {
        const initialStats: ChantingStats = {
          totalRounds: 0,
          totalBeads: 0,
          currentStreak: 0,
          bestStreak: 0,
          sessions: [],
          totalTimeSpent: 0,
          averageRoundsPerDay: 0
        };
        setStats(initialStats);
      }
    } catch (error) {
      console.error('Error loading chanting stats:', error);
    }
  };

  const playSound = () => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const celebrateRoundCompletion = (roundNumber: number) => {
    if (soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const bellFrequency = 800; // Temple bell frequency
        
        // Ring bell the same number of times as rounds completed
        for (let i = 0; i < roundNumber; i++) {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = bellFrequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
          }, i * 600); // 600ms between each bell ring
        }
      } catch (error) {
        console.error('Error playing celebration:', error);
      }
    }
    
    if (navigator.vibrate) {
      // Vibrate pattern: ring count times
      const vibratePattern = [];
      for (let i = 0; i < roundNumber; i++) {
        vibratePattern.push(200, 400); // vibrate, pause
      }
      navigator.vibrate(vibratePattern);
    }
  };

  const handleBeadClick = () => {
    if (!isChanting) {
      setIsChanting(true);
      setSessionStartTime(Date.now());
    }

    if (isPaused) return;

    playSound();

    const newCount = count + 1;
    setCount(newCount);

    if (newCount === selectedMantra.beads) {
      const newRounds = rounds + 1;
      setRounds(newRounds);
      setCount(0);
      celebrateRoundCompletion(newRounds);
      checkMilestones((stats?.totalRounds || 0) + newRounds);
      updateGoalsProgress(1);
    }
  };

  const checkMilestones = (totalRounds: number) => {
    const milestoneValues = [10, 50, 100, 500, 1000, 5000, 10000];
    
    milestoneValues.forEach(milestone => {
      if (totalRounds >= milestone && !milestones.includes(milestone)) {
        setMilestones([...milestones, milestone]);
        if (user && user.uid !== 'guest') {
          set(ref(db, `users/${user.uid}/chantingMilestones/${milestone}`), milestone);
        }
        setMilestoneRounds(milestone);
        setShowMilestoneModal(true);
      }
    });
  };

  const updateGoalsProgress = async (roundsCompleted: number) => {
    if (!user || user.uid === 'guest') return;
    
    const updatedGoals = goals.map(goal => {
      if (goal.endDate > Date.now()) {
        return { ...goal, current: goal.current + roundsCompleted };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    
    for (const goal of updatedGoals) {
      await update(ref(db, `users/${user.uid}/chantingGoals/${goal.id}`), {
        current: goal.current
      });
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      const pauseDuration = Date.now() - (pauseStartTime || 0);
      setPausedDuration(pausedDuration + pauseDuration);
      setPauseStartTime(null);
      setIsPaused(false);
    } else {
      setPauseStartTime(Date.now());
      setIsPaused(true);
    }
  };

  const handleReset = () => {
    setShowResetBeadsConfirm(true);
  };

  const confirmResetBeads = () => {
    setCount(0);
    playSound();
    setShowResetBeadsConfirm(false);
    showSuccess('Beads counter reset successfully');
  };

  const handleResetRounds = () => {
    setShowResetRoundsConfirm(true);
  };

  const confirmResetRounds = () => {
    setRounds(0);
    setShowResetRoundsConfirm(false);
    showSuccess('Rounds counter reset successfully');
  };

  const handleResetTimer = () => {
    setShowResetTimerConfirm(true);
  };

  const confirmResetTimer = () => {
    setSessionStartTime(Date.now());
    setPausedDuration(0);
    setCurrentTime(0);
    setShowResetTimerConfirm(false);
    showSuccess('Timer reset successfully');
  };

  const handleSaveSession = async () => {
    if (!user || user.uid === 'guest') {
      showWarning('Sign In Required', 'Please sign in to save your chanting sessions');
      return;
    }

    if (rounds === 0 && count === 0) {
      showWarning('No Activity', 'Please complete at least one bead before saving');
      return;
    }

    try {
      const duration = sessionStartTime 
        ? Math.floor((Date.now() - sessionStartTime - pausedDuration) / 1000) 
        : 0;
      
      const session: ChantingSession = {
        id: Date.now().toString(),
        count: count,
        rounds: rounds,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        duration: duration,
        mantraType: selectedMantra.id === 'custom' ? customMantra : selectedMantra.name,
        goal: rounds * selectedMantra.beads + count,
        completed: count === 0
      };

      const sessionsRef = ref(db, `users/${user.uid}/chantingSessions`);
      await push(sessionsRef, session);

      const updatedStats: ChantingStats = {
        totalRounds: (stats?.totalRounds || 0) + rounds,
        totalBeads: (stats?.totalBeads || 0) + (rounds * selectedMantra.beads) + count,
        currentStreak: calculateStreak(),
        bestStreak: stats?.bestStreak || 0,
        sessions: [...(stats?.sessions || []), session],
        totalTimeSpent: (stats?.totalTimeSpent || 0) + duration,
        averageRoundsPerDay: calculateAverageRounds((stats?.totalRounds || 0) + rounds),
        favoriteMantra: selectedMantra.id === 'custom' ? customMantra : selectedMantra.name
      };

      if (updatedStats.currentStreak > updatedStats.bestStreak) {
        updatedStats.bestStreak = updatedStats.currentStreak;
      }

      await set(ref(db, `users/${user.uid}/chantingStats`), updatedStats);
      
      setStats(updatedStats);
      setSessionSummary({
        rounds,
        count,
        duration,
        totalRounds: updatedStats.totalRounds
      });
      setShowSaveModal(true);
      
      setCount(0);
      setRounds(0);
      setIsChanting(false);
      setSessionStartTime(null);
      setPausedDuration(0);
    } catch (error) {
      console.error('Error saving session:', error);
      showError('Save Failed', 'Unable to save session. Please try again');
    }
  };

  const calculateAverageRounds = (totalRounds: number): number => {
    if (!stats?.sessions || stats.sessions.length === 0) return totalRounds;
    const firstSession = stats.sessions[0]?.timestamp || Date.now();
    const daysSinceStart = Math.max(1, Math.floor((Date.now() - firstSession) / (1000 * 60 * 60 * 24)));
    return Math.round(totalRounds / daysSinceStart * 10) / 10;
  };

  const calculateStreak = (): number => {
    if (!stats?.sessions || stats.sessions.length === 0) return 1;

    let streak = 1;
    const sessions = [...stats.sessions].sort((a, b) => b.timestamp - a.timestamp);

    for (let i = 0; i < sessions.length - 1; i++) {
      const currentDate = new Date(sessions[i].timestamp).toDateString();
      const prevDate = new Date(sessions[i + 1].timestamp);
      prevDate.setDate(prevDate.getDate() - 1);
      
      if (currentDate === prevDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getRecentSessions = () => {
    if (!stats?.sessions) return [];
    return [...stats.sessions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  };

  const checkDailyReset = async () => {
    if (!user || user.uid === 'guest') return;

    try {
      const today = new Date().toDateString();
      const resetRef = ref(db, `users/${user.uid}/chantingSettings/lastResetDate`);
      const snapshot = await get(resetRef);
      
      if (snapshot.exists()) {
        const lastReset = snapshot.val();
        setLastResetDate(lastReset);
        
        // If it's a new day, auto-reset rounds
        if (lastReset !== today) {
          setRounds(0);
          setCount(0);
          await set(resetRef, today);
          setLastResetDate(today);
          showSuccess('Daily Reset', 'Rounds have been reset for the new day');
        }
      } else {
        // First time setup
        await set(resetRef, today);
        setLastResetDate(today);
      }

      // Check and perform 30-day data cleanup
      await performDataCleanup();
    } catch (error) {
      console.error('Error checking daily reset:', error);
    }
  };

  const performDataCleanup = async () => {
    if (!user || user.uid === 'guest') return;

    try {
      const statsRef = ref(db, `users/${user.uid}/chantingStats`);
      const snapshot = await get(statsRef);
      
      if (snapshot.exists()) {
        const statsData = snapshot.val();
        const sessions = statsData.sessions || [];
        
        // Keep only last 30 days of sessions
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recentSessions = sessions.filter((session: any) => session.timestamp > thirtyDaysAgo);
        
        // If cleanup happened, save updated data
        if (recentSessions.length < sessions.length) {
          await update(statsRef, {
            sessions: recentSessions
          });
          console.log(`Cleaned up ${sessions.length - recentSessions.length} old sessions`);
        }
      }
    } catch (error) {
      console.error('Error performing data cleanup:', error);
    }
  };

  const createGoal = async (type: 'daily' | 'weekly' | 'monthly', target: number) => {
    if (!user || user.uid === 'guest') {
      showWarning('Sign In Required', 'Please sign in to create chanting goals');
      return;
    }

    const now = Date.now();
    const endDate = type === 'daily' 
      ? now + 24 * 60 * 60 * 1000
      : type === 'weekly'
      ? now + 7 * 24 * 60 * 60 * 1000
      : now + 30 * 24 * 60 * 60 * 1000;

    const goal: Goal = {
      id: now.toString(),
      type,
      target,
      current: 0,
      startDate: now,
      endDate
    };

    const goalsRef = ref(db, `users/${user.uid}/chantingGoals`);
    await push(goalsRef, goal);
    loadGoals();
    showSuccess(`Goal created: ${target} rounds ${type}!`);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getCurrentSessionTime = () => {
    if (!sessionStartTime) return 0;
    const elapsed = Date.now() - sessionStartTime - pausedDuration;
    return Math.floor(elapsed / 1000);
  };

  const themeColors = {
    orange: { primary: 'from-orange-500 to-amber-600', secondary: 'from-orange-600 to-amber-700', bg: 'from-orange-50 to-amber-50', border: 'border-orange-300', text: 'text-orange-600' },
    purple: { primary: 'from-purple-500 to-indigo-600', secondary: 'from-purple-600 to-indigo-700', bg: 'from-purple-50 to-indigo-50', border: 'border-purple-300', text: 'text-purple-600' },
    green: { primary: 'from-green-500 to-emerald-600', secondary: 'from-green-600 to-emerald-700', bg: 'from-green-50 to-emerald-50', border: 'border-green-300', text: 'text-green-600' },
    blue: { primary: 'from-blue-500 to-cyan-600', secondary: 'from-blue-600 to-cyan-700', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-300', text: 'text-blue-600' }
  };

  const currentTheme = themeColors[theme as keyof typeof themeColors] || themeColors.orange;

  const beadSizeClass = beadSize === 'small' ? 'w-48 h-48' : beadSize === 'medium' ? 'w-56 h-56' : 'w-64 h-64';

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-6xl mx-auto px-3 sm:px-4">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentTheme.primary} rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl sm:shadow-2xl border-2 ${currentTheme.border}`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">Japa Mala Counter</h1>
            <p className="text-white text-opacity-90 text-sm sm:text-base md:text-lg">{selectedMantra.name}</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 sm:p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg sm:rounded-xl transition-all"
            >
              <SettingsIcon className="text-white" size={20} />
            </button>
            <button
              onClick={() => setShowGoals(!showGoals)}
              className="p-2 sm:p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg sm:rounded-xl transition-all"
            >
              <Target className="text-white" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Control Panels - Settings & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Settings Panel - Collapsible (Closed by default) */}
        <details className="bg-white rounded-lg sm:rounded-xl shadow-lg border-2 border-stone-200">
          <summary className="px-4 sm:px-6 py-3 sm:py-4 cursor-pointer font-bold text-base sm:text-lg md:text-xl text-stone-800 hover:bg-stone-50 rounded-t-lg sm:rounded-t-xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <SettingsIcon size={24} />
              Preferences
            </span>
            <ChevronDown size={20} className="transform transition-transform" />
          </summary>
          
          <div className="px-6 pb-6 space-y-4 border-t-2 border-stone-100">
            {/* Mantra Selection */}
            <div>
              <label className="block font-semibold mb-2 text-stone-700 text-sm">Mantra Type</label>
              <select
                value={selectedMantra.id}
                onChange={(e) => setSelectedMantra(MANTRA_TYPES.find(m => m.id === e.target.value) || MANTRA_TYPES[0])}
                className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
              >
                {MANTRA_TYPES.map(mantra => (
                  <option key={mantra.id} value={mantra.id}>{mantra.name}</option>
                ))}
              </select>
            </div>

            {selectedMantra.id === 'custom' && (
              <div>
                <label className="block font-semibold mb-2 text-stone-700 text-sm">Custom Mantra Name</label>
                <input
                  type="text"
                  value={customMantra}
                  onChange={(e) => setCustomMantra(e.target.value)}
                  placeholder="Enter mantra name"
                  className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
            )}

            {/* Compact Toggle Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-50 p-3 rounded-lg border-2 border-stone-200">
                <label className="block text-xs font-semibold text-stone-600 mb-2">Sound</label>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-full p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${soundEnabled ? 'bg-green-500 text-white' : 'bg-stone-300 text-stone-600'}`}
                >
                  {soundEnabled ? <><Volume2 size={16} /> ON</> : <><VolumeX size={16} /> OFF</>}
                </button>
              </div>

              <div className="bg-stone-50 p-3 rounded-lg border-2 border-stone-200">
                <label className="block text-xs font-semibold text-stone-600 mb-2">Auto Count</label>
                <button
                  onClick={() => setAutoIncrement(!autoIncrement)}
                  className={`w-full p-2 rounded-lg transition-all ${autoIncrement ? 'bg-green-500 text-white' : 'bg-stone-300 text-stone-600'}`}
                >
                  {autoIncrement ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {autoIncrement && (
              <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                <label className="block text-xs font-semibold text-blue-700 mb-2">Speed: {incrementSpeed}ms</label>
                <input
                  type="range"
                  min="1000"
                  max="5000"
                  step="500"
                  value={incrementSpeed}
                  onChange={(e) => setIncrementSpeed(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            )}

            {/* Button Size */}
            <div>
              <label className="block font-semibold mb-2 text-stone-700 text-sm">Button Size</label>
              <div className="grid grid-cols-3 gap-2">
                {['small', 'medium', 'large'].map(size => (
                  <button
                    key={size}
                    onClick={() => setBeadSize(size)}
                    className={`py-2 rounded-lg transition-all text-sm font-semibold ${beadSize === size ? 'bg-orange-500 text-white shadow-lg' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <label className="block font-semibold mb-2 text-stone-700 text-sm">Theme</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.keys(themeColors).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`h-12 rounded-lg transition-all border-4 ${theme === t ? 'border-stone-800 scale-110' : 'border-stone-200 hover:border-stone-400'} bg-gradient-to-br ${themeColors[t as keyof typeof themeColors].primary}`}
                    title={t}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={saveUserPreferences}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              Save Preferences
            </button>
          </div>
        </details>

        {/* Goals Panel - Collapsible (Closed by default) */}
        <details className="bg-white rounded-lg sm:rounded-xl shadow-lg border-2 border-stone-200">
          <summary className="px-4 sm:px-6 py-3 sm:py-4 cursor-pointer font-bold text-base sm:text-lg md:text-xl text-stone-800 hover:bg-stone-50 rounded-t-lg sm:rounded-t-xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target size={24} />
              Goals
            </span>
            <ChevronDown size={20} className="transform transition-transform" />
          </summary>
          
          <div className="px-6 pb-6 space-y-4 border-t-2 border-stone-100">
            {/* Milestones */}
            {milestones.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-stone-700">
                  <Award className="text-yellow-600" size={18} />
                  Milestones Achieved
                </h4>
                <div className="flex flex-wrap gap-2">
                  {milestones.sort((a, b) => a - b).map(milestone => (
                    <div key={milestone} className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-sm font-bold flex items-center gap-1.5">
                      <Award size={14} />
                      {milestone}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Goals */}
            {goals.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3 text-stone-700">Active Goals</h4>
                <div className="space-y-2">
                  {goals.map(goal => (
                    <div key={goal.id} className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-sm text-stone-800 capitalize">{goal.type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${goal.current >= goal.target ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Goal */}
            <div>
              <h4 className="font-semibold text-sm mb-3 text-stone-700">Create New Goal</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const target = prompt('Enter daily rounds target:');
                    if (target) createGoal('daily', parseInt(target));
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  Daily
                </button>
                <button
                  onClick={() => {
                    const target = prompt('Enter weekly rounds target:');
                    if (target) createGoal('weekly', parseInt(target));
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  Weekly
                </button>
                <button
                  onClick={() => {
                    const target = prompt('Enter monthly rounds target:');
                    if (target) createGoal('monthly', parseInt(target));
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className={`bg-gradient-to-br ${currentTheme.bg} rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 ${currentTheme.border} shadow-md sm:shadow-lg`}>
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <Trophy className={currentTheme.text} size={18} />
            <h3 className="font-bold text-xs sm:text-sm md:text-base text-stone-800">Total Rounds</h3>
          </div>
          <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${currentTheme.text}`}>{stats?.totalRounds || 0}</p>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5 sm:mt-1">Completed</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-300 shadow-md sm:shadow-lg">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <TrendingUp className="text-blue-600" size={18} />
            <h3 className="font-bold text-xs sm:text-sm md:text-base text-stone-800">Total Beads</h3>
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">{stats?.totalBeads || 0}</p>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5 sm:mt-1">Mantras chanted</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-green-300 shadow-md sm:shadow-lg">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <Flame className="text-green-600" size={18} />
            <h3 className="font-bold text-xs sm:text-sm md:text-base text-stone-800">Streak</h3>
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">{stats?.currentStreak || 0}</p>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5 sm:mt-1">Days</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-purple-300 shadow-md sm:shadow-lg">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <Clock className="text-purple-600" size={18} />
            <h3 className="font-bold text-xs sm:text-sm md:text-base text-stone-800">Time</h3>
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600">{Math.floor((stats?.totalTimeSpent || 0) / 60)}m</p>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5 sm:mt-1">Chanting</p>
        </div>
      </div>

      {/* Main Counter */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 shadow-xl sm:shadow-2xl border-2 border-stone-200">
        {/* Session Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-800 mb-2 sm:mb-3">Current Session</h2>
          
          {/* Timer Display */}
          {isChanting && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl">
              <Clock size={20} className="text-purple-600" />
              <span className="text-lg font-bold text-purple-700">{formatTime(currentTime)}</span>
            </div>
          )}
        </div>

        {/* Counter Display */}
        <div className="flex justify-center gap-3 sm:gap-6 md:gap-8 mb-4 sm:mb-6">
          <div className="text-center">
            <p className="text-xs text-stone-500 mb-1 sm:mb-2 uppercase tracking-wide">Rounds</p>
            <p className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold ${currentTheme.text}`}>{rounds}</p>
          </div>
          <div className="flex items-center">
            <div className="h-12 sm:h-16 md:h-20 w-0.5 sm:w-1 bg-stone-300 rounded-full"></div>
          </div>
          <div className="text-center">
            <p className="text-xs text-stone-500 mb-1 sm:mb-2 uppercase tracking-wide">Beads</p>
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600">{count}<span className="text-xl sm:text-2xl md:text-3xl text-stone-400">/{selectedMantra.beads}</span></p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative w-full bg-stone-200 rounded-full h-3 sm:h-4 md:h-6 overflow-hidden">
            <div 
              className={`absolute top-0 left-0 bg-gradient-to-r ${currentTheme.primary} h-full transition-all duration-300 flex items-center justify-end pr-2`}
              style={{ width: `${(count / selectedMantra.beads) * 100}%` }}
            >
              <span className="text-white text-xs font-bold hidden sm:inline">
                {count > 0 && `${Math.round((count / selectedMantra.beads) * 100)}%`}
              </span>
            </div>
          </div>
          <p className="text-xs text-center text-stone-500 mt-2">
            {selectedMantra.beads - count} beads remaining
          </p>
        </div>

        {/* Main Counter Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleBeadClick}
            disabled={isPaused}
            className={`${beadSizeClass} bg-gradient-to-br ${currentTheme.primary} hover:${currentTheme.secondary} text-white rounded-full shadow-2xl transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center text-5xl sm:text-6xl md:text-7xl font-bold border-4 sm:border-6 md:border-8 ${currentTheme.border} ${isPaused ? 'opacity-50 cursor-not-allowed' : ''} touch-manipulation relative`}
          >
            <span>{count}</span>
            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                <Pause size={48} className="text-white" />
              </div>
            )}
          </button>
        </div>

        {/* Action Controls - Reorganized */}
        <div className="space-y-4">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {isChanting && (
              <button
                onClick={handlePauseResume}
                className={`px-4 py-3 sm:py-4 ${isPaused ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'} text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base`}
              >
                {isPaused ? <><Play size={18} /> Resume</> : <><Pause size={18} /> Pause</>}
              </button>
            )}
            <button
              onClick={handleSaveSession}
              className="px-4 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base col-span-2 sm:col-span-1"
            >
              <Award size={18} />
              <span>Save Session</span>
            </button>
          </div>

          {/* Secondary Actions - Collapsible */}
          <details id="advancedControls" className="bg-stone-50 rounded-xl border-2 border-stone-200" open={isChanting}>
            <summary className="px-4 py-3 cursor-pointer font-semibold text-stone-700 hover:text-stone-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <SettingsIcon size={18} />
                Advanced Controls
              </span>
              <ChevronDown size={18} className="transform transition-transform" />
            </summary>
            <div className="p-4 space-y-3 border-t-2 border-stone-200">
              {/* Reset All Button */}
              <button
                onClick={() => {
                  handleReset();
                  handleResetRounds();
                  if (isChanting) {
                    handleResetTimer();
                  }
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <RefreshCw size={18} />
                <span>Reset Everything</span>
              </button>
              
              {/* Individual Reset Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={handleReset}
                className="px-3 py-2 sm:px-4 sm:py-3 bg-stone-500 hover:bg-stone-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <RefreshCw size={16} />
                <span>Reset Beads</span>
              </button>
              <button
                onClick={handleResetRounds}
                className="px-3 py-2 sm:px-4 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <RotateCcw size={16} />
                <span>Reset Rounds</span>
              </button>
              {isChanting && (
                <button
                  onClick={handleResetTimer}
                  className="px-3 py-2 sm:px-4 sm:py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm col-span-2"
                >
                  <Clock size={16} />
                  <span>Reset Timer</span>
                </button>
              )}
            </div>
          </div>
        </details>

      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-stone-200">
        <h3 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Calendar className={currentTheme.text} size={28} />
          Recent Sessions
        </h3>
        
        {getRecentSessions().length > 0 ? (
          <div className="space-y-3">
            {getRecentSessions().map((session, index) => (
              <div key={session.id || index} className={`p-4 bg-gradient-to-r ${currentTheme.bg} rounded-lg border-2 ${currentTheme.border}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-stone-800">
                      {session.rounds} rounds {session.count > 0 && `+ ${session.count} beads`}
                    </p>
                    <p className="text-sm text-stone-600">
                      {session.date} • Duration: {Math.floor(session.duration / 60)}m {session.duration % 60}s
                    </p>
                    {session.mantraType && (
                      <p className="text-xs text-stone-500 mt-1">
                        {session.mantraType}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${currentTheme.text}`}>
                      {session.rounds * (session.mantraType === 'Custom Mantra' ? selectedMantra.beads : 108) + session.count}
                    </p>
                    <p className="text-xs text-stone-500">mantras</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-stone-500">
            <p>No sessions yet. Start chanting to track your progress!</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className={`bg-gradient-to-r ${currentTheme.bg} rounded-xl p-6 border-2 ${currentTheme.border}`}>
        <h3 className="font-bold text-lg mb-3 text-stone-800">How to Use Premium Features</h3>
        <ul className="space-y-2 text-stone-700 text-sm sm:text-base">
          <li><strong>Mantra Types:</strong> Choose from traditional mantras or create custom ones</li>
          <li><strong>Auto-Increment:</strong> Automatic counting at your preferred pace</li>
          <li><strong>Sound Effects:</strong> Audio feedback on bead completion</li>
          <li><strong>Pause/Resume:</strong> Take breaks without losing progress</li>
          <li><strong>Goals:</strong> Set and track daily, weekly, or monthly targets</li>
          <li><strong>Milestones:</strong> Unlock achievements at 10, 50, 100, 500+ rounds</li>
          <li><strong>Themes:</strong> Customize appearance to your preference</li>
        </ul>
      </div>

      {/* Milestone Achievement Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100000] p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 border-4 border-yellow-300">
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Trophy className="text-yellow-600 w-16 h-16" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                Milestone Achieved!
              </h2>
              <p className="text-2xl font-bold text-stone-800">
                {milestoneRounds} Rounds Completed
              </p>
              <p className="text-stone-700 text-lg leading-relaxed">
                Your dedication to spiritual practice is truly inspiring. Keep chanting!
              </p>
              <p className="text-orange-600 font-bold text-xl">Hare Krishna!</p>
            </div>

            <button
              onClick={() => setShowMilestoneModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white rounded-xl font-bold transition-all shadow-lg"
            >
              Continue Chanting
            </button>
          </div>
        </div>
      )}

      {/* Session Saved Modal */}
      {showSaveModal && sessionSummary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100000] p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 border-4 border-green-300">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="text-green-600 w-16 h-16" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Session Saved!
              </h2>
              
              <div className="bg-white/70 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 font-semibold">Rounds:</span>
                  <span className="text-2xl font-bold text-green-600">{sessionSummary.rounds}</span>
                </div>
                {sessionSummary.count > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600 font-semibold">Extra Beads:</span>
                    <span className="text-xl font-bold text-stone-700">{sessionSummary.count}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 font-semibold">Duration:</span>
                  <span className="text-lg font-bold text-stone-700">
                    {Math.floor(sessionSummary.duration / 60)}m {sessionSummary.duration % 60}s
                  </span>
                </div>
                <div className="flex justify-between items-center border-t-2 border-stone-200 pt-2 mt-2">
                  <span className="text-stone-600 font-semibold">Total Lifetime:</span>
                  <span className="text-2xl font-bold text-orange-600">{sessionSummary.totalRounds} rounds</span>
                </div>
              </div>

              <p className="text-stone-700 text-sm">
                Your spiritual progress has been recorded
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSessionSummary(null);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Beads Confirmation Modal */}
      {showResetBeadsConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100000] p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-stone-50 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 border-4 border-stone-300">
            <div className="bg-gradient-to-r from-stone-100 to-stone-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <RefreshCw className="text-stone-600 w-16 h-16" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-stone-800">
                Reset Beads Counter?
              </h2>
              <p className="text-stone-600 text-base">
                This will reset the current beads count to zero. Your completed rounds will be preserved.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetBeadsConfirm(false)}
                className="flex-1 px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetBeads}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-bold transition-all shadow-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Rounds Confirmation Modal */}
      {showResetRoundsConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100000] p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 border-4 border-orange-300">
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <RotateCcw className="text-orange-600 w-16 h-16" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-stone-800">
                Reset Rounds Counter?
              </h2>
              <p className="text-stone-600 text-base">
                This will reset the session rounds counter to zero. Your lifetime statistics will not be affected.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetRoundsConfirm(false)}
                className="flex-1 px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetRounds}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold transition-all shadow-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Timer Confirmation Modal */}
      {showResetTimerConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100000] p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 border-4 border-purple-300">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Clock className="text-purple-600 w-16 h-16" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-stone-800">
                Reset Session Timer?
              </h2>
              <p className="text-stone-600 text-base">
                This will reset the session timer to zero and start counting from now. Your rounds and beads will not be affected.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetTimerConfirm(false)}
                className="flex-1 px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetTimer}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  );
};

export default ChantingCounter;
