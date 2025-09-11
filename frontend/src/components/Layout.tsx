import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark text-light">
      <Outlet />
      <Navigation />
    </div>
  );
};

export default Layout;
