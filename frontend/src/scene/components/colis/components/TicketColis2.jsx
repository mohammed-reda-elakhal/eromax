import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, PDFDownloadLink, Font } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

// Register local Arabic font for PDF
Font.register({
  family: 'NotoSansArabic',
  src: '/fonts/NotoSansArabic-Regular.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

// --- SIMPLE & ELEGANT TICKET STYLES ---
const styles = StyleSheet.create({
  page: {
    width: 283.46, // 10cm
    height: 283.46, // 10cm
    padding: 8, // réduit
    fontFamily: 'NotoSansArabic',
    backgroundColor: '#fff',
    color: '#22223b',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    border: '1.2px solid #e2e8f0',
    boxSizing: 'border-box',
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  logoBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 4,
    objectFit: 'contain',
  },
  brandName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    letterSpacing: 1,
  },
  codeSuiviSmall: {
    fontSize: 8,
    color: '#1e40af',
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: 60,
  },
  infoSection: {
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    backgroundColor: '#f8fafc',
    padding: 5, // réduit
    marginBottom: 4, // réduit
    width: '100%',
    height: 82, // fixed height
    overflow: 'hidden',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 7.5, // réduit
    color: '#64748b',
    fontWeight: 'bold',
    minWidth: 40, // réduit
  },
  value: {
    fontSize: 8.5, // réduit
    color: '#22223b',
    fontWeight: 'normal',
    maxWidth: 90, // réduit
    wordBreak: 'break-word',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  addressValue: {
    fontSize: 8.5,
    color: '#22223b',
    fontWeight: 'normal',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    width: '100%',
    marginLeft: 4,
  },
  booleanValue: {
    fontSize: 7.5,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    textAlign: 'center',
    minWidth: 25,
    marginTop: 8,
  },
  booleanTrue: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
  booleanFalse: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  booleanNeutral: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    border: '1px solid #d1d5db',
  },
  codeSuivi: {
    fontSize: 9, // réduit
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
    marginVertical: 2, // réduit
    letterSpacing: 0.5,
  },
  codesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4, // réduit
    paddingHorizontal: 2, // réduit
  },
  qr: {
    width: 50, // réduit
    height: 50, // réduit
  },
  barcode: {
    width: 120, // réduit
    height: 40, // réduit
  },
  storeSection: {
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    backgroundColor: '#f1f5f9',
    padding: 3, // plus petit
    marginBottom: 2, // plus petit
  },
  storeTitle: {
    fontSize: 7, // plus petit
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 1,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  storeValue: {
    fontSize: 7, // plus petit
    color: '#22223b',
    marginRight: 8,
    marginBottom: 0,
  },
  footer: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: 3, // réduit
    marginTop: 4, // réduit
    fontSize: 7, // réduit
    color: '#64748b',
    textAlign: 'center',
  },
  downloadBtn: {
    marginTop: 8,
    padding: '6px 16px',
    backgroundColor: '#1677ff',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 14,
    cursor: 'pointer',
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
        {/* Logo, Brand, Code suivi */}
        <View style={styles.logoBox}>
          <View style={styles.logoBrand}>
            <Image src="/image/logo-light.png" style={styles.logo} />
            <Text style={styles.brandName}>EROMAX</Text>
          </View>
          <Text style={styles.codeSuiviSmall}>{colis?.code_suivi || ''}</Text>
        </View>
        {/* Infos Colis réorganisées */}
        <View style={styles.infoSection}>
          {/* Nom & Tél sur une ligne */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>{colis?.nom || ''}</Text>
            <Text style={styles.label}>Tél:</Text>
            <Text style={styles.value}>{colis?.tele || ''}</Text>
          </View>
          {/* Ville & Prix sur une ligne */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ville:</Text>
            <Text style={styles.value}>{colis?.villeData?.nom || colis?.ville?.nom || ''}</Text>
            <Text style={styles.label}>Prix:</Text>
            <Text style={styles.value}>{colis?.prix || ''} DH</Text>
          </View>
           {/* Région  */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Région:</Text>
            <Text style={styles.value}>{colis?.regionData?.nom || colis?.region?.nom || ''}</Text>
            <Text style={styles.label}>Produit :</Text>
            <Text style={styles.value}>{colis?.nature_produit || ''}</Text>
          </View>
          {/* Adresse seule */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 1 }}>
            <Text style={styles.label}>Adresse:</Text>
            <Text style={styles.addressValue}>{colis?.adresse || ''}</Text>
          </View>
         
          {/* Fragile & Remplacer sur une ligne */}
          <View style={styles.infoRow}>
            <Text style={[styles.booleanValue, colis?.ouvrir ? styles.booleanTrue : styles.booleanFalse]}>
              {colis?.ouvrir ? 'Ouvrir' : 'Non Ouvrir'}
            </Text>
            <Text style={[styles.booleanValue, colis?.is_fragile ? styles.booleanTrue : styles.booleanNeutral]}>
              {colis?.is_fragile ? 'Fragile' : ''}
            </Text>
            <Text style={[styles.booleanValue, colis?.is_remplace ? styles.booleanTrue : styles.booleanNeutral]}>
              {colis?.is_remplace ? 'Remplacer' : ''}
            </Text>
          </View>
        </View>
        {/* Infos Expéditeur compactes */}
        <View style={styles.storeSection}>
          <Text style={styles.storeTitle}>Expéditeur</Text>
          <View style={styles.storeRow}>
            <Text style={styles.storeValue}>
              {colis?.storeData?.storeName || colis?.store?.storeName || ''}
            </Text>
            <Text style={styles.storeValue}>
              {colis?.storeData?.tele || colis?.store?.tele || ''}
            </Text>
          </View>
        </View>
        {/* QR & Barcode */}
        <View style={styles.codesRow}>
          {codes[idx]?.qr && <Image src={codes[idx].qr} style={styles.qr} />}
          {codes[idx]?.barcode && <Image src={codes[idx].barcode} style={styles.barcode} />}
        </View>
        {/* Footer */}
        <Text style={styles.footer}>إيروماكس مسؤولة فقط عن التوصيل</Text>
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