import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    { name: 'Home', path: '/home', icon: '🏠' },
    { name: 'Chat', path: '/chat', icon: '💬' },
    { name: 'Journal', path: '/journal', icon: '📔' },
    { name: 'Meditate', path: '/meditate', icon: '🧘‍♀️' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-lg border-t border-medium/30 shadow-2xl z-50">
      <div className="safe-area-bottom">
        <div className="flex justify-around items-center px-2 py-2 sm:py-3 max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 sm:px-3 sm:py-3 rounded-xl transition-all duration-300 transform ${
                  isActive
                    ? 'text-light bg-medium/30 shadow-lg scale-105 -translate-y-0.5' 
                    : 'text-medium hover:text-light hover:bg-medium/10 hover:scale-105 active:scale-95'
                }`}
              >
                <span className={`text-xl sm:text-2xl mb-1 transition-transform duration-300 ${
                  isActive ? 'animate-bounce' : ''
                }`}>
                  {tab.icon}
                </span>
                <span className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isActive ? 'font-semibold' : 'font-normal'
                }`}>
                  {tab.name}
                </span>
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-accent-color rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
