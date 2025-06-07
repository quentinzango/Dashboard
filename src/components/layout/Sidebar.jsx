import React from 'react';
import UserProfile from './UserProfile';
import { 
  HiHome, HiShoppingBag, HiTruck, HiUserGroup, HiOfficeBuilding 
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const menuItems = [
    { 
      label: "Dashboard", 
      icon: <HiHome className="text-xl" />,
      action: () => navigate('/dashboard') 
    },
    { 
      label: "Suppliers", 
      icon: <HiUserGroup className="text-xl" />,
      action: () => navigate('/dashboard/suppliers') 
    },
    { 
      label: "Users", 
      icon: <HiUserGroup className="text-xl" />,
      action: () => navigate('/dashboard/users') 
    },
    { 
      label: "Subscribers", 
      icon: <HiUserGroup className="text-xl" />,
      action: () => navigate('/dashboard/subscribers') 
    },
    { 
      label: "Kits", 
      icon: <HiShoppingBag className="text-xl" />,
      action: () => navigate('/dashboard/kits') 
    },
    { 
      label: "Map", 
      icon: <HiTruck className="text-xl" />,
      action: () => navigate('/dashboard/map') 
    },
    { 
      label: "Roles", 
      icon: <HiOfficeBuilding className="text-xl" />,
      action: () => navigate('/dashboard/roles') 
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
          <button
            key={index}
            onClick={item.action}
            className={`w-full py-3 px-5 flex items-center text-left
              hover:bg-gray-800 transition-colors duration-200
              ${isOpen ? 'justify-start' : 'justify-center'}`}
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