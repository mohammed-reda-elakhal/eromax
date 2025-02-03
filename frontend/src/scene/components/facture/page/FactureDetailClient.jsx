// FactureDetail.jsx

import React, { useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import '../facture.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getFactureDetailsByCode } from '../../../../redux/apiCalls/factureApiCalls';
import { Table, Tag } from 'antd';

const FactureDetail = () => {
  const printRef = useRef();
  const dispatch = useDispatch();
  const facture = useSelector((state) => state.facture.detailFacture);
  const promotion = useSelector((state) => state.facture.promotionFacture);
  const { code_facture } = useParams();

  useEffect(() => {
    dispatch(getFactureDetailsByCode(code_facture));
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
      .then(function (pdfUrl) {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pdfUrl;
        document.body.appendChild(iframe);
        iframe.onload = function () {
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

  // Updated columns for Colis Details Table
  const colisColumns = [
    rowNumberColumn, // Add the row number column at the beginning
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 120,
      fixed: 'left',
    },
    {
      title: 'Date Livraison',
      dataIndex: 'date_livraison',
      key: 'date_livraison',
      width: 160,
      render: (text) =>
        text
          ? new Date(text).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'N/A',
    },
    {
      title: 'Destinataire & Contact',
      dataIndex: 'destinataire',
      key: 'destinataire',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.destinataire}</div>
          <div>{record.telephone}</div>
          <div style={{ fontStyle: 'italic' }}>{record.ville}</div>
          <div>
            <strong>Prix :</strong> {record.prix} DH
          </div>
        </div>
      ),
    },
    {
      title: 'Tarification',
      key: 'tarification',
      width: 220,
      render: (text, record) => (
        <div>
          <div>
            <strong>Livraison:</strong> {record.new_tarif_livraison} DH{' '}
            {promotion && (
              <span
                className="old-price"
                style={{ textDecoration: 'line-through', color: '#888' }}
              >
                ({record.old_tarif_livraison} DH)
              </span>
            )}
          </div>
          <div>
            <strong>Supplémentaire:</strong> {record.tarif_ajouter} DH
          </div>
          <div>
            <strong>Fragile:</strong> {record.tarif_fragile} DH
          </div>
        </div>
      ),
    },
    {
      title: 'Total Tarif',
      dataIndex: 'tarif_total',
      key: 'tarif_total',
      width: 120,
      render: (text) => `${text} DH`,
    },
    {
      title: 'Montant à Payer',
      dataIndex: 'montant_a_payer',
      key: 'montant_a_payer',
      width: 150,
      render: (text) => `${text} DH`,
    },
  ];

  // Updated columns for the Calculation Table
  const calcColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Montant (DH)',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: 150,
      render: (text) => (
        <span style={{ fontSize: '16px', color: '#333' }}>
          {text ? text.toFixed(2) : '0.00'} DH
        </span>
      ),
    },
  ];

  // Calculate totals based on facture type
  let totalPrix = 0;
  let totalTarif = 0;
  let totalFraisRefus = 0;
  let totalTarifAjouter = 0; // Initialize totalTarifAjouter

  if (facture) {
    if (facture.type === 'client') {
      // For 'client' facture, sum 'prix' only for 'Livrée' colis
      totalPrix = facture.colis.reduce((acc, col) => {
        if (col.statut === 'Livrée') {
          return acc + (col.prix || 0);
        }
        return acc;
      }, 0);

      // Sum 'tarif_total' for all colis
      totalTarif = facture.colis.reduce((acc, col) => acc + (col.tarif_total || 0), 0) || 0;

      // Sum 'tarif_ajouter' for all colis
      totalTarifAjouter =
        facture.colis.reduce((acc, col) => acc + (col.tarif_ajouter || 0), 0) || 0;

      // Sum 'tarif_refus' (old_tarif_livraison) for 'Refusée' colis
      totalFraisRefus = facture.colis.reduce((acc, col) => {
        if (['Refusée', 'En Retour', 'Fermée'].includes(col.statut)) {
          return acc + (col.old_tarif_livraison || 0);
        }
        return acc;
      }, 0);
    } else if (facture.type === 'livreur') {
      // For 'livreur' facture, sum 'montant_a_payer' for all colis
      totalPrix = facture.colis.reduce(
        (acc, col) => acc + (col.montant_a_payer || 0),
        0
      ) || 0;

      // Sum 'tarif_total' for all colis
      totalTarif = facture.colis.reduce((acc, col) => acc + (col.tarif_total || 0), 0) || 0;

      // Sum 'tarif_ajouter' for all colis (should be 0 for livreur)
      totalTarifAjouter =
        facture.colis.reduce((acc, col) => acc + (col.tarif_ajouter || 0), 0) || 0;
    }
  }

  // Calculate netAPayer based on facture type
  const netAPayer =
    facture.type === 'client'
      ? totalPrix - totalTarif - totalFraisRefus
      : totalPrix; // For 'livreur', netAPayer is totalPrix

  // Data for the Calculation Table
  const calcData =
    facture.type === 'livreur'
      ? [
          {
            key: '1',
            description: 'Total Prix',
            total: totalPrix,
          },
          {
            key: '2',
            description: 'Total Tarif',
            total: totalTarif,
          },
          {
            key: '3',
            description: 'Total Supplémentaire',
            total: totalTarifAjouter,
          },
          {
            key: '4',
            description: 'Net à Payer',
            total: netAPayer,
          },
        ]
      : [
          {
            key: '1',
            description: 'Total Prix',
            total: totalPrix,
          },
          {
            key: '2',
            description: 'Total Tarif',
            total: totalTarif,
          },
          {
            key: '3',
            description: 'Total Supplémentaire',
            total: totalTarifAjouter,
          },
          {
            key: '4',
            description: 'Frais Refus',
            total: totalFraisRefus,
          },
          {
            key: '5',
            description: 'Net à Payer',
            total: netAPayer,
          },
        ];

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
              <p>{facture?.store || 'N/A'}</p>
              <p>{facture?.client_tele || 'N/A'}</p>
            </div>
            <div className="bon-livraison">
              <p>
                <strong>Bon Livraison:</strong>
              </p>
              <p>#{facture?.code_facture || 'N/A'}</p>
              <p>
                {facture?.date_facture
                  ? new Date(facture.date_facture).toLocaleDateString('fr-FR', {
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
        {promotion && (
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

        {/* Table to display the colis details */}
        <div className="table-facture">
          <Table
            size="small"
            className="table-data"
            columns={colisColumns}
            dataSource={facture?.colis}
            pagination={false}
            rowKey="code_suivi"
          />
        </div>

        {/* Calculation Table Header */}
        <div
          style={{
            marginTop: '20px',
            marginBottom: '10px',
            textAlign: 'right',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Récapitulatif
        </div>

        {/* Table to display the calculation of totals */}
        <div className="table-calcul">
          <Table
            size="small"
            className="table-calc-data"
            columns={calcColumns}
            dataSource={calcData}
            pagination={false}
            showHeader={false}
          />
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
