import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const UserProfileDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="bg-white bg-opacity-20 p-1 rounded-full">
          <div className="bg-gray-200 border-2 border-white rounded-full w-10 h-10 flex items-center justify-center">
            <FiUser className="text-blue-800 text-xl" />
          </div>
        </div>
        <div className="ml-3 hidden md:block">
          <p className="font-medium text-white">{user?.nom || 'Utilisateur'}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.nom || 'Utilisateur'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FiUser className="mr-3 text-gray-500" />
              <span>Mon profil</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FiSettings className="mr-3 text-gray-500" />
              <span>Paramètres du compte</span>
            </button>
          </div>
          
          <div className="py-1 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <FiLogOut className="mr-3" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;