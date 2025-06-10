import React, { useState, useEffect } from 'react';
import { FiSearch,  FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const SuperAdministratorsPage = () => {
  const [superAdmins, setSuperAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSuperAdmin, setNewSuperAdmin] = useState({
    userId: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});

  // Fetch super admins and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simuler l'appel API pour les super administrateurs
        const mockSuperAdmins = [
          { id: 1, userId: 1, phoneNumber: '+1234567890' },
          { id: 2, userId: 2, phoneNumber: '+0987654321' },
        ];
        
        // Simuler l'appel API pour tous les utilisateurs
        const mockUsers = [
          { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+123456789', active: true },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+987654321', active: false },
          { id: 3, name: 'Robert Johnson', email: 'robert@example.com', phone: '+112233445', active: true },
          { id: 4, name: 'Emily Davis', email: 'emily@example.com', phone: '+556677889', active: true },
          { id: 5, name: 'Michael Wilson', email: 'michael@example.com', phone: '+998877665', active: false },
        ];
        
        // Combiner les données pour l'affichage
        const combinedSuperAdmins = mockSuperAdmins.map(sa => {
          const user = mockUsers.find(u => u.id === sa.userId);
          return {
            ...sa,
            user: { email: user.email }
          };
        });
        
        setSuperAdmins(combinedSuperAdmins);
        setUsers(mockUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter super admins based on search term
  const filteredSuperAdmins = superAdmins.filter(superAdmin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (superAdmin.user.email && superAdmin.user.email.toLowerCase().includes(searchLower)) ||
      (superAdmin.phoneNumber && superAdmin.phoneNumber.toLowerCase().includes(searchLower))
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSuperAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSuperAdmins.length / itemsPerPage);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSuperAdmin({
      ...newSuperAdmin,
      [name]: value
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!newSuperAdmin.userId) newErrors.userId = 'User is required';
    if (!newSuperAdmin.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      // Simulation d'appel API
      const user = users.find(u => u.id.toString() === newSuperAdmin.userId);
      
      // Structure de données pour l'API
      const newSuperAdminObj = {
        userId: user.id,
        phoneNumber: newSuperAdmin.phoneNumber
      };
      
      // Ici, vous feriez normalement un appel API réel :
      // const response = await fetch('/api/super-admins', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSuperAdminObj)
      // });
      
      // Pour la simulation, ajout local
      const newSuperAdminWithId = {
        ...newSuperAdminObj,
        id: superAdmins.length + 1,
        user: { email: user.email }
      };
      
      setSuperAdmins([...superAdmins, newSuperAdminWithId]);
      setIsModalOpen(false);
      setNewSuperAdmin({ userId: '', phoneNumber: '' });
    } catch (error) {
      console.error('Error creating super admin:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this super admin?')) {
      try {
        // Simulation d'appel API DELETE
        // await fetch(`/api/super-admins/${id}`, { method: 'DELETE' });
        
        // Mise à jour locale
        setSuperAdmins(superAdmins.filter(superAdmin => superAdmin.id !== id));
      } catch (error) {
        console.error('Error deleting super admin:', error);
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">List of Super Administrators</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Super Admin
          </button>
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search by email or phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-gray-500">Total Super Admins</h3>
            <p className="text-2xl font-bold">{filteredSuperAdmins.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NUMERO TEL2</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((superAdmin) => (
                <tr key={superAdmin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{superAdmin.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{superAdmin.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(superAdmin.id)} 
                      className="text-red-600 hover:text-red-900 flex items-center"
                    >
                      <FiTrash2 className="mr-1" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                  No super administrators found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredSuperAdmins.length > itemsPerPage && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md flex items-center ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FiChevronLeft className="mr-1" />
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
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
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
              <FiChevronRight className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Add Super Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Super Administrator</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userId">
                  Select User
                </label>
                <select
                  id="userId"
                  name="userId"
                  value={newSuperAdmin.userId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.userId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select a user</option>
                  {users
                    .filter(user => !superAdmins.some(sa => sa.userId === user.id))
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))}
                </select>
                {errors.userId && <p className="text-red-500 text-xs italic mt-1">{errors.userId}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                  Secondary Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={newSuperAdmin.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter secondary phone number"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.phoneNumber ? 'border-red-500' : ''
                  }`}
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs italic mt-1">{errors.phoneNumber}</p>}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Super Admin
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