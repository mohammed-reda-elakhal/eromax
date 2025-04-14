import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    width: '450px',
    height: '450px',
    padding: 30,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  typeSection: {
    textAlign: 'center',
    marginBottom: 15,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  livreurSection: {
    textAlign: 'center',
    marginBottom: 20,
  },
  livreurLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  livreurValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  footer: {
    marginTop: 'auto',
    fontSize: 10,
  },
  dateSection: {
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  commentaire: {
    marginTop: 10,
    padding: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    fontSize: 10,
  }
});

const TicketTemplate = ({ data }) => (
  <Document>
    <Page size={[450, 450]} style={styles.page}>
      {/* Header with large EROMAX DELIVERY */}
      <View style={styles.header}>
        <Text style={styles.logo}>EROMAX DELIVERY</Text>
      </View>

      {/* Type section */}
      <View style={styles.typeSection}>
        <Text style={styles.typeValue}>{data.type}</Text>
      </View>

      {/* Livreur section with large name */}
      <View style={styles.livreurSection}>
        <Text style={styles.livreurValue}>{data.livreur}</Text>
      </View>

      {/* Footer with date and commentaire */}
      <View style={styles.footer}>
        <View style={styles.dateSection}>
          <Text>
            {data.date}
          </Text>
        </View>

        {data.commentaire && (
          <View style={styles.commentaire}>
            <Text style={styles.label}>Commentaire:</Text>
            <Text>{data.commentaire}</Text>
          </View>
        )}
      </View>
    </Page>
  </Document>
);

export default TicketTemplate;
