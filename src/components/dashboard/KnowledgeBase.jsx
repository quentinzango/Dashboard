import React from 'react';

const KnowledgeBase = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total Fournisseurs</h3>
            <p className="text-3xl font-bold mt-2">55</p>
            <p className="text-green-500 mt-1 flex items-center">
              <span>↑ 12.5%</span>
              <span className="ml-1 text-sm">from last month</span>
            </p>
          </div>
          <div className="bg-gray-300 border-2 border-dashed rounded-xl w-12 h-12" />
        </div>
      </div>
      
      {/* Total Earnings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total Earnings</h3>
            <p className="text-3xl font-bold mt-2">$24,500</p>
            <p className="text-green-500 mt-1 flex items-center">
              <span>↑ 8.2%</span>
              <span className="ml-1 text-sm">from last month</span>
            </p>
          </div>
          <div className="bg-gray-300 border-2 border-dashed rounded-xl w-12 h-12" />
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;