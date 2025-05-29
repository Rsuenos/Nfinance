// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AppContent from './components/AppContent';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;