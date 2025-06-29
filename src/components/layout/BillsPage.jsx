// src/components/pages/BillsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoiceTemplate from './InvoiceTemplate';

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'payee', 'en_attente', 'impayee'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // nombre d'éléments par page

  // ─── 1) Récupération des factures ─────────────────────────────────
  const fetchBills = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Non authentifié');
      setLoading(false);
      return;
    }

    try {
      let url = 'https://www.emkit.site/factures/';
      if (filter !== 'all') url += `?statut=${filter}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des factures');
      const data = await response.json();
      setBills(data);
      setError(null);
      setCurrentPage(1); // reset page on new fetch
    } catch (err) {
      setError(err.message);
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // ─── 2) Paiement manuel d'une facture ─────────────────────────────
  const handlePayBill = async (billId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch(
        `https://www.emkit.site/factures/${billId}/pay/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du paiement');
      }

      await fetchBills();
      alert('Facture payée avec succès!');
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    }
  };

  // ─── 3) Affichage et téléchargement de la facture au format PDF ───
  const handleViewInvoice = (bill) => {
    // Créer le document PDF
    const blobPromise = pdf(<InvoiceTemplate bill={bill} />).toBlob();
    
    blobPromise.then(blob => {
      // Créer une URL pour le blob
      const url = URL.createObjectURL(blob);
      const filename = `facture_${bill.abonne.replace(/\s+/g, '_')}_${bill.periode}.pdf`;
      
      // Ouvrir dans un nouvel onglet pour visualisation
      const newWindow = window.open(url, '_blank');
      
      // Créer un lien de téléchargement caché
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      
      // Ajouter un bouton de téléchargement dans le nouvel onglet
      if (newWindow) {
        newWindow.onload = () => {
          const downloadBtn = newWindow.document.createElement('button');
          downloadBtn.innerText = 'Télécharger la facture';
          downloadBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
            font-family: Arial, sans-serif;
            font-size: 14px;
          `;
          
          downloadBtn.onclick = () => {
            downloadLink.click();
            
            // Nettoyer après 1 seconde
            setTimeout(() => {
              document.body.removeChild(downloadLink);
              URL.revokeObjectURL(url);
            }, 1000);
          };
          
          newWindow.document.body.appendChild(downloadBtn);
        };
      } else {
        // Si la fenêtre n'a pas pu s'ouvrir, déclencher le téléchargement directement
        downloadLink.click();
        
        // Nettoyer après 1 seconde
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
        }, 1000);
      }
    });
  };

  // ─── Effet : chargement au montage et à chaque changement de filtre ─
  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // ─── Filtrage côté client (recherche) ───────────────────────────────
  const filteredBills = bills.filter((bill) =>
    bill.abonne.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.periode.includes(searchTerm)
  );

  // ─── Pagination : calculer les données à afficher ──────────────────
  const pageCount = Math.ceil(filteredBills.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBills = filteredBills.slice(startIndex, startIndex + pageSize);

  // ─── Affichage ─────────────────────────────────────────────────────
  if (loading) return <div className="text-center py-10">Chargement des factures...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Gestion des factures</h2>
      {/* Barre de recherche & filtres */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <input
          type="text"
          placeholder="Rechercher par abonné ou période..."
          className="w-full md:w-1/3 p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Toutes', color: 'bg-blue-500 text-white' },
            { key: 'payee', label: 'Payées', color: 'bg-green-500 text-white' },
            { key: 'en_attente', label: 'En attente', color: 'bg-yellow-500 text-white' },
            { key: 'impayee', label: 'Impayées', color: 'bg-red-500 text-white' }
          ].map(({ key, label, color }) => (
            <button
              key={key}
              className={`px-4 py-2 rounded ${filter === key ? color : 'bg-gray-200'}`} 
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {/* Tableau des factures */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Abonné', 'Période', 'Consommation (kWh)', 'Montant (FCFA)', 'Statut', 'Actions'].map((heading) => (
                <th
                  key={heading}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedBills.map((bill) => (
              <tr key={bill.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {bill.abonne}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bill.periode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bill.consommation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bill.montant}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    bill.statut === 'payee'
                      ? 'bg-green-100 text-green-800'
                      : bill.statut === 'impayee'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>{bill.statut}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                  <button
                    onClick={() => handleViewInvoice(bill)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Voir la facture
                  </button>
                  {(bill.statut === 'en_attente' || bill.statut === 'impayee') ? (
                    <button
                      onClick={() => handlePayBill(bill.id)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Payer
                    </button>
                  ) : (
                    <span className="text-gray-400">Payée</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBills.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune facture trouvée</p>
          </div>
        )}
      </div>
      {/* Pagination Controls */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Précédent
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pageCount))}
            disabled={currentPage === pageCount}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default BillsPage;