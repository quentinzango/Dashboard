import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiMapPin, FiEdit2, FiTrash2, FiPlus, FiSearch, FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';

const SuppliersPage = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ nom: '', siege_social: '', logo: null });
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState(null);
  const suppliersPerPage = 5;

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { navigate('/login'); return; }

      const res = await fetch('https://www.emkit.site/api/v1/fournisseurs/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
        return;
      }
      
      if (!res.ok) throw new Error('Erreur lors du chargement des fournisseurs');
      
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les fournisseurs');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewSupplier(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setNewSupplier(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSubmit = async e => {
    e.preventDefault();
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { navigate('/login'); return; }

      const formData = new FormData();
      formData.append('nom', newSupplier.nom);
      formData.append('siege_social', newSupplier.siege_social);
      if (newSupplier.logo) {
        formData.append('logo', newSupplier.logo);
      }

      const res = await fetch('https://www.emkit.site/api/v1/fournisseurs/', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur lors de l’enregistrement');
      
      setSuppliers(prev => [...prev, data]);
      setIsAdding(false);
      setNewSupplier({ nom: '', siege_social: '', logo: null });
      setLogoPreview(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleEdit = id => navigate(`/suppliers/edit/${id}`);

  const handleDelete = async id => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { navigate('/login'); return; }
      
      const res = await fetch(`https://www.emkit.site/api/v1/fournisseurs/${id}/`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      if (!res.ok) throw new Error();
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression du fournisseur');
    }
  };

  // Filtering & pagination
  const filtered = suppliers.filter(s => {
    const nom = s.nom?.toLowerCase() || '';
    const siege = s.siege_social?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return nom.includes(term) || siege.includes(term);
  });
  
  const totalPages = Math.ceil(filtered.length / suppliersPerPage);
  const current = filtered.slice((currentPage - 1) * suppliersPerPage, currentPage * suppliersPerPage);

  if (isAdding) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Nouveau Fournisseur</h2>
            <button 
              onClick={() => { setIsAdding(false); setError(null); setLogoPreview(null); }}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          
          <form onSubmit={handleAddSubmit} className="space-y-4" encType="multipart/form-data">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Nom</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiHome className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="nom"
                  placeholder="Nom du fournisseur"
                  value={newSupplier.nom}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Siège social</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="siege_social"
                  placeholder="Adresse du siège social"
                  value={newSupplier.siege_social}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Logo du fournisseur
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-indigo-500">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="h-28 object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiImage className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-500">Cliquer pour télécharger</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                type="button" 
                onClick={() => { setIsAdding(false); setError(null); setLogoPreview(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <FiPlus className="mr-1" /> Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Liste des Fournisseurs d'Énergie</h1>
        <button 
          onClick={() => setIsAdding(true)} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <FiPlus className="mr-1" /> Ajouter un fournisseur
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Rechercher par nom ou siège social"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Total Fournisseurs</h3>
          <p className="text-2xl font-bold text-indigo-600">{filtered.length}</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siège social</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {current.length > 0 ? (
                  current.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        {s.logo ? (
                          <img 
                            src={`https://www.emkit.site${s.logo}`} 
                            alt="Logo" 
                            className="h-10 w-10 object-contain"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
                            <FiImage className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FiHome className="h-5 w-5 mr-2 text-indigo-500" />
                          <span className="text-sm font-medium text-gray-900">{s.nom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FiMapPin className="h-5 w-5 mr-2 text-indigo-500" />
                          <span className="text-sm text-gray-500">{s.siege_social}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => handleEdit(s.id)} 
                            className="text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
                          >
                            <FiEdit2 className="mr-1" /> Modifier
                          </button>
                          <button 
                            onClick={() => handleDelete(s.id)} 
                            className="text-red-600 hover:text-red-800 flex items-center transition-colors"
                          >
                            <FiTrash2 className="mr-1" /> Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucun fournisseur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
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
        </>
      )}
    </div>
  );
};

export default SuppliersPage;