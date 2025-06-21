import React from 'react';
import UserProfile from './UserProfile';
import { 
  HiHome,  HiTruck, HiUserGroup,  HiOutlineLogout, HiOutlineUserCircle, HiOutlineDocumentText  
} from 'react-icons/hi';

import { FaUserPlus } from 'react-icons/fa';
import { FaBolt } from 'react-icons/fa';
import { FaUserShield } from 'react-icons/fa';
import { FaCrown } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Appel à l'API de déconnexion
      const refreshToken = localStorage.getItem('refreshToken');
      await fetch('http://localhost:8000/auth/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ refresh: refreshToken })
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer les tokens et rediriger
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const menuItems = [
    { 
      label: "Dashboard", 
      icon: <HiHome className="text-xl" />,
      path: "/dashboard" 
    }, 
    { 
      label: "SuperAdministrators", 
      icon: <FaCrown className="text-xl" />,
      path: "/dashboard/SuperAdministrators"
    },
    { 
      label: "Administrators", 
      icon: <FaUserShield className="text-xl" />,
      path: "/dashboard/Administrators"
    },
    { 
      label: "Suppliers", 
      icon: <FaBolt className="text-xl" />,
      path: "/dashboard/suppliers" 
    },
    { 
      label: "Users", 
      icon: <HiUserGroup className="text-xl" />,
      path: "/dashboard/users"
    },
    { 
      label: "Subscribers", 
      icon: <FaUserPlus className="text-xl" />, 
      path: "/dashboard/subscribers"
    },
    { 
      label: "Accounts", 
      icon: <HiOutlineUserCircle className="text-xl" />,
      path: "/dashboard/accounts"
    },
    { 
      label: "Bills", 
      icon: <HiOutlineDocumentText className="text-xl" />,
      path: "/dashboard/bills"
    },
    { 
      label: "Map", 
      icon: <HiTruck className="text-xl" />,
      path: "/dashboard/map"
    },
    { 
      label: "Sign out", 
      icon: <HiOutlineLogout className="text-xl" />,
      action: handleLogout
    },
  ];

  return (
    <aside 
      className={`bg-black text-white h-full transform transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      } flex flex-col`}
    >
      {/* Profil utilisateur */}
      <UserProfile isOpen={isOpen} />
      
      {/* Séparateur */}
      <div className="px-5 py-3">
        <div className="border-t border-gray-700"></div>
      </div>
      
      {/* Titre du menu */}
      <div className="px-5 py-2">
        <h2 className={`font-bold uppercase text-sm text-gray-400 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}>MAIN MENU</h2>
      </div>
      
      {/* Items du menu */}
      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item, index) => (
          item.action ? (
            <button
              key={index}
              onClick={item.action}
              className={`
                flex items-center w-full py-3 px-5 text-left
                hover:bg-gray-800 transition-colors duration-200
                ${isOpen ? 'justify-start' : 'justify-center'}
              `}
            >
              <div className="flex-shrink-0 text-gray-300">
                {item.icon}
              </div>
              
              <span className={`
                ml-3 text-gray-300 transition-opacity
                ${isOpen ? 'opacity-100' : 'opacity-0'}
              `}>
                {item.label}
              </span>
            </button>
          ) : (
            <NavLink 
              key={index}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center w-full py-3 px-5 text-left
                 hover:bg-gray-800 transition-colors duration-200
                 ${isOpen ? 'justify-start' : 'justify-center'}
                 ${isActive ? 'bg-gray-800 border-l-4 border-indigo-500' : ''}`
              }
            >
              <div className="flex-shrink-0 text-gray-300">
                {item.icon}
              </div>
              
              <span className={`
                ml-3 text-gray-300 transition-opacity
                ${isOpen ? 'opacity-100' : 'opacity-0'}
              `}>
                {item.label}
              </span>
            </NavLink>
          )
        ))}
      </nav>
      
      {/* Bouton de réduction/expansion */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={toggleSidebar}
          className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400"
        >
          <div className="transform transition-transform duration-300">
            {isOpen ? "<<" : ">>"}
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;