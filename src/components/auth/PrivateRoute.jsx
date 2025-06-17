// src/components/auth/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

// Vérifie si un token est stocké
const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return Boolean(token);
};

/**
 * PrivateRoute protège une route :
 * si l'utilisateur est authentifié (token présent), on affiche le contenu
 * sinon on redirige vers /login
 */
export default function PrivateRoute({ children }) {
  return isAuthenticated()
    ? children
    : <Navigate to="/login" replace />;
}
