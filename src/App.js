import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/Login';
import LayoutComponent from './components/layout/LayoutComponent';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/dashboard/*" 
          element={
            <PrivateRoute>
              <LayoutComponent />
            </PrivateRoute>
          } 
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
