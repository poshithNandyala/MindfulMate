import React, { useState, useRef, useEffect } from 'react';
import CustomButton from '../components/CustomButton';
import MoodModal from '../components/MoodModal';
import AnimatedBackground from '../components/AnimatedBackground';

interface Sound {
  name: string;
  emoji: string;
  url: string;
}

const Meditate: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real non-copyright ambient sounds from various free sources
  const sounds: Sound[] = [
    { 
      name: 'Beach', 
      emoji: '🏖️', 
      // Free ocean waves sound from Mixkit (royalty-free)
      url: 'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3'
    },
    { 
      name: 'Forest', 
      emoji: '🌲', 
      // Free forest ambience from Mixkit (royalty-free)
      url: 'https://assets.mixkit.co/active_storage/sfx/523/523-preview.mp3'
    },
    { 
      name: 'Rain', 
      emoji: '🌧️', 
      // Free rain sound from Mixkit (royalty-free)
      url: 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3'
    },
    { 
      name: 'River', 
      emoji: '🏞️', 
      // Free flowing water from Mixkit (royalty-free)
      url: 'https://assets.mixkit.co/active_storage/sfx/578/578-preview.mp3'
    },
    { 
      name: 'Birds', 
      emoji: '🕊️', 
      // Free bird sounds from Mixkit (royalty-free)
      url: 'https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3'
    },
    { 
      name: 'Wind', 
      emoji: '💨', 
      // Free wind ambience from Mixkit (royalty-free)
      url: 'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3'
    },
  ];

  useEffect(() => {
    return () => {
      cleanupMeditation();
    };
  }, []);

  const cleanupMeditation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const formatTime = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioError = () => {
    setAudioError('Unable to load selected sound. Continuing without audio.');
    setTimeout(() => setAudioError(null), 3000);
  };

  const startMeditation = async () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds === 0) return;

    setTimeLeft(totalSeconds);
    setIsPlaying(true);
    setIsPaused(false);
    setAudioError(null);

    if (selectedSound && audioRef.current) {
      try {
        audioRef.current.volume = 0.3; // Lower volume for ambient sounds
        audioRef.current.loop = true;
        await audioRef.current.play();
      } catch (error) {
        handleAudioError();
      }
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsPaused(false);
          cleanupMeditation();
          setShowMoodModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseResumeMeditation = async () => {
    if (isPaused) {
      setIsPaused(false);
      if (selectedSound && audioRef.current) {
        try {
          await audioRef.current.play();
        } catch (error) {
          handleAudioError();
        }
      }
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setIsPaused(false);
            cleanupMeditation();
            setShowMoodModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsPaused(true);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const stopMeditation = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setTimeLeft(0);
    cleanupMeditation();
    setShowMoodModal(true);
  };

  const handleMoodSelect = (mood: string) => {
    console.log('Mood after meditation:', mood);
    setHours(0);
    setMinutes(10);
    setSeconds(0);
    setSelectedSound(null);
    setShowMoodModal(false);
  };

  const adjustTime = (type: 'hours' | 'minutes' | 'seconds', increment: boolean) => {
    if (isPlaying) return;
    
    if (type === 'hours') {
      setHours(prev => Math.max(0, Math.min(23, increment ? prev + 1 : prev - 1)));
    } else if (type === 'minutes') {
      setMinutes(prev => Math.max(0, Math.min(59, increment ? prev + 1 : prev - 1)));
    } else {
      setSeconds(prev => Math.max(0, Math.min(59, increment ? prev + 1 : prev - 1)));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'hours' | 'minutes' | 'seconds', increment: boolean) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      adjustTime(type, increment);
    }
  };

  return (
    <>
      {/* Background Blur Overlay */}
      {showMoodModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-md"
          style={{ zIndex: 40 }}
        />
      )}

      {/* Main Container - Fixed with proper padding for bottom navigation */}
      <div className="bg-dark text-light">
        {/* Content Container with proper bottom padding to avoid navigation overlap */}
        <div className="px-4 py-6 pb-32 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
          {isPlaying && <AnimatedBackground />}
          
          <div className="max-w-lg mx-auto space-y-6">
            {/* Compact Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 glass rounded-2xl border border-accent-color/20">
                <span className="text-3xl">🧘‍♀️</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Meditate</h1>
              <p className="text-secondary-text text-base">Find your inner peace</p>
            </div>

            {/* Error Message */}
            {audioError && (
              <div className="p-3 glass rounded-2xl border border-red-400/30 bg-red-500/10 animate-pulse">
                <p className="text-red-300 text-sm text-center">{audioError}</p>
              </div>
            )}

            {/* Compact Timer Display */}
            <div className="glass rounded-3xl p-6 sm:p-8 border border-accent-color/30 text-center">
              <div className="text-5xl sm:text-6xl font-mono font-bold gradient-text mb-4 tracking-wider">
                {isPlaying ? formatTime(timeLeft) : formatTime(hours * 3600 + minutes * 60 + seconds)}
              </div>
              
              {!isPlaying && (
                <div className="flex justify-center items-end space-x-6 sm:space-x-8">
                  {/* Time Controls - More Compact */}
                  {(['hours', 'minutes', 'seconds'] as const).map((type) => {
                    const value = type === 'hours' ? hours : type === 'minutes' ? minutes : seconds;
                    return (
                      <div key={type} className="flex flex-col items-center">
                        <button
                          onClick={() => adjustTime(type, true)}
                          className="w-8 h-8 glass rounded-full border border-accent-color/30 text-primary-text hover:border-accent-color hover:bg-accent-color/20 transition-all duration-200 mb-2 flex items-center justify-center text-sm font-bold hover:scale-110"
                          aria-label={`Increase ${type}`}
                        >
                          +
                        </button>
                        <div className="text-primary-text font-mono text-2xl sm:text-3xl font-bold">
                          {value.toString().padStart(2, '0')}
                        </div>
                        <div className="text-secondary-text text-xs font-medium capitalize my-1">
                          {type}
                        </div>
                        <button
                          onClick={() => adjustTime(type, false)}
                          className="w-8 h-8 glass rounded-full border border-accent-color/30 text-primary-text hover:border-accent-color hover:bg-accent-color/20 transition-all duration-200 flex items-center justify-center text-sm font-bold hover:scale-110"
                          aria-label={`Decrease ${type}`}
                        >
                          -
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Compact Sound Selection */}
            {!isPlaying && (
              <div className="glass rounded-3xl p-6 border border-accent-color/30">
                <h3 className="text-lg font-bold text-primary-text mb-4 text-center">
                  Ambient Sound
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {sounds.map((sound) => (
                    <button
                      key={sound.name}
                      onClick={() => setSelectedSound(sound)}
                      className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-300 hover:scale-105 ${
                        selectedSound?.name === sound.name
                          ? 'border-accent-color bg-accent-color/20 shadow-lg'
                          : 'border-accent-bg/30 hover:border-accent-color/50 hover:bg-accent-color/10'
                      }`}
                      aria-label={`Select ${sound.name} ambient sound`}
                    >
                      <span className="text-2xl mb-1">{sound.emoji}</span>
                      <span className="text-xs text-primary-text font-medium">{sound.name}</span>
                    </button>
                  ))}
                </div>
                
                {selectedSound && (
                  <div className="text-center mt-4 p-3 bg-accent-color/10 rounded-xl border border-accent-color/30">
                    <p className="text-accent-color text-sm font-medium">
                      {selectedSound.emoji} {selectedSound.name}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Compact Controls */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              {!isPlaying ? (
                <CustomButton
                  title="🧘‍♀️ Start Meditation"
                  onPress={startMeditation}
                  disabled={hours === 0 && minutes === 0 && seconds === 0}
                  className="w-full sm:w-auto px-8 py-3 text-base font-bold rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                />
              ) : (
                <>
                  <CustomButton
                    title={isPaused ? "▶️ Resume" : "⏸️ Pause"}
                    onPress={pauseResumeMeditation}
                    variant="secondary"
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
                  />
                  <CustomButton
                    title="⏹️ Stop"
                    onPress={stopMeditation}
                    variant="secondary"
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
                  />
                </>
              )}
            </div>

            {/* Compact Session Status */}
            {isPlaying && (
              <div className="glass rounded-2xl p-4 border border-accent-color/30">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-primary-text font-medium text-sm">
                    {isPaused ? '⏸️ Paused' : '🧘‍♀️ In Progress'}
                  </p>
                  {selectedSound && (
                    <span className="text-secondary-text text-sm">
                      • {selectedSound.emoji} {selectedSound.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Hidden Audio Element */}
            {selectedSound && (
              <audio
                ref={audioRef}
                src={selectedSound.url}
                preload="auto"
                onError={handleAudioError}
                onLoadStart={() => setAudioError(null)}
                crossOrigin="anonymous"
              />
            )}

            {/* Attribution for free sounds */}
            <div className="text-center mt-6">
              <p className="text-xs text-secondary-text/60">
                Ambient sounds provided by Mixkit - royalty-free audio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <MoodModal
        isVisible={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onMoodSelect={handleMoodSelect}
      />
    </>
  );
};

export default Meditate;
