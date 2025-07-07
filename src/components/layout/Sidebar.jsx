// src/components/layout/Sidebar.jsx
import React from 'react';
import UserProfile from './UserProfile';
import {
  HiHome, HiTruck, HiUserGroup, HiOutlineLogout,
  HiOutlineUserCircle, HiOutlineDocumentText
} from 'react-icons/hi';
import { MdElectricalServices } from 'react-icons/md';
import { FaUserPlus, FaBolt, FaUserShield, FaCrown, FaWrench} from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await fetch('http://localhost:8000/auth/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ refresh: refreshToken })
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const menuItems = [
    { label: "Dashboard",           icon: <HiHome className="text-xl" />,               path: "/dashboard" },
    { label: "SuperAdministrators", icon: <FaCrown className="text-xl" />,              path: "/dashboard/superadministrators" },
    { label: "Administrators",      icon: <FaUserShield className="text-xl" />,         path: "/dashboard/administrators" },
    { label: "Suppliers",           icon: <FaBolt className="text-xl" />,               path: "/dashboard/suppliers" },
    { label: "Users",               icon: <HiUserGroup className="text-xl" />,          path: "/dashboard/users" },
    { label: "Subscribers",         icon: <FaUserPlus className="text-xl" />,           path: "/dashboard/subscribers" },
    { label: "Accounts",            icon: <HiOutlineUserCircle className="text-xl" />,  path: "/dashboard/accounts" },
    { label: "Bills",               icon: <HiOutlineDocumentText className="text-xl" />, path: "/dashboard/bills" },
    { label: "Billings",               icon: <HiOutlineDocumentText className="text-xl" />, path: "/dashboard/billings" },
    { label: "Equipements",         icon: <MdElectricalServices className="text-xl" />, path: "/dashboard/equipements" },
    { label: "Technicians",         icon: <FaWrench className="text-xl" />, path: "/dashboard/technicians" },
    { label: "Map",                 icon: <HiTruck className="text-xl" />,              path: "/dashboard/map" },
    { label: "Sign out",            icon: <HiOutlineLogout className="text-xl" />,      action: handleLogout },
  ];

  return (
    <aside className={`
      bg-black text-white h-full 
      transform transition-all duration-300
      ${isOpen ? 'w-64' : 'w-20'} flex flex-col
    `}>
      <UserProfile isOpen={isOpen} />

      <div className="px-5 py-3">
        <div className="border-t border-gray-700" />
      </div>

      

      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item, idx) => {
          const base = `
            flex items-center w-full py-3 px-5
            transition-all duration-300
            ${isOpen ? 'justify-start' : 'justify-center'}
          `;

          if (item.action) {
            return (
              <button
                key={idx}
                onClick={item.action}
                className={`${base} hover:bg-gray-800`}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                {isOpen && <span className="ml-3">{item.label}</span>}
              </button>
            );
          }

          return (
            <NavLink
              key={idx}
              to={item.path}
              end
              className={({ isActive }) => `
                ${base}
                ${isActive
                  ? `bg-white text-indigo-600 rounded-r-full`
                  : `text-white hover:bg-gray-800`
                }
              `}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {isOpen && <span className="ml-3">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={toggleSidebar}
          className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400"
        >
          <span className="transform transition-transform duration-300">
            {isOpen ? '«' : '»'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
