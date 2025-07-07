import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FiUser, FiUserPlus, FiUserCheck, FiShield, FiActivity, 
  FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronLeft, 
  FiChevronRight, FiX, FiTool, FiRefreshCw, FiUserX 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const TechniciansPage = () => {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTech, setNewTech] = useState({
    utilisateur: '',
    administrateur: '',
    super_administrateur: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Variables pour la recherche et la pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) return navigate('/login');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      // Récupérer le profil utilisateur en premier
      const profile = await fetchUserProfile();
      setUserProfile(profile);

      const [resTechs, resUsers, resAdmins, resSuperAdmins] = await Promise.all([
        fetch('https://www.emkit.site/api/v1/techniciens/', { headers }),
        fetch('https://www.emkit.site/api/v1/auth/users/', { headers }),
        fetch('https://www.emkit.site/api/v1/administrateurs/', { headers }),
        fetch('https://www.emkit.site/api/v1/superadministrateurs/', { headers })
      ]);

      if (resTechs.status === 401) {
        localStorage.removeItem('accessToken');
        return navigate('/login');
      }
      if (!resTechs.ok) throw new Error('Impossible de charger les techniciens');

      let dataTechs = await resTechs.json();
      const dataUsers = await resUsers.json();
      const dataAdmins = await resAdmins.json();
      const dataSuperAdmins = await resSuperAdmins.json();

      // Filtrer les techniciens selon le rôle
      if (profile?.role === 'administrateur') {
        dataTechs = dataTechs.filter(
          t => t.fournisseur_energie?.id === profile.administrateur_fournisseur_energie_id
        );
      } else if (profile?.role === 'technicien') {
        dataTechs = dataTechs.filter(t => t.id === profile.technicien_id);
      }

      // Gestion de la pagination si nécessaire
      const actualAdmins = dataAdmins.results ? dataAdmins.results : dataAdmins;
      const actualSuperAdmins = dataSuperAdmins.results ? dataSuperAdmins.results : dataSuperAdmins;

      setUsers(dataUsers);
      setAdmins(actualAdmins);
      setSuperAdmins(actualSuperAdmins);

      // Créer des maps pour les relations
      const userMap = {};
      dataUsers.forEach(u => { userMap[u.id] = u.email; });

      const adminMap = {};
      actualAdmins.forEach(a => { 
        adminMap[a.id] = a.utilisateur_detail?.email || 'Admin inconnu'; 
      });

      const superAdminMap = {};
      actualSuperAdmins.forEach(sa => { 
        superAdminMap[sa.id] = sa.utilisateur_detail?.email || 'Super Admin inconnu'; 
      });

      setTechnicians(dataTechs.map(t => ({
        id: t.id,
        user: t.utilisateur ? userMap[t.utilisateur] : '—',
        admin: t.administrateur ? adminMap[t.administrateur] : '—',
        superAdmin: t.super_administrateur ? superAdminMap[t.super_administrateur] : '—',
        supplier: t.fournisseur_energie?.nom || '—'
      })));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Erreur lors du chargement des données');
    }
  }, [navigate, fetchUserProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrer les administrateurs en fonction du profil utilisateur
  const filteredAdmins = useMemo(() => {
    if (!userProfile || !userProfile.administrateur_id) return admins;
    return admins.filter(a => a.id === userProfile.administrateur_id);
  }, [admins, userProfile]);

  // Filtrer les super administrateurs en fonction du profil utilisateur
  const filteredSuperAdmins = useMemo(() => {
    if (!userProfile || !userProfile.superadministrateur_id) return superAdmins;
    return superAdmins.filter(sa => sa.id === userProfile.superadministrateur_id);
  }, [superAdmins, userProfile]);

  const filtered = technicians.filter(t =>
    (t.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.admin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.superAdmin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.supplier || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const current = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleDelete = async id => {
    if (!window.confirm('Supprimer ce technicien ?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`https://www.emkit.site/api/v1/techniciens/${id}/`, {
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
    setNewTech({ 
      utilisateur: '', 
      administrateur: userProfile?.administrateur_id || '',
      super_administrateur: userProfile?.superadministrateur_id || ''
    });
    setIsAdding(true);
  };

  const handleNewChange = e => {
    const { name, value } = e.target;
    setNewTech(nt => ({ ...nt, [name]: value }));
  };

  const handleAddSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const { utilisateur, administrateur, super_administrateur } = newTech;
    
    if (!utilisateur || (!administrateur && !super_administrateur)) {
      setIsSubmitting(false);
      return setError('Les champs utilisateur et au moins un type d\'administrateur sont requis');
    }

    const token = localStorage.getItem('accessToken');
    try {
      const payload = {
        utilisateur: parseInt(utilisateur, 10),
      };
      
      // Pré-remplir avec l'admin connecté si disponible
      if (userProfile?.administrateur_id) {
        payload.administrateur = userProfile.administrateur_id;
      } else if (administrateur) {
        payload.administrateur = parseInt(administrateur, 10);
      }
      
      // Pré-remplir avec le super admin connecté si disponible
      if (userProfile?.superadministrateur_id) {
        payload.super_administrateur = userProfile.superadministrateur_id;
      } else if (super_administrateur) {
        payload.super_administrateur = parseInt(super_administrateur, 10);
      }

      const res = await fetch('https://www.emkit.site/api/v1/techniciens/', {
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiTool className="mr-2 text-blue-600" size={24} />
          Gestion des Techniciens
        </h1>
        {userProfile?.role !== 'technicien' && (
          <button
            onClick={handleAddToggle}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center shadow-md transition-colors"
            disabled={isSubmitting}
          >
            <FiUserPlus className="mr-2" /> Ajouter un Technicien
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mb-6 p-6 bg-white rounded-xl shadow-md border border-indigo-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <FiUserPlus className="mr-2 text-indigo-600" />
            Nouveau Technicien
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
              <FiX className="mr-2" size={18} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiUser className="mr-2 text-gray-500" />
                Utilisateur *
              </label>
              <select
                name="utilisateur"
                value={newTech.utilisateur}
                onChange={handleNewChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={isSubmitting}
              >
                <option value="">Sélectionnez un utilisateur</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.email}</option>
                ))}
              </select>
            </div>
            
            {userProfile?.role === 'administrateur' ? (
              <input type="hidden" name="administrateur" value={userProfile.administrateur_id} />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiUserCheck className="mr-2 text-gray-500" />
                  Administrateur (Optionnel)
                </label>
                <select
                  name="administrateur"
                  value={newTech.administrateur}
                  onChange={handleNewChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isSubmitting || (userProfile?.role === 'administrateur')}
                >
                  <option value="">Sélectionnez un administrateur</option>
                  {filteredAdmins.map(a => (
                    <option key={a.id} value={a.id}>{a.utilisateur_detail?.email}</option>
                  ))}
                </select>
              </div>
            )}
            
            {userProfile?.role === 'superadministrateur' ? (
              <input type="hidden" name="super_administrateur" value={userProfile.superadministrateur_id} />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiShield className="mr-2 text-gray-500" />
                  Super Administrateur (Optionnel)
                </label>
                <select
                  name="super_administrateur"
                  value={newTech.super_administrateur}
                  onChange={handleNewChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isSubmitting || (userProfile?.role === 'superadministrateur')}
                >
                  <option value="">Sélectionnez un super administrateur</option>
                  {filteredSuperAdmins.map(sa => (
                    <option key={sa.id} value={sa.id}>{sa.utilisateur_detail?.email}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)} 
              className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              <FiX className="mr-1" /> Annuler
            </button>
            <button 
              type="submit" 
              className={`px-5 py-2.5 text-white rounded-lg flex items-center ${
                isSubmitting 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 transition-colors'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FiRefreshCw className="mr-2 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <FiPlus className="mr-1" /> 
                  <span>Créer</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par utilisateur, administrateur ou fournisseur..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow flex items-center border border-gray-200">
          <div className="mr-4">
            <h3 className="text-sm font-medium text-gray-500 flex items-center">
              <FiUser className="mr-1" /> Total Techniciens
            </h3>
            <p className="text-2xl font-bold text-indigo-600">{technicians.length}</p>
          </div>
          <div className="h-10 w-px bg-gray-200 mx-4"></div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Page</h3>
            <p className="text-lg font-semibold text-gray-700">{currentPage}/{totalPages || 1}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
          <p className="font-medium flex items-center justify-center">
            <FiX className="mr-2" /> Erreur lors du chargement des données
          </p>
          <p className="mt-2">{error}</p>
          <button 
            onClick={fetchData} 
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center mx-auto"
          >
            <FiRefreshCw className="mr-2" /> Réessayer
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiUser className="mr-2" /> Utilisateur
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiUserCheck className="mr-2" /> Administrateur
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiShield className="mr-2" /> Super Admin
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiActivity className="mr-2" /> Fournisseur
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {current.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <FiUser className="mr-2 text-blue-500" />
                          {t.user}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiUserCheck className="mr-2 text-green-500" />
                          {t.admin}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiShield className="mr-2 text-purple-500" />
                          {t.superAdmin}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiActivity className="mr-2 text-yellow-500" />
                          {t.supplier}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/technicians/edit/${t.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center p-2 rounded-full hover:bg-indigo-50 transition-colors"
                            title="Modifier"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-red-600 hover:text-red-900 flex items-center p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {current.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center text-gray-500">
                          <FiUserX className="text-gray-400 mb-2" size={32} />
                          <span className="text-sm">Aucun technicien trouvé</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FiChevronLeft className="mr-1" /> Précédent
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Suivant <FiChevronRight className="ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TechniciansPage;