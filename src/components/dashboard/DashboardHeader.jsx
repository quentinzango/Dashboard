import React, { useState, useEffect } from 'react';

const DashboardHeader = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Récupérer le nom de l'utilisateur connecté
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // Appel API pour récupérer les données de l'utilisateur
        const response = await fetch('http://localhost:8000/api/v1/auth/users/me/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const userData = await response.json();
        setUserName(userData.nom);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour {userName || 'utilisateur'}
          </h1>
         
        </div>
        
        <div className="flex items-center">
          <div className="bg-gray-300 border-2 border-dashed rounded-xl w-12 h-12" />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;