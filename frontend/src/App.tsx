import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Modal from 'react-modal';
import Layout from './components/Layout';
import ConnectionStatus from './components/ConnectionStatus';
import Welcome from './pages/Welcome';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Journal from './pages/Journal';
import Meditate from './pages/Meditate';

function App() {
  useEffect(() => {
    // Set app element for react-modal accessibility
    Modal.setAppElement('#root');
  }, []);

  return (
    <Router>
      <div className="App min-h-screen bg-primary-bg">
        <ConnectionStatus />
        <Routes>
          {/* Authentication Routes */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Main App Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/meditate" element={<Meditate />} />
          </Route>
          
          {/* Chat Route (standalone) */}
          <Route path="/chat" element={<Chat />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
