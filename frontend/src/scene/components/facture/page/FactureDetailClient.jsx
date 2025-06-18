import React, { useEffect, useRef, useState } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import '../facture.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getFactureClientByCode } from '../../../../redux/apiCalls/factureApiCalls';
import { Table, Alert, Tag, Button, message } from 'antd';
import { useLocation } from 'react-router-dom';
import '../components/factureStyles.css';

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #333',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  expediteur: {
    flex: 1,
  },
  bonLivraison: {
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
    borderBottom: '1px solid #ccc',
    paddingBottom: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    minHeight: 25,
    alignItems: 'center',
  },
  tableColNumber: {
    width: '8%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    padding: 7,
    fontSize: 8,
    textAlign: 'center',
  },
  tableColHeader: {
    width: '24%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    padding: 7,
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    fontSize: 8,
    wordBreak: 'break-all',
    wrap: true,
  },
  tableCol: {
    width: '24%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    padding: 7,
    fontSize: 8,
    wordBreak: 'break-all',
    wrap: true,
  },
  tableColWide: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    padding: 7,
    fontSize: 9,
    wordBreak: 'break-word',
  },
  tableColLast: {
    width: '15%',
    padding: 7,
    fontSize: 9,
  },
  tableColStatus: {
    width: '12%',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    padding: 7,
    fontSize: 8,
    textAlign: 'center',
  },
  promotionSection: {
    backgroundColor: '#fff2e8',
    padding: 10,
    marginBottom: 15,
    border: '1px solid #ffd591',
    borderRadius: 4,
  },
  promotionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  promotionText: {
    fontSize: 10,
    textAlign: 'center',
  },
  duplicateAlert: {
    backgroundColor: '#fff2f0',
    border: '1px solid #ffccc7',
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
  duplicateTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#cf1322',
    marginBottom: 5,
  },
  duplicateCodes: {
    fontSize: 8,
    color: '#cf1322',
  },
  recapSection: {
    marginTop: 20,
    border: '1px solid #ccc',
    padding: 10,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  recapTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px solid #333',
    fontWeight: 'bold',
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  signature: {
    width: '45%',
    textAlign: 'center',
  },
  signatureLine: {
    borderBottom: '1px solid #333',
    marginTop: 20,
    marginBottom: 5,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

// PDF Document Component
const FacturePDF = ({ facture, promotion, duplicateCodes, calcData }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>{facture?.code_facture || 'N/A'}</Text>
        
        <View style={pdfStyles.infoSection}>
          <View style={pdfStyles.expediteur}>
            <Text style={{ fontWeight: 'bold' }}>Expéditeur:</Text>
            <Text>{facture?.store ? facture.store.storeName : 'N/A'}</Text>
            <Text>{facture?.store && facture.store.id_client ? facture.store.id_client.tele : 'N/A'}</Text>
          </View>
          
          <View style={pdfStyles.bonLivraison}>
            <Text style={{ fontWeight: 'bold' }}>Bon Livraison:</Text>
            <Text>#{facture?.code_facture || 'N/A'}</Text>
            <Text>
              {facture?.date
                ? new Date(facture.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A'}
            </Text>
            <Text>{facture?.colis?.length || 0} Colis</Text>
          </View>
        </View>
      </View>

      {/* Promotion Section */}
      {promotion && Object.keys(promotion).length > 0 && (
        <View style={pdfStyles.promotionSection}>
          <Text style={pdfStyles.promotionTitle}>Promotion EROMAX</Text>
          <Text style={pdfStyles.promotionText}>
            {promotion.type === 'percentage_discount'
              ? `Réduction de ${promotion.value} %`
              : `Tarif Fixe de ${promotion.value} DH`}
          </Text>
        </View>
      )}

      {/* Duplicate Alert */}
      {duplicateCodes.length > 0 && (
        <View style={pdfStyles.duplicateAlert}>
          <Text style={pdfStyles.duplicateTitle}>
            Attention: Des colis dupliqués ont été détectés dans cette facture
          </Text>
          <Text style={pdfStyles.duplicateCodes}>
            Codes dupliqués: {duplicateCodes.join(', ')}
          </Text>
        </View>
      )}

      {/* Colis Details Table */}
      <Text style={pdfStyles.sectionTitle}>Détails des Colis</Text>
      
      {/* Table Header */}
      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableColNumber}>#</Text>
          <Text style={pdfStyles.tableColHeader}>Code Suivi</Text>
          <Text style={pdfStyles.tableColHeader}>Date Livraison</Text>
          <Text style={pdfStyles.tableColWide}>Destinataire</Text>
          <Text style={pdfStyles.tableColStatus}>Statut</Text>
          <Text style={pdfStyles.tableColStatus}>Total Tarif</Text>
          <Text style={pdfStyles.tableColLast}>Montant à Payer</Text>
        </View>
        
        {/* Table Rows */}
        {facture?.colis?.map((colis, index) => (
          <View key={colis.code_suivi} style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableColNumber}>{index + 1}</Text>
            <Text style={pdfStyles.tableCol}>
              {colis.code_suivi}
              {duplicateCodes.includes(colis.code_suivi) && ' (Dupliqué)'}
            </Text>
            <Text style={pdfStyles.tableCol}>
              {colis.date_livraisant
                ? new Date(colis.date_livraisant).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : 'N/A'}
            </Text>
            <Text style={pdfStyles.tableColWide}>
              <Text>{colis.nom}</Text>{'\n'}
              <Text>{colis.tele}</Text>{'\n'}
              <Text style={{ fontStyle: 'italic' }}>{colis.ville ? colis.ville.nom : 'N/A'}</Text>{'\n'}
              Prix: {colis.prix} DH
            </Text>
            <Text style={pdfStyles.tableColStatus}>{colis.statu_final}</Text>
            <Text style={pdfStyles.tableColStatus}>{colis?.crbt?.total_tarif} DH</Text>
            <Text style={pdfStyles.tableColLast}>{colis?.crbt?.prix_a_payant} DH</Text>
          </View>
        ))}
      </View>

      {/* Tarifs Supplémentaires */}
      {facture && facture.colis && facture.colis.some(colis => colis.tarif_ajouter?.value > 0) && (
        <>
          <Text style={pdfStyles.sectionTitle}>Détails des Tarifs Supplémentaires</Text>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.tableColHeader}>Code Suivi</Text>
              <Text style={pdfStyles.tableColHeader}>Montant</Text>
              <Text style={pdfStyles.tableColWide}>Description</Text>
            </View>
            {facture.colis
              .filter(colis => colis.tarif_ajouter?.value > 0)
              .map((colis, index) => (
                <View key={index} style={pdfStyles.tableRow}>
                  <Text style={pdfStyles.tableCol}>{colis.code_suivi}</Text>
                  <Text style={pdfStyles.tableCol}>{colis.tarif_ajouter.value} DH</Text>
                  <Text style={pdfStyles.tableColWide}>
                    {colis.tarif_ajouter.description || 'Pas de description'}
                  </Text>
                </View>
              ))}
          </View>
        </>
      )}

      {/* Récapitulatif Financier */}
      <View style={pdfStyles.recapSection}>
        <Text style={pdfStyles.sectionTitle}>Récapitulatif Financier</Text>
        {calcData.map((item, index) => (
          <View key={item.key} style={item.isTotal ? pdfStyles.recapTotal : pdfStyles.recapRow}>
            <Text style={{ fontWeight: item.isTotal ? 'bold' : 'normal' }}>
              {item.description}
            </Text>
            <Text style={{ fontWeight: item.isTotal ? 'bold' : 'normal' }}>
              {item.total.toFixed(2)} DH
            </Text>
          </View>
        ))}
      </View>

      {/* Signatures */}
      <View style={pdfStyles.signatures}>
        <View style={pdfStyles.signature}>
          <Text style={pdfStyles.signatureLine}>____________________</Text>
          <Text>Signature Client</Text>
        </View>
        <View style={pdfStyles.signature}>
          <Text style={pdfStyles.signatureLine}>____________________</Text>
          <Text>Signature du livreur</Text>
        </View>
      </View>

      {/* Page Number */}
      <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }) => (
        `Page ${pageNumber} sur ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

const FactureDetail = () => {
  const printRef = useRef();
  const dispatch = useDispatch();
  const facture = useSelector((state) => state.facture.detailFacture);
  const promotion = useSelector((state) => state.facture.promotionFacture);
  const { code_facture } = useParams();
  const [pdfLoading, setPdfLoading] = useState(false);

  const location = useLocation();
  const highlightedColisId = location.state?.colisId;

  // Function to detect duplicate colis within a facture
  const findDuplicatesInFacture = (facture) => {
    if (!facture || !facture.colis || facture.colis.length === 0) return [];

    // Create a map to count occurrences of each code_suivi
    const codeCount = {};
    facture.colis.forEach(colis => {
      codeCount[colis.code_suivi] = (codeCount[colis.code_suivi] || 0) + 1;
    });

    // Filter for codes that appear more than once
    const duplicateCodes = Object.entries(codeCount)
      .filter(([_, count]) => count > 1)
      .map(([code]) => code);

    return duplicateCodes;
  };

  // Get duplicate colis information from the API response or calculate it locally if not available
  const duplicateCodes = facture && facture.duplicateCodes ? facture.duplicateCodes :
                         (facture ? findDuplicatesInFacture(facture) : []);
  const hasDuplicates = facture && facture.hasDuplicates !== undefined ? facture.hasDuplicates :
                        (duplicateCodes.length > 0);

  // Create a set of duplicate codes for faster lookup
  const duplicateCodesSet = new Set(duplicateCodes);

  useEffect(() => {
    dispatch(getFactureClientByCode(code_facture));
    window.scrollTo(0, 0);
  }, [dispatch, code_facture]);

  // Improved print function using browser's print API
  const handlePrintPdf = () => {
    setPdfLoading(true);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const element = printRef.current;
    
    if (printWindow && element) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${facture?.code_facture || 'Facture'}</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 15mm;
                }
                body {
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                  line-height: 1.4;
                }
                .facture-detail {
                  margin: 0;
                  padding: 0;
                }
                .facture-buttons {
                  display: none !important;
                }
                .duplicate-alert-container {
                  background-color: #fff2f0 !important;
                  border: 1px solid #ffccc7 !important;
                  padding: 8px !important;
                  margin-bottom: 10px !important;
                  border-radius: 4px !important;
                }
                .duplicate-row {
                  background-color: #fef2f2 !important;
                }
                table {
                  border-collapse: collapse;
                  width: 100%;
                  font-size: 10px;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 4px;
                  text-align: left;
                }
                th {
                  background-color: #f5f5f5;
                  font-weight: bold;
                }
                .section-header {
                  background-color: #f5f5f5;
                  padding: 8px;
                  margin: 10px 0;
                  border: 1px solid #ddd;
                }
                .recap-section {
                  border: 1px solid #ccc;
                  padding: 10px;
                  margin: 15px 0;
                }
                .signatures {
                  display: flex;
                  justify-content: space-between;
                  margin-top: 30px;
                }
                .signature {
                  width: 45%;
                  text-align: center;
                }
                .signature-line {
                  border-bottom: 1px solid #333;
                  margin: 20px 0 5px 0;
                }
              }
            </style>
          </head>
          <body>
            ${element.outerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setPdfLoading(false);
        }, 500);
      };
    } else {
      message.error('Impossible d\'ouvrir la fenêtre d\'impression');
      setPdfLoading(false);
    }
  };

  // New column for row numbering
  const rowNumberColumn = {
    title: '#',
    key: 'index',
    width: 40,
    fixed: 'left',
    render: (text, record, index) => <span>{index + 1}</span>,
  };

  // Updated columns for Colis Details Table with enhanced styling
  const colisColumns = [
    rowNumberColumn,
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 120,
      fixed: 'left',
      render: (text, record) => {
        const isDuplicate = duplicateCodesSet.has(text);
        const isHighlighted = record._id === highlightedColisId;

        return (
          <div style={{
            backgroundColor: isHighlighted ? '#f5f5f5' : 'transparent',
            padding: '4px',
            fontWeight: 'bold',
            color: isDuplicate ? '#cf1322' : 'inherit'
          }}>
            {text}
            {isDuplicate && (
              <span style={{
                marginLeft: '5px',
                color: '#cf1322',
                fontSize: '12px'
              }}>
                (Dupliqué)
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: 'Date Livraison',
      dataIndex: 'date_livraisant',
      key: 'date_livraisant',
      width: 160,
      render: (text) => (
        <div>
          {text ? (
            new Date(text).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          ) : (
            'N/A'
          )}
        </div>
      ),
    },
    {
      title: 'Destinataire & Contact',
      dataIndex: 'destinataire',
      key: 'destinataire',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.nom}
          </div>
          <div>
            {record.tele}
          </div>
          <div style={{ fontStyle: 'italic' }}>
            {record.ville ? record.ville.nom : 'N/A'}
          </div>
          <div>
            Prix: {record.prix} DH
          </div>
        </div>
      ),
    },
    {
      title: 'Statu Final',
      dataIndex: 'statu_final',
      key: 'statu_final',
      width: 120,
      align: 'center',
      render: (statu_final) => statu_final,
    },
    {
      title: 'Tarification',
      key: 'tarification',
      width: 220,
      render: (_, record) => (
        <div>
          {
            record.statu_final === "Livrée"
            ?
            <div>
              <div>Livraison: {record.crbt?.tarif_livraison} DH</div>

              <div>Fragile: {record.crbt?.tarif_fragile} DH</div>
            </div>
            :
            <div>
              <div>Tarif refuse: {record.crbt?.tarif_refuse} DH</div>
              <div>
                Supplémentaire: {record.crbt?.tarif_supplementaire} DH
                {record.tarif_ajouter?.value > 0 && record.tarif_ajouter?.description && (
                  <span style={{ display: 'block', fontSize: '12px', fontStyle: 'italic' }}>
                    ({record.tarif_ajouter.description})
                  </span>
                )}
              </div>
              <div>Fragile: {record.crbt?.tarif_fragile} DH</div>
            </div>
          }
        </div>
      ),
    },
    {
      title: 'Total Tarif',
      dataIndex: 'total_tarif',
      key: 'tarif_total',
      width: 120,
      align: 'center',
      render: (_, record) => `${record?.crbt?.total_tarif} DH`,
    },
    {
      title: 'Montant à Payer',
      dataIndex: 'crbt.prix_a_payant',
      key: 'montant_a_payant',
      width: 150,
      align: 'center',
      render: (_, record) => `${record?.crbt?.prix_a_payant} DH`,
    },
  ];

  // Simplified columns for the Calculation Table
  const calcColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 180,
      render: (text, record) => (
        <span style={{
          fontWeight: record.isTotal ? 'bold' : 'normal',
          fontSize: '13px',
          color: '#333'
        }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Montant (DH)',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: 100,
      render: (text, record) => (
        <span style={{
          fontWeight: record.isTotal ? 'bold' : 'normal',
          fontSize: '13px',
          color: '#333'
        }}>
          {text ? text.toFixed(2) : '0.00'} DH
        </span>
      ),
    },
  ];

  // Totals (assumed to be calculated in the API response and stored in the facture object)
  const totalPrix = facture ? facture.totalPrix : 0;
  const totalTarif = facture ? facture.totalTarifLivraison : 0;
  const totalFraisRefus = facture ? facture.totalTarifRefuse : 0;
  const totalTarifAjouter = facture ? facture.totalTarifAjouter : 0;
  const totalTarifFragil = facture ? facture.totalTarifFragile : 0;
  const netAPayer =
    facture && facture.type === 'client'
      ? totalPrix - totalTarif - totalFraisRefus - totalTarifAjouter -totalTarifFragil
      : totalPrix;

  // Data for the Calculation Table (for client facture)
  const calcData =
    facture && facture.type === 'client'
      ? [
          {
            key: '1',
            description: 'Total Prix',
            total: totalPrix,
            isTotal: false,
          },
          {
            key: '2',
            description: 'Total Tarif',
            total: totalTarif,
            isTotal: false,
          },
          {
            key: '3',
            description: 'Total Fragil',
            total: totalTarifFragil,
            isTotal: false,
          },
          {
            key: '4',
            description: 'Total Supplémentaire',
            total: totalTarifAjouter,
            isTotal: false,
          },
          {
            key: '5',
            description: 'Frais Refus',
            total: totalFraisRefus,
            isTotal: false,
          },
          {
            key: '6',
            description: 'Net à Payer',
            total: netAPayer,
            isTotal: true,
          },
        ]
      : [];

  return (
    <div>
      {/* Buttons to download and print the PDF */}
      <div className="facture-buttons">
        {facture && (
          <PDFDownloadLink
            document={
              <FacturePDF
                facture={facture}
                promotion={promotion}
                duplicateCodes={duplicateCodes}
                calcData={calcData}
              />
            }
            fileName={`${facture?.code_facture || 'facture'}.pdf`}
            style={{
              display: 'inline-block',
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {({ loading }) => loading ? 'Génération PDF...' : 'Télécharger PDF'}
          </PDFDownloadLink>
        )}
        <Button 
          type="primary" 
          onClick={handlePrintPdf}
          loading={pdfLoading}
          style={{ marginRight: '10px' }}
        >
          Imprimer PDF
        </Button>
      </div>

      {/* Facture detail to be converted into PDF */}
      <div className="facture-detail" ref={printRef}>
        <div className="facture-header">
          <div className="facture-title">
            <h2>{facture?.code_facture || 'N/A'}</h2>
          </div>
          <div className="facture-info">
            <div className="expediteur">
              <p>
                <strong>Expéditeur:</strong>
              </p>
              <p>{facture?.store ? facture.store.storeName : 'N/A'}</p>
              <p>
                {facture?.store && facture.store.id_client
                  ? facture.store.id_client.tele
                  : 'N/A'}
              </p>
            </div>
            <div className="bon-livraison">
              <p>
                <strong>Bon Livraison:</strong>
              </p>
              <p>#{facture?.code_facture || 'N/A'}</p>
              <p>
                {facture?.date
                  ? new Date(facture.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </p>
              <p>{facture?.colis?.length || 0} Colis</p>
            </div>
          </div>
        </div>

        {/* Promotion Section */}
        {promotion && Object.keys(promotion).length > 0 && (
          <div className="promotion-section">
            <div className="promotion_content">
              <h1>
                <strong>Promotion EROMAX</strong>
              </h1>
              <p>
                {promotion.type === 'percentage_discount'
                  ? `Réduction de ${promotion.value} %`
                  : `Tarif Fixe de ${promotion.value} DH`}
              </p>
            </div>
          </div>
        )}

        {/* Table to display the colis details - simplified */}
        <div className="simple-section">
          <div className="simple-header">
            <h4>Détails des Colis</h4>
          </div>

          {/* Alert message for duplicates */}
          {hasDuplicates && (
            <div
              className="duplicate-alert-container"
              style={{
                backgroundColor: '#fff2f0',
                border: '1px solid #ffccc7',
                padding: '12px 16px',
                borderRadius: '4px',
                marginBottom: '16px'
              }}
            >
              <h4 style={{ color: '#cf1322', margin: '0 0 8px 0' }}>
                Attention: Des colis dupliqués ont été détectés dans cette facture
              </h4>
              <div>
                <p>Codes dupliqués:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {duplicateCodes.map(code => (
                    <Tag key={code} color="red">{code}</Tag>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="table-facture" style={{ maxHeight: '800px', overflow: 'auto' }}>
            <Table
              size="small"
              className="table-simple"
              columns={colisColumns}
              dataSource={facture?.colis}
              pagination={false}
              rowKey="code_suivi"
              bordered
              scroll={{ y: 700, x: 'max-content' }}
              sticky={true}
              rowClassName={(record) => {
                // Add a class to highlight duplicate rows
                return duplicateCodesSet.has(record.code_suivi) ? 'duplicate-row' : '';
              }}
            />
          </div>
        </div>

        {/* Additional table for tarif_ajouter details - simplified */}
        {facture && facture.colis && facture.colis.some(colis => colis.tarif_ajouter?.value > 0) && (
          <div className="simple-section">
            <div className="simple-header">
              <h4>Détails des Tarifs Supplémentaires</h4>
            </div>
            <div className="table-supplements">
              <Table
                size="small"
                className="table-simple"
                scroll={{ y: '300px', x: 'max-content' }}
                sticky={true}
                columns={[
                  {
                    title: 'Code Suivi',
                    dataIndex: 'code_suivi',
                    key: 'code_suivi',
                    width: 120
                  },
                  {
                    title: 'Montant',
                    dataIndex: 'value',
                    key: 'value',
                    width: 100,
                    render: value => `${value} DH`,
                  },
                  {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                    width: 250
                  }
                ]}
                dataSource={facture.colis
                  .filter(colis => colis.tarif_ajouter?.value > 0)
                  .map((colis, index) => ({
                    key: index,
                    code_suivi: colis.code_suivi,
                    value: colis.tarif_ajouter.value,
                    description: colis.tarif_ajouter.description || 'Pas de description'
                  }))}
                pagination={false}
                bordered
              />
            </div>
          </div>
        )}

        {/* Calculation Table - Simplified */}
        <div className="recap-section">
          <div className="recap-header">
            <h4>Récapitulatif Financier</h4>
          </div>
          <div className="table-calcul">
            <Table
              size="small"
              className="table-calc-data"
              columns={calcColumns}
              dataSource={calcData}
              pagination={false}
              showHeader={false}
              bordered={false}
              scroll={{ y: '200px', x: 'max-content' }}
              sticky={true}
              rowClassName={(_, index) => {
                if (index === calcData.length - 1) return 'total-row-simple';
                return 'recap-row';
              }}
            />
          </div>
        </div>

        {/* Signatures Section */}
        <div className="facture-signatures">
          <div className="signature-client">
            <p>
              <strong>Signature Client:</strong>
            </p>
          </div>
          <div className="signature-livreur">
            <p>
              <strong>Signature du livreur:</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactureDetail;
