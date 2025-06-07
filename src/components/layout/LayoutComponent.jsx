import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import KnowledgeBase from '../dashboard/KnowledgeBase';
import StatisticCard from '../dashboard/StatisticCard';
import { Routes, Route } from 'react-router-dom';
import SuppliersPage from './SuppliersPage'; // Nouveau composant pour les fournisseurs

const LayoutComponent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Barre de navigation latérale */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête du dashboard */}
        <DashboardHeader />
        
        {/* Contenu défilant */}
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Knowledge base</h2>
                  <KnowledgeBase />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Statistic</h2>
                  <StatisticCard />
                </div>
              </div>
            } />
            
            {/* Page des fournisseurs */}
            <Route path="/suppliers" element={<SuppliersPage />} />
            
            {/* Ajoutez d'autres routes ici */}
            <Route path="/users" element={<div>Liste des Utilisateurs</div>} />
            <Route path="/subscribers" element={<div>Liste des Abonnés</div>} />
            <Route path="/kits" element={<div>Liste des Kits</div>} />
            <Route path="/map" element={<div>Carte</div>} />
            <Route path="/roles" element={<div>Rôles</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default LayoutComponent;