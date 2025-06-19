import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const StatisticCard = () => {
  const [chartData, setChartData] = useState({
    abonnesData: [],
    disjoncteursData: [],
    actionsData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Objectifs maximums pour chaque catégorie
  const MAX_ABONNES = 10000;
  const MAX_DISJONCTEURS = 100;
  const MAX_ACTIONS = 50000;
  
  // Couleurs personnalisées pour les camemberts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    const fetchChartData = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        // Récupérer les données nécessaires
        const [abonnesRes, disjoncteursRes, actionsRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/abonnes/', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:8000/api/v1/disjoncteurs/', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:8000/api/v1/actions/', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        // Vérifier les réponses
        if (!abonnesRes.ok) throw new Error('Échec de la récupération des abonnés');
        if (!disjoncteursRes.ok) throw new Error('Échec de la récupération des disjoncteurs');
        if (!actionsRes.ok) throw new Error('Échec de la récupération des actions');

        // Convertir en JSON
        const [abonnesData, disjoncteursData, actionsData] = await Promise.all([
          abonnesRes.json(),
          disjoncteursRes.json(),
          actionsRes.json()
        ]);

        // Préparer les données pour les camemberts
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

        setChartData({
          abonnesData: abonnesChartData,
          disjoncteursData: disjoncteursChartData,
          actionsData: actionsChartData,
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
  }, []);

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
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.abonnesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[0] : COLORS[1]} />
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