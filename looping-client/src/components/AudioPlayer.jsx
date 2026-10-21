import React, { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiMusic, FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi';

// Global audio instance that persists across navigation
let globalAudioInstance = null;
let globalState = {
  currentSongIndex: 0,
  isPlaying: false,
  currentTime: 0,
  volume: 0.7
};

const songs = [
  { id: 1, title: "Summer Breeze", artist: "Acoustic Dreams", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Midnight Jazz", artist: "Smooth Collective", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Electric Pulse", artist: "Neon Lights", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: 4, title: "Ocean Waves", artist: "Nature Sounds", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: 5, title: "Urban Rhythm", artist: "City Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { id: 6, title: "Classical Morning", artist: "Symphony Orchestra", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { id: 7, title: "Rock Anthem", artist: "Thunder Road", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { id: 8, title: "Latin Fire", artist: "Salsa Kings", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { id: 9, title: "Ambient Space", artist: "Cosmic Journey", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
  { id: 10, title: "Folk Tales", artist: "Acoustic Sessions", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
  { id: 11, title: "Electronic Dreams", artist: "Synth Wave", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
  { id: 12, title: "Blues Night", artist: "Delta Blues Band", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
  { id: 13, title: "Pop Sensation", artist: "Chart Toppers", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3" },
  { id: 14, title: "Reggae Vibes", artist: "Island Rhythm", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" },
  { id: 15, title: "Metal Storm", artist: "Heavy Thunder", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
  { id: 16, title: "Jazz Fusion", artist: "Modern Jazz Quartet", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" },
  { id: 17, title: "Country Roads", artist: "Nashville Stars", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3" },
  { id: 18, title: "Hip Hop Beat", artist: "Urban Flow", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3" },
  { id: 19, title: "Classical Piano", artist: "Grand Piano Masters", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3" },
  { id: 20, title: "World Music", artist: "Global Harmony", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3" }
];

const AudioPlayer = () => {
  // Initialize from global state or sessionStorage
  const getInitialState = () => {
    // Try sessionStorage first
    const savedState = sessionStorage.getItem('audioPlayerState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        globalState = { ...globalState, ...parsed };
        console.log('Restored audio state from sessionStorage:', parsed);
      } catch (e) {
        console.error('Error parsing audio state:', e);
      }
    } else {
      console.log('No saved state found, using defaults');
    }
    return globalState;
  };

  const initialState = getInitialState();
  const [currentSongIndex, setCurrentSongIndex] = useState(initialState.currentSongIndex);
  const [audioPopupOpen, setAudioPopupOpen] = useState(false);
  const popupRef = useRef(null);
  
  // Prevent song index changes during navigation
  useEffect(() => {
    // If we have a valid saved song index that's different from current, restore it
    if (initialState.currentSongIndex >= 0 && initialState.currentSongIndex < songs.length) {
      if (currentSongIndex !== initialState.currentSongIndex) {
        console.log('Restoring song index from', currentSongIndex, 'to', initialState.currentSongIndex);
        setCurrentSongIndex(initialState.currentSongIndex);
        lastSongIndex.current = initialState.currentSongIndex;
      }
    }
  }, []);
  const [isPlaying, setIsPlaying] = useState(initialState.isPlaying);
  const [currentTime, setCurrentTime] = useState(initialState.currentTime);
  const [duration, setDuration] = useState(initialState.duration || 0);
  const [volume, setVolume] = useState(initialState.volume);
  const audioRef = useRef(null);
  const lastSongIndex = useRef(initialState.currentSongIndex);

  // Prevent song index changes during navigation
  const safeSetSongIndex = (newIndex) => {
    if (newIndex !== lastSongIndex.current) {
      console.log('Song index changing from', lastSongIndex.current, 'to', newIndex);
      lastSongIndex.current = newIndex;
      setCurrentSongIndex(newIndex);
    }
  };

  const currentSong = songs[currentSongIndex];

  // Sync state with global state and sessionStorage whenever it changes
  useEffect(() => {
    // Update global state
    globalState = {
      currentSongIndex,
      isPlaying,
      currentTime,
      volume,
      duration
    };
    
    // Save to sessionStorage
    sessionStorage.setItem('audioPlayerState', JSON.stringify(globalState));
  }, [currentSongIndex, isPlaying, currentTime, volume, duration]);

  useEffect(() => {
    // Create or reuse global audio instance
    if (!globalAudioInstance) {
      globalAudioInstance = new Audio();
      globalAudioInstance.preload = 'auto';
    }
    
    const audio = globalAudioInstance;
    audioRef.current = audio;

    // Update audio source if song changed (with more robust comparison)
    const currentSrc = audio.src;
    const expectedSrc = currentSong.url;
    
    // Only update source if it's actually different and this is a real user action
    if (currentSrc && expectedSrc && !currentSrc.includes(expectedSrc.split('?')[0])) {
      // Additional check: only update if this is not during navigation
      const isNavigation = window.location.pathname === "/" && lastSongIndex.current === currentSongIndex;
      
      if (!isNavigation || (isNavigation && globalState.currentSongIndex === currentSongIndex)) {
        console.log('Updating audio source from', currentSrc, 'to', expectedSrc);
        audio.src = expectedSrc;
        audio.load();
      } else {
        console.log('Skipping audio source update during navigation');
      }
    } else if (!currentSrc && expectedSrc) {
      // Initial load case
      console.log('Initial audio load:', expectedSrc);
      audio.src = expectedSrc;
      audio.load();
    }

    // Immediately sync current time with global state
    const syncCurrentTime = () => {
      const audioTime = audio.currentTime;
      const globalTime = globalState.currentTime;
      
      // If there's a significant difference, use the global time
      if (Math.abs(audioTime - globalTime) > 0.5) {
        audio.currentTime = globalTime;
      }
      setCurrentTime(audio.currentTime);
    };

    const updateTime = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      globalState.currentTime = time;
    };
    
    const updateDuration = () => {
      const audioDuration = audio.duration;
      if (!isNaN(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration);
        globalState.duration = audioDuration;
        console.log('Duration updated:', audioDuration);
      }
    };
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    audio.volume = volume;
    globalState.volume = volume;

    // Initial sync
    syncCurrentTime();

    // Restore playback position and continue playing if it was playing
    const restorePlayback = async () => {
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
        // Only restore time if there's a significant difference to avoid jumps
        const currentTimeDiff = Math.abs(audio.currentTime - globalState.currentTime);
        if (currentTimeDiff > 0.5 && globalState.currentTime > 0) {
          audio.currentTime = globalState.currentTime;
          setCurrentTime(globalState.currentTime);
          console.log('Restored time to:', globalState.currentTime);
        }
        
        // Continue playing if it was playing before navigation (be more aggressive)
        if (globalState.isPlaying) {
          if (audio.paused) {
            try {
              // Force play with multiple attempts if needed
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                playPromise.then(() => {
                  setIsPlaying(true);
                  console.log('Successfully resumed playback');
                }).catch((error) => {
                  console.error("First play attempt failed, retrying:", error);
                  // Retry after a short delay
                  setTimeout(async () => {
                    try {
                      await audio.play();
                      setIsPlaying(true);
                      console.log('Successfully resumed playback on retry');
                    } catch (retryError) {
                      console.error("Retry also failed:", retryError);
                      setIsPlaying(false);
                      globalState.isPlaying = false;
                    }
                  }, 100);
                });
              }
            } catch (error) {
              console.error("Error resuming playback:", error);
              setIsPlaying(false);
              globalState.isPlaying = false;
            }
          } else {
            // Audio is already playing, just sync the state
            setIsPlaying(true);
            console.log('Audio was already playing, synced state');
          }
        }
      } else {
        // Audio not ready, wait for it to load
        const handleCanPlay = async () => {
          if (globalState.currentTime > 0) {
            audio.currentTime = globalState.currentTime;
            setCurrentTime(globalState.currentTime);
          }
          
          if (globalState.isPlaying && audio.paused) {
            try {
              await audio.play();
              setIsPlaying(true);
            } catch (error) {
              console.error("Error resuming playback:", error);
              setIsPlaying(false);
              globalState.isPlaying = false;
            }
          }
          audio.removeEventListener('canplay', handleCanPlay);
        };
        audio.addEventListener('canplay', handleCanPlay);
      }
    };

    // Try to restore immediately if audio is ready, otherwise wait for loadeddata
    if (audio.readyState >= 2) {
      restorePlayback();
    } else {
      const handleLoadedData = () => {
        restorePlayback();
        audio.removeEventListener('loadeddata', handleLoadedData);
      };
      audio.addEventListener('loadeddata', handleLoadedData);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [volume, currentSongIndex]);

  // Effect to restore duration from global state when component loads
  useEffect(() => {
    if (globalAudioInstance && globalState.duration > 0) {
      setDuration(globalState.duration);
      console.log('Restored duration from global state:', globalState.duration);
    }
  }, [currentSongIndex]);

  // Additional effect to ensure time display stays synchronized
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (globalAudioInstance && audioRef.current) {
        const audioTime = globalAudioInstance.currentTime;
        const displayTime = currentTime;
        
        // If display time is significantly off, update it
        if (Math.abs(audioTime - displayTime) > 0.3) {
          setCurrentTime(audioTime);
          globalState.currentTime = audioTime;
        }
      }
    }, 100); // Check every 100ms

    return () => clearInterval(syncInterval);
  }, [currentTime]);

  // Navigation guard to prevent audio from pausing during navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save the exact playing state before navigation
      if (globalAudioInstance) {
        globalState.isPlaying = !globalAudioInstance.paused;
        globalState.currentTime = globalAudioInstance.currentTime;
        globalState.currentSongIndex = currentSongIndex; // Ensure song index is saved
        sessionStorage.setItem('audioPlayerState', JSON.stringify(globalState));
        console.log('Navigation guard: Saved audio state with song index', currentSongIndex);
      }
    };

    // Listen for navigation events
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Also listen for route changes (React Router doesn't have a built-in event for this)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      handleBeforeUnload();
      return originalPushState.apply(window.history, args);
    };
    
    window.history.replaceState = function(...args) {
      handleBeforeUnload();
      return originalReplaceState.apply(window.history, args);
    };

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) && !event.target.closest('.audio-toggle-btn')) {
        setAudioPopupOpen(false);
      }
    };

    if (audioPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [audioPopupOpen]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newPlayingState = !isPlaying;
    globalState.isPlaying = newPlayingState;
    
    if (newPlayingState) {
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
        globalState.isPlaying = false;
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
    setIsPlaying(newPlayingState);
  };

  const handlePrevious = () => {
    const newIndex = currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
    safeSetSongIndex(newIndex);
    globalState.currentSongIndex = newIndex;
    globalState.isPlaying = false;
    globalState.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleNext = () => {
    const newIndex = (currentSongIndex + 1) % songs.length;
    safeSetSongIndex(newIndex);
    globalState.currentSongIndex = newIndex;
    globalState.isPlaying = false;
    globalState.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    globalState.currentTime = newTime;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    globalState.volume = newVolume;
    
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white text-black p-2 shadow-lg border-b border-gray-200">
      <audio
        ref={audioRef}
        src={currentSong.url}
        onPause={() => {
          setIsPlaying(false);
          globalState.isPlaying = false;
        }}
      />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="hidden sm:flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {currentSong.title}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {currentSong.artist}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 mx-2 sm:mx-4">
            <button
              onClick={handlePrevious}
              className="p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              title="Previous Song"
            >
              <FiSkipBack size={14} sm:size={16} />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FiPause size={14} sm:size={16} /> : <FiPlay size={14} sm:size={16} />}
            </button>
            
            <button
              onClick={handleNext}
              className="p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              title="Next Song"
            >
              <FiSkipForward size={14} sm:size={16} />
            </button>
            
            {/* Music Icon Button */}
            <div className="relative">
              <button
                onClick={() => setAudioPopupOpen(!audioPopupOpen)}
                className="p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                title="Audio Controls"
              >
                <FiMusic size={14} sm:size={16} />
              </button>
              
              {/* Audio Popup */}
              {audioPopupOpen && (
                <div ref={popupRef} className="fixed top-12 left-1/2 transform -translate-x-1/2 mt-1 w-80 max-w-[90vw] bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                  {/* Song Title */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 text-sm truncate">
                      {currentSong.title}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {currentSong.artist}
                    </p>
                  </div>
                  
                  {/* Volume Control */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {volume === 0 ? (
                        <FiVolumeX size={16} className="text-gray-600" />
                      ) : volume < 0.5 ? (
                        <FiVolume1 size={16} className="text-gray-600" />
                      ) : (
                        <FiVolume2 size={16} className="text-gray-600" />
                      )}
                      <span className="text-xs text-gray-600">Volume</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${volume * 100}%, #d1d5db ${volume * 100}%, #d1d5db 100%)`
                      }}
                    />
                  </div>
                  
                  {/* Time Display */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-red-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                                  </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center space-x-1 sm:space-x-2">
            <span className="text-xs text-gray-600 w-6 sm:w-8 text-right">
              {formatTime(currentTime)}
            </span>
            
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: duration > 0 
                  ? `linear-gradient(to right, #dc2626 0%, #dc2626 ${(currentTime / duration) * 100}%, #d1d5db ${(currentTime / duration) * 100}%, #d1d5db 100%)`
                  : '#d1d5db'
              }}
            />
            
            <span className="text-xs text-gray-600 w-6 sm:w-8">
              {formatTime(duration)}
            </span>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center space-x-2 ml-4">
              <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${volume * 100}%, #d1d5db ${volume * 100}%, #d1d5db 100%)`
                }}
              />
            </div>
          </div>
        </div>

        </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #dc2626;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: #dc2626;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #dc2626;
          border-radius: 50%;
          cursor: pointer;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: #dc2626;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;
