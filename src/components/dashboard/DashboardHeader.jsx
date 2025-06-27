import React, { useState, useEffect } from 'react';
import { FiUser, FiBell, FiSettings,  } from 'react-icons/fi';
import { FaSun } from 'react-icons/fa';

const DashboardHeader = () => {
  const [userName, setUserName] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Récupérer le nom de l'utilisateur connecté
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('https://www.emkit.site/api/v1/auth/users/me/', {
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

    // Mettre à jour la date et l'heure
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
      setCurrentTime(now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    };

    fetchUserData();
    updateDateTime();
    
    // Mettre à jour l'heure chaque minute
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex-1 mb-4 sm:mb-0">
          <div className="flex items-center">
            <FaSun className="text-yellow-300 text-2xl mr-3 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold">
                Bonjour {userName || 'utilisateur'}
              </h1>
              <p className="text-blue-100 flex items-center mt-1">
                <span className="mr-2">📅</span> 
                {currentDate}
                <span className="mx-3">|</span>
                <span className="mr-2">🕒</span> 
                {currentTime}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-blue-500 transition-all">
            <FiBell className="text-xl" />
            <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>
          
          <button className="p-2 rounded-full hover:bg-blue-500 transition-all">
            <FiSettings className="text-xl" />
          </button>
          
          <div className="flex items-center ml-2">
            <div className="bg-white bg-opacity-20 p-1 rounded-full">
              <div className="bg-gray-200 border-2 border-white rounded-full w-10 h-10 flex items-center justify-center">
                <FiUser className="text-blue-800 text-xl" />
              </div>
            </div>
            <div className="ml-3 hidden md:block">
              <p className="font-medium">{userName || 'Utilisateur'}</p>
              <p className="text-blue-100 text-sm"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;