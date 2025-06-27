import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const USERS_STORAGE_KEY = 'usersList';

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nom: '',
    numero_telephone: ''
  });
  const [error, setError] = useState(null);
  const usersPerPage = 5;

  // Encapsuler fetchUsers avec useCallback
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Vous devez vous connecter.');

      const res = await fetch('https://www.emkit.site/api/v1/auth/users/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error('Erreur lors de la récupération des utilisateurs');

      const data = await res.json();
      setUsers(data);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Chargement initial : localStorage ou API
  useEffect(() => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      setUsers(JSON.parse(stored));
      setLoading(false);
    } else {
      fetchUsers();
    }
  }, [fetchUsers]);

  // Supprimer un utilisateur
  const handleDelete = async (userId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`https://www.emkit.site/api/v1/auth/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      } else if (res.status === 401) {
        navigate('/login');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert('Erreur lors de la suppression');
    }
  };

  // Ajouter un utilisateur
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Vous devez vous connecter.');

      const res = await fetch('https://www.emkit.site/api/v1/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || JSON.stringify(data));

      const createdUser = data.user ?? data;
      const updatedList = [createdUser, ...users];
      setUsers(updatedList);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));

      setNewUser({ email: '', password: '', nom: '', numero_telephone: '' });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  // Filtrage (sans numero_telephone)
  const filteredUsers = users.filter(u =>
    (u.nom && u.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">List of Users</h1>

      {/* --- Barre de recherche + bouton Ajouter --- */}
      <div className="flex items-center justify-between mb-4">
      <div className="relative w-full max-w-sm">
  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" >
      <circle cx="11" cy="11" r="7" />
      <line x1="16.65" y1="16.65" x2="21" y2="21" />
    </svg>
  </span>
  <input
    type="text"
    placeholder="Rechercher un utilisateur..."
    className="border border-gray-300 rounded-md px-10 py-2 w-full max-w-sm"
    value={searchTerm}
    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
  />
</div>

        <button
          onClick={() => setIsAdding(true)}
          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Ajouter un utilisateur
        </button>
      </div>

      {/* --- Compteur utilisateurs affichés --- */}

      <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold">{filteredUsers.length}</p>
          </div>

      {/* --- Formulaire d'ajout --- */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50">
          {error && <div className="mb-2 text-red-600">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              name="nom"
              placeholder="Nom"
              value={newUser.nom}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded-md"
            />
            <input
              required
              name="email"
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded-md"
            />
            <input
              required
              name="numero_telephone"
              placeholder="Téléphone"
              value={newUser.numero_telephone}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded-md"
            />
            <input
              required
              name="password"
              type="password"
              placeholder="Mot de passe"
              value={newUser.password}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded-md"
            />
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewUser({ email: '', password: '', nom: '', numero_telephone: '' });
                setError(null);
              }}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* --- Loading & Table des utilisateurs --- */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>{['Nom', 'Email', 'Statut', 'Actions'].map(col => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}</tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    <input type="checkbox" checked={user.active} readOnly className="h-4 w-4 text-indigo-600 rounded" />
                    <span className="ml-2 text-sm text-gray-500">{user.active ? 'Actif' : 'Inactif'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onClick={() => navigate(`/users/edit/${user.id}`)} className="text-indigo-600 hover:text-indigo-900 mr-3">Modifier</button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredUsers.length > usersPerPage && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
