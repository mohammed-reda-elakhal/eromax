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
    width: 32, // Reduced from 32
    height: 26, // Reduced from 32
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInline: {
    fontSize: 5.5,
    color: '#666',
    fontWeight: 'normal',
    marginLeft: 2,
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

  // Smaller product value styling for compact display
  labelProduct: {
    fontSize: 6,
    color: '#000',
    fontWeight: 'bold',
    minWidth: 22,
    maxWidth: 22,
    textAlign: 'left',
  },
  valueProduct: {
    fontSize: 5.5,
    color: '#000',
    fontWeight: 'normal',
    flex: 1,
    textAlign: 'left',
    maxWidth: 60,
    lineHeight: 1,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #000',
    paddingBottom: 4,
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'column',
    gap: 2,
    flex: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fieldLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    minWidth: 62,
  },
  fieldValue: {
    fontSize: 7,
    flex: 1,
  },
  boolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boolLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    marginRight: 3,
  },
  boolValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  brandLogo: {
    width: 42,
    height: 18,
    objectFit: 'contain',
  },
  crbt: {
    borderTop: '1px solid #000',
    borderBottom: '1px solid #000',
    paddingVertical: 3,
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
  },
  barcodeBox: {
    borderTop: '1px solid #000',
    borderBottom: '1px solid #000',
    paddingVertical: 4,
    marginBottom: 4,
    alignItems: 'center',
    gap: 4,
  },
  codeSuiviText: {
    fontSize: 8,
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #000',
    paddingBottom: 6,
    marginBottom: 6,
  },
  brandLogoLarge: {
    width: 80,
    height: 30,
    objectFit: 'contain',
  },
  suiviCode: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  bodySection: {
    paddingVertical: 3,
    marginBottom: 6,
    gap: 2,
  },
  bodyColumns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  bodyLeft: {
    flex: 1,
    gap: 2,
  },
  qrBody: {
    width: 90,
    height: 90,
    border: '1px solid #000',
    backgroundColor: '#fff',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #000',
  },
  barcodeLarge: {
    width: 120,
    height: 50,
    border: '1px solid #000',
    backgroundColor: '#fff',
  },
  qrLarge: {
    width: 50,
    height: 50,
    border: '1px solid #000',
    backgroundColor: '#fff',
  },
});

const generateBarcode = (text) => {
  try {
    if (!text || text.length === 0) {
      console.error('Empty text for barcode');
      return null;
    }
    
    console.log('Generating barcode for:', text);
    const canvas = document.createElement('canvas');
    
    JsBarcode(canvas, text, { 
      format: 'CODE128',
      width: 2,
      height: 120,
      displayValue: false,
      margin: 14,
      fontSize: 12,
      textMargin: 2,
      background: '#ffffff',
      lineColor: '#000000',
      valid: (valid) => {
        if (!valid) {
          console.warn('⚠️ Invalid barcode value:', text);
        } else {
          console.log('✅ Valid barcode generated for:', text);
        }
      }
    });
    
    const dataUrl = canvas.toDataURL('image/png');
    console.log('Barcode data URL length:', dataUrl.length);
    return dataUrl;
  } catch (e) {
    console.error('❌ Barcode generation error for text:', text, 'Error:', e);
    return null;
  }
};

// Helper to generate QR/barcode for a list of colis
const useColisCodes = (colisList) => {
  const [codes, setCodes] = useState([]);
  useEffect(() => {
    if (!colisList || !colisList.length) {
      console.log('No colis list provided');
      return;
    }
    
    console.log(`Generating codes for ${colisList.length} colis...`);
    
    Promise.all(
      colisList.map(async (colis, index) => {
        try {
          console.log(`[${index + 1}/${colisList.length}] Generating codes for:`, colis.code_suivi);
          
          // Generate QR code
          const qr = await QRCode.toDataURL(colis.code_suivi, { 
            width: 800, 
            margin: 14,
            errorCorrectionLevel: 'M',
            type: 'image/png'
          });
          console.log(`  ✅ QR generated for: ${colis.code_suivi} (length: ${qr.length})`);
          
          // Generate Barcode
          const barcode = generateBarcode(colis.code_suivi);
          if (!barcode) {
            console.error(`  ❌ Barcode generation failed for: ${colis.code_suivi}`);
          }
          
          return { qr, barcode };
        } catch (error) {
          console.error(`  ❌ Error generating codes for ${colis.code_suivi}:`, error);
          return { qr: null, barcode: null };
        }
      })
    ).then((generatedCodes) => {
      console.log('✅ All codes generated successfully');
      setCodes(generatedCodes);
    }).catch((error) => {
      console.error('❌ Error in code generation promise:', error);
    });
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
        <View style={styles.proHeader}>
          <Image src="/image/lg.jpg" style={styles.brandLogoLarge} />
          <Text style={styles.suiviCode}>{colis?.code_suivi || ''}</Text>
        </View>

        <View style={styles.bodySection}>
          <View style={styles.bodyColumns}>
            <View style={styles.bodyLeft}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Nom complet:</Text>
                <Text style={styles.fieldValue}>{truncateText(colis?.nom || '', 22)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Téléphone:</Text>
                <Text style={styles.fieldValue}>{colis?.tele || ''}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Adresse:</Text>
                <Text style={styles.fieldValue}>{truncateText(colis?.adresse || '', 38)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Produit:</Text>
                <Text style={styles.fieldValue}>{truncateText(colis?.nature_produit || '', 24)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Ville:</Text>
                <Text style={styles.fieldValue}>{truncateText(colis?.villeData?.nom || colis?.ville?.nom || '', 20)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date d'envoi:</Text>
                <Text style={styles.fieldValue}>
                  {colis?.createdAt ? new Date(colis.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                </Text>
              </View>
              <View style={styles.boolRow}>
                <View style={styles.boolGroup}>
                  <Text style={styles.boolLabel}>Ouvrir:</Text>
                  <Text style={styles.boolValue}>{getBooleanText(colis?.ouvrir)}</Text>
                </View>
                <View style={styles.boolGroup}>
                  <Text style={styles.boolLabel}>Remplacer:</Text>
                  <Text style={styles.boolValue}>{getBooleanText(colis?.is_remplace)}</Text>
                </View>
                <View style={styles.boolGroup}>
                  <Text style={styles.boolLabel}>Fragile:</Text>
                  <Text style={styles.boolValue}>{getBooleanText(colis?.is_fragile)}</Text>
                </View>
              </View>
            </View>
            {codes[idx]?.qr && <Image src={codes[idx].qr} style={styles.qrBody} />}
          </View>
        </View>

        

        <Text style={styles.crbt}>CRBT: {colis?.prix || 0} DH</Text>

        <View style={styles.footerRow}>
          {codes[idx]?.barcode && <Image src={codes[idx].barcode} style={styles.barcodeLarge} />}
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