import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary-bg to-dark text-light flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent-color/10 via-transparent to-teal-400/10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      </div>
      
      {/* Main content area with proper spacing for navigation */}
      <main className="flex-1 relative z-10 pb-20 sm:pb-24 min-h-screen">
        <Outlet />
      </main>
      
      {/* Fixed bottom navigation */}
      <Navigation />
    </div>
  );
};

export default Layout;
