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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sounds: Sound[] = [
    { name: 'Beach', emoji: '🏖️', url: '/sounds/beach.mp3' },
    { name: 'Serene', emoji: '🕊️', url: '/sounds/serene.mp3' },
    { name: 'River', emoji: '🏞️', url: '/sounds/river.mp3' },
    { name: 'Forest', emoji: '🌲', url: '/sounds/forest.mp3' },
    { name: 'Waterfall', emoji: '💦', url: '/sounds/waterfall.mp3' },
    { name: 'Stars', emoji: '⭐', url: '/sounds/stars.mp3' },
  ];

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startMeditation = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds === 0) return;

    setTimeLeft(totalSeconds);
    setIsPlaying(true);
    setIsPaused(false);

    // Start audio if a sound is selected
    if (selectedSound && audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.loop = true;
      audioRef.current.play();
    }

    // Start timer
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Meditation completed
          setIsPlaying(false);
          setIsPaused(false);
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setShowMoodModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseResumeMeditation = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      if (selectedSound && audioRef.current) {
        audioRef.current.play();
      }
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setIsPaused(false);
            if (audioRef.current) {
              audioRef.current.pause();
            }
            setShowMoodModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Pause
      setIsPaused(true);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const stopMeditation = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setTimeLeft(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setShowMoodModal(true);
  };

  const handleMoodSelect = (mood: string) => {
    console.log('Mood after meditation:', mood);
    // Here you could save the mood to backend if needed
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

  return (
    <div className="flex-1 p-6 pb-24 relative">
      {isPlaying && <AnimatedBackground />}
      
      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-light mb-2">🧘‍♀️ Meditate</h1>
          <p className="text-medium">
            Find your inner peace with guided meditation
          </p>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-mono font-bold text-light mb-4">
            {isPlaying ? formatTime(timeLeft) : formatTime(hours * 3600 + minutes * 60 + seconds)}
          </div>
          
          {!isPlaying && (
            <div className="flex justify-center space-x-6">
              {/* Hours */}
              <div className="text-center">
                <button
                  onClick={() => adjustTime('hours', true)}
                  className="block w-8 h-8 bg-medium/20 rounded text-light hover:bg-medium/30 transition-colors mb-2"
                >
                  +
                </button>
                <div className="text-light font-mono text-2xl">{hours.toString().padStart(2, '0')}</div>
                <div className="text-medium text-sm">Hours</div>
                <button
                  onClick={() => adjustTime('hours', false)}
                  className="block w-8 h-8 bg-medium/20 rounded text-light hover:bg-medium/30 transition-colors mt-2"
                >
                  -
                </button>
              </div>

              {/* Minutes */}
              <div className="text-center">
                <button
                  onClick={() => adjustTime('minutes', true)}
                  className="block w-8 h-8 bg-medium/20 rounded text-light hover:bg-medium/30 transition-colors mb-2"
                >
                  +
                </button>
                <div className="text-light font-mono text-2xl">{minutes.toString().padStart(2, '0')}</div>
                <div className="text-medium text-sm">Minutes</div>
                <button
                  onClick={() => adjustTime('minutes', false)}
                  className="block w-8 h-8 bg-medium/20 rounded text-light hover:bg-medium/30 transition-colors mt-2"
                >
                  -
                </button>
              </div>

              {/* Seconds */}
              <div className="text-center">
                <button
                  onClick={() => adjustTime('seconds', true)}
                  className="block w-8 h-8 bg-medium/20 rounded text-light hover:bg-medium/30 transition-colors mb-2"
                >
                  +
                </button>
                <div className="text-light font-mono text-2xl">{seconds.toString().padStart(2, '0')}</div>
                <div className="text-medium text-sm">Seconds</div>
                <button
                  onClick={() => adjustTime('seconds', false)}
                  className="block w-8 h-8 bg-medium/20 rounded text-light hover:bg-medium/30 transition-colors mt-2"
                >
                  -
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sound Selection */}
        {!isPlaying && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-light mb-4 text-center">
              Choose Ambient Sound
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {sounds.map((sound) => (
                <button
                  key={sound.name}
                  onClick={() => setSelectedSound(sound)}
                  className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                    selectedSound?.name === sound.name
                      ? 'border-light bg-light/10'
                      : 'border-medium/30 hover:border-light/50'
                  }`}
                >
                  <span className="text-2xl mb-1">{sound.emoji}</span>
                  <span className="text-sm text-light">{sound.name}</span>
                </button>
              ))}
            </div>
            {selectedSound && (
              <p className="text-center text-medium mt-2">
                Selected: {selectedSound.emoji} {selectedSound.name}
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isPlaying ? (
            <CustomButton
              title="Start Meditation"
              onPress={startMeditation}
              disabled={hours === 0 && minutes === 0 && seconds === 0}
              className="px-8"
            />
          ) : (
            <>
              <CustomButton
                title={isPaused ? "Resume" : "Pause"}
                onPress={pauseResumeMeditation}
                variant="secondary"
                className="px-6"
              />
              <CustomButton
                title="Stop"
                onPress={stopMeditation}
                variant="secondary"
                className="px-6"
              />
            </>
          )}
        </div>

        {/* Hidden Audio Element */}
        {selectedSound && (
          <audio
            ref={audioRef}
            src={selectedSound.url}
            preload="auto"
          />
        )}

        {/* Mood Modal */}
        <MoodModal
          isVisible={showMoodModal}
          onClose={() => setShowMoodModal(false)}
          onMoodSelect={handleMoodSelect}
        />
      </div>
    </div>
  );
};

export default Meditate;
