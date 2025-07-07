import React, { useState, useEffect } from 'react';
import { FiBell, FiSettings } from 'react-icons/fi';
import { FaSun } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import UserProfileDropdown from './UserProfileDropdown';

const DashboardHeader = () => {
  const [userName, setUserName] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const notificationsCount = 3; // Valeur temporaire

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('https://www.emkit.site/api/v1/auth/users/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const userData = await response.json();
        setUserName(userData.nom);
        setUserEmail(userData.email);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

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
                Bienvenue {userName || 'utilisateur'}
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
          <Link 
            to="/dashboard/notifications" 
            className="relative p-2 rounded-full hover:bg-blue-500 transition-all"
          >
            <FiBell className="text-xl" />
            {notificationsCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notificationsCount}
              </span>
            )}
          </Link>
          
          <button className="p-2 rounded-full hover:bg-blue-500 transition-all">
            <FiSettings className="text-xl" />
          </button>
          
          <UserProfileDropdown user={{ nom: userName, email: userEmail }} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;