import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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

  if (loading) return <div className="text-center py-10">Chargement des comptes...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestion des comptes</h2>
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Rechercher ID ou nom"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <h3 className="text-gray-500 text-sm">Total des comptes</h3>
          <p className="text-2xl font-bold">{totalCount}</p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID','Abonné','Solde (FCFA)','Dernière MAJ','Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pageData.length > 0 ? pageData.map(account => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{account.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{account.abonne?.utilisateur?.nom || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{account.solde}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{account.updated_at ? new Date(account.updated_at).toLocaleString() : 'N/A'}</td>
                <td className="px-6 py-4 text-sm font-medium">
                  <Link to={`/dashboard/accounts/${account.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Détails</Link>
                  <button onClick={() => handleRecharge(account.id)} className="text-indigo-600 hover:text-indigo-900">Recharger</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Aucun compte trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p-1,1))}
            disabled={currentPage===1}
            className="p-2 bg-white border rounded disabled:opacity-50"
          ><FiChevronLeft /></button>
          {Array.from({ length: totalPages }, (_, i) => i+1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${currentPage===page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >{page}</button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))}
            disabled={currentPage===totalPages}
            className="p-2 bg-white border rounded disabled:opacity-50"
          ><FiChevronRight /></button>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
