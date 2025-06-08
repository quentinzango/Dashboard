import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatisticCard = ({ 
  connectedMetersHistory,
  disconnectedMetersHistory,
  subscribersHistory,
  smsHistory
}) => {
  const data = [
    { name: 'Jan', Connectés: 10, 'Hors service': 2, Abonnés: 3, SMS: 1 },
    { name: 'Feb', Connectés: 12, 'Hors service': 1, Abonnés: 4, SMS: 2 },
    { name: 'Mar', Connectés: 15, 'Hors service': 5, Abonnés: 15, SMS: 3 },
    { name: 'Apr', Connectés: 11, 'Hors service': 4, Abonnés: 4, SMS: 4 },
    // Ajouter plus de données selon l'historique
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Score de progression</h3>
        
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">Connectés</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm">Hors service</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-sm">Abonnés</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">SMS</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Connectés" stroke="#3B82F6" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Hors service" stroke="#EF4444" />
            <Line type="monotone" dataKey="Abonnés" stroke="#F97316" />
            <Line type="monotone" dataKey="SMS" stroke="#10B981" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-gray-500 mb-2">Autre</h4>
          <p className="text-sm">Aug 2021</p>
          <p className="text-sm mt-1">Abondé: 162.1, 27.75%</p>
          <p className="text-sm mt-1">Admito: 182.53, 31.25%</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-gray-500 mb-2">Consommation</h4>
          <p className="text-sm">Communes SMS</p>
          <p className="text-sm">Alertes</p>
          <p className="text-sm">Paramètres</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-gray-500 mb-2">Accès</h4>
          <div className="grid grid-cols-4 gap-1">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
              <div key={month} className="text-center text-xs py-1 bg-white rounded">
                {month}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticCard;