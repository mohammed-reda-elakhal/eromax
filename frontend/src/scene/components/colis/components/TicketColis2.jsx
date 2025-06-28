import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, PDFDownloadLink } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

const styles = StyleSheet.create({
  page: {
    width: '100mm',
    height: '100mm',
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#f7fafc',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    marginBottom: 2,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 6,
  },
  codeSuivi: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    letterSpacing: 1.2,
    flex: 1,
    textAlign: 'right',
  },
  region: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 2,
    marginTop: -6,
  },
  codesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  qr: {
    width: 50,
    height: 50,
  },
  barcode: {
    width: 130,
    height: 40,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 7,
    padding: 7,
    width: '48%',
    minHeight: 80,
    boxShadow: '0 1px 4px #e2e8f0',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 3,
    paddingBottom: 4,
    textAlign: 'center',
  },
  infoLine: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    width: 34,
    fontSize: 8,
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 8,
    color: '#0f172a',
    textAlign: 'center',
    flex: 1,
  },
  price: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 2,
  },
  messageFooter: {
    fontSize: 8,
    textAlign: 'center',
    boxShadow: '0 1px 4px #e2e8f0',
    margin: '6px 0',
    padding: '6px 8px',
    backgroundColor: '#fff',
  },
  downloadBtn: {
    marginTop: 8,
    padding: '6px 16px',
    backgroundColor: '#1677ff',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 14,
  },
});

const generateBarcode = (text) => {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, { format: 'CODE128', width: 2, height: 40, displayValue: false, margin: 0 });
    return canvas.toDataURL('image/png');
  } catch (e) {
    return null;
  }
};

// Helper to generate QR/barcode for a list of colis
const useColisCodes = (colisList) => {
  const [codes, setCodes] = useState([]);
  useEffect(() => {
    if (!colisList || !colisList.length) return;
    Promise.all(
      colisList.map(async (colis) => {
        const qr = await QRCode.toDataURL(colis.code_suivi, { width: 300, margin: 1 });
        const barcode = generateBarcode(colis.code_suivi);
        return { qr, barcode };
      })
    ).then(setCodes);
  }, [colisList]);
  return codes;
};

const TicketPDF = ({ colisList, codes }) => (
  <Document>
    {colisList.map((colis, idx) => (
      <Page key={colis.code_suivi || idx} size={{ width: 283.46, height: 283.46 }} style={styles.page}>
        {/* Header Row: Logo + Code Suivi */}
        <View style={styles.headerRow}>
          <Image src={'/image/logo-light.png'} style={styles.logo} />
          <Text style={styles.codeSuivi}>{colis?.code_suivi || ''}</Text>
        </View>
        {/* Region under code suivi */}
        <Text style={styles.region}>{colis?.regionData?.nom || colis?.region?.nom || ''}</Text>
        {/* QR and Barcode Row */}
        <View style={styles.codesRow}>
          {codes[idx]?.qr && <Image src={codes[idx].qr} style={styles.qr} />}
          {codes[idx]?.barcode && <Image src={codes[idx].barcode} style={styles.barcode} />}
        </View>
        {/* Info Row: Store (left), Colis (right) */}
        <View style={styles.infoRow}>
          {/* Store Info */}
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Expéditeur (Store)</Text>
            <View style={styles.infoLine}><Text style={styles.value}>{colis?.storeData?.storeName || colis?.store?.storeName || ''}</Text></View>
            <View style={styles.infoLine}><Text style={styles.value}>{colis?.storeData?.tele || colis?.store?.tele || ''}</Text></View>
          </View>
          {/* Colis Info */}
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Informations Colis</Text>
            <View style={styles.infoLine}><Text style={styles.label}>Nom:</Text><Text style={styles.value}>{colis?.nom || ''}</Text></View>
            <View style={styles.infoLine}><Text style={styles.label}>Tél:</Text><Text style={styles.value}>{colis?.tele || ''}</Text></View>
            <View style={styles.infoLine}><Text style={styles.label}>Prix:</Text><Text style={styles.price}>{colis?.prix || ''} DH</Text></View>
            <View style={styles.infoLine}><Text style={styles.label}>Ville:</Text><Text style={styles.value}>{colis?.villeData?.nom || colis?.ville?.nom || ''}</Text></View>
            <View style={styles.infoLine}><Text style={styles.label}>Adresse:</Text><Text style={styles.value}>{colis?.adresse || ''}</Text></View>
            <View style={styles.infoLine}><Text style={styles.label}>Produit:</Text><Text style={styles.value}>{colis?.nature_produit || ''}</Text></View>
            <View style={styles.infoLine}><Text style={styles.label}>Région:</Text><Text style={styles.value}>{colis?.regionData?.nom || colis?.region?.nom || ''}</Text></View>
          </View>
        </View>
        {/* Footer */}
        <View>
          <Text style={styles.messageFooter}>Eromax est uniquement responsable de la livraison</Text>
        </View>
      </Page>
    ))}
  </Document>
);

// Main component for single or batch
function TicketColis2({ colis, colisList }) {
  // Support both single and batch mode
  const list = colisList || (colis ? [colis] : []);
  const codes = useColisCodes(list);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <PDFViewer style={{ width: 500, height: 500 }}>
        <TicketPDF colisList={list} codes={codes} />
      </PDFViewer>
      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <PDFDownloadLink
          document={<TicketPDF colisList={list} codes={codes} />}
          fileName={list.length > 1 ? `Tickets-Colis.pdf` : `Ticket-${list[0]?.code_suivi || 'colis'}.pdf`}
        >
          {({ loading }) => (
            <button disabled={loading} style={styles.downloadBtn}>
              {loading ? 'Préparation...' : list.length > 1 ? 'Télécharger tous les tickets' : 'Télécharger PDF'}
            </button>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
}

export default TicketColis2; 