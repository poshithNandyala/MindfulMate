import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Home', path: '/home', icon: '🏠' },
    { name: 'Journal', path: '/journal', icon: '📔' },
    { name: 'Meditate', path: '/meditate', icon: '🧘‍♀️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark border-t border-medium p-4">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              location.pathname === tab.path 
                ? 'text-light bg-medium/20' 
                : 'text-medium hover:text-light'
            }`}
          >
            <span className="text-2xl mb-1">{tab.icon}</span>
            <span className="text-sm font-medium">{tab.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
