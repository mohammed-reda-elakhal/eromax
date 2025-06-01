import React, { useEffect, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import '../facture.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getFactureClientByCode } from '../../../../redux/apiCalls/factureApiCalls';
import { Table, Alert, Tag } from 'antd';
import { useLocation } from 'react-router-dom';
import '../components/factureStyles.css';


const FactureDetail = () => {
  const printRef = useRef();
  const dispatch = useDispatch();
  const facture = useSelector((state) => state.facture.detailFacture);
  const promotion = useSelector((state) => state.facture.promotionFacture);
  const { code_facture } = useParams();

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

  // Function to generate PDF and download
  const handleDownloadPdf = () => {
    const element = printRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${facture?.code_facture}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    html2pdf().set(opt).from(element).save();
  };

  // Function to print the PDF
  const handlePrintPdf = () => {
    const element = printRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${facture?.code_facture}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .outputPdf('bloburl')
      .then((pdfUrl) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pdfUrl;
        document.body.appendChild(iframe);
        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow.print();
          }, 1);
        };
      });
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
            {record.destinataire}
          </div>
          <div>
            {record.telephone}
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
        <button onClick={handleDownloadPdf}>Télécharger PDF</button>
        <button onClick={handlePrintPdf}>Imprimer PDF</button>
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

          <div className="table-facture" style={{ maxHeight: '400px', overflow: 'auto' }}>
            <Table
              size="small"
              className="table-simple"
              columns={colisColumns}
              dataSource={facture?.colis}
              pagination={false}
              rowKey="code_suivi"
              bordered
              scroll={{ y: 'calc(100vh - 500px)', x: 'max-content' }}
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
