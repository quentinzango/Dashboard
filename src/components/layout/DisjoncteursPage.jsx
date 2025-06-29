import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DisjoncteursPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [disjoncteurs, setDisjoncteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [abonneInfo, setAbonneInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDisjoncteur, setCurrentDisjoncteur] = useState(null);
  const [typesEquipement, setTypesEquipement] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    libelle: '',
    voltage: '',
    type_equipement: '',
    abonne: id
  });

  // Récupérer les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');
        
        // Récupérer les informations de l'abonné
        const abonneRes = await fetch(`http://localhost:8000/api/v1/abonnes/${id}/`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!abonneRes.ok) {
          const errorText = await abonneRes.text();
          throw new Error(`Erreur abonné [${abonneRes.status}]: ${errorText}`);
        }
        
        const abonneData = await abonneRes.json();
        setAbonneInfo(abonneData);

        // Récupérer les disjoncteurs de l'abonné
        const disjoncteursRes = await fetch(`http://localhost:8000/api/v1/disjoncteurs/?abonne=${id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!disjoncteursRes.ok) {
          const errorText = await disjoncteursRes.text();
          throw new Error(`Erreur disjoncteurs [${disjoncteursRes.status}]: ${errorText}`);
        }
        
        const disjoncteursData = await disjoncteursRes.json();
        console.log("Disjoncteurs reçus:", disjoncteursData); // Debug
        setDisjoncteurs(disjoncteursData);

        // Récupérer les types d'équipement
        const typesRes = await fetch('http://localhost:8000/api/v1/typeequipements/', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!typesRes.ok) {
          const errorText = await typesRes.text();
          throw new Error(`Erreur types [${typesRes.status}]: ${errorText}`);
        }
        
        const typesData = await typesRes.json();
        setTypesEquipement(typesData);
        
      } catch (e) {
        console.error("Erreur détaillée:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Ouvrir le modal pour ajouter ou modifier
  const openModal = (disjoncteur = null) => {
    if (disjoncteur) {
      setCurrentDisjoncteur(disjoncteur);
      setFormData({
        nom: disjoncteur.nom,
        libelle: disjoncteur.libelle,
        voltage: disjoncteur.voltage,
        type_equipement: disjoncteur.type_equipement.id,
        abonne: id
      });
    } else {
      setCurrentDisjoncteur(null);
      setFormData({
        nom: '',
        libelle: '',
        voltage: '',
        type_equipement: '',
        abonne: id
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  // Fermer le modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDisjoncteur(null);
    setError(null);
  };

  // Soumettre le formulaire (création ou mise à jour)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const token = localStorage.getItem('accessToken');
    const method = currentDisjoncteur ? 'PUT' : 'POST';
    const url = currentDisjoncteur 
      ? `http://localhost:8000/api/v1/disjoncteurs/${currentDisjoncteur.id}/`
      : 'http://localhost:8000/api/v1/disjoncteurs/';
    
    // Préparer les données avec les bons types
    const payload = {
      ...formData,
      voltage: parseFloat(formData.voltage),
      type_equipement: parseInt(formData.type_equipement, 10),
      abonne: parseInt(id, 10)
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Réponse d'erreur:", responseData);
        
        let errorMessage = 'Échec de l\'opération';
        if (responseData && typeof responseData === 'object') {
          // Gestion des erreurs de validation Django
          const errors = Object.entries(responseData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          
          errorMessage = errors;
        } else if (responseData?.detail) {
          errorMessage = responseData.detail;
        }
        
        throw new Error(errorMessage);
      }

      // Recharger les données
      const disjoncteursRes = await fetch(`http://localhost:8000/api/v1/disjoncteurs/?abonne=${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!disjoncteursRes.ok) {
        const errorText = await disjoncteursRes.text();
        throw new Error(`Erreur rechargement [${disjoncteursRes.status}]: ${errorText}`);
      }
      
      const disjoncteursData = await disjoncteursRes.json();
      console.log("Disjoncteurs après mise à jour:", disjoncteursData);
      setDisjoncteurs(disjoncteursData);
      
      closeModal();
    } catch (e) {
      console.error("Erreur soumission:", e);
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer un disjoncteur
  const handleDelete = async (disjoncteurId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce disjoncteur ?')) return;
    
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`http://localhost:8000/api/v1/disjoncteurs/${disjoncteurId}/`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Échec suppression [${response.status}]: ${errorText}`);
      }

      // Mettre à jour l'état local
      setDisjoncteurs(prev => prev.filter(d => d.id !== disjoncteurId));
    } catch (e) {
      console.error("Erreur suppression:", e);
      setError(e.message);
    }
  };

  // Changer l'état d'un disjoncteur
  const toggleState = async (disjoncteur) => {
    const token = localStorage.getItem('accessToken');
    const newState = disjoncteur.current_state === 'ON' ? 'OFF' : 'ON';
    
    try {
      const response = await fetch(`https://www.emkit.site/api/v1/disjoncteurs/${disjoncteur.id}/control/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ state: newState })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Échec changement état [${response.status}]: ${errorText}`);
      }

      // Mettre à jour l'état local
      setDisjoncteurs(prev => 
        prev.map(d => 
          d.id === disjoncteur.id 
            ? { ...d, current_state: newState } 
            : d
        )
      );
    } catch (e) {
      console.error("Erreur toggle:", e);
      setError(e.message);
    }
  };

  if (loading) return <div className="text-center py-10">Chargement des disjoncteurs...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Disjoncteurs de l'abonné</h1>
          {abonneInfo && (
            <p className="text-gray-600 mt-1">
              {abonneInfo.utilisateur?.email} • {abonneInfo.fournisseur_energie?.nom}
            </p>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => openModal()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Ajouter un disjoncteur
          </button>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Retour
          </button>
        </div>
      </div>

      {/* Message d'erreur global */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {disjoncteurs.length > 0 ? (
          disjoncteurs.map(d => (
            <div 
              key={d.id} 
              className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                d.current_state === 'ON' ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-800">{d.nom}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  d.current_state === 'ON' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {d.current_state}
                </span>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Libellé:</span> {d.libelle}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Voltage:</span> {d.voltage} V
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Type:</span> {d.type_equipement?.nom}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Dernière mise à jour:</span> {d.last_updated}
                </p>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                <button 
                  onClick={() => toggleState(d)}
                  className={`px-4 py-2 rounded-md ${
                    d.current_state === 'ON'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {d.current_state === 'ON' ? 'Éteindre' : 'Allumer'}
                </button>
                
                <button 
                  onClick={() => openModal(d)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                >
                  Modifier
                </button>
                
                <button 
                  onClick={() => handleDelete(d.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Aucun disjoncteur trouvé pour cet abonné</p>
          </div>
        )}
      </div>

      {/* Modal pour ajouter/modifier */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {currentDisjoncteur ? 'Modifier le disjoncteur' : 'Ajouter un disjoncteur'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-4">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded whitespace-pre-wrap">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Libellé *
                </label>
                <input
                  type="text"
                  name="libelle"
                  value={formData.libelle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voltage (V) *
                </label>
                <input
                  type="number"
                  name="voltage"
                  value={formData.voltage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  step="0.01"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'équipement *
                </label>
                <select
                  name="type_equipement"
                  value={formData.type_equipement}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionnez un type</option>
                  {typesEquipement.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.nom}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? (currentDisjoncteur ? 'Enregistrement...' : 'Création...') 
                    : (currentDisjoncteur ? 'Enregistrer' : 'Créer')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisjoncteursPage;