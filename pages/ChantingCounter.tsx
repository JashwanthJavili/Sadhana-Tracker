import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, get, set, update, push } from 'firebase/database';
import { db } from '../services/firebase';
import { useToast } from '../contexts/ToastContext';
import { Clock, RotateCcw, TrendingUp, Calendar, ChevronDown, X, Plus, Minus, Play, Pause, History as HistoryIcon } from 'lucide-react';

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
  
  // Core state
  const [currentBead, setCurrentBead] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  
  // Settings
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [targetRounds, setTargetRounds] = useState(16);
  const [targetBeads, setTargetBeads] = useState(BEADS_PER_ROUND);
  const [autoLapEnabled, setAutoLapEnabled] = useState(true);
  
  // History
  const [sessions, setSessions] = useState<ChantingSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState<ChantingStats | null>(null);
  
  // Long press detection
  const timerPressRef = useRef<NodeJS.Timeout | null>(null);
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

  // Auto-increment bead when timer starts (optional auto-counting)
  useEffect(() => {
    let autoInterval: NodeJS.Timeout | null = null;
    
    if (isRunning && autoLapEnabled) {
      // Auto increment every 5 seconds (adjustable)
      autoInterval = setInterval(() => {
        handleBeadIncrement();
      }, 5000);
    }
    
    return () => {
      if (autoInterval) clearInterval(autoInterval);
    };
  }, [isRunning, autoLapEnabled, currentBead, currentRound]);

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
    
    if (newBead >= targetBeads) {
      // Round completed
      const newRound = currentRound + 1;
      setCurrentRound(newRound);
      setCurrentBead(0);
      playRoundCompleteSound();
    } else {
      setCurrentBead(newBead);
    }
  };

  const playRoundCompleteSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Timer tap: Start/Pause toggle
  const handleTimerTap = () => {
    if (isLongPress) return; // Don't toggle if long press was detected
    
    if (!isRunning && !sessionStartTime) {
      // First start
      setSessionStartTime(Date.now());
      setIsRunning(true);
    } else {
      // Toggle pause/resume
      setIsRunning(!isRunning);
    }
  };

  // Timer long press: Reset
  const handleTimerLongPressStart = () => {
    timerPressRef.current = setTimeout(() => {
      setIsLongPress(true);
      handleTimerReset();
    }, 800); // 800ms for long press
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
    showSuccess('Timer reset');
  };

  // Beads tap: Open settings modal
  const handleBeadsTap = () => {
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    setShowSettingsModal(false);
    showSuccess('Settings saved');
  };

  const handleResetSettings = () => {
    setCurrentBead(0);
    setCurrentRound(0);
    setShowSettingsModal(false);
    showSuccess('Counter reset');
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

      showSuccess('Session saved successfully!');
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
    return `${(currentBead + 1).toString().padStart(3, '0')}:${targetBeads.toString().padStart(3, '0')}`;
  };

  const getCompletionPercentage = (session: ChantingSession): number => {
    const total = targetRounds * targetBeads;
    const completed = session.rounds * targetBeads + session.beads;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Japa Counter</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <HistoryIcon size={20} />
            </button>
            <button
              onClick={handleSaveSession}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Main Counter */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Beads Display */}
        <div 
          onClick={handleBeadsTap}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-800/70 transition-all border border-gray-700 active:scale-95"
        >
          <div className="text-sm text-gray-400 mb-2 font-medium">BEADS</div>
          <div className="text-6xl font-bold tracking-wider font-mono">
            {formatBeadCount()}
          </div>
          <div className="text-sm text-gray-400 mt-2">Tap to configure</div>
        </div>

        {/* Timer Display */}
        <div 
          onMouseDown={handleTimerLongPressStart}
          onMouseUp={handleTimerLongPressEnd}
          onMouseLeave={handleTimerLongPressEnd}
          onTouchStart={handleTimerLongPressStart}
          onTouchEnd={handleTimerLongPressEnd}
          onClick={handleTimerTap}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-800/70 transition-all border border-gray-700 active:scale-95"
        >
          <div className="text-sm text-gray-400 mb-2 font-medium">TIMER</div>
          <div className="text-6xl font-bold tracking-wider font-mono">
            {formatTimer(timerSeconds)}
          </div>
          <div className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-2">
            {isRunning ? (
              <><Pause size={14} /> Tap to pause • Long press to reset</>
            ) : (
              <><Play size={14} /> Tap to start • Long press to reset</>
            )}
          </div>
        </div>

        {/* Rounds Display */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-400 mb-1">Rounds Completed</div>
              <div className="text-4xl font-bold">{currentRound}/{targetRounds}</div>
            </div>
            <div className="w-24 h-24">
              <svg className="transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#374151"
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
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.totalRounds}</div>
              <div className="text-xs text-gray-400 mt-1">Total Rounds</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.totalBeads}</div>
              <div className="text-xs text-gray-400 mt-1">Total Beads</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-orange-500">{Math.floor(stats.totalTime / 60)}m</div>
              <div className="text-xs text-gray-400 mt-1">Total Time</div>
            </div>
          </div>
        )}

        {/* Chanting Inspiration */}
        <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-800/50">
          <h3 className="text-lg font-bold mb-2 text-orange-300">Chanting Inspiration</h3>
          <p className="text-sm text-gray-300 italic mb-3">
            "Associating With The Supreme Lord Directly"
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            By chanting the holy names, you are directly associating with the Supreme Lord Krishna. 
            Each round brings you closer to spiritual perfection and purifies your consciousness.
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold">Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Rounds Setting */}
              <div>
                <label className="block text-sm text-gray-400 mb-3 font-medium">ROUNDS</label>
                <div className="flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-700">
                  <button
                    onClick={() => setTargetRounds(Math.max(1, targetRounds - 1))}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-3xl font-bold">{targetRounds}</span>
                  <button
                    onClick={() => setTargetRounds(targetRounds + 1)}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Beads Setting */}
              <div>
                <label className="block text-sm text-gray-400 mb-3 font-medium">BEADS PER ROUND</label>
                <div className="flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-700">
                  <button
                    onClick={() => setTargetBeads(Math.max(1, targetBeads - 1))}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-3xl font-bold">{targetBeads}</span>
                  <button
                    onClick={() => setTargetBeads(targetBeads + 1)}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Auto Lap Toggle */}
              <div className="flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-700">
                <span className="text-sm font-medium">Auto lap on round finish</span>
                <button
                  onClick={() => setAutoLapEnabled(!autoLapEnabled)}
                  className={`w-14 h-8 rounded-full transition-colors ${autoLapEnabled ? 'bg-orange-600' : 'bg-gray-700'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${autoLapEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={handleResetSettings}
                  className="py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors"
                >
                  RESET
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-semibold transition-colors"
                >
                  SET
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold">Session History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              {sessions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No sessions yet</p>
                  <p className="text-sm">Complete a round and save your session!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-500">{session.date}</div>
                            <div className="text-xs text-gray-400">{session.startTime}</div>
                          </div>
                          <div className="h-10 w-px bg-gray-700" />
                          <div>
                            <div className="text-sm text-gray-400">Completed</div>
                            <div className="text-lg font-bold">{session.rounds} rounds</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Duration</div>
                          <div className="text-lg font-bold">{Math.floor(session.duration / 60)}m</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(getCompletionPercentage(session), 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 font-medium min-w-[3rem] text-right">
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
    </div>
  );
}
