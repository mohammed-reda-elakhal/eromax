import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    width: '450px',
    height: '450px',
    padding: 30,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {
    fontSize: 12,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  commentaire: {
    marginTop: 20,
    padding: 10,
    borderStyle: 'solid',
    borderWidth: 1,
  }
});

const TicketTemplate = ({ data }) => (
  <Document>
    <Page size={[450, 450]} style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.logo}>EROMAX DELIVERY</Text>
      </View>
      
      <View style={styles.content}>
        <Text>
          <Text style={styles.label}>Livreur:</Text>
          {data.livreur}
        </Text>
      </View>

      <View style={styles.content}>
        <Text>
          <Text style={styles.label}>Type:</Text>
          {data.type}
        </Text>
      </View>

      <View style={styles.content}>
        <Text>
          <Text style={styles.label}>Date:</Text>
          {data.date}
        </Text>
      </View>

      {data.commentaire && (
        <View style={styles.commentaire}>
          <Text style={styles.label}>Commentaire:</Text>
          <Text>{data.commentaire}</Text>
        </View>
      )}
    </Page>
  </Document>
);

export default TicketTemplate;
