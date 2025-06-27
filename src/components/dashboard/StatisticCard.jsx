import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Label
} from 'recharts';

const StatisticCard = ({ selectedSupplier }) => {
  const [chartData, setChartData] = useState({
    abonnesData: [],
    disjoncteursData: [],
    actionsData: [],
    consumptionBarData: [],
    consumptionPieData: [],
    totalAbonnes: 0,
    totalDisjoncteurs: 0,
    totalConnectes: 0,
    totalHorsService: 0,
    totalActions: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [exporting, setExporting] = useState(false);
  
  const MAX_ABONNES = 10000;
  const MAX_DISJONCTEURS = 10000;
  const MAX_ACTIONS = 50000;
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    const fetchChartData = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const [abonnesRes, disjoncteursRes, actionsRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/abonnes/', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:8000/api/v1/disjoncteurs/', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:8000/api/v1/actions/', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!abonnesRes.ok) throw new Error('Échec de la récupération des abonnés');
        if (!disjoncteursRes.ok) throw new Error('Échec de la récupération des disjoncteurs');
        if (!actionsRes.ok) throw new Error('Échec de la récupération des actions');

        const [abonnesData, disjoncteursData, actionsData] = await Promise.all([
          abonnesRes.json(),
          disjoncteursRes.json(),
          actionsRes.json()
        ]);

        const abonnesChartData = [
          { name: 'Abonnés actifs', value: abonnesData.length },
          { name: 'Objectif restant', value: MAX_ABONNES - abonnesData.length }
        ];
        
        const disjoncteursChartData = [
          { name: 'Connectés', value: disjoncteursData.filter(d => d.current_state === 'ON').length },
          { name: 'Hors service', value: disjoncteursData.filter(d => d.current_state === 'OFF').length }
        ];
        
        const actionsChartData = [
          { name: 'SMS envoyés', value: actionsData.length },
          { name: 'Objectif restant', value: MAX_ACTIONS - actionsData.length }
        ];

        const consumptionUrl = selectedSupplier 
          ? `http://localhost:8000/api/v1/stats/?supplier_id=${selectedSupplier}`
          : `http://localhost:8000/api/v1/stats/`;
          
        const consumptionRes = await fetch(consumptionUrl, { headers: { 'Authorization': `Bearer ${token}` } });
        
        if (!consumptionRes.ok) throw new Error('Échec de la récupération des données de consommation');
        const consumptionData = await consumptionRes.json();

        setChartData({
          abonnesData: abonnesChartData,
          disjoncteursData: disjoncteursChartData,
          actionsData: actionsChartData,
          consumptionBarData: consumptionData.bar_data,
          consumptionPieData: consumptionData.pie_data,
          totalAbonnes: abonnesData.length,
          totalDisjoncteurs: disjoncteursData.length,
          totalConnectes: disjoncteursData.filter(d => d.current_state === 'ON').length,
          totalHorsService: disjoncteursData.filter(d => d.current_state === 'OFF').length,
          totalActions: actionsData.length
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedSupplier]);

  // Fonction corrigée pour gérer l'export CSV
  const handleExportCSV = async () => {
    setExporting(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    
    try {
      const params = new URLSearchParams({
        period: period,
        supplier_id: selectedSupplier || ''
      });
      
      const response = await fetch(`http://localhost:8000/api/v1/export-consumption/?${params.toString()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Échec de l'export: ${errorText}`);
      }
      
      // Récupération directe du blob CSV
      const csvData = await response.blob();
      
      // Création et téléchargement du fichier
      const url = URL.createObjectURL(csvData);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `consommation_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setError(error.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="h-96 flex items-center justify-center">
          <p className="text-red-500">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-6">Statistiques globales</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Camembert pour les abonnés */}
        <div className="text-center">
          <h4 className="text-md font-medium mb-4">Abonnés</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.abonnesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={60}
                  fill="#00008B"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.abonnesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[0] : COLORS[3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 bg-blue-50 p-3 rounded-lg">
            <p className="text-xl font-bold text-blue-700">
              {chartData.totalAbonnes} / {MAX_ABONNES}
            </p>
            <p className="text-sm text-gray-600">Abonnés actifs sur objectif</p>
          </div>
        </div>
        
        {/* Camembert pour les disjoncteurs */}
        <div className="text-center">
          <h4 className="text-md font-medium mb-4">Disjoncteurs</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.disjoncteursData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.disjoncteursData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[2] : COLORS[3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <p className="text-lg font-bold text-green-700">{chartData.totalConnectes}</p>
              <p className="text-xs text-gray-600">Connectés</p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg">
              <p className="text-lg font-bold text-red-700">{chartData.totalHorsService}</p>
              <p className="text-xs text-gray-600">Hors service</p>
            </div>
          </div>
        </div>
        
        {/* Camembert pour les actions (SMS) */}
        <div className="text-center">
          <h4 className="text-md font-medium mb-4">Actions (SMS)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.actionsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.actionsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[4] : COLORS[5]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 bg-purple-50 p-3 rounded-lg">
            <p className="text-xl font-bold text-purple-700">
              {chartData.totalActions} / {MAX_ACTIONS}
            </p>
            <p className="text-sm text-gray-600">SMS envoyés sur objectif</p>
          </div>
        </div>
      </div>
      
      {/* Graphiques de consommation */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-700 mb-6">Consommation d'énergie</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Graphique en barres */}
          <div className="text-center">
            <h4 className="text-md font-medium mb-4">Évolution mensuelle</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.consumptionBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 1000]} ticks={[0, 200, 400, 600, 800, 1000]}>
                    <Label value="kWh" angle={-90} position="insideLeft" />
                  </YAxis>
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumption" name="Consommation" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Graphique en camembert */}
          <div className="text-center">
            <h4 className="text-md font-medium mb-4">Répartition par région</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.consumptionPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.consumptionPieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} kWh`, 'Consommation']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section d'export */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Export des données de consommation</h3>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                  Sélectionnez la période
                </label>
                <input
                  type="month"
                  id="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4 sm:mt-6">
                <button
                  onClick={handleExportCSV}
                  disabled={exporting}
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg text-white font-medium ${
                    exporting ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {exporting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Export en cours...
                    </span>
                  ) : 'Exporter en CSV'}
                </button>
              </div>
            </div>
            {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-gray-500 mb-2">Objectifs</h4>
          <p className="text-sm">Abonnés: {MAX_ABONNES}</p>
          <p className="text-sm">Disjoncteurs: {MAX_DISJONCTEURS}</p>
          <p className="text-sm">SMS: {MAX_ACTIONS}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-gray-500 mb-2">Pourcentages</h4>
          <p className="text-sm">
            Abonnés: {((chartData.totalAbonnes / MAX_ABONNES) * 100).toFixed(1)}%
          </p>
          <p className="text-sm">
            Connectés: {chartData.totalDisjoncteurs > 0 
              ? ((chartData.totalConnectes / chartData.totalDisjoncteurs) * 100).toFixed(1) + '%'
              : '0%'}
          </p>
          <p className="text-sm">
            SMS: {((chartData.totalActions / MAX_ACTIONS) * 100).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-gray-500 mb-2">Dernière mise à jour</h4>
          <p className="text-sm">{new Date().toLocaleDateString()}</p>
          <p className="text-sm">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticCard;