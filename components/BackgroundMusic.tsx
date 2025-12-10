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
  const playerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.2); // Start at 20% volume
  const [targetVolume, setTargetVolume] = useState(0.3); // Target 30%
  const [showConsent, setShowConsent] = useState(false);
  const [userConsented, setUserConsented] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showSongName, setShowSongName] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSongId, setCurrentSongId] = useState(SONGS[0].id);
  const [isAutoIncrementing, setIsAutoIncrementing] = useState(false);
  const [showMuteIcon, setShowMuteIcon] = useState(true); // Alternate between mute and music icon

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
    // Auto-initialize music player without consent dialog
    setUserConsented(true);
    setShowPlayer(true);
    
    // Alternate between mute and music icon every 4 seconds when not playing
    const iconInterval = setInterval(() => {
      if (!isPlaying) {
        setShowMuteIcon(prev => !prev);
      }
    }, 4000);
    
    // Show devotional popup occasionally (not too frequent to avoid irritation)
    const showPopup = () => {
      if (!isPlaying && !isExpanded) {
        setShowSongName(true);
        setTimeout(() => setShowSongName(false), 3500);
      }
    };

    // Show first popup after 5 seconds
    const initialTimer = setTimeout(() => {
      showPopup();
    }, 5000);
    
    // Then show every 40 seconds (less frequent, less irritating)
    const popupInterval = setInterval(() => {
      showPopup();
    }, 40000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(iconInterval);
      clearInterval(popupInterval);
    };
  }, [isPlaying, isExpanded]);

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
          const newVolume = Math.min(prev + 0.01, targetVolume);
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
      }, 500);
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

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Close popup automatically when user clicks play
      setShowSongName(false);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
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

  // Close music player when clicking outside (click-outside detection)
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (playerRef.current && !playerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    // Add slight delay to avoid closing immediately after opening
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Always show player
  if (!showPlayer) {
    return null;
  }

  return (
    <>
      {/* Audio element - Always present in DOM to prevent playback interruption */}
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

      {/* Music Player - Compact floating button that expands */}
      {(() => {
        const currentSong = SONGS.find(s => s.id === currentSongId) || SONGS[0];
        
        const musicPlayer = (
          <>
            {/* Devotional Mantra Popup - Shows full name with icon */}
            {showSongName && !isExpanded && (
              <div className="absolute bottom-full right-0 mb-2">
                {/* Minimal devotional card */}
                <div className="bg-gradient-to-r from-orange-500/95 to-orange-600/95 text-white px-2.5 py-1.5 rounded-lg shadow-lg animate-scale-in border border-orange-300/50 backdrop-blur-md relative cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all" onClick={() => { toggleExpand(); setShowSongName(false); }}>
                  {/* Subtle shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>
                  
                  {/* Full song name with alternating icon */}
                  <div className="relative flex items-center gap-1.5 whitespace-nowrap">
                    {showMuteIcon ? (
                      <VolumeX size={12} className="flex-shrink-0" strokeWidth={2.5} />
                    ) : (
                      <Music size={12} className="flex-shrink-0" strokeWidth={2.5} />
                    )}
                    <span className="text-[10px] font-medium tracking-wide">
                      {currentSong.displayName}
                    </span>
                  </div>
                  
                  {/* Small tail */}
                  <div className="absolute top-full right-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-orange-600/95"></div>
                </div>
                
                {/* Subtle glow */}
                <div className="absolute inset-0 bg-orange-400/30 rounded-lg blur-md -z-10 pointer-events-none"></div>
              </div>
            )}

            {/* Compact Mode - Enhanced with interesting features */}
            {!isExpanded && (
              <div className="relative group pointer-events-none">
                {/* Multi-layer glow and ripple effects when playing - NOT CLICKABLE */}
                {isPlaying && (
                  <>
                    {/* Breathing glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full blur-2xl opacity-50 animate-pulse pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-orange-600 rounded-full blur-lg opacity-60 animate-pulse pointer-events-none" style={{ animationDelay: '0.2s' }}></div>
                    
                    {/* Ripple effect rings */}
                    <div className="absolute inset-0 -m-2 border-2 border-orange-400/30 rounded-full animate-ping pointer-events-none"></div>
                    <div className="absolute inset-0 -m-4 border border-orange-300/20 rounded-full animate-ping pointer-events-none" style={{ animationDelay: '0.3s' }}></div>
                  </>
                )}
                
                {/* Subtle pulse when not playing to draw attention */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-xl animate-pulse pointer-events-none"></div>
                )}
                
                {/* Main button - ONLY THIS IS CLICKABLE */}
                <div 
                  onClick={toggleExpand}
                  className="relative bg-gradient-to-br from-orange-300 via-orange-500 to-orange-600 rounded-full shadow-2xl p-3 sm:p-4 hover:scale-110 hover:rotate-12 transition-all duration-300 border-2 border-orange-200/60 backdrop-blur-sm overflow-hidden cursor-pointer pointer-events-auto"
                >
                  {/* Shimmer effect - NOT CLICKABLE */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full pointer-events-none"></div>
                  
                  {/* Rotating gradient background when playing - NOT CLICKABLE */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 to-orange-400 opacity-50 animate-spin pointer-events-none" style={{ animationDuration: '3s' }}></div>
                  )}
                  
                  {/* Icon - Responsive size (small on mobile, normal on web) */}
                  {isPlaying ? (
                    <>
                      <Music 
                        size={16} 
                        className="sm:hidden text-white drop-shadow-lg relative z-10 animate-pulse"
                        strokeWidth={2.5}
                      />
                      <Music 
                        size={24} 
                        className="hidden sm:block text-white drop-shadow-lg relative z-10 animate-pulse"
                        strokeWidth={2.5}
                      />
                    </>
                  ) : (
                    showMuteIcon ? (
                      <>
                        <VolumeX 
                          size={16} 
                          className="sm:hidden text-white drop-shadow-lg relative z-10 transition-all duration-500"
                          strokeWidth={2.5}
                        />
                        <VolumeX 
                          size={24} 
                          className="hidden sm:block text-white drop-shadow-lg relative z-10 transition-all duration-500"
                          strokeWidth={2.5}
                        />
                      </>
                    ) : (
                      <>
                        <Music 
                          size={16} 
                          className="sm:hidden text-white drop-shadow-lg relative z-10 transition-all duration-500"
                          strokeWidth={2.5}
                        />
                        <Music 
                          size={24} 
                          className="hidden sm:block text-white drop-shadow-lg relative z-10 transition-all duration-500"
                          strokeWidth={2.5}
                        />
                      </>
                    )
                  )}
                  
                  {/* Playing indicator - Enhanced animated wave - NOT CLICKABLE */}
                  {isPlaying && (
                    <div className="absolute -top-1 -right-1 flex gap-0.5 pointer-events-none">
                      <div className="w-1.5 h-3 bg-lime-300 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-4 bg-lime-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-3 bg-lime-300 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                </div>

                {/* Attractive Tooltip - NOT CLICKABLE */}
                <div className="absolute bottom-full right-0 mb-3 px-5 py-3 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 text-white text-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl border-2 border-pink-400/60 backdrop-blur-lg pointer-events-none">
                  <div className="font-bold text-center drop-shadow-lg">
                    {currentSong.displayName}
                  </div>
                  <div className="absolute top-full right-6 w-0 h-0 border-l-5 border-l-transparent border-r-5 border-r-transparent border-t-6 border-t-orange-900"></div>
                </div>
              </div>
            )}          {/* Expanded Mode - Ultra Compact */}
          {isExpanded && (
            <div className="bg-gradient-to-br from-orange-500/95 via-orange-600/95 to-red-500/95 rounded-xl shadow-2xl p-2.5 animate-scale-in border border-orange-300/50 backdrop-blur-lg w-52 overflow-hidden relative">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none"></div>
              
              {/* Ultra Compact Header */}
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="bg-white/20 p-1 rounded-lg backdrop-blur-sm relative">
                    <Music size={14} className={`text-white ${isPlaying ? 'animate-pulse' : ''}`} strokeWidth={2.5} />
                    {isPlaying && (
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[11px] font-bold leading-tight truncate drop-shadow">
                      {currentSong.name}
                    </div>
                    <div className="text-orange-100 text-[9px] flex items-center gap-0.5">
                      {isPlaying ? (
                        <>
                          <span className="bg-green-400 text-green-900 px-1 py-0.5 rounded text-[8px] font-bold">LIVE</span>
                          <span className="truncate">Playing</span>
                        </>
                      ) : (
                        <>
                          <span className="bg-white/80 text-orange-600 px-1 py-0.5 rounded text-[8px] font-bold">READY</span>
                          <span className="truncate">Tap Play</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={toggleExpand}
                  className="text-white/90 hover:text-white transition-colors bg-white/20 hover:bg-white/30 rounded-full p-1 flex-shrink-0"
                  title="Close"
                >
                  <ChevronDown size={14} strokeWidth={2.5} />
                </button>
              </div>

              {/* Ultra Compact Controls */}
              <div className="bg-white/15 backdrop-blur-md rounded-lg p-2 border border-white/20 shadow-inner relative z-10">
                {/* Song Selector - Dropdown */}
                {SONGS.length > 1 && (
                  <div className="mb-1.5">
                    <label className="text-white/90 text-[9px] font-medium block mb-0.5">Select Mantra</label>
                    <select
                      value={currentSongId}
                      onChange={(e) => changeSong(e.target.value)}
                      className="w-full px-2 py-1 bg-white/10 border border-white/30 rounded-md text-white text-[10px] hover:bg-white/20 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/50"
                    >
                      {SONGS.map(song => (
                        <option key={song.id} value={song.id} className="bg-orange-600 text-white">
                          {song.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Play/Pause - Ultra Compact */}
                <div className="flex justify-center mb-1.5">
                  <button
                    onClick={togglePlay}
                    className="relative group/play"
                    disabled={isMuted}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-white rounded-full blur-md opacity-20 group-hover/play:opacity-40 transition-opacity pointer-events-none"></div>
                    
                    {/* Button - Small */}
                    <div className="relative bg-gradient-to-br from-white to-orange-50 rounded-full shadow-lg p-2 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/50">
                      {isPlaying ? (
                        <Pause size={16} className="text-orange-600" strokeWidth={2.5} fill="currentColor" />
                      ) : (
                        <Play size={16} className="text-orange-600" strokeWidth={2.5} fill="currentColor" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Volume Control - Ultra Compact */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-white/90 text-[9px] font-medium">
                    <span className="flex items-center gap-0.5">
                      <Volume2 size={10} strokeWidth={2.5} />
                      Volume
                    </span>
                    <span className="bg-white/25 px-1 py-0.5 rounded font-bold">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  
                  {/* Slider - Compact */}
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
                      className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer backdrop-blur-sm border border-white/30"
                      style={{
                        background: `linear-gradient(to right, #fff ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`
                      }}
                      disabled={isMuted}
                    />
                  </div>
                  {isAutoIncrementing && (
                    <div className="text-center">
                      <span className="text-[8px] text-white/70 animate-pulse">Auto-increasing...</span>
                    </div>
                  )}
                </div>

                {/* Mute Toggle - Compact */}
                <div className="flex justify-center mt-2">
                  <button
                    onClick={toggleMute}
                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-white/30 hover:scale-105 active:scale-95"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX size={12} strokeWidth={2.5} />
                        <span className="text-[10px] font-semibold">Unmute</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={12} strokeWidth={2.5} />
                        <span className="text-[10px] font-semibold">Mute</span>
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
            return ReactDOM.createPortal(<div ref={playerRef}>{musicPlayer}</div>, container);
          }
        }
        // Mobile: position vertically above message button (fixed position)
        return <div ref={playerRef} className="fixed bottom-20 right-6 z-[60]">{musicPlayer}</div>;
      })()}
    </>
  );
};

export default BackgroundMusic;
