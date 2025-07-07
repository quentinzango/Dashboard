import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

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

  // Fonction pour générer le PDF avec style
  const handleGeneratePDF = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      // Récupérer l'utilisateur connecté
      const userRes = await fetch('https://www.emkit.site/api/v1/auth/users/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userRes.json();

      let logoUrl = '';
      let supplierName = 'Fournisseur';

      // Récupérer le fournisseur selon le rôle
      if (userData.role === 'administrateur') {
        const adminRes = await fetch(`https://www.emkit.site/api/v1/administrateurs/?utilisateur=${userData.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const adminData = await adminRes.json();
        const admins = adminData.results || adminData; // Gestion pagination
        const admin = admins.length > 0 ? admins[0] : null;
        
        if (admin?.fournisseur_energie) {
          const supplierRes = await fetch(`https://www.emkit.site/api/v1/fournisseurs/${admin.fournisseur_energie}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const supplierData = await supplierRes.json();
          logoUrl = `https://www.emkit.site${supplierData.logo}`;
          supplierName = supplierData.nom;
        }
      } 
      else if (userData.role === 'technicien') {
        const techRes = await fetch(`https://www.emkit.site/api/v1/techniciens/?utilisateur=${userData.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const techData = await techRes.json();
        const techs = techData.results || techData; // Gestion pagination
        const tech = techs.length > 0 ? techs[0] : null;
        
        if (tech?.fournisseur_energie) {
          const supplierRes = await fetch(`https://www.emkit.site/api/v1/fournisseurs/${tech.fournisseur_energie}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const supplierData = await supplierRes.json();
          logoUrl = `https://www.emkit.site${supplierData.logo}`;
          supplierName = supplierData.nom;
        }
      }

      // Création du PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Palette de couleurs
      const primaryColor = '#4CAF50'; // Vert
      const secondaryColor = '#2196F3'; // Bleu
      const accentColor = '#FF9800'; // Orange
      const darkColor = '#333333';
      const lightBlue = '#E3F2FD';

      // Dimensions utiles
      const pageWidth = 210;
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      // En-tête stylisé
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, pageWidth, 25, 'F');

      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text("FICHE D'INSCRIPTION", pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(10);
      doc.text("Formulaire d'enregistrement client", pageWidth / 2, 22, { align: 'center' });

      // Logo
      if (logoUrl) {
        try {
          // Ajouter le logo en base64 (dans une application réelle, il faudrait convertir l'URL en base64)
          doc.addImage(logoUrl, 'jpg', margin, 12, 40, 15);
        } catch (e) {
          console.error("Erreur chargement logo", e);
          doc.setFontSize(8);
          doc.setTextColor(primaryColor);
          doc.text("LOGO", margin, 14);
        }
      } else {
        doc.setFillColor(255, 255, 255);
        doc.circle(margin, 12, 6, 'F');
        doc.setFontSize(8);
        doc.setTextColor(primaryColor);
        doc.text("LOGO", margin - 3, 14);
      }

      // Position verticale initiale
      let y = 35;

      // Fonction pour ajouter un champ
      const addField = (label) => {
        // Label
        doc.setFontSize(10);
        doc.setTextColor(darkColor);
        doc.setFont('helvetica', 'normal');
        doc.text(`${label}:`, margin, y);
        // Ligne de saisie
        doc.setDrawColor(200);
        doc.setLineWidth(0.2);
        doc.line(margin + 30, y - 1, margin + 30 + (contentWidth - 30), y - 1);
        y += 7;
      };

      // Fonction pour ajouter une section
      const addSection = (title) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(lightBlue);
        doc.rect(margin, y, contentWidth, 8, 'F');

        doc.setFontSize(12);
        doc.setTextColor(darkColor);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 5, y + 5.5);

        y += 10;
      };

      // SECTION 1: Informations Personnelles
      addSection("1. Informations Personnelles");
      addField("Nom Complet");
      addField("Email");
      addField("Profession");

      // SECTION 2: Coordonnées
      addSection("2. Coordonnées");
      addField("Téléphone Principal");
      addField("Téléphone Secondaire");
      addField("Ville");
      addField("Adresse Complète");

      // SECTION 3: Informations Professionnelles
      addSection("3. Informations Professionnelles");
      addField("Entreprise");
      addField("Secteur d'Activité");

      // SECTION 4: Informations Supplémentaires
      addSection("4. Informations Supplémentaires");
      doc.setFontSize(10);
      doc.setTextColor(darkColor);
      doc.setFont('helvetica', 'normal');
      doc.text("Comment avez-vous connu nos services?", margin, y);
      y += 5;
      doc.setDrawColor(secondaryColor);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 1, margin + contentWidth - 30, y - 1);
      y += 8;
      doc.text("Quels sont vos besoins spécifiques?", margin, y);
      y += 5;
      doc.roundedRect(margin, y, contentWidth - 30, 20, 3, 3, 'S');
      y += 25;
      doc.text("Commentaires supplémentaires:", margin, y);
      y += 5;
      doc.roundedRect(margin, y, contentWidth - 30, 15, 3, 3, 'S');
      y += 20;

      // SECTION 5: Signature et Date
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      addSection("5. Signature et Approbation");
      y += 5;
      doc.setFontSize(10);
      doc.setTextColor(darkColor);
      doc.setFont('helvetica', 'normal');
      doc.text("Signature du Client:", margin, y);
      doc.setDrawColor(accentColor);
      doc.setLineWidth(0.8);
      doc.line(margin + 40, y + 4, margin + 120, y + 4);
      y += 15;
      doc.text("Date:", margin, y);
      doc.line(margin + 20, y + 4, margin + 100, y + 4);
      y += 10;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("En signant ce formulaire, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.",
        margin, y, { maxWidth: contentWidth });
      y += 8;

      // Pied de page
      doc.setFillColor(primaryColor);
      doc.rect(0, 280, pageWidth, 15, 'F');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`© ${new Date().getFullYear()} ${supplierName} - Tous droits réservés`,
        pageWidth / 2, 286, { align: 'center' });
      doc.text("Confidentialité garantie", pageWidth / 2, 292, { align: 'center' });

      // Générer le PDF et l'ouvrir dans un nouvel onglet
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Ouvrir dans un nouvel onglet
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
          <head>
            <title>Fiche d'inscription</title>
            <style>
              body { margin: 0; padding: 20px; background-color: #f5f5f5; }
              .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .actions { margin-top: 20px; text-align: center; }
              button { padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Fiche d'inscription prête</h1>
                <p>Votre fiche d'inscription a été générée avec succès.</p>
              </div>
              <iframe 
                src="${pdfUrl}" 
                width="100%" 
                height="600px" 
                style="border: none;"
              ></iframe>
              <div class="actions">
                <button onclick="downloadPDF()">Télécharger le PDF</button>
              </div>
            </div>
            <script>
              function downloadPDF() {
                const link = document.createElement('a');
                link.href = '${pdfUrl}';
                link.download = 'fiche_inscription.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
      
    } catch (err) {
      console.error("Erreur lors de la génération du PDF", err);
      alert("Une erreur est survenue lors de la génération du PDF");
    }
  };

  // Fonction pour charger les utilisateurs
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
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      <h1 className="text-2xl font-bold text-gray-900">Liste des Utilisateurs</h1>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"/>
              <line x1="16.65" y1="16.65" x2="21" y2="21"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="border border-gray-300 rounded-md px-10 py-2 w-full"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={handleGeneratePDF}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-md hover:from-green-600 hover:to-teal-700 flex items-center shadow-md transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Fiche d'inscription
          </button>
          
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700 flex items-center shadow-md transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-gray-500">Utilisateurs Totaux</h3>
        <p className="text-2xl font-bold">{filteredUsers.length}</p>
      </div>

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
              className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              required
              name="email"
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              required
              name="numero_telephone"
              placeholder="Téléphone"
              value={newUser.numero_telephone}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              required
              name="password"
              type="password"
              placeholder="Mot de passe"
              value={newUser.password}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Nom', 'Email', 'Statut', 'Actions'].map(col => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    <input type="checkbox" checked={user.is_active} readOnly className="h-4 w-4 text-indigo-600 rounded"/>
                    <span className="ml-2 text-sm text-gray-500">{user.is_active ? 'Actif' : 'Inactif'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => navigate(`/users/edit/${user.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 hover:underline"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length > usersPerPage && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-gray-50 gap-4">
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
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-blue-500'
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
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-blue-500'
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