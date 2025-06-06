import React from 'react';

const SidebarItem = ({ label, icon, isOpen }) => {
  return (
    <button className={`
      w-full py-3 px-5 flex items-center text-left
      hover:bg-gray-800 transition-colors duration-200
      ${isOpen ? 'justify-start' : 'justify-center'}
    `}>
      <div className="flex-shrink-0 text-gray-300">
        {icon}
      </div>
      
      <span className={`
        ml-3 text-gray-300 transition-opacity
        ${isOpen ? 'opacity-100' : 'opacity-0'}
      `}>
        {label}
      </span>
    </button>
  );
};

export default SidebarItem;