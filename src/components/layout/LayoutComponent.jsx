import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import KnowledgeBase from '../dashboard/KnowledgeBase';
import StatisticCard from '../dashboard/StatisticCard';
import SuppliersPage from './SuppliersPage';
import SubscribersPage from './SubscribersPage';
import UsersPage from './UsersPage';
import SuperAdministratorsPage from './SuperAdministratorsPage';
import AdministratorsPage from './AdministratorsPage';
import AccountsPage from './AccountsPage'; 
import BillsPage from './BillsPage'; 
import EquipementsPage from './EquipementsPage';
import TechniciansPage from './TechniciansPage';
import NotificationsPage from './NotificationsPage'; 

const LayoutComponent = () => {
  //const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectedMeters, setConnectedMeters] = useState(0);
  const [disconnectedMeters, setDisconnectedMeters] = useState(0);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [smsCount, setSmsCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7));
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : null;
  };

  // Chargement des fournisseurs
  const fetchSuppliers = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const res = await fetch('http://localhost:8000/api/v1/fournisseurs/', { headers });
      if (!res.ok) throw new Error('Échec récupération fournisseurs');
      setSuppliers(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Chargement des compteurs, abonnés, SMS
  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setIsRefreshing(false);
      return;
    }
    try {
      const metersRes = await fetch('http://localhost:8000/api/v1/disjoncteurs/', { headers });
      const meters = await metersRes.json();
      setConnectedMeters(meters.filter(m => m.current_state === 'ON').length);
      setDisconnectedMeters(meters.filter(m => m.current_state === 'OFF').length);

      const subsRes = await fetch('http://localhost:8000/api/v1/abonnes/', { headers });
      const subs = await subsRes.json();
      setSubscribersCount(subs.length);

      const currentMonth = new Date().getMonth() + 1;
      const smsRes = await fetch(`http://localhost:8000/api/v1/actions/?date__month=${currentMonth}`, { headers });
      setSmsCount((await smsRes.json()).length);

      setLastUpdate(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Chargement de la consommation totale
  const fetchTotalConsumption = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const params = new URLSearchParams({ date: selectedDate });
      if (selectedSupplier) params.append('supplier_id', selectedSupplier);
      const res = await fetch(`http://localhost:8000/api/v1/total/?${params}`, { headers });
      const { total_consumption } = await res.json();
      setTotalConsumption(total_consumption);
    } catch (e) {
      console.error(e);
      setTotalConsumption(0);
    }
  }, [selectedDate, selectedSupplier]);

  // Effets initiaux
  useEffect(() => {
    fetchSuppliers();
    fetchDashboardData();
  }, [fetchSuppliers, fetchDashboardData]);

  useEffect(() => {
    fetchTotalConsumption();
  }, [fetchTotalConsumption]);

  // Handlers enfants
  const handleDateChange = (newDate) => setSelectedDate(newDate);
  const handleSupplierChange = (supplierId) => setSelectedSupplier(supplierId);
  const handleMonthChange = async (monthAbbrev) => {
    const map = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
    const m = map[monthAbbrev] || (new Date().getMonth()+1);
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const smsRes = await fetch(`http://localhost:8000/api/v1/actions/?date__month=${m}`, { headers });
      setSmsCount((await smsRes.json()).length);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        {/* Actualiser */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <h2 className="text-xl font-semibold text-gray-700">Tableau de bord</h2>
          {lastUpdate && <p className="text-xs text-gray-500">Dernière mise à jour : {lastUpdate.toLocaleTimeString()}</p>}
          <button
            onClick={() => { fetchDashboardData(); fetchTotalConsumption(); }}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-700"
          >
            {isRefreshing ? 'Chargement…' : 'Actualiser'}
          </button>
        </div>

        {/* Routes */}
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
                    selectedMonth={selectedDate.slice(5)}
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
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/subscribers" element={<SubscribersPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/SuperAdministrators" element={<SuperAdministratorsPage />} />
            <Route path="/Administrators" element={<AdministratorsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/bills" element={<BillsPage />} />
            <Route path="/equipements" element={<EquipementsPage />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default LayoutComponent;