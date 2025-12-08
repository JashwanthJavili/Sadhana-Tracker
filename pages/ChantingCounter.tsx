import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, get, set } from 'firebase/database';
import { db } from '../services/firebase';
import { useToast } from '../contexts/ToastContext';
import { Clock, RotateCcw, Calendar, X, Plus, Minus, Play, Pause, History as HistoryIcon, Award, CheckCircle, Flame, Sparkles, HelpCircle, Info, Settings } from 'lucide-react';
import { requestVibrationPermission, vibrate } from '../utils/permissions';

interface ChantingSession {
  id: string;
  beads: number;
  rounds: number;
  date: string;
  startTime: string;
  completeTime: string;
  timestamp: number;
  duration: number;
  completed: boolean;
}

interface ChantingStats {
  totalRounds: number;
  totalBeads: number;
  totalTime: number;
  sessions: ChantingSession[];
}

const BEADS_PER_ROUND = 108;

export default function ChantingCounter() {
  const { user } = useAuth();
  const { showSuccess, showWarning } = useToast();
  
  // Core state - Start rounds at 0, beads at 0 (000:000 format)
  const [currentBead, setCurrentBead] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  
  // Settings
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  // Inline guide panel (shows explanation beside the counter)
  const [showInlineGuide, setShowInlineGuide] = useState(false);
  const [guideLanguage, setGuideLanguage] = useState<'en' | 'hi' | 'te'>('en');
  const [targetRounds, setTargetRounds] = useState(16);
  const [targetBeads, setTargetBeads] = useState(BEADS_PER_ROUND);
  const [autoLapEnabled, setAutoLapEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clickAreaShape, setClickAreaShape] = useState<'circle' | 'square'>('circle');
  const [hideBeadNumbers, setHideBeadNumbers] = useState(false);
  
  // History
  const [sessions, setSessions] = useState<ChantingSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState<ChantingStats | null>(null);
  
  // Long press and double click detection
  const timerPressRef = useRef<NodeJS.Timeout | null>(null);
  const beadsPressRef = useRef<NodeJS.Timeout | null>(null);
  const timerClickRef = useRef<number>(0);
  const beadsClickRef = useRef<number>(0);
  const [isLongPress, setIsLongPress] = useState(false);

  // Load sessions and stats
  useEffect(() => {
    if (user && user.uid !== 'guest') {
      loadSessions();
      loadStats();
    }
  }, [user]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const loadSessions = async () => {
    if (!user || user.uid === 'guest') return;

    try {
      const sessionsRef = ref(db, `users/${user.uid}/chantingSessions`);
      const snapshot = await get(sessionsRef);
      
      if (snapshot.exists()) {
        const sessionsData = snapshot.val();
        const sessionsArray = Object.values(sessionsData) as ChantingSession[];
        setSessions(sessionsArray.sort((a, b) => b.timestamp - a.timestamp).slice(0, 30));
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadStats = async () => {
    if (!user || user.uid === 'guest') return;

    try {
      const statsRef = ref(db, `users/${user.uid}/chantingStats`);
      const snapshot = await get(statsRef);
      
      if (snapshot.exists()) {
        setStats(snapshot.val());
      } else {
        const initialStats: ChantingStats = {
          totalRounds: 0,
          totalBeads: 0,
          totalTime: 0,
          sessions: []
        };
        setStats(initialStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleBeadIncrement = () => {
    const newBead = currentBead + 1;
    
    // Vibrate on each bead count
    if (vibrationEnabled) {
      // Strong vibration for clear feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100); // Strong 100ms vibration
      }
    }
    
    if (newBead >= targetBeads) {
      // Round completed (108 beads done)
      const newRound = currentRound + 1;
      setCurrentRound(newRound);
      setCurrentBead(0); // Reset to bead 0 for next round
      
      // Play bell sound for round completion
      if (soundEnabled) {
        playRoundCompleteSound();
      }
      
      // Triple vibration for round completion - very strong
      if (vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([300, 100, 300, 100, 300]); // Triple strong vibration
      }
      
      if (newRound >= targetRounds && autoLapEnabled) {
        showSuccess('Target rounds completed! 🎉');
      }
    } else {
      setCurrentBead(newBead);
    }
  };

  const playRoundCompleteSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a realistic temple bell sound with multiple harmonics
      const playTone = (frequency: number, startTime: number, duration: number, volume: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const now = audioContext.currentTime;
      
      // Temple bell sound - multiple harmonics for rich tone
      playTone(523, now, 1.5, 0.6);      // C5 - fundamental
      playTone(659, now, 1.5, 0.4);      // E5 - third harmonic
      playTone(784, now, 1.5, 0.3);      // G5 - fifth harmonic
      playTone(1047, now + 0.05, 1.2, 0.2); // C6 - octave
      
      // Add a gentle strike sound at the beginning
      playTone(200, now, 0.1, 0.5);
      
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Timer click: Start/Pause, Double-click: Reset
  const handleTimerClick = () => {
    const now = Date.now();
    
    if (now - timerClickRef.current < 300) {
      // Double click detected
      handleTimerReset();
      timerClickRef.current = 0;
    } else {
      // Single click: Start/Pause
      timerClickRef.current = now;
      setTimeout(() => {
        if (timerClickRef.current === now) {
          // It was a single click
          if (!isRunning && !sessionStartTime) {
            setSessionStartTime(Date.now());
            setIsRunning(true);
          } else {
            setIsRunning(!isRunning);
          }
        }
      }, 300);
    }
  };

  // Timer long press (mobile): Reset
  const handleTimerLongPressStart = () => {
    timerPressRef.current = setTimeout(() => {
      setIsLongPress(true);
      handleTimerReset();
    }, 600);
  };

  const handleTimerLongPressEnd = () => {
    if (timerPressRef.current) {
      clearTimeout(timerPressRef.current);
    }
    setTimeout(() => setIsLongPress(false), 100);
  };

  const handleTimerReset = () => {
    setIsRunning(false);
    setTimerSeconds(0);
    setSessionStartTime(null);
    showSuccess('⏱️ Timer reset');
  };

  // Beads click: Configure, Double-click: Reset
  const handleBeadsClick = () => {
    const now = Date.now();
    
    if (now - beadsClickRef.current < 300) {
      // Double click detected
      handleBeadsReset();
      beadsClickRef.current = 0;
    } else {
      // Single click: Open settings
      beadsClickRef.current = now;
      setTimeout(() => {
        if (beadsClickRef.current === now) {
          setShowSettingsModal(true);
        }
      }, 300);
    }
  };

  // Beads long press (mobile): Reset
  const handleBeadsLongPressStart = () => {
    beadsPressRef.current = setTimeout(() => {
      setIsLongPress(true);
      handleBeadsReset();
    }, 600);
  };

  const handleBeadsLongPressEnd = () => {
    if (beadsPressRef.current) {
      clearTimeout(beadsPressRef.current);
    }
    setTimeout(() => setIsLongPress(false), 100);
  };

  const handleBeadsReset = () => {
    setCurrentBead(0);
    setCurrentRound(0);
    showSuccess('📿 Counter reset to 000:000');
  };

  const handleSaveSettings = () => {
    setShowSettingsModal(false);
    showSuccess('Settings saved');
  };

  const handleResetSettings = () => {
    setCurrentBead(0);
    setCurrentRound(0);
    setShowSettingsModal(false);
    showSuccess('Counter reset to 000:000');
  };

  const handleSaveSession = async () => {
    if (!user || user.uid === 'guest') {
      showWarning('Sign In Required', 'Please sign in to save your chanting sessions');
      return;
    }

    if (currentRound === 0 && currentBead === 0) {
      showWarning('No Activity', 'Please complete at least one bead before saving');
      return;
    }

    try {
      const now = new Date();
      const session: ChantingSession = {
        id: Date.now().toString(),
        beads: currentBead,
        rounds: currentRound,
        date: now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
        startTime: sessionStartTime ? new Date(sessionStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--',
        completeTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        timestamp: Date.now(),
        duration: timerSeconds,
        completed: currentBead === 0 && currentRound > 0
      };

      const sessionsRef = ref(db, `users/${user.uid}/chantingSessions/${session.id}`);
      await set(sessionsRef, session);

      // Update stats
      const newStats: ChantingStats = {
        totalRounds: (stats?.totalRounds || 0) + currentRound,
        totalBeads: (stats?.totalBeads || 0) + (currentRound * targetBeads) + currentBead,
        totalTime: (stats?.totalTime || 0) + timerSeconds,
        sessions: [...(stats?.sessions || []), session].slice(-30)
      };

      const statsRef = ref(db, `users/${user.uid}/chantingStats`);
      await set(statsRef, newStats);

      showSuccess('Session saved successfully! 🙏');
      loadSessions();
      loadStats();
      
      // Reset for new session
      setCurrentBead(0);
      setCurrentRound(0);
      setTimerSeconds(0);
      setIsRunning(false);
      setSessionStartTime(null);
    } catch (error) {
      console.error('Error saving session:', error);
      showWarning('Error', 'Failed to save session');
    }
  };

  const formatTimer = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBeadCount = (): string => {
    return `${currentRound.toString().padStart(3, '0')}:${currentBead.toString().padStart(3, '0')}`;
  };

  const getCompletionPercentage = (session: ChantingSession): number => {
    const total = targetRounds * targetBeads;
    const completed = session.rounds * targetBeads + session.beads;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-2 border-orange-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="text-white animate-pulse" size={32} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
                  📿 Japa Counter
                </h1>
                <button
                  onClick={() => setShowGuideModal(true)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-all shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95"
                  title="How to Use"
                >
                  <HelpCircle className="text-white" size={20} />
                </button>
              </div>
              <p className="text-white/90 text-sm sm:text-base mt-1">Hare Krishna Maha Mantra</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all shadow-lg"
              title="Settings"
            >
              <Settings className="text-white" size={20} />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all shadow-lg"
              title="View History"
            >
              <HistoryIcon className="text-white" size={20} />
            </button>
            <button
              onClick={handleSaveSession}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-white text-orange-600 hover:bg-orange-50 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Save Session
            </button>
          </div>
        </div>
      </div>

      {/* Usage Instructions - Collapsible (Moved to Top) */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 overflow-hidden">
        <button
          onClick={() => setShowInlineGuide(!showInlineGuide)}
          className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-orange-100/50 transition-all"
        >
          <h3 className="text-sm sm:text-base font-bold text-orange-600">How to Use</h3>
          <div className={`transform transition-transform ${showInlineGuide ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {showInlineGuide && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <p className="text-xs sm:text-sm font-semibold text-stone-700 mb-2">📿 BEADS Counter:</p>
                <ul className="text-xs text-stone-600 space-y-1">
                  <li>• <strong>Web:</strong> Click = Configure • 2× Click = Reset</li>
                  <li>• <strong>Mobile:</strong> Tap = Configure • Long press = Reset</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <p className="text-xs sm:text-sm font-semibold text-stone-700 mb-2">⏱️ TIMER:</p>
                <ul className="text-xs text-stone-600 space-y-1">
                  <li>• <strong>Web:</strong> Click = Start/Pause • 2× Click = Reset</li>
                  <li>• <strong>Mobile:</strong> Tap = Start/Pause • Long press = Reset</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Counter Section */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Beads Display */}
        <div 
          onClick={handleBeadsClick}
          onTouchStart={handleBeadsLongPressStart}
          onTouchEnd={handleBeadsLongPressEnd}
          className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-6 lg:p-8 shadow-xl border-2 border-orange-200 cursor-pointer hover:border-orange-400 hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="text-center">
            <div className="text-xs sm:text-sm lg:text-base font-semibold text-orange-600 mb-2 sm:mb-3 flex items-center justify-center gap-1 sm:gap-2">
              📿 <span className="hidden sm:inline">BEADS</span>
            </div>
            <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-stone-800 tracking-wider font-mono">
              {formatBeadCount()}
            </div>
            <p className="text-[0.65rem] sm:text-xs text-stone-500 mt-2 sm:mt-3">Rounds : Current Bead</p>
          </div>
        </div>

        {/* Timer Display */}
        <div 
          onClick={handleTimerClick}
          onTouchStart={handleTimerLongPressStart}
          onTouchEnd={handleTimerLongPressEnd}
          className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-6 lg:p-8 shadow-xl border-2 border-orange-200 cursor-pointer hover:border-orange-400 hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="text-center">
            <div className="text-xs sm:text-sm lg:text-base font-semibold text-orange-600 mb-2 sm:mb-3 flex items-center justify-center gap-1 sm:gap-2">
              <Clock size={14} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">TIMER</span>
            </div>
            <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-stone-800 tracking-wider font-mono">
              {formatTimer(timerSeconds)}
            </div>
            <p className="text-[0.65rem] sm:text-xs text-stone-500 mt-2 sm:mt-3">{isRunning ? 'Running...' : 'Ready'}</p>
          </div>
        </div>
      </div>

      {/* Tap Button to Increment Beads (Removed duplicate instructions) */}
      {/* Tap Button to Increment Beads */}
      {clickAreaShape === 'circle' ? (
        // Circle Mode - Traditional round button
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-orange-200">
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={handleBeadIncrement}
              className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-full shadow-2xl transform transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center border-4 sm:border-6 border-orange-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {!hideBeadNumbers && (
                <span className="text-7xl sm:text-8xl md:text-9xl font-bold relative z-10">{currentBead}</span>
              )}
              <span className={`text-sm sm:text-base font-medium ${hideBeadNumbers ? '' : 'mt-2'} relative z-10 opacity-90`}>
                {hideBeadNumbers ? <span className="text-6xl sm:text-7xl md:text-8xl font-bold">Tap</span> : 'Tap to Count'}
              </span>
            </button>
            {!hideBeadNumbers && (
              <div className="text-center">
                <p className="text-stone-700 text-base sm:text-lg font-semibold mb-1">
                  {targetBeads - currentBead} beads remaining
                </p>
                <p className="text-stone-500 text-sm">in this round</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Square Mode - Entire box becomes orange and clickable
        <button
          onClick={handleBeadIncrement}
          className="w-full bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border-4 border-orange-300 transform transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex flex-col items-center gap-6 relative z-10">
            <div className="text-center">
              {!hideBeadNumbers && (
                <span className="text-7xl sm:text-8xl md:text-9xl font-bold text-white block">{currentBead}</span>
              )}
              <span className={`text-base sm:text-lg font-bold text-white block ${hideBeadNumbers ? '' : 'mt-4'} opacity-90`}>
                {hideBeadNumbers ? <span className="text-6xl sm:text-7xl md:text-8xl">Tap to Count</span> : 'Tap to Count'}
              </span>
            </div>
            {!hideBeadNumbers && (
              <div className="text-center">
                <p className="text-white text-base sm:text-lg font-semibold mb-1">
                  {targetBeads - currentBead} beads remaining
                </p>
                <p className="text-orange-100 text-sm">in this round</p>
              </div>
            )}
          </div>
        </button>
      )}

      {/* Rounds Progress */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-6 shadow-xl border-2 border-orange-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <div className="text-sm font-semibold text-orange-600 mb-2 flex items-center gap-2 justify-center sm:justify-start">
              <RotateCcw size={18} /> Rounds Progress
            </div>
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-800">
              {currentRound} <span className="text-stone-400">/</span> {targetRounds}
            </div>
          </div>
          <div className="w-32 h-32 sm:w-36 sm:h-36 relative">
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#fed7aa"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f97316"
                strokeWidth="10"
                strokeDasharray={`${(currentRound / targetRounds) * 283} 283`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-600">
                {Math.round((currentRound / targetRounds) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 sm:p-6 border-2 border-orange-200 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <Award className="mx-auto text-orange-600 mb-3" size={28} />
            <div className="text-3xl sm:text-4xl font-bold text-orange-600">{stats.totalRounds}</div>
            <div className="text-xs sm:text-sm text-stone-600 mt-2 font-medium">Total Rounds</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 sm:p-6 border-2 border-orange-200 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <CheckCircle className="mx-auto text-orange-600 mb-3" size={28} />
            <div className="text-3xl sm:text-4xl font-bold text-orange-600">{stats.totalBeads.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-stone-600 mt-2 font-medium">Total Beads</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 sm:p-6 border-2 border-orange-200 text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <Flame className="mx-auto text-orange-600 mb-3" size={28} />
            <div className="text-3xl sm:text-4xl font-bold text-orange-600">{Math.floor(stats.totalTime / 60)}m</div>
            <div className="text-xs sm:text-sm text-stone-600 mt-2 font-medium">Total Time</div>
          </div>
        </div>
      )}

      {/* Chanting Inspiration */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl text-white border-2 border-orange-300">
        <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
          ✨ Chanting Inspiration
        </h3>
        <p className="text-sm sm:text-base italic mb-3 font-medium opacity-95">
          "Associating With The Supreme Lord Directly"
        </p>
        <p className="text-xs sm:text-sm leading-relaxed opacity-90">
          By chanting the holy names, you are directly associating with the Supreme Lord Krishna. 
          Each round brings you closer to spiritual perfection and purifies your consciousness. 
          The Hare Krishna mantra is the greatest benediction for humanity. Stay consistent and experience divine transformation!
        </p>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-8 sm:pt-16 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-orange-200 animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b-2 border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 flex items-center gap-2">
                ⚙️ Settings
              </h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-stone-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Completed Rounds Setting */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">COMPLETED ROUNDS</label>
                <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
                  <button
                    onClick={() => setCurrentRound(Math.max(0, currentRound - 1))}
                    className="p-3 bg-white hover:bg-orange-50 rounded-lg transition-colors shadow-md border-2 border-orange-300"
                  >
                    <Minus size={20} className="text-orange-600" />
                  </button>
                  <span className="text-4xl font-bold text-orange-600">{currentRound}</span>
                  <button
                    onClick={() => setCurrentRound(currentRound + 1)}
                    className="p-3 bg-white hover:bg-orange-50 rounded-lg transition-colors shadow-md border-2 border-orange-300"
                  >
                    <Plus size={20} className="text-orange-600" />
                  </button>
                </div>
              </div>

              {/* Current Bead Position Setting with Scrollable Picker */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">CURRENT BEAD POSITION (0-107)</label>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => setCurrentBead(Math.max(0, currentBead - 1))}
                      className="p-3 bg-white hover:bg-orange-50 rounded-lg transition-colors shadow-md border-2 border-orange-300"
                    >
                      <Minus size={20} className="text-orange-600" />
                    </button>
                    <span className="text-4xl font-bold text-orange-600 min-w-[100px] text-center">{currentBead}</span>
                    <button
                      onClick={() => setCurrentBead(Math.min(107, currentBead + 1))}
                      className="p-3 bg-white hover:bg-orange-50 rounded-lg transition-colors shadow-md border-2 border-orange-300"
                    >
                      <Plus size={20} className="text-orange-600" />
                    </button>
                  </div>
                  
                  {/* Scrollable Number Picker */}
                  <div className="relative">
                    <div className="flex overflow-x-auto gap-2 py-4 px-2 bg-white rounded-lg border-2 border-orange-300 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100" style={{ scrollbarWidth: 'thin' }}>
                      {Array.from({ length: 108 }, (_, i) => i).map((num) => (
                        <button
                          key={num}
                          onClick={() => setCurrentBead(num)}
                          className={`flex-shrink-0 w-12 h-12 rounded-lg font-bold transition-all ${
                            currentBead === num
                              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg scale-110'
                              : 'bg-orange-100 text-stone-700 hover:bg-orange-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-stone-500 mt-2 text-center">Scroll horizontally to select bead position (0-107)</p>
                  </div>
                </div>
              </div>

              {/* Auto Lap Toggle */}
              <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
                <span className="text-sm font-bold text-stone-700">Auto lap on round finish</span>
                <button
                  onClick={() => setAutoLapEnabled(!autoLapEnabled)}
                  className={`relative w-16 h-8 rounded-full transition-colors shadow-inner ${autoLapEnabled ? 'bg-orange-600' : 'bg-stone-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${autoLapEnabled ? 'translate-x-8' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Vibration Toggle */}
              <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
                <div className="flex-1">
                  <span className="text-sm font-bold text-stone-700 block">📳 Vibration feedback</span>
                  <span className="text-xs text-stone-500">
                    {vibrationEnabled ? 'Tap each bead to feel vibration' : 'Enable to get haptic feedback'}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    if (!vibrationEnabled) {
                      // Request permission when enabling
                      const permission = await requestVibrationPermission();
                      if (permission.granted) {
                        setVibrationEnabled(true);
                        // Test with strong vibration pattern
                        if ('vibrate' in navigator) {
                          navigator.vibrate([200, 100, 200, 100, 200]);
                        }
                        showSuccess('Vibration enabled - You should feel 3 strong pulses');
                      } else {
                        showWarning('Vibration Not Available', permission.error || 'Your device does not support vibration');
                      }
                    } else {
                      setVibrationEnabled(false);
                      showSuccess('Vibration disabled');
                    }
                  }}
                  className={`relative w-16 h-8 rounded-full transition-colors shadow-inner ${vibrationEnabled ? 'bg-orange-600' : 'bg-stone-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${vibrationEnabled ? 'translate-x-8' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
                <div className="flex-1">
                  <span className="text-sm font-bold text-stone-700 block">🔔 Sound on round complete</span>
                  <span className="text-xs text-stone-500">
                    {soundEnabled ? 'Bell sound plays after 108 beads' : 'Enable to hear completion sound'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const newState = !soundEnabled;
                    setSoundEnabled(newState);
                    if (newState) {
                      // Test sound when enabling
                      playRoundCompleteSound();
                      showSuccess('Sound enabled - You should hear a bell');
                    } else {
                      showSuccess('Sound disabled');
                    }
                  }}
                  className={`relative w-16 h-8 rounded-full transition-colors shadow-inner ${soundEnabled ? 'bg-orange-600' : 'bg-stone-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${soundEnabled ? 'translate-x-8' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Hide Bead Numbers Toggle */}
              <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
                <div>
                  <span className="text-sm font-bold text-stone-700 block">🎯 Hide bead numbers</span>
                  <span className="text-xs text-stone-500">Increase focus during chanting</span>
                </div>
                <button
                  onClick={() => setHideBeadNumbers(!hideBeadNumbers)}
                  className={`relative w-16 h-8 rounded-full transition-colors shadow-inner ${hideBeadNumbers ? 'bg-orange-600' : 'bg-stone-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${hideBeadNumbers ? 'translate-x-8' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Click Area Shape Toggle */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">TAP BUTTON SHAPE</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setClickAreaShape('circle')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      clickAreaShape === 'circle'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-600 shadow-lg'
                        : 'bg-white text-stone-700 border-orange-200 hover:border-orange-400'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-orange-400"></div>
                      </div>
                      <span className="font-bold text-sm">Circle</span>
                      <span className="text-xs opacity-80">(Default)</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setClickAreaShape('square')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      clickAreaShape === 'square'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-600 shadow-lg'
                        : 'bg-white text-stone-700 border-orange-200 hover:border-orange-400'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-2xl bg-orange-400"></div>
                      </div>
                      <span className="font-bold text-sm">Square</span>
                      <span className="text-xs opacity-80">(Box shape)</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid responsive-grid-2 gap-3 pt-4">
                <button
                  onClick={handleResetSettings}
                  className="py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold transition-all shadow-md border-2 border-stone-300 transform hover:scale-105 active:scale-95"
                >
                  RESET TO 0
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold transition-all shadow-md transform hover:scale-105 active:scale-95"
                >
                  DONE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl border-2 border-orange-200 animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b-2 border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center gap-3">
                <Info className="text-orange-600" size={28} />
                <h2 className="text-xl sm:text-2xl font-bold text-stone-800">How to Use Japa Counter</h2>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-stone-600" />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex border-b-2 border-orange-100 bg-orange-50">
              <button
                onClick={() => setGuideLanguage('en')}
                className={`flex-1 py-3 px-4 font-bold transition-colors ${
                  guideLanguage === 'en'
                    ? 'bg-white text-orange-600 border-b-4 border-orange-600'
                    : 'text-stone-600 hover:bg-orange-100'
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setGuideLanguage('hi')}
                className={`flex-1 py-3 px-4 font-bold transition-colors ${
                  guideLanguage === 'hi'
                    ? 'bg-white text-orange-600 border-b-4 border-orange-600'
                    : 'text-stone-600 hover:bg-orange-100'
                }`}
              >
                🇮🇳 हिंदी
              </button>
              <button
                onClick={() => setGuideLanguage('te')}
                className={`flex-1 py-3 px-4 font-bold transition-colors ${
                  guideLanguage === 'te'
                    ? 'bg-white text-orange-600 border-b-4 border-orange-600'
                    : 'text-stone-600 hover:bg-orange-100'
                }`}
              >
                🇮🇳 తెలుగు
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)] space-y-6">
              {guideLanguage === 'en' && (
                <>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                      📿 BEADS Counter
                    </h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>Web (Desktop):</strong> Click once to open settings and configure your position. Double-click to reset beads to 0 and rounds to 0.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>Mobile (Touch):</strong> Tap once to open settings. Long press to reset beads to 0 and rounds to 0.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>Settings:</strong> Set completed rounds (0+) and current bead position (0-107). Scroll through bead numbers for quick selection.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>Display Format:</strong> Shows as 000:000 (Rounds:Beads). Example: 002:025 means 2 complete rounds, currently at bead 25.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                      ⏱️ TIMER
                    </h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>Web (Desktop):</strong> Click once to start/pause timer. Double-click to reset timer to 00:00:00.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>Mobile (Touch):</strong> Tap once to start/pause timer. Long press to reset timer to 00:00:00.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                      🎯 TAP BUTTON
                    </h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>Tap the large circular button in the center to increment bead count.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>When you complete 108 beads, it automatically increases round count and resets beads to 0.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>The display shows remaining beads in the current round.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                    <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                      💾 Saving Sessions
                    </h3>
                    <p className="text-stone-700">
                      Click "Save Session" button to save your chanting progress to history. View your past sessions and track your spiritual journey over time!
                    </p>
                  </div>
                </>
              )}

              {guideLanguage === 'hi' && (
                <>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                      📿 मनके काउंटर
                    </h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>वेब (डेस्कटॉप):</strong> सेटिंग खोलने और अपनी स्थिति कॉन्फ़िगर करने के लिए एक बार क्लिक करें। मनकों को 0 और राउंड को 0 पर रीसेट करने के लिए डबल-क्लिक करें।</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>मोबाइल (टच):</strong> सेटिंग खोलने के लिए एक बार टैप करें। मनकों को 0 और राउंड को 0 पर रीसेट करने के लिए लंबा दबाएं।</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>सेटिंग्स:</strong> पूर्ण राउंड (0+) और वर्तमान मनका स्थिति (0-107) सेट करें। त्वरित चयन के लिए मनका संख्याओं को स्क्रॉल करें।</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>प्रदर्शन प्रारूप:</strong> 000:000 (राउंड:मनके) के रूप में दिखाता है। उदाहरण: 002:025 का मतलब 2 पूर्ण राउंड, वर्तमान में मनका 25 पर।</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                      ⏱️ टाइमर
                    </h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>वेब (डेस्कटॉप):</strong> टाइमर शुरू/रोकने के लिए एक बार क्लिक करें। टाइमर को 00:00:00 पर रीसेट करने के लिए डबल-क्लिक करें।</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>मोबाइल (टच):</strong> टाइमर शुरू/रोकने के लिए एक बार टैप करें। टाइमर को 00:00:00 पर रीसेट करने के लिए लंबा दबाएं।</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                      🎯 टैप बटन
                    </h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>मनका गिनती बढ़ाने के लिए केंद्र में बड़े गोलाकार बटन को टैप करें।</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>जब आप 108 मनके पूरे करते हैं, तो यह स्वचालित रूप से राउंड गिनती बढ़ाता है और मनकों को 0 पर रीसेट करता है।</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                    <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                      💾 सत्र सहेजना
                    </h3>
                    <p className="text-stone-700">
                      अपनी जप प्रगति को इतिहास में सहेजने के लिए "Save Session" बटन पर क्लिक करें। अपने पिछले सत्र देखें और समय के साथ अपनी आध्यात्मिक यात्रा को ट्रैक करें!
                    </p>
                  </div>
                </>
              )}

              {guideLanguage === 'te' && (
                <>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                      📿 పూసల కౌంటర్
                    </h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>వెబ్ (డెస్క్‌టాప్):</strong> సెట్టింగ్‌లను తెరవడానికి మరియు మీ స్థానాన్ని కాన్ఫిగర్ చేయడానికి ఒకసారి క్లిక్ చేయండి। పూసలను 0కి మరియు రౌండ్‌లను 0కి రీసెట్ చేయడానికి డబుల్-క్లిక్ చేయండి।</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>మొబైల్ (టచ్):</strong> సెట్టింగ్‌లను తెరవడానికి ఒకసారి టాప్ చేయండి। పూసలను 0కి మరియు రౌండ్‌లను 0కి రీసెట్ చేయడానికి ఎక్కువసేపు నొక్కి ఉంచండి।</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>సెట్టింగ్‌లు:</strong> పూర్తయిన రౌండ్‌లు (0+) మరియు ప్రస్తుత పూస స్థానం (0-107) సెట్ చేయండి। త్వరిత ఎంపిక కోసం పూస సంఖ్యలను స్క్రోల్ చేయండి।</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>ప్రదర్శన ఫార్మాట్:</strong> 000:000 (రౌండ్‌లు:పూసలు) గా చూపిస్తుంది। ఉదాహరణ: 002:025 అంటే 2 పూర్తి రౌండ్‌లు, ప్రస్తుతం 25వ పూసలో ఉన్నారు.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                      ⏱️ టైమర్
                    </h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>వెబ్ (డెస్క్‌టాప్):</strong> టైమర్‌ను ప్రారంభించడానికి/పాజ్ చేయడానికి ఒకసారి క్లిక్ చేయండి। టైమర్‌ను 00:00:00కి రీసెట్ చేయడానికి డబుల్-క్లిక్ చేయండి।</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span><strong>మొబైల్ (టచ్):</strong> టైమర్‌ను ప్రారంభించడానికి/పాజ్ చేయడానికి ఒకసారి టాప్ చేయండి। టైమర్‌ను 00:00:00కి రీసెట్ చేయడానికి ఎక్కువసేపు నొక్కి ఉంచండి।</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                      🎯 టాప్ బటన్
                    </h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>పూస లెక్కను పెంచడానికి మధ్యలో ఉన్న పెద్ద వృత్తాకార బటన్‌ను టాప్ చేయండి।</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>మీరు 108 పూసలను పూర్తి చేసినప్పుడు, ఇది స్వయంచాలకంగా రౌండ్ లెక్కను పెంచుతుంది మరియు పూసలను 0కి రీసెట్ చేస్తుంది।</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                    <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                      💾 సెషన్‌లను సేవ్ చేయడం
                    </h3>
                    <p className="text-stone-700">
                      మీ జపం పురోగతిని చరిత్రలో సేవ్ చేయడానికి "Save Session" బటన్‌పై క్లిక్ చేయండి। మీ గత సెషన్‌లను చూడండి మరియు కాలక్రమేణా మీ ఆధ్యాత్మిక ప్రయాణాన్ని ట్రాక్ చేయండి!
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t-2 border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 text-center">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                {guideLanguage === 'en' ? 'Got It! 🙏' : guideLanguage === 'hi' ? 'समझ गया! 🙏' : 'అర్థమైంది! 🙏'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl border-2 border-orange-200 animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b-2 border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 flex items-center gap-2">
                📅 Session History
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-stone-600" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              {sessions.length === 0 ? (
                <div className="text-center py-16 text-stone-500">
                  <Calendar size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-semibold mb-2">No sessions yet</p>
                  <p className="text-sm">Complete a round and save your session!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 sm:p-5 border-2 border-orange-200 hover:border-orange-300 hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">{session.date}</div>
                            <div className="text-xs text-stone-500">{session.startTime}</div>
                          </div>
                          <div className="h-12 w-px bg-orange-300" />
                          <div>
                            <div className="text-sm text-stone-500">Completed</div>
                            <div className="text-xl font-bold text-stone-800">{session.rounds} rounds</div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-sm text-stone-500">Duration</div>
                          <div className="text-xl font-bold text-stone-800">{Math.floor(session.duration / 60)}m</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-orange-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-amber-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(getCompletionPercentage(session), 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-stone-600 font-bold min-w-[3.5rem] text-right">
                          {getCompletionPercentage(session)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
