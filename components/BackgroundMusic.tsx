import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Volume2, VolumeX, Music, ChevronDown, ChevronUp, Pause, Play } from 'lucide-react';

interface BackgroundMusicProps {
  autoPlay?: boolean;
}

// Available songs - Add more songs here
const SONGS = [
  {
    id: 'om-namo',
    name: 'Om Namo Bagavathevasudeyava',
    file: 'Om_Namo_Bagavathevasudeyava.mp3',
    displayName: '🕉️ Om Namo Bhagavate Vasudevaya'
  },
  // Add more songs like this:
  // { id: 'hare-krishna', name: 'Hare Krishna Mantra', file: 'hare-krishna.mp3', displayName: '🙏 Hare Krishna Mantra' }
];

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ autoPlay = true }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.1); // Start at 10% volume
  const [targetVolume, setTargetVolume] = useState(0.3); // Target 30%
  const [showConsent, setShowConsent] = useState(false);
  const [userConsented, setUserConsented] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showSongName, setShowSongName] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSongId, setCurrentSongId] = useState(SONGS[0].id);
  const [isAutoIncrementing, setIsAutoIncrementing] = useState(false);

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Check if user has given consent or muted
    const musicConsent = localStorage.getItem('backgroundMusicConsent');
    const musicMuted = localStorage.getItem('backgroundMusicMuted');
    
    if (musicMuted === 'true') {
      setIsMuted(true);
      setUserConsented(true);
      setShowPlayer(true);
    } else if (musicConsent === 'granted') {
      setUserConsented(true);
      setShowPlayer(true);
      // Auto-play if consent was previously granted
      if (autoPlay) {
        setTimeout(() => {
          playAudio();
        }, 1000);
      }
    } else if (musicConsent !== 'denied') {
      // Show consent dialog if not previously answered
      setTimeout(() => {
        setShowConsent(true);
      }, 3000); // Show after 3 seconds on login
    }
  }, [autoPlay]);

  // Auto-increment volume from 10% to 30% when playing
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }

    if (isPlaying && volume < targetVolume && !isAutoIncrementing) {
      setIsAutoIncrementing(true);
      
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }

      volumeIntervalRef.current = setInterval(() => {
        setVolume(prev => {
          const newVolume = Math.min(prev + 0.02, targetVolume);
          if (audioRef.current) {
            audioRef.current.volume = newVolume;
          }
          if (newVolume >= targetVolume) {
            setIsAutoIncrementing(false);
            if (volumeIntervalRef.current) {
              clearInterval(volumeIntervalRef.current);
            }
          }
          return newVolume;
        });
      }, 300);
    } else if (!isPlaying && volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      setIsAutoIncrementing(false);
    }

    return () => {
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
    };
  }, [isPlaying, targetVolume, isAutoIncrementing]);

  const playAudio = () => {
    if (audioRef.current && !isPlaying && !isMuted) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowSongName(true);
          setTimeout(() => setShowSongName(false), 3000);
          console.log('🎵 Background music started');
        })
        .catch(error => {
          console.log('Audio play prevented:', error);
        });
    }
  };

  const handleConsent = (granted: boolean) => {
    setShowConsent(false);
    setUserConsented(granted);
    setShowPlayer(true);
    localStorage.setItem('backgroundMusicConsent', granted ? 'granted' : 'denied');
    
    if (granted) {
      setTimeout(() => {
        playAudio();
        // Auto-expand for 3 seconds to show controls
        setIsExpanded(true);
        setTimeout(() => setIsExpanded(false), 5000);
      }, 500);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowSongName(true);
          setTimeout(() => setShowSongName(false), 3000);
        })
        .catch(error => console.error('Play error:', error));
    }
  };

  const changeSong = (songId: string) => {
    const wasPlaying = isPlaying;
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    setCurrentSongId(songId);
    
    setTimeout(() => {
      if (wasPlaying && audioRef.current && !isMuted) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setShowSongName(true);
            setTimeout(() => setShowSongName(false), 3000);
          })
          .catch(error => console.error('Play error:', error));
      }
    }, 100);
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
    
    // Save preference
    localStorage.setItem('backgroundMusicMuted', String(newMutedState));
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Auto-collapse after 8 seconds of no interaction
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Show song name periodically when playing
  useEffect(() => {
    if (isPlaying && !isExpanded) {
      // Show song name every 20 seconds for 3 seconds
      const interval = setInterval(() => {
        setShowSongName(true);
        setTimeout(() => setShowSongName(false), 3000);
      }, 20000); // Every 20 seconds

      return () => clearInterval(interval);
    }
  }, [isPlaying, isExpanded]);

  // Don't render anything until ready
  if (!showPlayer && !showConsent) {
    return null;
  }

  return (
    <>
      {/* Consent Dialog */}
      {showConsent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-scale-in">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3 text-white">
                <Music size={32} className="flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold">Om Namo Bhagavate 🙏</h3>
                  <p className="text-sm text-orange-100 mt-1">Divine Background Music</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Would you like to play the <span className="font-semibold text-orange-600">Om Namo Bhagavate Vasudevaya</span> mantra in the background while you use the app? 
                You can control the music anytime using the floating player.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleConsent(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Not Now
                </button>
                <button
                  onClick={() => handleConsent(true)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg text-white font-medium hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  Yes, Play Music
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio element - Always present in DOM to prevent playback interruption */}
      {userConsented && (
        <audio
          ref={audioRef}
          loop
          preload="auto"
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        >
          <source 
            src={`/audio/${SONGS.find(s => s.id === currentSongId)?.file || SONGS[0].file}`}
            type="audio/mpeg" 
          />
          Your browser does not support audio playback.
        </audio>
      )}

      {/* Music Player - Compact floating button that expands */}
      {userConsented && (() => {
        const currentSong = SONGS.find(s => s.id === currentSongId) || SONGS[0];
        
        const musicPlayer = (
          <>
            {/* Song Name Animation - Shows periodically */}
            {showSongName && !isExpanded && (
              <div className="absolute bottom-full right-0 mb-3 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-scale-in whitespace-nowrap border border-orange-300/30 backdrop-blur-sm">
                <div className="text-sm font-bold flex items-center gap-2">
                  <span className="text-lg animate-bounce">🎵</span>
                  <span>{currentSong.displayName}</span>
                </div>
                <div className="absolute top-full right-6 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-orange-500"></div>
              </div>
            )}

            {/* Compact Mode - Same size as notification icons */}
            {!isExpanded && (
              <div 
                onClick={toggleExpand}
                className="relative group"
              >
                {/* Glow effect when playing */}
                {isPlaying && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-lg opacity-60 animate-pulse"></div>
                )}
                
                {/* Main button - Same size as notification bell */}
                <div className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-full shadow-2xl p-3 cursor-pointer hover:scale-110 transition-all duration-300 border-2 border-orange-300/50">
                  <Music 
                    size={24} 
                    className={`text-white drop-shadow-lg ${isPlaying ? 'animate-pulse' : ''}`}
                    strokeWidth={2.5}
                  />
                  
                  {/* Playing indicator - animated wave */}
                  {isPlaying && (
                    <div className="absolute -top-1 -right-1 flex gap-0.5">
                      <div className="w-1 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-4 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gradient-to-br from-gray-800 to-gray-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-2xl border border-gray-700">
                  <div className="font-semibold flex items-center gap-1">
                    <span>{isPlaying ? '⏸️' : '▶️'}</span>
                    <span>{currentSong.displayName}</span>
                  </div>
                  <div className="text-gray-300 text-[10px] mt-0.5">Click to {isPlaying ? 'pause' : 'play'}</div>
                  <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                </div>
              </div>
            )}          {/* Expanded Mode - Full controls */}
          {isExpanded && (
            <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-3xl shadow-2xl p-5 animate-scale-in border-2 border-orange-300/50 backdrop-blur-sm w-72 sm:w-80">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    <Music size={20} className={`text-white ${isPlaying ? 'animate-pulse' : ''}`} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-white text-sm font-bold leading-tight">{currentSong.name.split(' ').slice(0, 2).join(' ')}</div>
                    <div className="text-orange-100 text-xs">{currentSong.name.split(' ').slice(2).join(' ')}</div>
                  </div>
                </div>
                <button
                  onClick={toggleExpand}
                  className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1.5"
                >
                  <ChevronDown size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Controls */}
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner">
                {/* Song Selector - Dropdown */}
                {SONGS.length > 1 && (
                  <div className="mb-4">
                    <label className="text-white/90 text-xs font-medium block mb-2">🎵 Select Song</label>
                    <select
                      value={currentSongId}
                      onChange={(e) => changeSong(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white text-sm hover:bg-white/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      {SONGS.map(song => (
                        <option key={song.id} value={song.id} className="bg-orange-600 text-white">
                          {song.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Play/Pause - Premium centered design */}
                <div className="flex justify-center mb-4">
                  <button
                    onClick={togglePlay}
                    className="relative group/play"
                    disabled={isMuted}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-30 group-hover/play:opacity-50 transition-opacity"></div>
                    
                    {/* Button */}
                    <div className="relative bg-gradient-to-br from-white to-orange-50 rounded-full shadow-2xl p-4 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/50">
                      {isPlaying ? (
                        <Pause size={24} className="text-orange-600" strokeWidth={2.5} fill="currentColor" />
                      ) : (
                        <Play size={24} className="text-orange-600" strokeWidth={2.5} fill="currentColor" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Volume Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-white/90 text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <Volume2 size={14} strokeWidth={2.5} />
                      Volume
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  
                  {/* Custom styled range slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume * 100}
                      onChange={(e) => {
                        const newVolume = Number(e.target.value) / 100;
                        setVolume(newVolume);
                        setTargetVolume(newVolume);
                        setIsAutoIncrementing(false);
                      }}
                      className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer backdrop-blur-sm border border-white/30"
                      style={{
                        background: `linear-gradient(to right, #fff ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`
                      }}
                      disabled={isMuted}
                    />
                  </div>
                  {isAutoIncrementing && (
                    <div className="text-center">
                      <span className="text-[10px] text-white/70 animate-pulse">🎵 Auto-increasing volume...</span>
                    </div>
                  )}
                </div>

                {/* Mute Toggle - Premium style */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={toggleMute}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all duration-300 border border-white/30 hover:scale-105 active:scale-95"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX size={18} strokeWidth={2.5} />
                        <span className="text-xs font-semibold">Unmute</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={18} strokeWidth={2.5} />
                        <span className="text-xs font-semibold">Mute</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
        );

        // On desktop, render into the container; on mobile, render at fixed position
        if (!isMobile) {
          const container = document.getElementById('music-player-container');
          if (container) {
            return ReactDOM.createPortal(musicPlayer, container);
          }
        }
        // Mobile: wrap in fixed positioned div
        return <div className="fixed bottom-24 right-4 z-[60]">{musicPlayer}</div>;
      })()}
    </>
  );
};

export default BackgroundMusic;
