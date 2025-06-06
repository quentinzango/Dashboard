//import logo from './logo.svg';
import './App.css';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import LayoutComponent from './components/layout/LayoutComponent';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<LayoutComponent />} />
      <Route path="/dashboard" element={<LayoutComponent />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;