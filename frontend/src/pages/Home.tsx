import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { moodAPI } from '../utils/api';
import CustomButton from '../components/CustomButton';

interface MoodData {
  name: string;
  emoji: string;
  color: string;
  gradient: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodResponse, setMoodResponse] = useState<string>('');

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

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    
    // Send mood-aware message to AI
    try {
      const moodMessages = {
        'Calm': `Hello, I'm feeling calm today. I'd like some peaceful thoughts and mindfulness advice.`,
        'Happy': `Hi there! I'm feeling really happy today! Share in my joy and give me some positive energy.`,
        'Anxious': `I'm feeling anxious right now. Can you help me feel more grounded and provide some calming words?`,
        'Sad': `I'm feeling sad today. I could use some gentle support and understanding words.`
      };
      
      const response = await moodAPI.sendMoodMessage(
        moodMessages[mood as keyof typeof moodMessages] || `I'm feeling ${mood.toLowerCase()} today.`,
        mood.toLowerCase()
      );
      
      if (response.response) {
        setMoodResponse(response.response);
      }
    } catch (error) {
      console.error('Error sending mood message:', error);
      setMoodResponse("I'm here for you. How can I help you feel better today?");
    }
  };

  const stats = [
    { label: 'Chat Sessions', value: '12', icon: '💬' },
    { label: 'Journal Entries', value: '8', icon: '📔' },
    { label: 'Meditation Minutes', value: '45', icon: '🧘‍♀️' },
  ];

  const quickActions = [
    { name: 'Start AI Chat', path: '/chat', icon: '💬', gradient: 'from-blue-500 to-purple-600' },
    { name: 'Write Journal', path: '/journal', icon: '📝', gradient: 'from-green-500 to-teal-600' },
    { name: 'Meditate Now', path: '/meditate', icon: '🧘‍♀️', gradient: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-accent-color/5 to-teal-400/5 animate-pulse"
            style={{
              width: `${Math.random() * 120 + 40}px`,
              height: `${Math.random() * 120 + 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 4 + 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Profile Section */}
        <div className="flex justify-end mb-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-light font-medium">Welcome back, {user?.username}!</p>
                <p className="text-medium text-sm">{user?.email}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-accent-color to-teal-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{user?.username?.charAt(0).toUpperCase()}</span>
              </div>
              <CustomButton
                title="Logout"
                onPress={logout}
                variant="secondary"
                size="sm"
                className="ml-2"
              />
            </div>
          ) : (
            <div className="flex gap-3">
              <CustomButton
                title="Sign In"
                onPress={() => navigate('/signin')}
                variant="secondary"
                size="sm"
              />
              <CustomButton
                title="Sign Up"
                onPress={() => navigate('/signup')}
                variant="primary"
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-accent-color via-teal-400 to-blue-500 rounded-full mb-4 sm:mb-6 shadow-2xl animate-pulse">
              <span className="text-4xl sm:text-5xl">🌟</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-accent-color via-teal-400 to-blue-500 bg-clip-text text-transparent">
              {greeting}!
            </span>
            <div className="text-3xl sm:text-5xl lg:text-6xl mt-2 animate-bounce">👋</div>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-medium max-w-2xl lg:max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8">
            Your personal <span className="text-accent-color font-semibold">AI mental wellness companion</span> is here to support, listen, and guide you on your journey.
          </p>
          
          <button
            onClick={() => navigate('/chat')}
            className="inline-flex items-center px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-accent-color via-teal-400 to-blue-500 text-white font-bold text-lg sm:text-xl rounded-2xl shadow-2xl hover:shadow-accent-color/25 hover:scale-105 transition-all duration-300 animate-pulse"
          >
            <span className="mr-2">💬</span>
            Start Talking Now
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-dark/40 backdrop-blur-sm border border-medium/20 rounded-2xl p-4 sm:p-6 text-center transition-all duration-300 hover:bg-dark/60 hover:border-accent-color/30 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-2xl sm:text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl sm:text-3xl font-bold text-accent-color mb-1">{stat.value}</div>
              <div className="text-sm sm:text-base text-medium font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mood Check-in */}
        <div className="bg-dark/30 backdrop-blur-sm border border-medium/20 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-light mb-6 flex items-center">
            <span className="mr-3 text-3xl">💭</span>
            How are you feeling today?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {moods.map((mood) => (
              <button
                key={mood.name}
                onClick={() => handleMoodSelect(mood.name)}
                className={`group relative p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 transform ${
                  selectedMood === mood.name
                    ? 'border-accent-color bg-accent-color/10 shadow-lg scale-105' 
                    : 'border-medium/30 hover:border-accent-color/50 hover:bg-dark/20 hover:scale-105'
                }`}
              >
                <div className={`text-3xl sm:text-4xl mb-2 transition-transform duration-300 ${
                  selectedMood === mood.name ? 'animate-bounce' : 'group-hover:scale-110'
                }`}>
                  {mood.emoji}
                </div>
                <div className="text-light font-semibold text-sm sm:text-base">{mood.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mood Response */}
        {selectedMood && moodResponse && (
          <div className="bg-gradient-to-r from-accent-color/10 to-teal-400/10 backdrop-blur-sm border border-accent-color/30 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 shadow-xl animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-light mb-4 flex items-center">
              <span className="mr-3 text-3xl">
                {moods.find(m => m.name === selectedMood)?.emoji || '💭'}
              </span>
              Your MindfulMate Response
            </h2>
            <div className="bg-dark/20 rounded-2xl p-4 sm:p-6 border border-accent-color/20">
              <p className="text-light leading-relaxed text-base sm:text-lg">
                {moodResponse}
              </p>
              {isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-accent-color/20 flex justify-center">
                  <CustomButton
                    title="Continue Chat"
                    onPress={() => navigate('/chat')}
                    variant="primary"
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-accent-color/5 to-teal-400/5 backdrop-blur-sm border border-accent-color/20 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-light mb-6 flex items-center">
            <span className="mr-3 text-3xl">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {quickActions.map((action, index) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`group bg-gradient-to-r ${action.gradient} p-6 sm:p-7 rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95`}
              >
                <div className="text-3xl sm:text-4xl mb-3 group-hover:animate-bounce">{action.icon}</div>
                <div className="text-base sm:text-lg">{action.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Journaling Card */}
          <div className="bg-dark/40 backdrop-blur-sm border border-medium/20 rounded-3xl p-6 sm:p-8 shadow-xl transition-all duration-300 hover:bg-dark/50 hover:border-accent-color/30 hover:shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl sm:text-3xl">📔</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-light">Digital Journaling</h3>
            </div>
            <p className="text-medium mb-6 leading-relaxed text-sm sm:text-base">
              Express your thoughts, track your emotions, and reflect on your personal growth journey with our intelligent journaling system.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CustomButton
                title="Start Writing"
                onPress={() => navigate('/journal')}
                variant="secondary"
                className="transition-all duration-300 hover:scale-105"
              />
              <div className="text-sm text-accent-color font-medium">
                ✨ AI-powered insights
              </div>
            </div>
          </div>

          {/* Meditation Card */}
          <div className="bg-dark/40 backdrop-blur-sm border border-medium/20 rounded-3xl p-6 sm:p-8 shadow-xl transition-all duration-300 hover:bg-dark/50 hover:border-accent-color/30 hover:shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl sm:text-3xl">🧘‍♀️</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-light">Guided Meditation</h3>
            </div>
            <p className="text-medium mb-6 leading-relaxed text-sm sm:text-base">
              Find your inner peace with customizable meditation sessions, ambient soundscapes, and mindfulness exercises.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CustomButton
                title="Begin Session"
                onPress={() => navigate('/meditate')}
                variant="secondary"
                className="transition-all duration-300 hover:scale-105"
              />
              <div className="text-sm text-accent-color font-medium">
                🎵 6 ambient sounds
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="text-center p-6 sm:p-8 bg-dark/30 backdrop-blur-sm border border-medium/20 rounded-3xl shadow-xl">
          <div className="text-accent-color text-4xl sm:text-5xl mb-4 animate-pulse">💎</div>
          <blockquote className="text-lg sm:text-xl text-light font-medium italic mb-3 leading-relaxed max-w-4xl mx-auto">
            "The greatest revolution of our generation is the discovery that human beings, by changing the inner attitudes of their minds, can change the outer aspects of their lives."
          </blockquote>
          <cite className="text-medium font-medium">— William James</cite>
        </div>
      </div>
    </div>
  );
};

export default Home;
