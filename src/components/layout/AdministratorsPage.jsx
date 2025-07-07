import React, { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiChevronLeft, FiChevronRight, FiMail, FiHome } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AdministratorsPage = () => {
  const navigate = useNavigate();
  const [administrators, setAdministrators] = useState([]);
  const [users, setUsers] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [energySuppliers, setEnergySuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdministrator, setNewAdministrator] = useState({
    utilisateur: '',
    super_administrateur: '',
    fournisseur_energie: ''
  });
  const [errors, setErrors] = useState({});

  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch users
        const usersRes = await fetch('http://localhost:8000/api/v1/auth/users/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        const usersData = await usersRes.json();
        setUsers(usersData);

        // Fetch super admins
        const superAdminsRes = await fetch('http://localhost:8000/api/v1/superadministrateurs/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!superAdminsRes.ok) throw new Error('Failed to fetch super admins');
        const superAdminsData = await superAdminsRes.json();
        const processedSuperAdmins = superAdminsData.map(sa => ({
          ...sa,
          email: sa.utilisateur_detail?.email || 'Unknown'
        }));
        setSuperAdmins(processedSuperAdmins);

        // Fetch energy suppliers
        const suppliersRes = await fetch('http://localhost:8000/api/v1/fournisseurs/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!suppliersRes.ok) throw new Error('Failed to fetch energy suppliers');
        const suppliersData = await suppliersRes.json();
        setEnergySuppliers(suppliersData);

        // Fetch administrators
        const adminsRes = await fetch('http://localhost:8000/api/v1/administrateurs/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!adminsRes.ok) throw new Error('Failed to fetch administrators');
        const adminsData = await adminsRes.json();

        // Process data using the nested serializer fields
        const processedAdmins = adminsData.map(admin => ({
          id: admin.id,
          userEmail: admin.utilisateur_detail?.email || 'Unknown',
          superAdminName: admin.super_admin_detail?.utilisateur_detail?.email || 'Unknown',
          energySupplierName: admin.fournisseur_detail?.nom || 'Unknown',
          utilisateur: admin.utilisateur,
          super_administrateur: admin.super_administrateur,
          fournisseur_energie: admin.fournisseur_energie
        }));

        setAdministrators(processedAdmins);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  // Filter administrators based on search term
  const filteredAdministrators = administrators.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (admin.userEmail && admin.userEmail.toLowerCase().includes(searchLower)) ||
      (admin.superAdminName && admin.superAdminName.toLowerCase().includes(searchLower)) ||
      (admin.energySupplierName && admin.energySupplierName.toLowerCase().includes(searchLower))
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdministrators.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdministrators.length / itemsPerPage);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdministrator({
      ...newAdministrator,
      [name]: value
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!newAdministrator.utilisateur) newErrors.utilisateur = 'User is required';
    if (!newAdministrator.super_administrateur) newErrors.super_administrateur = 'Super Admin is required';
    if (!newAdministrator.fournisseur_energie) newErrors.fournisseur_energie = 'Energy Supplier is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/administrateurs/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          utilisateur: parseInt(newAdministrator.utilisateur),
          super_administrateur: parseInt(newAdministrator.super_administrateur),
          fournisseur_energie: parseInt(newAdministrator.fournisseur_energie)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || JSON.stringify(errorData));
      }

      const createdAdmin = await response.json();
      
      // Process the new administrator with serializer fields
      const newAdmin = {
        id: createdAdmin.id,
        userEmail: createdAdmin.utilisateur_detail?.email || 'Unknown',
        superAdminName: createdAdmin.super_admin_detail?.utilisateur_detail?.email || 'Unknown',
        energySupplierName: createdAdmin.fournisseur_detail?.nom || 'Unknown',
        utilisateur: createdAdmin.utilisateur,
        super_administrateur: createdAdmin.super_administrateur,
        fournisseur_energie: createdAdmin.fournisseur_energie
      };
      
      // Update local state
      setAdministrators([...administrators, newAdmin]);
      
      setIsModalOpen(false);
      setNewAdministrator({ utilisateur: '', super_administrateur: '', fournisseur_energie: '' });
    } catch (error) {
      console.error('Error creating administrator:', error);
      setErrors({ submit: error.message });
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }
          
        const response = await fetch(`http://localhost:8000/api/v1/administrateurs/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to delete administrator');
        
        // Update local state
        setAdministrators(administrators.filter(admin => admin.id !== id));
      } catch (error) {
        console.error('Error deleting administrator:', error);
        setErrors({ submit: error.message });
      }
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
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Liste des Administrateurs</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Ajouter un Administrateur
          </button>
        </div>
        
        <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Rechercher par email, super admin ou fournisseur"
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm w-full md:w-auto">
            <h3 className="text-gray-500 text-sm">Total Administrateurs</h3>
            <p className="text-2xl font-bold text-indigo-600">{filteredAdministrators.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Super Administrateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur D'énergie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiMail className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="text-sm font-medium text-gray-900">{admin.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiMail className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="text-sm text-gray-500">{admin.superAdminName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiHome className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="text-sm text-gray-500">{admin.energySupplierName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleDelete(admin.id)} 
                      className="text-red-600 hover:text-red-800 flex items-center transition-colors"
                    >
                      <FiTrash2 className="mr-1" />
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun administrateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredAdministrators.length > itemsPerPage && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md flex items-center ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <FiChevronLeft className="mr-1" />
              Précédent
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
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md flex items-center ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Suivant
              <FiChevronRight className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Add Administrator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ajouter un Administrateur</h2>
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
              {/* User Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="utilisateur">
                  Sélectionner un utilisateur
                </label>
                <select
                  id="utilisateur"
                  name="utilisateur"
                  value={newAdministrator.utilisateur}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border ${
                    errors.utilisateur ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email} ({user.nom})
                    </option>
                  ))}
                </select>
                {errors.utilisateur && <p className="text-red-500 text-xs mt-1">{errors.utilisateur}</p>}
              </div>
              
              {/* Super Admin Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="super_administrateur">
                  Sélectionner un Super Administrateur
                </label>
                <select
                  id="super_administrateur"
                  name="super_administrateur"
                  value={newAdministrator.super_administrateur}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border ${
                    errors.super_administrateur ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Sélectionner un super admin</option>
                  {superAdmins.map(superAdmin => (
                    <option key={superAdmin.id} value={superAdmin.id}>
                      {superAdmin.email}
                    </option>
                  ))}
                </select>
                {errors.super_administrateur && <p className="text-red-500 text-xs mt-1">{errors.super_administrateur}</p>}
              </div>
              
              {/* Energy Supplier Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="fournisseur_energie">
                  Sélectionner un Fournisseur d'Énergie
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiHome className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="fournisseur_energie"
                    name="fournisseur_energie"
                    value={newAdministrator.fournisseur_energie}
                    onChange={handleInputChange}
                    className={`w-full pl-10 px-4 py-2 border ${
                      errors.fournisseur_energie ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {energySuppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.nom}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.fournisseur_energie && <p className="text-red-500 text-xs mt-1">{errors.fournisseur_energie}</p>}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrors({});
                    setNewAdministrator({ utilisateur: '', super_administrateur: '', fournisseur_energie: '' });
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

export default AdministratorsPage;