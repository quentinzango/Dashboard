// src/components/pages/InvoiceTemplate.jsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

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
    borderBottomWidth: 2,
    borderBottomColor: '#112131',
    borderBottomStyle: 'solid',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4a5568',
    backgroundColor: '#edf2f7',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
    color: '#4a5568',
  },
  value: {
    width: '60%',
  },
  summary: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2b6cb0',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#718096',
  },
  status: {
    padding: 5,
    borderRadius: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 5,
  },
  statusPaid: {
    backgroundColor: '#c6f6d5',
    color: '#276749',
  },
  statusPending: {
    backgroundColor: '#feebc8',
    color: '#9c4221',
  },
  statusUnpaid: {
    backgroundColor: '#fed7d7',
    color: '#9b2c2c',
  },
});

const InvoiceTemplate = ({ bill }) => {
  // Récupérer le nom du fournisseur depuis la facture
  const fournisseurNom = bill.fournisseur_nom || "EnMKit Energy Solutions";

  const getStatusStyle = () => {
    switch(bill.statut) {
      case 'payee':
        return [styles.status, styles.statusPaid];
      case 'en_attente':
        return [styles.status, styles.statusPending];
      case 'impayee':
        return [styles.status, styles.statusUnpaid];
      default:
        return styles.status;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FACTURE D'ÉLECTRICITÉ</Text>
            <Text>{fournisseurNom}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations client</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Abonné:</Text>
            <Text style={styles.value}>{bill.abonne}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Période facturée:</Text>
            <Text style={styles.value}>{bill.periode}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de consommation</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Consommation (kWh):</Text>
            <Text style={styles.value}>{bill.consommation} kWh</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Montant total:</Text>
            <Text style={styles.value}>{bill.montant} FCFA</Text>
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.row}>
            <Text style={styles.label}>Statut:</Text>
            <Text style={[styles.value, ...getStatusStyle()]}>
              {bill.statut.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.amount}>{bill.montant} FCFA</Text>
        </View>

        <View style={styles.footer}>
          <Text>{fournisseurNom} • contact@emkit.com • +237 690 000 000</Text>
          <Text>Merci pour votre confiance !</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceTemplate;