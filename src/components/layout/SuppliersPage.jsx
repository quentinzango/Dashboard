import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SuppliersPage = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ nom: '', siege_social: '' });
  const [error, setError] = useState(null);
  const suppliersPerPage = 5;

  // Fetch suppliers wrapped in useCallback to satisfy useEffect deps
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

  const handleAddSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { navigate('/login'); return; }

      const res = await fetch('https://www.emkit.site/api/v1/fournisseurs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSupplier)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur lors de l’enregistrement');
      setSuppliers(prev => [...prev, data]);
      setIsAdding(false);
      setNewSupplier({ nom: '', siege_social: '' });
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
      const res = await fetch(`https://www.emkit.site/api/v1/fournisseurs/${id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Nouveau Fournisseur</h2>
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <input
            name="nom"
            placeholder="Nom"
            value={newSupplier.nom}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            name="siege_social"
            placeholder="Siège social"
            value={newSupplier.siege_social}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
          <div className="flex space-x-3">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Ajouter</button>
            <button type="button" onClick={() => { setIsAdding(false); setError(null); }}>Annuler</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des Fournisseurs</h1>
        <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Ajouter</button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Recherche par nom ou siège"
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full max-w-sm px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
        />
        <div>{filtered.length} résultat(s)</div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-indigo-500 rounded-full" />
        </div>
      ) : (
        <>
          <table className="min-w-full bg-white divide-y divide-gray-200 rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Siège social</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {current.map(s => (
                <tr key={s.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4">{s.nom}</td>
                  <td className="px-6 py-4">{s.siege_social}</td>
                  <td className="px-6 py-4 space-x-2 text-sm text-gray-500">
                    <button onClick={() => handleEdit(s.id)} className="text-indigo-600 hover:underline">Modifier</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >Précédent</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'font-bold' : ''}
                >{page}</button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >Suivant</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SuppliersPage;
