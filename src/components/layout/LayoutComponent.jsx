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
import AccountsPage from './AccountsPage'; 
import BillsPage from './BillsPage'; 
import EquipementsPage from './EquipementsPage';

const LayoutComponent = () => {
  // ─── États globaux ─────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compteurs, abonnés, SMS (statistiques de base)
  const [connectedMeters, setConnectedMeters] = useState(0);
  const [disconnectedMeters, setDisconnectedMeters] = useState(0);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [smsCount, setSmsCount] = useState(0);

  // ─── États pour la consommation totale ────────────────────────────
  // Par défaut : mois courant (YYYY-MM)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [totalConsumption, setTotalConsumption] = useState(0);

  // ─── États pour les fournisseurs ─────────────────────────────────
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // ─── Helpers pour récupérer le token ─────────────────────────────
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  // ─── 1) Charger la liste des fournisseurs ────────────────────────
  const fetchSuppliers = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const res = await fetch('https://www.emkit.site/fournisseurs/', { headers });
      if (!res.ok) throw new Error('Échec récupération fournisseurs');
      setSuppliers(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  // ─── 2) Charger compteurs, abonnés, SMS ───────────────────────────
  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setIsRefreshing(false);
      return;
    }
    try {
      // a) Compteurs
      const metersRes = await fetch('https://www.emkit.site/disjoncteurs/', { headers });
      const meters = await metersRes.json();
      setConnectedMeters(meters.filter(m => m.current_state === 'ON').length);
      setDisconnectedMeters(meters.filter(m => m.current_state === 'OFF').length);

      // b) Abonnés
      const subsRes = await fetch('https://www.emkit.site/abonnes/', { headers });
      const subs = await subsRes.json();
      setSubscribersCount(subs.length);

      // c) SMS pour le mois courant
      const currentMonth = new Date().getMonth() + 1;
      const smsRes = await fetch(`https://www.emkit.site/actions/?date__month=${currentMonth}`, { headers });
      const smsData = await smsRes.json();
      setSmsCount(smsData.length);

      setLastUpdate(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // ─── 3) Charger la consommation totale selon sélection ────────────
  const fetchTotalConsumption = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      // Construire query params
      const params = new URLSearchParams({ date: selectedDate });
      if (selectedSupplier) params.append('supplier_id', selectedSupplier);

      console.log('Fetching total consumption for', params.toString());
      const res = await fetch(`https://www.emkit.site/total/?${params}`, { headers });
      if (!res.ok) throw new Error('Échec récupération conso totale');
      const { total_consumption } = await res.json();
      setTotalConsumption(total_consumption);
    } catch (e) {
      console.error(e);
      setTotalConsumption(0);
    }
  }, [selectedDate, selectedSupplier]);

  // ─── Effets ───────────────────────────────────────────────────────
  // Au montage : fournisseurs + data de base
  useEffect(() => {
    fetchSuppliers();
    fetchDashboardData();
  }, [fetchSuppliers, fetchDashboardData]);

  // À chaque changement de date **ou** de fournisseur : refresh conso
  useEffect(() => {
    fetchTotalConsumption();
  }, [fetchTotalConsumption]);

  // ─── Handlers passés aux enfants ─────────────────────────────────
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };
  const handleSupplierChange = (supplierId) => {
    setSelectedSupplier(supplierId);
  };
  const handleMonthChange = async (monthAbbrev) => {
    // On peut garder votre ancien code pour les SMS
    const monthMap = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
    const m = monthMap[monthAbbrev] || (new Date().getMonth()+1);
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const smsRes = await fetch(`https://www.emkit.site/actions/?date__month=${m}`, { headers });
      const smsData = await smsRes.json();
      setSmsCount(smsData.length);
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        {/* Bouton Actualiser */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <h2 className="text-xl font-semibold text-gray-700">Tableau de bord</h2>
          {lastUpdate && <p className="text-xs text-gray-500">Dernière mise à jour : {lastUpdate.toLocaleTimeString()}</p>}
          <button
            onClick={() => { fetchDashboardData(); fetchTotalConsumption(); }}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-700"
          >
            {isRefreshing
              ? <span>Chargement…</span>
              : <span>Actualiser</span>
            }
          </button>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Statistiques</h2>
                  <KnowledgeBase
                    connectedMeters={connectedMeters}
                    disconnectedMeters={disconnectedMeters}
                    subscribersCount={subscribersCount}
                    smsCount={smsCount}
                    selectedMonth={selectedDate.slice(5)}     // extrait "06" de "2025-06"
                    onMonthChange={handleMonthChange}
                    totalConsumption={totalConsumption}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    suppliers={suppliers}
                    selectedSupplier={selectedSupplier}
                    onSupplierChange={handleSupplierChange}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Évolution</h2>
                  <StatisticCard selectedSupplier={selectedSupplier} />
                </div>
              </div>
            }/>
            {/* Autres routes… */}
            
            <Route path="/suppliers"      element={<SuppliersPage />} />
            <Route path="/subscribers"    element={<SubscribersPage />} />
            <Route path="/users"          element={<UsersPage />} />
            <Route path="/SuperAdministrators" element={<SuperAdministratorsPage />} />
            <Route path="/Administrators" element={<AdministratorsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/bills" element={<BillsPage />} />
            <Route path="/equipements" element={<EquipementsPage />} /> 

          </Routes>
        </div>
      </div>
    </div>
  );
};

export default LayoutComponent;
