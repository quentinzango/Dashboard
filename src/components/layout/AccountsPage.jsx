import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCreditCard, 
  FiUser, 
  FiDollarSign, 
  FiCalendar,
  FiEye,
  FiPlusCircle
} from 'react-icons/fi';

const AccountsPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchAccounts = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Non authentifié');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('https://www.emkit.site/api/v1/comptes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erreur récupération comptes');
      const data = await res.json();
      setAccounts(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  // Filter
  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const f = accounts.filter(a =>
      a.id.toString().includes(lower) ||
      (a.abonne?.utilisateur?.nom || '').toLowerCase().includes(lower)
    );
    setFiltered(f);
    setCurrentPage(1);
  }, [searchTerm, accounts]);

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pageData = filtered.slice(start, start + itemsPerPage);

  const handleRecharge = id => navigate(`/dashboard/accounts/${id}/recharge`);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Erreur : {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des comptes</h2>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Rechercher par ID ou nom"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm w-full md:w-auto">
          <h3 className="text-gray-500 text-sm">Total des comptes</h3>
          <p className="text-2xl font-bold text-indigo-600">{totalCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiCreditCard className="h-4 w-4 mr-2" /> ID
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiUser className="h-4 w-4 mr-2" /> Abonné
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiDollarSign className="h-4 w-4 mr-2" /> Solde (FCFA)
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 mr-2" /> Dernière MAJ
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pageData.length > 0 ? pageData.map(account => (
              <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FiCreditCard className="h-5 w-5 mr-2 text-indigo-500" />
                    <span className="text-sm text-gray-900">{account.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FiUser className="h-5 w-5 mr-2 text-indigo-500" />
                    <span className="text-sm text-gray-900">{account.abonne?.utilisateur?.nom || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FiDollarSign className="h-5 w-5 mr-2 text-indigo-500" />
                    <span className={`text-sm font-medium ${account.solde < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {account.solde}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FiCalendar className="h-5 w-5 mr-2 text-indigo-500" />
                    <span className="text-sm text-gray-500">
                      {account.updated_at ? new Date(account.updated_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      to={`/dashboard/accounts/${account.id}`} 
                      className="text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
                    >
                      <FiEye className="mr-1" /> Détails
                    </Link>
                    <button 
                      onClick={() => handleRecharge(account.id)} 
                      className="text-green-600 hover:text-green-800 flex items-center transition-colors"
                    >
                      <FiPlusCircle className="mr-1" /> Recharger
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun compte trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between px-6 py-3 bg-gray-50 gap-4">
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md flex items-center ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <FiChevronLeft className="mr-1" /> Précédent
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md flex items-center ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Suivant <FiChevronRight className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;