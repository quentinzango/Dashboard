import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import KnowledgeBase from '../dashboard/KnowledgeBase';
import StatisticCard from '../dashboard/StatisticCard';
import { Routes, Route } from 'react-router-dom';
import SuppliersPage from './SuppliersPage';
import SubscribersPage from './SubscribersPage';
import UsersPage from './UsersPage';
import SuperAdministratorsPage from './SuperAdministratorsPage';
import AdministratorsPage from './AdministratorsPage';

const LayoutComponent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    connectedMeters: 0,
    disconnectedMeters: 0,
    subscribersCount: 0,
    smsCount: 0,
    selectedMonth: 'Jan',
    selectedMonthValue: 1
  });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fonction pour récupérer les données
  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsRefreshing(false);
      return;
    }

    try {
      // Récupérer les données pour les compteurs
      const metersResponse = await fetch('http://localhost:8000/api/v1/disjoncteurs/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!metersResponse.ok) throw new Error('Échec de la récupération des compteurs');
      const metersData = await metersResponse.json();
      
      const connected = metersData.filter(m => m.current_state === 'ON').length;
      const disconnected = metersData.filter(m => m.current_state === 'OFF').length;
      
      // Récupérer le nombre total d'abonnés
      const subscribersResponse = await fetch('http://localhost:8000/api/v1/abonnes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!subscribersResponse.ok) throw new Error('Échec de la récupération des abonnés');
      const subscribersData = await subscribersResponse.json();
      
      // Récupérer le nombre de SMS pour le mois en cours
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const monthName = now.toLocaleString('fr-FR', { month: 'short' });
      
      const smsResponse = await fetch(`http://localhost:8000/api/v1/actions/?date__month=${currentMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!smsResponse.ok) throw new Error('Échec de la récupération des SMS');
      const smsData = await smsResponse.json();
      
      setDashboardData({
        connectedMeters: connected,
        disconnectedMeters: disconnected,
        subscribersCount: subscribersData.length,
        smsCount: smsData.length,
        selectedMonth: monthName,
        selectedMonthValue: currentMonth
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Chargement initial
    fetchDashboardData();
    
    // Configurer le rafraîchissement automatique toutes les 30 secondes
    const intervalId = setInterval(fetchDashboardData, 30000);
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  const handleMonthChange = async (month) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      // Convertir le nom du mois en numéro
      const monthMap = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4,
        'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8,
        'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
      };
      
      const monthValue = monthMap[month];
      if (!monthValue) return;
      
      // Récupérer le nombre de SMS pour le mois sélectionné
      const smsResponse = await fetch(`http://localhost:8000/api/v1/actions/?date__month=${monthValue}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!smsResponse.ok) throw new Error('Échec de la récupération des SMS');
      const smsData = await smsResponse.json();
      
      setDashboardData(prev => ({
        ...prev,
        smsCount: smsData.length,
        selectedMonth: month,
        selectedMonthValue: monthValue
      }));
      
    } catch (error) {
      console.error("Erreur lors du changement de mois:", error);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Tableau de bord</h2>
            {lastUpdate && (
              <p className="text-xs text-gray-500">
                Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button 
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-700"
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Actualiser</span>
              </>
            )}
          </button>
        </div>
        
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
                  <StatisticCard />
                </div>
              </div>
            } />
            
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/subscribers" element={<SubscribersPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/SuperAdministrators" element={<SuperAdministratorsPage />} />
            <Route path="/Administrators" element={<AdministratorsPage />} />
            <Route path="/users" element={<div>Liste des Utilisateurs</div>} />
            <Route path="/Administrators" element={<div>List of administrators</div>} />
            <Route path="/map" element={<div>Carte</div>} />
            <Route path="/SuperAdministrators" element={<div>List of super administrators</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default LayoutComponent;