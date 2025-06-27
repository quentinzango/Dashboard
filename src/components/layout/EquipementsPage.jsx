// src/components/pages/EquipementsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';


const EquipementsPage = () => {
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEquipement, setCurrentEquipement] = useState(null);
  const [nom, setNom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Récupérer le token d'authentification
  const token = localStorage.getItem('accessToken');
  
  // Charger les équipements
  const fetchEquipements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/typeequipements/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des équipements');
      const data = await response.json();
      setEquipements(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setEquipements([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Effet initial
  useEffect(() => {
    fetchEquipements();
  }, [fetchEquipements]);

  // Ouvrir le modal pour ajouter ou modifier
  const openModal = (equipement = null) => {
    setCurrentEquipement(equipement);
    setNom(equipement ? equipement.nom : '');
    setIsModalOpen(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEquipement(null);
    setNom('');
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = currentEquipement 
      ? `http://localhost:8000/api/v1/typeequipements/${currentEquipement.id}/`
      : 'http://localhost:8000/api/v1/typeequipements/';
    
    const method = currentEquipement ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nom })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la sauvegarde');
      }
      
      closeModal();
      fetchEquipements();
    } catch (err) {
      setError(err.message);
    }
  };

  // Supprimer un équipement
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type d\'équipement ?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/typeequipements/${id}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Échec de la suppression');
        
        fetchEquipements();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Filtrer les équipements selon la recherche
  const filteredEquipements = equipements.filter(equipement =>
    equipement.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const pageCount = Math.ceil(filteredEquipements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEquipements = filteredEquipements.slice(startIndex, startIndex + itemsPerPage);

  // Affichage
  if (loading) return <div className="text-center py-10">Chargement des équipements...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des types d'équipements</h2>
          <p className="text-gray-600 mt-1">Ajoutez, modifiez ou supprimez des types d'équipements</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Ajouter un type
          </button>
        </div>
      </div>

      {/* Tableau des équipements */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEquipements.length > 0 ? (
              paginatedEquipements.map((equipement) => (
                <tr key={equipement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipement.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{equipement.nom}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openModal(equipement)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(equipement.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun équipement trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Précédent
          </button>
          
          {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === page 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, pageCount))}
            disabled={currentPage === pageCount}
            className={`px-3 py-1 rounded-lg ${currentPage === pageCount ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {currentEquipement ? 'Modifier le type' : 'Ajouter un type'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="mb-4">
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du type d'équipement
                </label>
                <input
                  type="text"
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                >
                  {currentEquipement ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipementsPage;