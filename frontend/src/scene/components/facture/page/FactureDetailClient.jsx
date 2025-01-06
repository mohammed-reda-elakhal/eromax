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

  // Define columns for Colis Details Table
  const columns = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
    },
    {
      title: 'Nom Store',
      dataIndex: 'store',
      key: 'store',
      render: (text, record) => facture?.store || 'N/A',
    },
    {
      title: 'Destinataire',
      dataIndex: 'destinataire',
      key: 'destinataire',
      render: (text, record) => (
        <>
          <p>{record.destinataire}</p>
          <p>{record.telephone}</p>
          <p>{record.ville}</p>
          <p>
            <strong>Prix :</strong> {record.prix} DH
          </p>
        </>
      ),
    },
    {
      title: 'Statut',
      key: 'statut',
      dataIndex: 'statut',
      render: (text, record) => (
        <>
          {record?.statut === 'Livrée' ? (
            <Tag color="green">{record?.statut}</Tag>
          ) : (
            <Tag color="red">{record?.statut}</Tag>
          )}
        </>
      ),
    },
    {
      title: 'Tarif',
      render: (text, record) => (
        <div>
          <p>
            <strong>Livraison :</strong> {record.new_tarif_livraison}{' '}
            {promotion ? (
              <span className="old_price">{record.old_tarif_livraison} DH</span>
            ) : (
              ''
            )}
          </p>
          <p>
            <strong>Supplémentaire :</strong> {record.tarif_ajouter} DH
          </p>
          <p>
            <strong>Fragile :</strong> {record.tarif_fragile} DH
          </p>
          {promotion && (
            <p style={{ color: 'var(--limon)' }}>
              <strong>Réduction :</strong> {record.old_tarif_livraison - record.new_tarif_livraison} DH
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'TTL',
      dataIndex: 'tarif_total',
      key: 'tarif_total',
      render: (text) => `${text} DH`,
    },
    {
      title: 'Montant à Payer',
      key: 'montant_a_payer',
      dataIndex: 'montant_a_payer',
      render: (text) => `${text} DH`,
    },
  ];

  // Define columns for the calculation table
  const calcColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (text) => (text ? `${text.toFixed(2)} DH` : '0.00 DH'),
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
      totalTarifAjouter = facture.colis.reduce((acc, col) => acc + (col.tarif_ajouter || 0), 0) || 0;

      // Sum 'tarif_refus' (old_tarif_livraison) for 'Refusée' colis
      totalFraisRefus = facture.colis.reduce((acc, col) => {
        if (['Refusée', 'En Retour', 'Fermée'].includes(col.statut)) {
          return acc + (col.old_tarif_livraison || 0);
        }
        return acc;
      }, 0);
    } else if (facture.type === 'livreur') {
      // For 'livreur' facture, sum 'montant_a_payer' for all colis
      totalPrix = facture.colis.reduce((acc, col) => acc + (col.montant_a_payer || 0), 0) || 0;

      // Sum 'tarif_total' for all colis
      totalTarif = facture.colis.reduce((acc, col) => acc + (col.tarif_total || 0), 0) || 0;

      // Sum 'tarif_ajouter' for all colis (should be 0 for livreur)
      totalTarifAjouter = facture.colis.reduce((acc, col) => acc + (col.tarif_ajouter || 0), 0) || 0;
    }
  }

  // Calculate netAPayer based on facture type
  const netAPayer =
    facture.type === 'client'
      ? totalPrix - totalTarif - totalFraisRefus
      : totalPrix; // For 'livreur', netAPayer is totalPrix

  // Data for the calculation table
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
              <p>{facture?.date_facture ? new Date(facture.date_facture).toLocaleString() : 'N/A'}</p>
              <p>{facture?.colis?.length || 0} Colis</p>
            </div>
          </div>
        </div>

        {/* Promotion Section */}
        <div className="promotion-section">
          {promotion ? (
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
          ) : (
            ''
          )}
        </div>

        {/* Table to display the colis details */}
        <div className="table-facture">
          <Table
            className="table-data"
            columns={columns}
            dataSource={facture?.colis}
            pagination={false}
            rowKey="code_suivi"
          />
        </div>

        {/* Table to display the calculation of totals */}
        <div className="table-calcul">
          <Table
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
