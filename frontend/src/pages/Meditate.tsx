import React, { useState, useRef, useEffect } from 'react';
import CustomButton from '../components/CustomButton';
import MoodModal from '../components/MoodModal';
import AnimatedBackground from '../components/AnimatedBackground';

interface Sound {
  name: string;
  emoji: string;
  generator: () => { play: () => void; stop: () => void };
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
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSoundRef = useRef<{ play: () => void; stop: () => void } | null>(null);

  // Web Audio API context
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Generate White Noise
  const createWhiteNoise = () => {
    const audioCtx = getAudioContext();
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return {
      play: () => {
        const whiteNoise = audioCtx.createBufferSource();
        const gainNode = audioCtx.createGain();
        
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        
        whiteNoise.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0.1;
        
        whiteNoise.start();
        currentSoundRef.current = { 
          play: () => {}, 
          stop: () => whiteNoise.stop() 
        };
      },
      stop: () => {
        if (currentSoundRef.current) {
          currentSoundRef.current.stop();
        }
      }
    };
  };

  // Generate Pink Noise (better for meditation)
  const createPinkNoise = () => {
    const audioCtx = getAudioContext();
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    return {
      play: () => {
        const pinkNoise = audioCtx.createBufferSource();
        const gainNode = audioCtx.createGain();
        
        pinkNoise.buffer = buffer;
        pinkNoise.loop = true;
        
        pinkNoise.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0.15;
        
        pinkNoise.start();
        currentSoundRef.current = { 
          play: () => {}, 
          stop: () => pinkNoise.stop() 
        };
      },
      stop: () => {
        if (currentSoundRef.current) {
          currentSoundRef.current.stop();
        }
      }
    };
  };

  // Generate Ocean Waves
  const createOceanWaves = () => {
    const audioCtx = getAudioContext();
    
    return {
      play: () => {
        // Create filtered noise for ocean sound
        const bufferSize = 4 * audioCtx.sampleRate;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);

        // Generate noise with wave-like modulation
        for (let i = 0; i < bufferSize; i++) {
          const time = i / audioCtx.sampleRate;
          const wave1 = Math.sin(time * 0.1 * 2 * Math.PI) * 0.5;
          const wave2 = Math.sin(time * 0.05 * 2 * Math.PI) * 0.3;
          const noise = (Math.random() * 2 - 1) * 0.3;
          output[i] = noise * (wave1 + wave2 + 0.4);
        }

        const source = audioCtx.createBufferSource();
        const filter = audioCtx.createBiquadFilter();
        const gainNode = audioCtx.createGain();

        source.buffer = buffer;
        source.loop = true;

        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0.2;

        source.start();
        currentSoundRef.current = { 
          play: () => {}, 
          stop: () => source.stop() 
        };
      },
      stop: () => {
        if (currentSoundRef.current) {
          currentSoundRef.current.stop();
        }
      }
    };
  };

  // Generate Singing Bowl
  const createSingingBowl = () => {
    const audioCtx = getAudioContext();
    
    return {
      play: () => {
        const oscillator1 = audioCtx.createOscillator();
        const oscillator2 = audioCtx.createOscillator();
        const oscillator3 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // Tibetan singing bowl frequencies (approximated)
        oscillator1.frequency.value = 220; // A3
        oscillator2.frequency.value = 330; // E4 (perfect fifth)
        oscillator3.frequency.value = 440; // A4 (octave)

        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        oscillator3.type = 'sine';

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        oscillator3.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Gentle fade in/out
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 2);
        
        // Create gentle volume oscillation for bowl effect
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 0.1;
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);

        oscillator1.start();
        oscillator2.start();
        oscillator3.start();
        lfo.start();

        currentSoundRef.current = { 
          play: () => {}, 
          stop: () => {
            oscillator1.stop();
            oscillator2.stop();
            oscillator3.stop();
            lfo.stop();
          }
        };
      },
      stop: () => {
        if (currentSoundRef.current) {
          currentSoundRef.current.stop();
        }
      }
    };
  };

  // Generate Binaural Beats (meditation frequency)
  const createBinauralBeats = () => {
    const audioCtx = getAudioContext();
    
    return {
      play: () => {
        const leftOscillator = audioCtx.createOscillator();
        const rightOscillator = audioCtx.createOscillator();
        const leftGain = audioCtx.createGain();
        const rightGain = audioCtx.createGain();
        const merger = audioCtx.createChannelMerger(2);

        // Alpha wave frequency (8-12 Hz difference for relaxation)
        leftOscillator.frequency.value = 200; // Base frequency
        rightOscillator.frequency.value = 210; // 10 Hz difference

        leftOscillator.type = 'sine';
        rightOscillator.type = 'sine';

        leftOscillator.connect(leftGain);
        rightOscillator.connect(rightGain);
        
        leftGain.connect(merger, 0, 0);
        rightGain.connect(merger, 0, 1);
        
        merger.connect(audioCtx.destination);

        leftGain.gain.value = 0.05;
        rightGain.gain.value = 0.05;

        leftOscillator.start();
        rightOscillator.start();

        currentSoundRef.current = { 
          play: () => {}, 
          stop: () => {
            leftOscillator.stop();
            rightOscillator.stop();
          }
        };
      },
      stop: () => {
        if (currentSoundRef.current) {
          currentSoundRef.current.stop();
        }
      }
    };
  };

  // Generate Rain Sounds
  const createRainSounds = () => {
    const audioCtx = getAudioContext();
    
    return {
      play: () => {
        const bufferSize = 4 * audioCtx.sampleRate;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);

        // Generate rain-like noise
        for (let i = 0; i < bufferSize; i++) {
          const droplet = Math.random() < 0.02 ? (Math.random() * 2 - 1) * 0.5 : 0;
          const background = (Math.random() * 2 - 1) * 0.1;
          output[i] = droplet + background;
        }

        const source = audioCtx.createBufferSource();
        const filter1 = audioCtx.createBiquadFilter();
        const filter2 = audioCtx.createBiquadFilter();
        const gainNode = audioCtx.createGain();

        source.buffer = buffer;
        source.loop = true;

        filter1.type = 'highpass';
        filter1.frequency.value = 400;
        
        filter2.type = 'lowpass';
        filter2.frequency.value = 8000;

        source.connect(filter1);
        filter1.connect(filter2);
        filter2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0.3;

        source.start();
        currentSoundRef.current = { 
          play: () => {}, 
          stop: () => source.stop() 
        };
      },
      stop: () => {
        if (currentSoundRef.current) {
          currentSoundRef.current.stop();
        }
      }
    };
  };

  // Generated meditation sounds - no external files needed!
  const sounds: Sound[] = [
    { 
      name: 'Ocean Waves', 
      emoji: '🌊', 
      generator: createOceanWaves
    },
    { 
      name: 'Rain Sounds', 
      emoji: '🌧️', 
      generator: createRainSounds
    },
    { 
      name: 'Singing Bowl', 
      emoji: '🔔', 
      generator: createSingingBowl
    },
    { 
      name: 'White Noise', 
      emoji: '⚪', 
      generator: createWhiteNoise
    },
    { 
      name: 'Pink Noise', 
      emoji: '🌸', 
      generator: createPinkNoise
    },
    { 
      name: 'Binaural Beats', 
      emoji: '🧘‍♂️', 
      generator: createBinauralBeats
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
    if (currentSoundRef.current) {
      currentSoundRef.current.stop();
      currentSoundRef.current = null;
    }
  };

  const formatTime = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioError = (error: string) => {
    console.error('Audio error:', error);
    setAudioError(error);
    setTimeout(() => setAudioError(null), 3000);
  };

  const startMeditation = async () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds === 0) return;

    try {
      // Resume audio context if suspended (required by browsers)
      const audioCtx = getAudioContext();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      setTimeLeft(totalSeconds);
      setIsPlaying(true);
      setIsPaused(false);
      setAudioError(null);

      // Start selected sound
      if (selectedSound) {
        try {
          currentSoundRef.current = selectedSound.generator();
          currentSoundRef.current.play();
        } catch (error) {
          handleAudioError('Sound generation failed, continuing in silence');
        }
      }

      // Start meditation timer
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

    } catch (error) {
      handleAudioError('Audio context failed to start');
    }
  };

  const pauseResumeMeditation = async () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      
      try {
        const audioCtx = getAudioContext();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
      } catch (error) {
        console.error('Failed to resume audio context');
      }

      if (selectedSound && !currentSoundRef.current) {
        try {
          currentSoundRef.current = selectedSound.generator();
          currentSoundRef.current.play();
        } catch (error) {
          // Audio might not work, but meditation continues
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
      // Pause
      setIsPaused(true);
      if (currentSoundRef.current) {
        currentSoundRef.current.stop();
        currentSoundRef.current = null;
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

  return (
    <>
      {/* Background Blur Overlay */}
      {showMoodModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-md"
          style={{ zIndex: 40 }}
        />
      )}

      {/* Main Container */}
      <div className="bg-dark text-light">
        <div className="px-4 py-6 pb-32 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
          {isPlaying && <AnimatedBackground />}
          
          <div className="max-w-lg mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 glass rounded-2xl border border-accent-color/20">
                <span className="text-3xl">🧘‍♀️</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Meditate</h1>
              <p className="text-secondary-text text-base">Find your inner peace</p>
            </div>

            {/* Error Message */}
            {audioError && (
              <div className="p-3 glass rounded-2xl border border-yellow-400/30 bg-yellow-500/10">
                <p className="text-yellow-300 text-sm text-center">{audioError}</p>
              </div>
            )}

            {/* Timer Display */}
            <div className="glass rounded-3xl p-6 sm:p-8 border border-accent-color/30 text-center">
              <div className="text-5xl sm:text-6xl font-mono font-bold gradient-text mb-4 tracking-wider">
                {isPlaying ? formatTime(timeLeft) : formatTime(hours * 3600 + minutes * 60 + seconds)}
              </div>
              
              {!isPlaying && (
                <div className="flex justify-center items-end space-x-6 sm:space-x-8">
                  {(['hours', 'minutes', 'seconds'] as const).map((type) => {
                    const value = type === 'hours' ? hours : type === 'minutes' ? minutes : seconds;
                    return (
                      <div key={type} className="flex flex-col items-center">
                        <button
                          onClick={() => adjustTime(type, true)}
                          className="w-8 h-8 glass rounded-full border border-accent-color/30 text-primary-text hover:border-accent-color hover:bg-accent-color/20 transition-all duration-200 mb-2 flex items-center justify-center text-sm font-bold hover:scale-110"
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
                        >
                          -
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sound Selection */}
            {!isPlaying && (
              <div className="glass rounded-3xl p-6 border border-accent-color/30">
                <h3 className="text-lg font-bold text-primary-text mb-4 text-center">
                  Generated Ambient Sounds
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedSound(null)}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-300 hover:scale-105 ${
                      selectedSound === null
                        ? 'border-accent-color bg-accent-color/20 shadow-lg'
                        : 'border-accent-bg/30 hover:border-accent-color/50 hover:bg-accent-color/10'
                    }`}
                  >
                    <span className="text-2xl mb-1">🔇</span>
                    <span className="text-xs text-primary-text font-medium">Silence</span>
                  </button>
                  {sounds.map((sound) => (
                    <button
                      key={sound.name}
                      onClick={() => setSelectedSound(sound)}
                      className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-300 hover:scale-105 ${
                        selectedSound?.name === sound.name
                          ? 'border-accent-color bg-accent-color/20 shadow-lg'
                          : 'border-accent-bg/30 hover:border-accent-color/50 hover:bg-accent-color/10'
                      }`}
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

            {/* Controls */}
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

            {/* Session Status */}
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

            {/* Info */}
            <div className="text-center space-y-2">
              <p className="text-xs text-secondary-text/80">
                ✨ All sounds generated in real-time - no files needed!
              </p>
              <p className="text-xs text-secondary-text/60">
                Click any sound button to hear a preview
              </p>
            </div>
          </div>
        </div>
      </div>

      <MoodModal
        isVisible={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onMoodSelect={handleMoodSelect}
      />
    </>
  );
};

export default Meditate;
