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

  // Calculate the sums for prix and tarif
  const totalPrix = facture?.colis?.reduce((acc, col) => acc + (col.montant_a_payer || 0), 0) || 0;
  const totalTarif = facture?.colis?.reduce((acc, col) => acc + (col.tarif_total || 0), 0) || 0;
  const difference = totalPrix - totalTarif;

  // Define columns for TableDashboard
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
            <strong>Prix :</strong> {record.prix}
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
            {promotion ? 
            <span className="old_price">{record.old_tarif_livraison}</span>
            :""
            }
          </p>
          <p>
            <strong>Suplementaire :</strong> {record.tarif_ajouter}
            <br />
          </p>
          <p>
            <strong>Fragile :</strong> {record.tarif_fragile}
          </p>
          <p style={{color : "var(--limon)"}}>
            <strong>Reduction :</strong> {record.old_tarif_livraison - record.new_tarif_livraison}
          </p>
        </div>
      ),
    },
    {
      title: 'TTL',
      dataIndex: 'tarif_total',
      key: 'tarif_total',
    },
    {
      title: 'Montant à Payer',
      render: (text, record) => <div>{record.prix - record.tarif_total}</div>,
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
      render: (text) => (text ? text.toFixed(2) : '0.00'),
    },
  ];

  // Data for the calculation table
  const calcData = [
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
      description: 'Montant à payer',
      total: difference,
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
            <h2>{facture?.code_facture}</h2>
          </div>
          <div className="facture-info">
            <div className="expediteur">
              <p>
                <strong>Expéditeur:</strong>
              </p>
              <p>{facture?.store || 'N/A'}</p>
              <p>{facture?.client_tele}</p>
            </div>
            <div className="bon-livraison">
              <p>
                <strong>Bon Livraison:</strong>
              </p>
              <p>#{facture?.code_facture}</p>
              <p>{facture?.date}</p>
              <p>{facture?.colis?.length} Colis</p>
            </div>
          </div>
        </div>

        <div className="promotion-section">
          {promotion ? 
            <div className="promotion_content">
              <h1>
                <strong>Promotion EROMAX</strong>
              </h1>
              <p>
                {promotion.type === 'percentage_discount'  ? 'Percentage Discount ' + promotion.value +" %"  : 'Fixed Tarif' + promotion.value +" DH"}
              </p>
            </div>
            : ""
            }
        </div>

        {/* Table to display the colis details */}
        <div className="table-facture">
          <Table className="table-data" columns={columns} dataSource={facture?.colis} pagination={false} />
        </div>

        {/* Table to display the calculation of totals */}
        <div className="table-calcul">
          <Table className="table-calc-data" columns={calcColumns} dataSource={calcData} pagination={false} />
        </div>

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
