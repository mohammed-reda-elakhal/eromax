// FactureDetailLivreur.jsx

import React, { useEffect, useRef, useMemo } from 'react';
import html2pdf from 'html2pdf.js';
import '../facture.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getFactureDetailsByCode } from '../../../../redux/apiCalls/factureApiCalls';
import { Table, Tag } from 'antd';
import moment from 'moment'; // Ensure moment is installed and imported

const FactureDetailLivreur = () => {
  const printRef = useRef();
  const dispatch = useDispatch();
  const facture = useSelector((state) => state.facture.detailFacture);
  const user = useSelector((state) => state.auth.user);
  const { code_facture } = useParams();

  useEffect(() => {
    if (code_facture) {
      dispatch(getFactureDetailsByCode(code_facture));
    }
    window.scrollTo(0, 0);
  }, [dispatch, code_facture]);

  // Function to generate PDF and download
  const handleDownloadPdf = () => {
    const element = printRef.current;

    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right
      filename: `${facture?.code_facture}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    // Add page numbers
    html2pdf()
      .set(opt)
      .from(element)
      .toContainer()
      .toCanvas()
      .toImg()
      .toPdf()
      .get('pdf')
      .then(function (pdf) {
        const totalPages = pdf.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdf.internal.pageSize.getWidth() / 2,
            pdf.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }
      })
      .save();
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
      title: 'Nom Livreur',
      dataIndex: 'livreur',
      key: 'livreur',
      render: () => facture?.livreur || 'N/A',
    },
    {
      title: 'Destinataire',
      dataIndex: 'destinataire',
      key: 'destinataire',
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephone',
      key: 'telephone',
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
    },
    {
      title: 'Tarif Livraison',
      dataIndex: 'new_tarif_livraison',
      key: 'tarif_livraison',
      render: (tarif_livraison, record) => (
        <span>
          { `${tarif_livraison} DH`}
        </span>
      ),
    },
    {
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
      render: (text) => (text ? `${text.toFixed(2)} DH` : 'N/A'),
    },
    {
      title: 'Montant à Payer',
      dataIndex: 'montant_a_payer',
      key: 'montant_a_payer',
      render: (montant) => `${montant} DH`,
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

  // Memoize the calculation of totals to optimize performance
  const { totalPrix, totalTarif, netAPayer, calcData } = useMemo(() => {
    let tp = 0; // Total Prix
    let tt = 0; // Total Tarif

    if (facture) {
      if (facture.type === 'livreur') {
        // Sum 'montant_a_payer' for all 'Livrée' colis
        tp = facture.colis.reduce((acc, col) => acc + (col.montant_a_payer || 0), 0) || 0;

        // Sum 'tarif_total' for all 'Livrée' colis (tarif_livraison + 0 + 0)
        tt = facture.colis.reduce((acc, col) => acc + (col.tarif_total || 0), 0) || 0;
      }
    }

    // Calculate netAPayer based on facture type
    const np = facture?.type === 'livreur' ? tp : 0;

    // Prepare calcData based on facture type
    const data =
      facture?.type === 'livreur'
        ? [
            {
              key: '1',
              description: 'Total Prix (Prix - Tarif Livraison)',
              total: tp,
            },
            {
              key: '2',
              description: 'Total Tarif Livraison',
              total: tt,
            },
            {
              key: '3',
              description: 'Net à Payer',
              total: np,
            },
          ]
        : [];

    return { totalPrix: tp, totalTarif: tt, netAPayer: np, calcData: data };
  }, [facture]);

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
              <p>{facture?.livreur || 'N/A'}</p>
              <p>{facture?.livreur_tele || 'N/A'}</p>
            </div>
            <div className="bon-livraison">
              <p>
                <strong>Bon Livraison:</strong>
              </p>
              <p>#{facture?.code_facture || 'N/A'}</p>
              <p>{facture?.date_facture ? moment(facture.date_facture).format('LLL') : 'N/A'}</p>
              <p>{facture?.colis?.length || 0} Colis</p>
            </div>
          </div>
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

export default FactureDetailLivreur;
