import React from 'react';
import Modal from 'react-modal';

interface MoodModalProps {
  isVisible: boolean;
  onClose: () => void;
  onMoodSelect: (mood: string) => void;
}

const MoodModal: React.FC<MoodModalProps> = ({ isVisible, onClose, onMoodSelect }) => {
  const moods = [
    { name: 'Happy', emoji: '😊', color: '#FFD700' },
    { name: 'Sad', emoji: '😢', color: '#87CEEB' },
    { name: 'Neutral', emoji: '😐', color: '#D1EAEC' },
    { name: 'Calm', emoji: '😌', color: '#98FB98' },
    { name: 'Anxious', emoji: '😰', color: '#FFA07A' },
  ];

  const handleMoodSelect = (mood: string) => {
    onMoodSelect(mood);
    onClose();
  };

  return (
    <Modal
      isOpen={isVisible}
      onRequestClose={onClose}
      className="bg-dark/95 border border-medium rounded-lg p-6 max-w-md mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black/50 flex items-start justify-center p-4"
      contentLabel="Mood Selection"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-light mb-2">How are you feeling?</h2>
        <p className="text-medium mb-6">Select your current mood</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.name}
              onClick={() => handleMoodSelect(mood.name)}
              className="flex flex-col items-center p-4 rounded-lg border border-medium/30 hover:border-light/50 transition-colors"
            >
              <span className="text-4xl mb-2">{mood.emoji}</span>
              <span className="text-light font-medium">{mood.name}</span>
            </button>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="px-6 py-2 text-medium hover:text-light transition-colors"
        >
          Skip for now
        </button>
      </div>
    </Modal>
  );
};

export default MoodModal;
