import React from 'react';
import Modal from 'react-modal';

interface MoodModalProps {
  isVisible: boolean;
  onClose: () => void;
  onMoodSelect: (mood: string) => void;
}

const MoodModal: React.FC<MoodModalProps> = ({ isVisible, onClose, onMoodSelect }) => {
  const moods = [
    { name: 'Happy', emoji: '😊', color: '#FFD700', gradient: 'from-yellow-400 to-orange-400' },
    { name: 'Sad', emoji: '😢', color: '#87CEEB', gradient: 'from-blue-400 to-cyan-400' },
    { name: 'Neutral', emoji: '😐', color: '#D1EAEC', gradient: 'from-gray-400 to-slate-400' },
    { name: 'Calm', emoji: '😌', color: '#98FB98', gradient: 'from-green-400 to-emerald-400' },
    { name: 'Anxious', emoji: '😰', color: '#FFA07A', gradient: 'from-red-400 to-rose-400' },
  ];

  const handleMoodSelect = (mood: string) => {
    onMoodSelect(mood);
    onClose();
  };

  return (
    <Modal
      isOpen={isVisible}
      onRequestClose={onClose}
      className="relative max-w-sm sm:max-w-md lg:max-w-lg mx-auto mt-8 sm:mt-12 lg:mt-20 p-6 sm:p-8 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl animate-scale-in"
      overlayClassName="fixed inset-0 flex items-start justify-center p-4 sm:p-6"
      style={{
        overlay: {
          zIndex: 50,
          backgroundColor: 'transparent',
        },
        content: {
          zIndex: 51,
        }
      }}
      contentLabel="Mood Selection"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
      
      <div className="relative text-center">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white/10 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
            <span className="text-2xl">💭</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
            How are you feeling?
          </h2>
          <p className="text-white/70 text-base sm:text-lg">Select your current mood</p>
        </div>
        
        {/* Enhanced Mood Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {moods.map((mood) => (
            <button
              key={mood.name}
              onClick={() => handleMoodSelect(mood.name)}
              className="group relative flex flex-col items-center p-4 sm:p-6 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all duration-500 hover:scale-110 hover:shadow-2xl"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Gradient Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${mood.gradient} opacity-0 group-hover:opacity-20 rounded-2xl blur-lg transition-opacity duration-500`} />
              
              <div className="relative">
                <span className="text-4xl sm:text-5xl mb-3 block group-hover:scale-125 transition-transform duration-300">
                  {mood.emoji}
                </span>
                <span className="text-white text-sm sm:text-base font-medium group-hover:text-white transition-colors duration-300">
                  {mood.name}
                </span>
              </div>

              {/* Ripple Effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-active:opacity-30 bg-white transition-opacity duration-150" />
            </button>
          ))}
        </div>
        
        {/* Enhanced Skip Button */}
        <button
          onClick={onClose}
          className="group relative px-8 py-3 text-white/70 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-md border border-transparent hover:border-white/20"
          style={{ pointerEvents: 'auto' }}
        >
          <span className="relative z-10">Skip for now</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
        </button>
      </div>
    </Modal>
  );
};

export default MoodModal;
