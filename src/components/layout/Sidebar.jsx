import React from 'react';
import UserProfile from './UserProfile';
import SidebarItem from './SidebarItem';
import { 
  HiHome, HiShoppingBag, HiTruck, HiUserGroup, HiOfficeBuilding 
  
} from 'react-icons/hi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { label: "Dashboard", icon: <HiHome className="text-xl" /> }, 
    { label: "Suppliers", icon: <HiUserGroup className="text-xl" /> },
    { label: "Users", icon: <HiUserGroup className="text-xl" /> },
    { label: "Subscribers", icon: <HiUserGroup className="text-xl" /> },
    { label: "Kits", icon: <HiShoppingBag className="text-xl" /> },
    { label: "Map", icon: <HiTruck className="text-xl" /> },
    { label: "Roles", icon: <HiOfficeBuilding className="text-xl" /> },
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
          <SidebarItem 
            key={index} 
            label={item.label} 
            icon={item.icon}
            isOpen={isOpen}
          />
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