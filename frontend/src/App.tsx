import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Modal from 'react-modal';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Journal from './pages/Journal';
import UserJournals from './pages/UserJournals';
import PastJournals from './pages/PastJournals';
import Meditate from './pages/Meditate';

function App() {
  useEffect(() => {
    // Set app element for react-modal accessibility
    Modal.setAppElement('#root');
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-primary-bg">
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
              <Route path="/user-journals" element={<UserJournals />} />
              <Route path="/past-journals" element={<PastJournals />} />
              <Route path="/meditate" element={<Meditate />} />
            </Route>
            
            {/* Chat Route (standalone) */}
            <Route path="/chat" element={<Chat />} />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
