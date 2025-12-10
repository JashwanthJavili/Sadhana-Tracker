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
    displayName: 'Om Namo Bhagavate Vasudevaya'
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
    
    // Show devotional popup more frequently (user requested frequent popups)
    const showPopup = () => {
      if (!isPlaying) {
        setShowSongName(true);
        setTimeout(() => setShowSongName(false), 3500); // Show for 3.5 seconds
      }
    };

    // Show first popup after 3 seconds
    const initialTimer = setTimeout(() => {
      showPopup();
    }, 3000);
    
    // Then show every 12 seconds (frequent popups)
    const popupInterval = setInterval(() => {
      showPopup();
    }, 12000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(iconInterval);
      clearInterval(popupInterval);
    };
  }, [isPlaying]);

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
            {showSongName && (
              <div className="absolute bottom-full right-0 mb-2">
                {/* Minimal devotional card */}
                <div className="bg-gradient-to-r from-orange-500/90 via-orange-600/90 to-red-500/90 text-white px-3 py-2 rounded-xl shadow-lg animate-scale-in border border-orange-300/50 backdrop-blur-md relative cursor-pointer hover:from-orange-600 hover:via-orange-700 hover:to-red-600 transition-all" onClick={() => { togglePlay(); setShowSongName(false); }}>
                  {/* Subtle shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>
                  
                  {/* Full song name with playing/mute icon */}
                  <div className="relative flex items-center gap-2 max-w-xs">
                    {isPlaying ? (
                      <Volume2 size={16} className="flex-shrink-0 text-white" strokeWidth={2.5} />
                    ) : (
                      <VolumeX size={16} className="flex-shrink-0 text-white" strokeWidth={2.5} />
                    )}
                    <span className="text-xs font-medium tracking-wide truncate">
                      {currentSong.displayName}
                    </span>
                  </div>
                  
                  {/* Small tail */}
                  <div className="absolute top-full right-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-orange-600/90"></div>
                </div>
                
                {/* Subtle glow */}
                <div className="absolute inset-0 bg-orange-400/30 rounded-xl blur-md -z-10 pointer-events-none"></div>
              </div>
            )}

            {/* Compact Mode - Enhanced with interesting features */}
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
                
                {/* Main button - ONLY THE ICON IS CLICKABLE: single tap toggles play/pause */}
                <div 
                  onClick={togglePlay}
                  className="relative bg-gradient-to-br from-orange-300 via-orange-500 to-orange-600 rounded-full shadow-2xl p-3 sm:p-5 hover:scale-110 hover:rotate-12 transition-all duration-300 border-2 border-orange-200/60 backdrop-blur-sm overflow-hidden cursor-pointer pointer-events-auto"
                >
                  {/* Shimmer effect - NOT CLICKABLE */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full pointer-events-none"></div>
                  
                  {/* Rotating gradient background when playing - NOT CLICKABLE */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 to-orange-400 opacity-50 animate-spin pointer-events-none" style={{ animationDuration: '3s' }}></div>
                  )}
                  
                  {/* Icon - Use same size on mobile and web (24px) for better visibility */}
                  {isPlaying ? (
                    <Music 
                      size={28} 
                      className="text-white drop-shadow-lg relative z-10 animate-pulse"
                      strokeWidth={2.5}
                    />
                  ) : (
                    showMuteIcon ? (
                      <VolumeX 
                        size={28} 
                        className="text-white drop-shadow-lg relative z-10 transition-all duration-500"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Music 
                        size={28} 
                        className="text-white drop-shadow-lg relative z-10 transition-all duration-500"
                        strokeWidth={2.5}
                      />
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
              </div>
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
        // Using bottom-20 (5rem = 80px) to keep spacing with message icon at bottom-6 (1.5rem = 24px)
        return <div ref={playerRef} className="fixed bottom-20 right-6 z-[60]">{musicPlayer}</div>;
      })()}
    </>
  );
};

export default BackgroundMusic;
