import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import KnowledgeBase from '../dashboard/KnowledgeBase';
import StatisticCard from '../dashboard/StatisticCard';
import { Routes, Route } from 'react-router-dom';
import SuppliersPage from './SuppliersPage';
import SubscribersPage from './SubscribersPage';
import UsersPage from './UsersPage';

const LayoutComponent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    connectedMeters: 0,
    disconnectedMeters: 0,
    subscribersCount: 0,
    smsCount: 0,
    selectedMonth: 'Jan',
    historyData: []
  });

  useEffect(() => {
    // Simuler un appel API pour récupérer les données du dashboard
    const fetchDashboardData = async () => {
      try {
        // Ici, vous ferez un appel réel à votre API
        // const response = await fetch('/api/dashboard');
        // const data = await response.json();
        
        // Données simulées en attendant l'API
        const mockData = {
          connectedMeters: 18,
          disconnectedMeters: 4,
          subscribersCount: 4,
          smsCount: 4,
          selectedMonth: 'Jan',
          historyData: [
            { month: 'Jan', connected: 10, disconnected: 2, subscribers: 3, sms: 1 },
            { month: 'Feb', connected: 12, disconnected: 1, subscribers: 4, sms: 2 },
            { month: 'Mar', connected: 15, disconnected: 3, subscribers: 5, sms: 3 },
            { month: 'Apr', connected: 18, disconnected: 4, subscribers: 4, sms: 4 },
          ]
        };
        
        setDashboardData(mockData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleMonthChange = (month) => {
    setDashboardData(prev => ({
      ...prev,
      selectedMonth: month
    }));
    
    // Ici, vous feriez un appel API pour récupérer les données du mois sélectionné
    // fetch(`/api/dashboard?month=${month}`).then(...)
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Statistiques</h2>
                  <KnowledgeBase 
                    connectedMeters={dashboardData.connectedMeters}
                    disconnectedMeters={dashboardData.disconnectedMeters}
                    subscribersCount={dashboardData.subscribersCount}
                    smsCount={dashboardData.smsCount}
                    selectedMonth={dashboardData.selectedMonth}
                    onMonthChange={handleMonthChange}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Évolution</h2>
                  <StatisticCard 
                    connectedMetersHistory={dashboardData.historyData}
                    disconnectedMetersHistory={dashboardData.historyData}
                    subscribersHistory={dashboardData.historyData}
                    smsHistory={dashboardData.historyData}
                  />
                </div>
              </div>
            } />
            
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/subscribers" element={<SubscribersPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users" element={<div>Liste des Utilisateurs</div>} />
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