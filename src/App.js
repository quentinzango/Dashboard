// src/App.js
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import LayoutComponent from './components/layout/LayoutComponent';
import PrivateRoute from './components/auth/PrivateRoute';
import DisjoncteursPage from './components/layout/DisjoncteursPage';



function App() {
  return (
    <Router>
      <Routes>
        {/* Routes protégées */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard/*" element={<LayoutComponent />} />
          <Route path="/subscribers/:id/disjoncteurs" element={<DisjoncteursPage />} />
        </Route>
        
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;