import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';

interface Slide {
  title: string;
  description: string;
  emoji: string;
}

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      title: "Welcome to Mental Health Companion",
      description: "Your AI-powered mental health friend, here to support you through every emotion.",
      emoji: "🤖"
    },
    {
      title: "Chat with Your AI Companion",
      description: "Have meaningful conversations about your feelings, thoughts, and daily experiences.",
      emoji: "💬"
    },
    {
      title: "Journal Your Journey",
      description: "Record your thoughts, track your moods, and reflect on your emotional growth.",
      emoji: "📔"
    },
    {
      title: "Find Inner Peace",
      description: "Relax with guided meditation sessions and soothing ambient sounds.",
      emoji: "🧘‍♀️"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/signin');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipToSignIn = () => {
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-dark text-light flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Skip Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={skipToSignIn}
            className="text-medium hover:text-light transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Slide Content */}
        <div className="mb-12">
          <div className="text-8xl mb-6">
            {slides[currentSlide].emoji}
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {slides[currentSlide].title}
          </h1>
          <p className="text-medium text-lg leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-light' : 'bg-medium/30'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between space-x-4">
          <CustomButton
            title="Previous"
            onPress={prevSlide}
            variant="secondary"
            disabled={currentSlide === 0}
            className="flex-1"
          />
          <CustomButton
            title={currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            onPress={nextSlide}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
