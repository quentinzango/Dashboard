import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import KnowledgeBase from '../dashboard/KnowledgeBase';
import StatisticCard from '../dashboard/StatisticCard';

const LayoutComponent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Barre de navigation latérale */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête du dashboard */}
        <DashboardHeader />
        
        {/* Contenu défilant */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Base de connaissances */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Knowledge base</h2>
              <KnowledgeBase />
            </div>
            
            {/* Section Statistiques */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Statistic</h2>
              <StatisticCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutComponent;