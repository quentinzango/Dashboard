import React, { useState, useEffect } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight, FiMail, FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const SuperAdministratorsPage = () => {
  const navigate = useNavigate();
  const [superAdmins, setSuperAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSuperAdmin, setNewSuperAdmin] = useState({
    utilisateur: '',  
    numero_tel2: ''   
  });
  const [errors, setErrors] = useState({});

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) { navigate('/login'); return; }

        const [saRes, usersRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/superadministrateurs/', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:8000/api/v1/auth/users/', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        if (!saRes.ok) throw new Error('Failed to fetch super admins');
        if (!usersRes.ok) throw new Error('Failed to fetch users');

        const saData = await saRes.json();
        const usersData = await usersRes.json();

        const enhancedSA = saData.map(sa => ({
          ...sa,
          email: sa.utilisateur_detail?.email || 'Unknown'
        }));

        setSuperAdmins(enhancedSA);
        setUsers(usersData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Filter + paginate
  const filtered = superAdmins.filter(sa => {
    const s = searchTerm.toLowerCase();
    return (
      sa.email.toLowerCase().includes(s) ||
      sa.numero_tel2.toLowerCase().includes(s)
    );
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(start, start + itemsPerPage);

  // Form handlers
  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewSuperAdmin(prev => ({ ...prev, [name]: value }));
  };
  const validateForm = () => {
    const errs = {};
    if (!newSuperAdmin.utilisateur) errs.utilisateur = 'User is required';
    if (!newSuperAdmin.numero_tel2) errs.numero_tel2 = 'Phone number is required';
    setErrors(errs);
    return !Object.keys(errs).length;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { navigate('/login'); return; }
      const res = await fetch('http://localhost:8000/api/v1/superadministrateurs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          utilisateur: parseInt(newSuperAdmin.utilisateur, 10),
          numero_tel2: newSuperAdmin.numero_tel2
        })
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to create');
      const created = await res.json();
      setSuperAdmins(prev => [
        ...prev,
        { 
          ...created,
          email: created.utilisateur_detail?.email || 'Unknown'
        }
      ]);
      setIsModalOpen(false);
      setNewSuperAdmin({ utilisateur: '', numero_tel2: '' });
      setErrors({});
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Liste des Super Administrateurs</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Ajouter un Super Admin
        </button>
      </div>

      {/* Search & total */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Rechercher par email ou téléphone"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm w-full md:w-auto">
          <h3 className="text-gray-500 text-sm">Total Super Admins</h3>
          <p className="text-2xl font-bold text-indigo-600">{filtered.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6 border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro Téléphone
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map(sa => (
                <tr key={sa.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiMail className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="text-sm font-medium text-gray-900">{sa.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiPhone className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="text-sm text-gray-500">{sa.numero_tel2}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun super administrateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > itemsPerPage && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ajouter un Super Administrateur</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="utilisateur" className="block text-gray-700 text-sm font-medium mb-2">
                  Sélectionner un utilisateur
                </label>
                <select
                  id="utilisateur"
                  name="utilisateur"
                  value={newSuperAdmin.utilisateur}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border ${
                    errors.utilisateur ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users
                    .filter(u => !superAdmins.some(sa => sa.utilisateur === u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.email} ({u.nom})
                      </option>
                    ))}
                </select>
                {errors.utilisateur && (
                  <p className="text-red-500 text-xs mt-1">{errors.utilisateur}</p>
                )}
              </div>
              <div className="mb-6">
                <label htmlFor="numero_tel2" className="block text-gray-700 text-sm font-medium mb-2">
                  Numéro de téléphone secondaire
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="numero_tel2"
                    name="numero_tel2"
                    value={newSuperAdmin.numero_tel2}
                    onChange={handleInputChange}
                    placeholder="Entrez le numéro secondaire"
                    className={`w-full pl-10 px-4 py-2 border ${
                      errors.numero_tel2 ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                {errors.numero_tel2 && (
                  <p className="text-red-500 text-xs mt-1">{errors.numero_tel2}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrors({});
                    setNewSuperAdmin({ utilisateur: '', numero_tel2: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdministratorsPage;