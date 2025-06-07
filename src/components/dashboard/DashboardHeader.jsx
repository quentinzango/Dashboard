import React from 'react';

const DashboardHeader = () => {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, Quentin</h1>
          <p className="text-gray-500">Vous avez 5 tâches à accomplir aujourd'hui</p>
        </div>
        
        <div className="flex items-center">
          <div className="bg-gray-300 border-2 border-dashed rounded-xl w-12 h-12" />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;