import React from 'react';

const StatisticCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Progress score</h3>
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
          65%
        </span>
      </div>
      
      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div 
          className="bg-indigo-600 h-4 rounded-full" 
          style={{ width: '65%' }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>0%</span>
        <span>100%</span>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-500">Completed tasks</p>
          <p className="text-xl font-bold">18/24</p>
        </div>
        <div>
          <p className="text-gray-500">Avg. completion</p>
          <p className="text-xl font-bold">75%</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticCard;