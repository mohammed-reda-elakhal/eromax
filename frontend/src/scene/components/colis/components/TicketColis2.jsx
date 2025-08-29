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

// --- COMPACT 10x10CM TICKET STYLES ---
const styles = StyleSheet.create({
  page: {
    width: 283.46, // 10cm
    height: 283.46, // 10cm
    padding: 6, // Reduced padding for more space
    fontFamily: 'NotoSansArabic',
    backgroundColor: '#fff',
    color: '#000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    border: '2px solid #000',
    boxSizing: 'border-box',
  },

  // Compact header section
  headerSection: {
    borderBottom: '1px solid #000',
    paddingBottom: 3, // Reduced
    marginBottom: 4, // Reduced
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 1, // Reduced
  },
  logoBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3, // Reduced
  },
  logo: {
    width: 24, // Reduced from 32
    height: 24, // Reduced from 32
    marginRight: 3, // Reduced
    objectFit: 'contain',
  },
  brandName: {
    fontSize: 11, // Reduced from 14
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.8, // Reduced
  },
  codeSuiviHeader: {
    fontSize: 7, // Reduced from 9
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 55, // Reduced
    border: '1px solid #000',
    padding: 3, // Reduced
    backgroundColor: '#f5f5f5',
  },

  // Compact main information section
  infoSection: {
    border: '1px solid #000',
    backgroundColor: '#fff',
    padding: 4, // Reduced from 8
    marginBottom: 4, // Reduced from 8
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1, // Reduced from 4
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 8,
    borderBottom: '0.5px solid #ccc',
    paddingBottom: 1,
    marginBottom: 1,
  },
  infoRowLast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 8,
    paddingBottom: 1,
    marginBottom: 0,
    borderBottom: 'none',
  },
  // Combined row for two fields side by side
  infoRowCombined: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 8,
    borderBottom: '0.5px solid #ccc',
    paddingBottom: 1,
    marginBottom: 1,
    justifyContent: 'space-between',
  },
  // Left side of combined row
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 4,
  },
  // Right side of combined row
  infoRowRight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginLeft: 4,
  },
  label: {
    fontSize: 6.5,
    color: '#000',
    fontWeight: 'bold',
    minWidth: 35,
    maxWidth: 35,
    textAlign: 'left',
  },
  // Label for combined rows (smaller width)
  labelCombined: {
    fontSize: 6.5,
    color: '#000',
    fontWeight: 'bold',
    minWidth: 25,
    maxWidth: 25,
    textAlign: 'left',
  },
  value: {
    fontSize: 6.5,
    color: '#000',
    fontWeight: 'normal',
    flex: 1,
    textAlign: 'left',
    maxWidth: 150,
  },
  // Value for combined rows (smaller max width)
  valueCombined: {
    fontSize: 6.5,
    color: '#000',
    fontWeight: 'normal',
    flex: 1,
    textAlign: 'left',
    maxWidth: 70,
  },

  // Triple combined row for three attributes
  infoRowTriple: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 8,
    paddingBottom: 1,
    marginBottom: 0,
    borderBottom: 'none',
    justifyContent: 'space-between',
  },

  // Each section in triple row
  infoRowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  // Label for triple row (smaller)
  labelTriple: {
    fontSize: 6,
    color: '#000',
    fontWeight: 'bold',
    marginRight: 2,
  },

  // OUI/NON text styling for boolean values
  checkbox: {
    fontSize: 6,
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 2,
    minWidth: 20,
    textAlign: 'center',
  },

  // Compact address styling
  addressValue: {
    fontSize: 6, // Reduced from 7.5
    color: '#000',
    fontWeight: 'normal',
    flex: 1,
    textAlign: 'left',
    lineHeight: 1.1, // Reduced from 1.2
    maxWidth: 150, // Reduced from 180
  },

  // Compact tracking code display
  codeSuiviSection: {
    border: '1px solid #000',
    backgroundColor: '#f8f8f8',
    padding: 2, // Reduced from 4
    marginBottom: 4, // Reduced from 8
    textAlign: 'center',
  },
  codeSuivi: {
    fontSize: 8, // Reduced from 10
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    letterSpacing: 0.5, // Reduced from 1
  },

  // Compact store/sender information section
  storeSection: {
    border: '1px solid #000',
    backgroundColor: '#fff',
    padding: 3, // Reduced from 6
    marginBottom: 4, // Reduced from 8
  },
  storeTitle: {
    fontSize: 6.5, // Reduced from 8
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2, // Reduced from 3
    borderBottom: '0.5px solid #ccc',
    paddingBottom: 1, // Reduced from 2
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6, // Reduced from 10
  },
  storeValue: {
    fontSize: 6, // Reduced from 7.5
    color: '#000',
    flex: 1,
    textAlign: 'left',
  },

  // Compact QR and Barcode section
  codesSection: {
    border: '1px solid #000',
    backgroundColor: '#fff',
    padding: 3, // Reduced from 6
    marginBottom: 4, // Reduced from 8
  },
  codesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6, // Reduced from 10
  },
  qr: {
    width: 40, // Reduced from 55 but still scannable
    height: 40, // Reduced from 55 but still scannable
    border: '1px solid #000',
  },
  barcode: {
    width: 110, // Reduced from 130 but still scannable
    height: 35, // Reduced from 45 but still scannable
    border: '1px solid #000',
  },

  // Compact footer section
  footer: {
    borderTop: '1px solid #000',
    paddingTop: 3, // Reduced from 6
    marginTop: 'auto', // Push to bottom
    fontSize: 6, // Reduced from 8
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  // Download button styling
  downloadBtn: {
    marginTop: 12,
    padding: '8px 20px',
    backgroundColor: '#000',
    color: '#fff',
    border: '2px solid #000',
    borderRadius: 0,
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 'bold',
    textTransform: 'uppercase',
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

// Helper function to truncate long text for compact layout
const truncateText = (text, maxLength = 25) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Helper function to get OUI/NON text for boolean values
const getBooleanText = (value) => {
  // Handle true values (boolean true, string "true", number 1)
  if (value === true || value === 'true' || value === 1 || value === '1') {
    return 'OUI'; // OUI for true/enabled/yes
  }
  // Handle false values (boolean false, string "false", number 0)
  if (value === false || value === 'false' || value === 0 || value === '0') {
    return 'NON'; // NON for false/disabled/no
  }
  // Handle undefined, null, or other values
  return 'NON'; // NON for unknown/not set
};

const TicketPDF = ({ colisList, codes }) => (
  <Document>
    {colisList.map((colis, idx) => (
      <Page key={colis.code_suivi || idx} size={{ width: 283.46, height: 283.46 }} style={styles.page}>

        {/* Header Section with Logo and Tracking Code */}
        <View style={styles.headerSection}>
          <View style={styles.logoBox}>
            <View style={styles.logoBrand}>
              <Image src="/image/logo-light.png" style={styles.logo} />
              <Text style={styles.brandName}>EROMAX</Text>
            </View>
            <Text style={styles.codeSuiviHeader}>{colis?.villeData?.nom || colis?.ville?.nom || ''}</Text>
          </View>
        </View>

        {/* Compact Tracking Code Section */}
        <View style={styles.codeSuiviSection}>
          <Text style={styles.codeSuivi}>{colis?.code_suivi || ''}</Text>
        </View>

        {/* Optimized Main Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoGrid}>
            {/* Combined Row: Name and Phone */}
            <View style={styles.infoRowCombined}>
              <View style={styles.infoRowLeft}>
                <Text style={styles.labelCombined}>Nom:</Text>
                <Text style={styles.valueCombined}>{truncateText(colis?.nom || '', 15)}</Text>
              </View>
              <View style={styles.infoRowRight}>
                <Text style={styles.labelCombined}>Tél:</Text>
                <Text style={styles.valueCombined}>{colis?.tele || ''}</Text>
              </View>
            </View>

            {/* Combined Row: City and Region */}
            <View style={styles.infoRowCombined}>
              <View style={styles.infoRowLeft}>
                <Text style={styles.labelCombined}>Prix:</Text>
                <Text style={styles.valueCombined}>{colis?.prix || ''} DH</Text>
              </View>
              <View style={styles.infoRowRight}>
                <Text style={styles.labelCombined}>Ville:</Text>
                <Text style={styles.valueCombined}>{truncateText(colis?.villeData?.nom || colis?.ville?.nom || '', 12)}</Text>
              </View>
            </View>

            {/* Combined Row: Price and Product Nature */}
            <View style={styles.infoRowCombined}>
              <View style={styles.infoRowRight}>
                <Text style={styles.labelCombined}>Produit:</Text>
                <Text style={styles.valueCombined}>{colis?.nature_produit}</Text>
              </View>
            </View>

            {/* Address - Single row (as requested) */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Adresse:</Text>
              <Text style={styles.addressValue}>{truncateText(colis?.adresse || '', 30)}</Text>
            </View>

            {/* Triple Combined Row: Ouvert, Remplacer, Fragile with OUI/NON */}
            <View style={styles.infoRowTriple}>
              <View style={styles.infoRowSection}>
                <Text style={styles.labelTriple}>Ouvert:</Text>
                <Text style={styles.checkbox}>{getBooleanText(colis?.ouvrir)}</Text>
              </View>
              <View style={styles.infoRowSection}>
                <Text style={styles.labelTriple}>Remplacer:</Text>
                <Text style={styles.checkbox}>{getBooleanText(colis?.is_remplace)}</Text>
              </View>
              <View style={styles.infoRowSection}>
                <Text style={styles.labelTriple}>Fragile:</Text>
                <Text style={styles.checkbox}>{getBooleanText(colis?.is_fragile)}</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Compact Store/Sender Information Section */}
        <View style={styles.storeSection}>
          <Text style={styles.storeTitle}>EXPÉDITEUR</Text>
          <View style={styles.storeRow}>
            <Text style={styles.storeValue}>
              {truncateText(colis?.storeData?.storeName || colis?.store?.storeName || 'N/A', 18)}
            </Text>
            <Text style={styles.storeValue}>
              {colis?.storeData?.tele || colis?.store?.tele || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Compact QR Code and Barcode Section */}
        <View style={styles.codesSection}>
          <View style={styles.codesRow}>
            {codes[idx]?.qr && <Image src={codes[idx].qr} style={styles.qr} />}
            {codes[idx]?.barcode && <Image src={codes[idx].barcode} style={styles.barcode} />}
          </View>
        </View>

        {/* Compact Footer */}
        <View style={styles.footer}>
          <Text>إيروماكس مسؤولة فقط عن التوصيل</Text>
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
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      {/* PDF Viewer with improved styling */}
      <div style={{
        border: '2px solid #000',
        borderRadius: 0,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        backgroundColor: '#fff'
      }}>
        <PDFViewer style={{
          width: 520,
          height: 520,
          border: 'none'
        }}>
          <TicketPDF colisList={list} codes={codes} />
        </PDFViewer>
      </div>

      {/* Download section */}
      <div style={{
        textAlign: 'center',
        marginTop: 20,
        padding: '15px',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: 0,
        minWidth: '300px'
      }}>
        <PDFDownloadLink
          document={<TicketPDF colisList={list} codes={codes} />}
          fileName={list.length > 1 ? `Tickets-Colis-${new Date().toISOString().split('T')[0]}.pdf` : `Ticket-${list[0]?.code_suivi || 'colis'}.pdf`}
        >
          {({ loading }) => (
            <button
              disabled={loading}
              style={{
                ...styles.downloadBtn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'PRÉPARATION EN COURS...' :
               list.length > 1 ? 'TÉLÉCHARGER TOUS LES TICKETS' : 'TÉLÉCHARGER LE TICKET PDF'}
            </button>
          )}
        </PDFDownloadLink>

        {/* Additional info */}
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          {list.length > 1 ? `${list.length} tickets à télécharger` : 'Ticket prêt pour impression'}
        </div>
      </div>
    </div>
  );
}

export default TicketColis2;