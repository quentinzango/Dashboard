import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeft: '5px solid #2ecc71',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  supplierInfo: {
    flexDirection: 'column',
    width: '60%',
  },
  supplierName: {
    fontSize: 22,
    fontWeight: 800,
    color: '#27ae60',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  supplierDetails: {
    fontSize: 10,
    color: '#34495e',
    marginBottom: 4,
  },
  invoiceInfo: {
    textAlign: 'right',
    width: '40%',
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 10,
    color: '#2c3e50',
    backgroundColor: '#2ecc71',
    padding: '5px 10px',
    borderRadius: 4,
  },
  section: {
    marginBottom: 25,
    border: '1px solid #e0f2e9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12,
    color: 'white',
    backgroundColor: '#27ae60',
    padding: 10,
    paddingLeft: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: '8px 15px',
    backgroundColor: '#f8fff9',
    borderBottom: '1px solid #e0f2e9',
  },
  rowAlt: {
    backgroundColor: '#f0f9f3',
  },
  label: {
    fontWeight: 600,
    width: '60%',
    color: '#2c3e50',
    fontSize: 12,
  },
  value: {
    width: '40%',
    textAlign: 'right',
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: 600,
  },
  valueHighlight: {
    color: '#27ae60',
    fontWeight: 700,
  },
  summary: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f0fdf9',
    border: '1px solid #b2f5e4',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  amountLarge: {
    fontSize: 24,
    fontWeight: 800,
    marginTop: 10,
    color: '#27ae60',
    textAlign: 'right',
    backgroundColor: '#d4f8e8',
    padding: '8px 15px',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#7f8c8d',
    paddingTop: 10,
    borderTop: '2px dashed #b2f5e4',
  },
  status: {
    padding: 8,
    borderRadius: 20,
    textAlign: 'center',
    fontWeight: 700,
    marginTop: 5,
    width: '100%',
    fontSize: 12,
  },
  statusPaid: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #28a745',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffc107',
  },
  statusUnpaid: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #dc3545',
  },
  logoContainer: {
    backgroundColor: '#f0fdf9',
    padding: 5,
    borderRadius: 4,
    marginBottom: 10,
    alignSelf: 'flex-start',
    border: '1px solid #b2f5e4',
  }
});

const InvoiceTemplate = ({ bill }) => {
  if (!bill) return null;

  // Fonction pour récupérer le logo du fournisseur
  const getSupplierLogo = () => {
    if (bill.abonne?.fournisseur_energie?.logo) {
      return `https://www.emkit.site${bill.abonne.fournisseur_energie.logo}`;
    }
    return null;
  };

  // Convertir les valeurs en nombres
  const montant = typeof bill.montant === 'number' ? bill.montant : parseFloat(bill.montant || 0);
  const consommation = typeof bill.consommation === 'number'
    ? bill.consommation
    : parseFloat(bill.consommation || 0);

  // Formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return isNaN(date) ? 'Date invalide' : date.toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  // Calculs
  const prixUnitaire = consommation > 0 ? montant / consommation : 0;
  const montantHT = montant * 0.82;
  const tva = montant * 0.18;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec logo */}
        <View style={styles.header}>
          <View style={styles.supplierInfo}>
            {getSupplierLogo() && (
              <View style={styles.logoContainer}>
                <Image
                  src={getSupplierLogo()}
                  style={{ width: 120, height: 40 }}
                />
              </View>
            )}
            <Text style={styles.supplierName}>{bill.abonne?.fournisseur_energie?.nom || 'Fournisseur inconnu'}</Text>
            <Text style={styles.supplierDetails}>Siege Social: {bill.abonne?.fournisseur_energie?.siege_social || 'Non spécifié'}</Text>
          </View>

          <View style={styles.invoiceInfo}>
            <Text style={styles.title}>FACTURE #{bill.id || 'N/A'}</Text>
            <Text style={{ marginTop: 5, color: '#2c3e50' }}>Date d'émission: {formatDate(bill.date_emission)}</Text>
            <Text style={{ color: '#2c3e50' }}>Période: {bill.periode || 'Période inconnue'}</Text>
          </View>
        </View>

        {/* Informations client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS CLIENT</Text>
          <View style={[styles.row, styles.rowAlt]}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>
              {(bill.abonne && bill.abonne.split('(')[0]?.trim()) || 'Abonné inconnu'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>
              {(bill.abonne && bill.abonne.split('(')[1]?.replace(')', '')) || 'Email inconnu'}
            </Text>
          </View>
        </View>

        {/* Details de la facture */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DÉTAILS DE LA FACTURE</Text>
          <View style={[styles.row, styles.rowAlt]}>
            <Text style={styles.label}>Consommation (kWh):</Text>
            <Text style={[styles.value, styles.valueHighlight]}>{consommation} kWh</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Prix unitaire moyen:</Text>
            <Text style={[styles.value, styles.valueHighlight]}>{prixUnitaire.toFixed(2)} FCFA/kWh</Text>
          </View>
          <View style={[styles.row, styles.rowAlt]}>
            <Text style={styles.label}>Montant HT:</Text>
            <Text style={styles.value}>{montantHT.toFixed(2)} FCFA</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>TVA (18%):</Text>
            <Text style={styles.value}>{tva.toFixed(2)} FCFA</Text>
          </View>
          <View style={[styles.row, styles.rowAlt, { borderBottomWidth: 0 }]}>
            <Text style={{ ...styles.label, fontWeight: 800, color: '#2c3e50' }}>Montant TTC:</Text>
            <Text style={{ ...styles.value, fontWeight: 800, color: '#27ae60' }}>{montant.toFixed(2)} FCFA</Text>
          </View>
        </View>

        {/* Résumé et statut */}
        <View style={styles.summary}>
          <View style={[styles.row, { borderBottomWidth: 0, backgroundColor: 'transparent' }]}>
            <Text style={[styles.label, { fontSize: 14 }]}>Statut de paiement:</Text>
            <Text style={[
              styles.status,
              bill.statut === 'payee' ? styles.statusPaid :
                bill.statut === 'en_attente' ? styles.statusPending :
                  styles.statusUnpaid
            ]}>
              {bill.statut ? bill.statut.toUpperCase() : 'STATUT INCONNU'}
            </Text>
          </View>

          <Text style={styles.amountLarge}>Total: {montant.toFixed(2)} FCFA</Text>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={{ color: '#27ae60', fontWeight: 'bold' }}>
            {bill.abonne?.fournisseur_energie?.nom || 'Fournisseur'} • contact@{bill.abonne?.fournisseur_energie?.nom?.toLowerCase() || 'fournisseur'}.com
          </Text>
          <Text>+237 690 000 000 • Merci pour votre confiance !</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceTemplate;