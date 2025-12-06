import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  X
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

  useEffect(() => {
    loadStats();
    loadGoals();
    loadUserPreferences();
  }, [user]);

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
      alert('Preferences saved!');
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

  const celebrateRoundCompletion = () => {
    if (soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const frequencies = [523, 659, 784, 1047];
        
        frequencies.forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
          }, index * 100);
        });
      } catch (error) {
        console.error('Error playing celebration:', error);
      }
    }
    
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
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
      celebrateRoundCompletion();
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
        alert(`🎉 MILESTONE ACHIEVED! 🎉\n\nYou've completed ${milestone} rounds!\n\nHare Krishna! 🙏`);
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
    if (confirm('Reset current beads count? (Rounds will be preserved)')) {
      setCount(0);
      playSound();
    }
  };

  const handleSaveSession = async () => {
    if (!user || user.uid === 'guest') {
      alert('Please sign in to save your chanting sessions');
      return;
    }

    if (rounds === 0 && count === 0) {
      alert('Please complete at least one bead before saving');
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
      setCount(0);
      setRounds(0);
      setIsChanting(false);
      setSessionStartTime(null);
      setPausedDuration(0);

      alert(`🙏 Session Saved!\n\n${rounds} rounds + ${count} beads\nDuration: ${Math.floor(duration / 60)}m ${duration % 60}s\n\nTotal Lifetime: ${updatedStats.totalRounds} rounds`);
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session');
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

  const createGoal = async (type: 'daily' | 'weekly' | 'monthly', target: number) => {
    if (!user || user.uid === 'guest') {
      alert('Please sign in to create goals');
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
    alert(`Goal created: ${target} rounds ${type}!`);
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentTheme.primary} rounded-2xl p-8 shadow-2xl border-2 ${currentTheme.border}`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Japa Mala Counter</h1>
            <p className="text-white text-opacity-90 text-lg">{selectedMantra.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all"
            >
              <SettingsIcon className="text-white" size={24} />
            </button>
            <button
              onClick={() => setShowGoals(!showGoals)}
              className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all"
            >
              <Target className="text-white" size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-stone-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <SettingsIcon size={28} />
              Settings
            </h3>
            <button onClick={() => setShowSettings(false)}>
              <X size={24} className="text-stone-500 hover:text-stone-700" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Mantra Selection */}
            <div>
              <label className="block font-bold mb-2 text-stone-700">Select Mantra Type</label>
              <select
                value={selectedMantra.id}
                onChange={(e) => setSelectedMantra(MANTRA_TYPES.find(m => m.id === e.target.value) || MANTRA_TYPES[0])}
                className="w-full p-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-orange-500"
              >
                {MANTRA_TYPES.map(mantra => (
                  <option key={mantra.id} value={mantra.id}>{mantra.name}</option>
                ))}
              </select>
            </div>

            {selectedMantra.id === 'custom' && (
              <div>
                <label className="block font-bold mb-2 text-stone-700">Custom Mantra Name</label>
                <input
                  type="text"
                  value={customMantra}
                  onChange={(e) => setCustomMantra(e.target.value)}
                  placeholder="Enter mantra name"
                  className="w-full p-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>
            )}

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-700">Sound Effects</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-xl transition-all ${soundEnabled ? 'bg-green-500 text-white' : 'bg-stone-200 text-stone-500'}`}
              >
                {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </button>
            </div>

            {/* Auto Increment Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-stone-700">Auto Increment</span>
                <button
                  onClick={() => setAutoIncrement(!autoIncrement)}
                  className={`px-4 py-2 rounded-xl transition-all ${autoIncrement ? 'bg-green-500 text-white' : 'bg-stone-200 text-stone-700'}`}
                >
                  {autoIncrement ? 'ON' : 'OFF'}
                </button>
              </div>
              {autoIncrement && (
                <div>
                  <label className="block text-sm mb-2 text-stone-600">Speed: {incrementSpeed}ms</label>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="500"
                    value={incrementSpeed}
                    onChange={(e) => setIncrementSpeed(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Bead Size */}
            <div>
              <label className="block font-bold mb-2 text-stone-700">Counter Button Size</label>
              <div className="flex gap-3">
                {['small', 'medium', 'large'].map(size => (
                  <button
                    key={size}
                    onClick={() => setBeadSize(size)}
                    className={`px-4 py-2 rounded-xl transition-all ${beadSize === size ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-700'}`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <label className="block font-bold mb-2 text-stone-700">Color Theme</label>
              <div className="flex gap-3">
                {Object.keys(themeColors).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`w-12 h-12 rounded-xl transition-all border-4 ${theme === t ? 'border-stone-800' : 'border-transparent'} bg-gradient-to-br ${themeColors[t as keyof typeof themeColors].primary}`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={saveUserPreferences}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Goals Panel */}
      {showGoals && (
        <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-stone-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Target size={28} />
              Goals & Milestones
            </h3>
            <button onClick={() => setShowGoals(false)}>
              <X size={24} className="text-stone-500 hover:text-stone-700" />
            </button>
          </div>

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Award className="text-yellow-600" size={20} />
                Milestones Achieved
              </h4>
              <div className="flex flex-wrap gap-3">
                {milestones.sort((a, b) => a - b).map(milestone => (
                  <div key={milestone} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold flex items-center gap-2">
                    <Award size={16} />
                    {milestone} Rounds
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Goals */}
          <div className="mb-6">
            <h4 className="font-bold text-lg mb-3">Active Goals</h4>
            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map(goal => (
                  <div key={goal.id} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-stone-800 capitalize">{goal.type} Goal</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${goal.current >= goal.target ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                        {goal.current}/{goal.target} rounds
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-stone-600 mt-2">
                      Ends: {new Date(goal.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 text-center py-4">No active goals. Create one below!</p>
            )}
          </div>

          {/* Create Goal */}
          <div>
            <h4 className="font-bold text-lg mb-3">Create New Goal</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  const target = prompt('Enter daily rounds target:');
                  if (target) createGoal('daily', parseInt(target));
                }}
                className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                Daily Goal
              </button>
              <button
                onClick={() => {
                  const target = prompt('Enter weekly rounds target:');
                  if (target) createGoal('weekly', parseInt(target));
                }}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all"
              >
                Weekly Goal
              </button>
              <button
                onClick={() => {
                  const target = prompt('Enter monthly rounds target:');
                  if (target) createGoal('monthly', parseInt(target));
                }}
                className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Monthly Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`bg-gradient-to-br ${currentTheme.bg} rounded-xl p-6 border-2 ${currentTheme.border} shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className={currentTheme.text} size={24} />
            <h3 className="font-bold text-lg text-stone-800">Total Rounds</h3>
          </div>
          <p className={`text-4xl font-bold ${currentTheme.text}`}>{stats?.totalRounds || 0}</p>
          <p className="text-sm text-stone-600 mt-1">Completed</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-300 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-600" size={24} />
            <h3 className="font-bold text-lg text-stone-800">Total Beads</h3>
          </div>
          <p className="text-4xl font-bold text-blue-600">{stats?.totalBeads || 0}</p>
          <p className="text-sm text-stone-600 mt-1">Mantras chanted</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="text-green-600" size={24} />
            <h3 className="font-bold text-lg text-stone-800">Current Streak</h3>
          </div>
          <p className="text-4xl font-bold text-green-600">{stats?.currentStreak || 0}</p>
          <p className="text-sm text-stone-600 mt-1">Days in a row</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-purple-600" size={24} />
            <h3 className="font-bold text-lg text-stone-800">Total Time</h3>
          </div>
          <p className="text-4xl font-bold text-purple-600">{Math.floor((stats?.totalTimeSpent || 0) / 60)}m</p>
          <p className="text-sm text-stone-600 mt-1">Chanting time</p>
        </div>
      </div>

      {/* Main Counter */}
      <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-stone-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center justify-center gap-2">
            Current Session
            {isChanting && (
              <span className="text-sm text-stone-500">
                ({formatTime(getCurrentSessionTime())})
              </span>
            )}
          </h2>
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-sm text-stone-600 mb-1">Rounds</p>
              <p className={`text-5xl font-bold ${currentTheme.text}`}>{rounds}</p>
            </div>
            <div className="text-6xl text-stone-300">|</div>
            <div className="text-center">
              <p className="text-sm text-stone-600 mb-1">Beads</p>
              <p className="text-5xl font-bold text-blue-600">{count}/{selectedMantra.beads}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-stone-200 rounded-full h-6 overflow-hidden">
              <div 
                className={`bg-gradient-to-r ${currentTheme.primary} h-full transition-all duration-300 rounded-full flex items-center justify-center text-white text-sm font-bold`}
                style={{ width: `${(count / selectedMantra.beads) * 100}%` }}
              >
                {count > 0 && `${Math.round((count / selectedMantra.beads) * 100)}%`}
              </div>
            </div>
          </div>

          {/* Counter Button */}
          <button
            onClick={handleBeadClick}
            disabled={isPaused}
            className={`${beadSizeClass} mx-auto mb-6 bg-gradient-to-br ${currentTheme.primary} hover:${currentTheme.secondary} text-white rounded-full shadow-2xl transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center text-6xl font-bold border-8 ${currentTheme.border} ${isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {count}
          </button>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            {isChanting && (
              <button
                onClick={handlePauseResume}
                className={`px-6 py-4 ${isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white rounded-xl font-bold transition-all flex items-center gap-2`}
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-6 py-4 bg-stone-500 hover:bg-stone-600 text-white rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <RefreshCw size={20} />
              Reset Beads
            </button>
            <button
              onClick={handleSaveSession}
              className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg"
            >
              💾 Save Session
            </button>
          </div>
        </div>
      </div>

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
        <h3 className="font-bold text-lg mb-3 text-stone-800">How to Use Advanced Features</h3>
        <ul className="space-y-2 text-stone-700">
          <li>• <strong>Mantra Types:</strong> Choose from 5 mantra types or create custom</li>
          <li>• <strong>Auto-Increment:</strong> Let the counter auto-advance at your preferred speed</li>
          <li>• <strong>Sound Effects:</strong> Beep on each bead, celebration melody on round completion</li>
          <li>• <strong>Pause/Resume:</strong> Take breaks without losing your session time tracking</li>
          <li>• <strong>Goals:</strong> Set daily, weekly, or monthly targets and track progress</li>
          <li>• <strong>Milestones:</strong> Unlock achievements at 10, 50, 100, 500+ rounds</li>
          <li>• <strong>Themes:</strong> Customize colors to match your mood</li>
          <li>• <strong>Button Size:</strong> Adjust counter button size for comfort</li>
        </ul>
      </div>
    </div>
  );
};

export default ChantingCounter;
