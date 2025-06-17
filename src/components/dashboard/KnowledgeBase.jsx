import React, { useState, useEffect } from 'react';

const KnowledgeBase = ({ 
  connectedMeters, 
  disconnectedMeters, 
  smsCount,
  selectedMonth,
  onMonthChange
}) => {
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Récupérer le nombre réel d'abonnés
  useEffect(() => {
    const fetchSubscribersCount = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await fetch('http://localhost:8000/api/v1/abonnes/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch subscribers');
        
        const data = await response.json();
        setSubscribersCount(data.length);
      } catch (error) {
        console.error('Error fetching subscribers:', error);
      }
    };

    fetchSubscribersCount();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Compteurs connectés */}
      <div className="bg-blue-100 rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Compteurs Connectés</h3>
            <p className="text-3xl font-bold mt-2">{connectedMeters}</p>
          </div>
          <div className="bg-blue-300 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Compteurs hors service */}
      <div className="bg-red-100 rounded-xl shadow-sm p-6 border-l-4 border-red-500">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Compteurs Hors service</h3>
            <p className="text-3xl font-bold mt-2">{disconnectedMeters}</p>
          </div>
          <div className="bg-red-300 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Nombre d'abonnés */}
      <div className="bg-orange-100 rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Nombre d'abonnés</h3>
            {/* Afficher le nombre réel d'abonnés */}
            <p className="text-3xl font-bold mt-2">{subscribersCount}</p>
          </div>
          <div className="bg-orange-300 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Nombre de SMS */}
      <div className="bg-green-100 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Nombre de SMS ({selectedMonth})</h3>
            <p className="text-3xl font-bold mt-2">{smsCount}</p>
            <div className="mt-2">
              <select 
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="text-sm p-1 border rounded focus:outline-none"
              >
                <option value="Jan">Janvier</option>
                <option value="Feb">Février</option>
                <option value="Mar">Mars</option>
                <option value="Apr">Avril</option>
                <option value="May">Mai</option>
                <option value="Jun">Juin</option>
                <option value="Jul">Juillet</option>
                <option value="Aug">Août</option>
                <option value="Sep">Septembre</option>
                <option value="Oct">Octobre</option>
                <option value="Nov">Novembre</option>
                <option value="Dec">Décembre</option>
              </select>
            </div>
          </div>
          <div className="bg-green-300 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;