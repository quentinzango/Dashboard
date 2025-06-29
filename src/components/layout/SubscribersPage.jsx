import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const SubscribersPage = () => {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState([]);
  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [newSub, setNewSub] = useState({
    utilisateur: '',
    fournisseur_energie: '',
    ville: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const perPage = 5;

  // 1) Fetch de toutes les données
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) return navigate('/login');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [resSubs, resUsers, resSupp, resCities] = await Promise.all([
        fetch('https://www.emkit.site/abonnes/', { headers }),
        fetch('https://www.emkit.site/api/v1/auth/users/', { headers }),
        fetch('https://www.emkit.site/fournisseurs/', { headers }),
        fetch('https://www.emkit.site/villes/', { headers })
      ]);

      if (resSubs.status === 401) {
        localStorage.removeItem('accessToken');
        return navigate('/login');
      }
      if (!resSubs.ok) throw new Error('Impossible de charger les abonnés');

      const [dataSubs, dataUsers, dataSupp, dataCities] = await Promise.all([
        resSubs.json(),
        resUsers.json(),
        resSupp.json(),
        resCities.json(),
      ]);

      setUsers(dataUsers);
      setSuppliers(dataSupp);
      setCities(dataCities);

      // Créer un mapping des villes par ID pour une recherche rapide
      const cityMap = {};
      dataCities.forEach(city => {
        cityMap[city.id] = city.nom;
      });

      // Formatage des abonnés avec résolution du nom de ville
      setSubscribers(dataSubs.map(a => ({
        id: a.id,
        user: a.utilisateur?.email || '—',
        supplier: a.fournisseur_energie?.nom || '—',
        city: a.ville ? cityMap[a.ville] || '—' : '—'
      })));
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2) Filtrage et pagination
  const filtered = subscribers.filter(s =>
    (s.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.supplier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const current = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // 3) Suppression
  const handleDelete = async id => {
    if (!window.confirm('Supprimer cet abonné ?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`https://www.emkit.site/abonnes/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      await fetchData();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  // 4) Toggle formulaire
  const handleAddToggle = () => {
    setError(null);
    setNewSub({ utilisateur: '', fournisseur_energie: '', ville: '' });
    setIsAdding(true);
  };

  // 5) Bind form
  const handleNewChange = e => {
    const { name, value } = e.target;
    setNewSub(ns => ({ ...ns, [name]: value }));
  };

  // 6) Soumission ajout avec correction du problème 400
  const handleAddSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const { utilisateur, fournisseur_energie, ville } = newSub;
    
    // Validation des champs requis (ville est optionnelle)
    if (!utilisateur || !fournisseur_energie) {
      setIsSubmitting(false);
      return setError('Les champs utilisateur et fournisseur sont requis');
    }

    const token = localStorage.getItem('accessToken');
    try {
      // CORRECTION : Formatage des données avec les noms de champs corrects
      const payload = {
        utilisateur_id: parseInt(utilisateur, 10),
        fournisseur_energie_id: parseInt(fournisseur_energie, 10),
      };
      
      // Ajout optionnel de la ville
      if (ville) {
        payload.ville_id = parseInt(ville, 10);
      }

      const res = await fetch('https://www.emkit.site/abonnes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // Gestion des erreurs de l'API
      if (!res.ok) {
        const errorData = await res.json();
        let errorMessage = 'Échec de la création';
        
        // Extraction des messages d'erreur détaillés
        if (errorData) {
          // CORRECTION : Meilleure gestion des erreurs
          const errors = [];
          for (const field in errorData) {
            errors.push(`${field}: ${errorData[field].join(', ')}`);
          }
          errorMessage = errors.join(' | ');
        }
        
        throw new Error(errorMessage);
      }

      // Rafraîchissement des données
      await fetchData();
      setIsAdding(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">List of Subscribers</h1>
        <button
          onClick={handleAddToggle}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
          disabled={isSubmitting}
        >
          + Add a Subscriber
        </button>
      </div>

      {/* Formulaire d'ajout inline */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mb-6 p-4 bg-gray-50 rounded">
          {error && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur *</label>
              <select
                name="utilisateur"
                value={newSub.utilisateur}
                onChange={handleNewChange}
                className="w-full border px-3 py-2 rounded"
                required
                disabled={isSubmitting}
              >
                <option value="">Sélectionnez un utilisateur</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.email}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur *</label>
              <select
                name="fournisseur_energie"
                value={newSub.fournisseur_energie}
                onChange={handleNewChange}
                className="w-full border px-3 py-2 rounded"
                required
                disabled={isSubmitting}
              >
                <option value="">Sélectionnez un fournisseur</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville (Optionnel)</label>
              <select
                name="ville"
                value={newSub.ville}
                onChange={handleNewChange}
                className="w-full border px-3 py-2 rounded"
                disabled={isSubmitting}
              >
                <option value="">Sélectionnez une ville</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 space-x-3">
            <button 
              type="submit" 
              className={`px-4 py-2 text-white rounded ${
                isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création en cours...' : 'Créer'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)} 
              className="px-4 py-2 bg-gray-300 rounded"
              disabled={isSubmitting}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Recherche & compteur */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search by user, supplier or city"
            className="w-full px-4 py-2 pl-10 border rounded focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500">Total Subscribers</h3>
          {/* Afficher le nombre réel d'abonnés */}
          <p className="text-2xl font-bold">{subscribers.length}</p>
        </div>
      </div>

      {/* Tableau ou loader */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['User', 'Supplier', 'City', 'Actions'].map(c => (
                    <th key={c} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {current.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{s.user}</td>
                    <td className="px-6 py-4">{s.supplier}</td>
                    <td className="px-6 py-4">{s.city}</td>
                    <td className="px-6 py-4 space-x-3">
                      {/* Nouveau bouton "Voir disjoncteurs" */}
                      <button 
                        onClick={() => navigate(`/subscribers/${s.id}/disjoncteurs`)} 
                        className="text-blue-600 hover:underline"
                      >
                        Voir disjoncteurs
                      </button>
                      
                      <button 
                        onClick={() => navigate(`/subscribers/edit/${s.id}`)} 
                        className="text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id)} 
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {current.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No Subscriber Found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubscribersPage;