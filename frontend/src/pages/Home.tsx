import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';

interface MoodData {
  name: string;
  emoji: string;
  color: string;
  gradient: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else if (hour < 21) {
      setGreeting('Good Evening');
    } else {
      setGreeting('Good Night');
    }
  }, []);

  const moods: MoodData[] = [
    { name: 'Calm', emoji: '😌', color: '#4fd1c7', gradient: 'from-teal-400 to-blue-500' },
    { name: 'Happy', emoji: '😊', color: '#68d391', gradient: 'from-green-400 to-green-600' },
    { name: 'Anxious', emoji: '😰', color: '#f6e05e', gradient: 'from-yellow-400 to-orange-500' },
    { name: 'Sad', emoji: '😢', color: '#fc8181', gradient: 'from-blue-400 to-blue-600' },
  ];

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    // TODO: Send mood to backend
  };

  const stats = [
    { label: 'Chat Sessions', value: '12', icon: '💬' },
    { label: 'Journal Entries', value: '8', icon: '📔' },
    { label: 'Meditation Minutes', value: '45', icon: '🧘‍♀️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-bg via-secondary-bg to-primary-bg overflow-hidden relative">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-accent-color/10 to-teal-400/10 animate-pulse"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-accent-color via-teal-400 to-blue-500 rounded-full mb-6 shadow-2xl animate-pulse">
              <span className="text-5xl">🌟</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="gradient-text">{greeting}!</span> 
            <div className="text-4xl md:text-6xl mt-2">👋</div>
          </h1>
          <p className="text-2xl text-secondary-text max-w-3xl mx-auto leading-relaxed">
            Your personal <span className="text-accent-color font-semibold">AI mental wellness companion</span> is here to support, listen, and guide you.
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigate('/chat')}
              className="px-12 py-4 bg-gradient-to-r from-accent-color via-teal-400 to-blue-500 text-white font-bold text-xl rounded-full shadow-2xl hover:shadow-accent-color/25 hover:scale-110 transition-all duration-300 animate-pulse"
            >
              💬 Start Talking Now
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass rounded-custom p-4 text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-accent-color">{stat.value}</div>
              <div className="text-sm text-secondary-text">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mood Check-in */}
        <div className="bg-secondary-bg/50 backdrop-blur-sm border border-accent-bg rounded-custom-lg p-6 mb-8 shadow-medium">
          <h2 className="text-2xl font-semibold text-primary-text mb-6 flex items-center">
            <span className="mr-3">💭</span>
            How are you feeling today?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.name}
                onClick={() => handleMoodSelect(mood.name)}
                className={`p-4 rounded-custom border-2 transition-all duration-300 btn-hover ${
                  selectedMood === mood.name
                    ? 'border-accent-color bg-accent-color/10 shadow-medium'
                    : 'border-accent-bg hover:border-accent-color/50'
                }`}
              >
                <div className="text-3xl mb-2">{mood.emoji}</div>
                <div className="text-primary-text font-medium">{mood.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-accent-color/10 to-teal-400/10 backdrop-blur-sm border border-accent-color/30 rounded-custom-lg p-6 mb-8 shadow-medium">
          <h2 className="text-2xl font-semibold text-primary-text mb-6 flex items-center">
            <span className="mr-3">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/chat')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-custom text-white font-semibold shadow-medium hover:shadow-large transition-all duration-300 btn-hover"
            >
              <div className="text-3xl mb-2">💬</div>
              <div>Start AI Chat</div>
            </button>
            <button
              onClick={() => navigate('/journal')}
              className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-custom text-white font-semibold shadow-medium hover:shadow-large transition-all duration-300 btn-hover"
            >
              <div className="text-3xl mb-2">📝</div>
              <div>Write Journal</div>
            </button>
            <button
              onClick={() => navigate('/meditate')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-custom text-white font-semibold shadow-medium hover:shadow-large transition-all duration-300 btn-hover"
            >
              <div className="text-3xl mb-2">🧘‍♀️</div>
              <div>Meditate Now</div>
            </button>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Journaling Card */}
          <div className="glass rounded-custom-lg p-8 shadow-medium hover:shadow-large transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">📔</span>
              </div>
              <h3 className="text-2xl font-semibold text-primary-text">Digital Journaling</h3>
            </div>
            <p className="text-secondary-text mb-6 leading-relaxed">
              Express your thoughts, track your emotions, and reflect on your personal growth journey with our intelligent journaling system.
            </p>
            <div className="flex items-center justify-between">
              <CustomButton
                title="Start Writing"
                onPress={() => navigate('/journal')}
                variant="secondary"
                className="btn-hover"
              />
              <div className="text-sm text-secondary-text">
                ✨ AI-powered insights
              </div>
            </div>
          </div>

          {/* Meditation Card */}
          <div className="glass rounded-custom-lg p-8 shadow-medium hover:shadow-large transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🧘‍♀️</span>
              </div>
              <h3 className="text-2xl font-semibold text-primary-text">Guided Meditation</h3>
            </div>
            <p className="text-secondary-text mb-6 leading-relaxed">
              Find your inner peace with customizable meditation sessions, ambient soundscapes, and mindfulness exercises.
            </p>
            <div className="flex items-center justify-between">
              <CustomButton
                title="Begin Session"
                onPress={() => navigate('/meditate')}
                variant="secondary"
                className="btn-hover"
              />
              <div className="text-sm text-secondary-text">
                🎵 6 ambient sounds
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="text-center mt-12 p-6 glass rounded-custom-lg">
          <div className="text-accent-color text-4xl mb-4">💎</div>
          <blockquote className="text-xl text-primary-text font-medium italic mb-2">
            "The greatest revolution of our generation is the discovery that human beings, by changing the inner attitudes of their minds, can change the outer aspects of their lives."
          </blockquote>
          <cite className="text-secondary-text">— William James</cite>
        </div>
      </div>
    </div>
  );
};

export default Home;
