import React, { useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import '../facture.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getFactureClientByCode } from '../../../../redux/apiCalls/factureApiCalls';
import { Table, Tag } from 'antd';

const FactureDetail = () => {
  const printRef = useRef();
  const dispatch = useDispatch();
  const facture = useSelector((state) => state.facture.detailFacture);
  const promotion = useSelector((state) => state.facture.promotionFacture);
  const { code_facture } = useParams();

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

  // Updated columns for Colis Details Table
  const colisColumns = [
    rowNumberColumn,
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 120,
      fixed: 'left',
    },
    {
      title: 'Date Livraison',
      dataIndex: 'date_livraisant',
      key: 'date_livraisant',
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
          {/* Render only the city name from the ville object */}
          <div style={{ fontStyle: 'italic' }}>
            {record.ville ? record.ville.nom : 'N/A'}
          </div>
          <div>
            <strong>Prix :</strong> {record.prix} DH
          </div>
        </div>
      ),
    },
    {
      title: 'Statu Final',
      dataIndex: 'statu_final',
      key: 'statu_final',
      width: 120,
      render: (statu_final) =>
        statu_final === 'Livrée' ? (
          <Tag color="green">{statu_final}</Tag>
        ) : (
          <Tag color="red">{statu_final}</Tag>
        ),
    },
    {
      title: 'Tarification',
      key: 'tarification',
      width: 220,
      render: (text, record) => (
        <div>
          {
            record.statu_final === "Livrée" 
            ?
            <>
              <div>
                <strong>Livraison:</strong> {record.crbt?.tarif_livraison} DH{' '}
                {promotion && record.ville && record.crbt && (
                  <span
                    className="old-price"
                    style={{ textDecoration: 'line-through', color: '#888' }}
                  >
                    ({record.ville.tarif} DH)
                  </span>
                )}
              </div>
              <div>
                <strong>Supplémentaire:</strong> {record.crbt?.tarif_supplementaire} DH
              </div>
              <div>
                <strong>Fragile:</strong> {record.crbt?.tarif_fragile} DH
              </div>
            </>
            :
            <>
              <div>
                <strong>Tarif refuse:</strong> {record.crbt?.tarif_refuse} DH
              </div>
              <div>
                <strong>Supplémentaire:</strong> {record.crbt?.tarif_supplementaire} DH
              </div>
              <div>
                <strong>Fragile:</strong> {record.crbt?.tarif_fragile} DH
              </div>
            </>
          }
          
        </div>
      ),
    },
    {
      title: 'Total Tarif',
      dataIndex: 'total_tarif',
      key: 'tarif_total',
      width: 120,
      render: (text,record) => `${record?.crbt?.total_tarif} DH`,
    },
    {
      title: 'Montant à Payer',
      dataIndex: 'crbt.prix_a_payant',
      key: 'montant_a_payant',
      width: 150,
      render: (text, record) => `${record?.crbt?.prix_a_payant} DH`,
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
          },
          {
            key: '2',
            description: 'Total Tarif',
            total: totalTarif,
          },
          {
            key: '2',
            description: 'Total Fragil',
            total: totalTarifFragil,
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
