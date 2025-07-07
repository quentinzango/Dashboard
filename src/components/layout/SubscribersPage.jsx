import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiSearch, 
  FiMail, 
  FiHome, 
  FiMapPin, 
  FiZap, 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiPlus,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
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
  const [userProfile, setUserProfile] = useState(null);
  const perPage = 5;

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    try {
      const res = await fetch('https://www.emkit.site/api/v1/auth/users/me/', { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("Erreur lors de la récupération du profil", e);
    }
    return null;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) return navigate('/login');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      // Récupérer le profil utilisateur
      const profile = await fetchUserProfile();
      setUserProfile(profile);

      let dataSubs = [];
      let dataUsers = [];
      let dataSupp = [];
      let dataCities = [];

      // Si l'utilisateur est un abonné, charger uniquement ses données
      if (profile?.role === 'abonne') {
        const [resSub, resUser, resSuppliers, resCities] = await Promise.all([
          fetch(`https://www.emkit.site/api/v1/abonnes/${profile.abonne_id}/`, { headers }),
          fetch('https://www.emkit.site/api/v1/auth/users/', { headers }),
          fetch('https://www.emkit.site/api/v1/fournisseurs/', { headers }),
          fetch('https://www.emkit.site/api/v1/villes/', { headers })
        ]);

        if (resSub.status === 401) {
          localStorage.removeItem('accessToken');
          return navigate('/login');
        }
        if (!resSub.ok) throw new Error('Impossible de charger votre abonnement');

        dataSubs = [await resSub.json()];
        dataUsers = await resUser.json();
        dataSupp = await resSuppliers.json();
        dataCities = await resCities.json();
      } else {
        // Pour les techniciens et administrateurs
        const [resSubs, resUsers, resSuppliers, resCities] = await Promise.all([
          fetch('https://www.emkit.site/api/v1/abonnes/', { headers }),
          fetch('https://www.emkit.site/api/v1/auth/users/', { headers }),
          fetch('https://www.emkit.site/api/v1/fournisseurs/', { headers }),
          fetch('https://www.emkit.site/api/v1/villes/', { headers })
        ]);

        if (resSubs.status === 401) {
          localStorage.removeItem('accessToken');
          return navigate('/login');
        }
        if (!resSubs.ok) throw new Error('Impossible de charger les abonnés');

        dataSubs = await resSubs.json();
        dataUsers = await resUsers.json();
        dataSupp = await resSuppliers.json();
        dataCities = await resCities.json();
      }

      setUsers(dataUsers);
      setSuppliers(dataSupp);
      setCities(dataCities);

      const cityMap = {};
      dataCities.forEach(city => {
        cityMap[city.id] = city.nom;
      });

      // Charger les disjoncteurs pour chaque abonné
      const subscribersWithBreakers = await Promise.all(dataSubs.map(async a => {
        try {
          const resBreakers = await fetch(
            `https://www.emkit.site/api/v1/disjoncteurs/?abonne=${a.id}`,
            { headers }
          );
          const breakers = resBreakers.ok ? await resBreakers.json() : [];
          return {
            ...a,
            breakers
          };
        } catch {
          return {
            ...a,
            breakers: []
          };
        }
      }));

      setSubscribers(subscribersWithBreakers.map(a => ({
        id: a.id,
        user: a.utilisateur?.email || '—',
        supplier: a.fournisseur_energie?.nom || '—',
        city: a.ville ? cityMap[a.ville] || '—' : '—',
        breakers: a.breakers || []  // Ajout des disjoncteurs
      })));
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, fetchUserProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleDelete = async id => {
    if (!window.confirm('Supprimer cet abonné ?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`https://www.emkit.site/api/v1/abonnes/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      await fetchData();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const handleAddToggle = () => {
    setError(null);
    setNewSub({ 
      utilisateur: '', 
      fournisseur_energie: userProfile?.technicien_fournisseur_id || '',
      ville: '' 
    });
    setIsAdding(true);
  };

  const handleNewChange = e => {
    const { name, value } = e.target;
    setNewSub(ns => ({ ...ns, [name]: value }));
  };

  const handleAddSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const { utilisateur, fournisseur_energie, ville } = newSub;
    
    if (!utilisateur || !fournisseur_energie) {
      setIsSubmitting(false);
      return setError('Les champs utilisateur et fournisseur sont requis');
    }

    const token = localStorage.getItem('accessToken');
    try {
      const payload = {
        utilisateur_id: parseInt(utilisateur, 10),
        fournisseur_energie_id: parseInt(fournisseur_energie, 10),
      };

      if (userProfile?.technicien_id) {
        payload.technicien_id = userProfile.technicien_id;
      }
      
      if (ville) {
        payload.ville_id = parseInt(ville, 10);
      }

      const res = await fetch('https://www.emkit.site/api/v1/abonnes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        let errorMessage = 'Échec de la création';
        if (errorData) {
          const errors = [];
          for (const field in errorData) {
            errors.push(`${field}: ${errorData[field].join(', ')}`);
          }
          errorMessage = errors.join(' | ');
        }
        throw new Error(errorMessage);
      }

      await fetchData();
      setIsAdding(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Masquer certaines fonctionnalités pour les abonnés
  const isAbonne = userProfile?.role === 'abonne';
  const showAddButton = !isAbonne && userProfile?.role !== 'abonne';
  const showDeleteButton = !isAbonne;
  const showEditButton = !isAbonne;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isAbonne ? "Mon Abonnement" : "Liste des Abonnés"}
        </h1>
        
        {showAddButton && (
          <button
            onClick={handleAddToggle}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
            disabled={isSubmitting}
          >
            <FiPlus className="mr-1" /> Ajouter un Abonné
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Ajouter un nouvel abonné</h2>
            <button 
              onClick={() => setIsAdding(false)} 
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Utilisateur *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="utilisateur"
                    value={newSub.utilisateur}
                    onChange={handleNewChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionnez un utilisateur</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.email}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Fournisseur *</label>
                {userProfile?.role === 'technicien' ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiHome className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={userProfile.technicien_fournisseur_nom || ''}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      readOnly
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiHome className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="fournisseur_energie"
                      value={newSub.fournisseur_energie}
                      onChange={handleNewChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionnez un fournisseur</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.nom}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Ville (Optionnel)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiMapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="ville"
                    value={newSub.ville}
                    onChange={handleNewChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionnez une ville</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                type="submit" 
                className={`px-4 py-2 text-white rounded-lg ${
                  isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                } flex items-center transition-colors`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Création en cours...' : 'Créer'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAbonne && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Rechercher par utilisateur, fournisseur ou ville"
              className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="bg-white p-4 rounded-lg shadow-sm w-full md:w-auto">
            <h3 className="text-gray-500 text-sm">Total Abonnés</h3>
            <p className="text-2xl font-bold text-indigo-600">{subscribers.length}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {!isAbonne && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fournisseur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ville
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disjoncteurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {current.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    {!isAbonne && (
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FiMail className="h-5 w-5 mr-2 text-indigo-500" />
                          <span className="text-sm text-gray-900">{s.user}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FiHome className="h-5 w-5 mr-2 text-indigo-500" />
                        <span className="text-sm text-gray-900">{s.supplier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FiMapPin className="h-5 w-5 mr-2 text-indigo-500" />
                        <span className="text-sm text-gray-900">{s.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {s.breakers.slice(0, 3).map(b => (
                          <div 
                            key={b.id}
                            className={`px-2 py-1 rounded-full flex items-center ${
                              b.current_state === 'ON' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                            title={`${b.nom} (${b.libelle}) - ${b.voltage}V`}
                          >
                            <FiZap className="mr-1" />
                            <span className="text-xs">{b.nom}</span>
                          </div>
                        ))}
                        {s.breakers.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full flex items-center">
                            <FiZap className="mr-1" />
                            +{s.breakers.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => navigate(`/subscribers/${s.id}/disjoncteurs`)} 
                          className="text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                        >
                          <FiEye className="mr-1" /> Détails
                        </button>
                        
                        {showEditButton && (
                          <button 
                            onClick={() => navigate(`/subscribers/edit/${s.id}`)} 
                            className="text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
                          >
                            <FiEdit2 className="mr-1" /> Modifier
                          </button>
                        )}
                        
                        {showDeleteButton && (
                          <button 
                            onClick={() => handleDelete(s.id)} 
                            className="text-red-600 hover:text-red-800 flex items-center transition-colors"
                          >
                            <FiTrash2 className="mr-1" /> Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {current.length === 0 && (
                  <tr>
                    <td 
                      colSpan={isAbonne ? 4 : 5} 
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {isAbonne ? "Aucune donnée d'abonnement trouvée" : "Aucun abonné trouvé"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!isAbonne && totalPages > 1 && (
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
        </>
      )}
    </div>
  );
};

export default SubscribersPage;