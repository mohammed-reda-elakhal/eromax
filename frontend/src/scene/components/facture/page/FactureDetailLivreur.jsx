// FactureDetailLivreur.jsx

import React, { useEffect, useRef, useMemo } from 'react';
import html2pdf from 'html2pdf.js';
import '../facture.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {  getFactureLivreurByCode } from '../../../../redux/apiCalls/factureApiCalls';
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
      dispatch(getFactureLivreurByCode(code_facture));
    }
    window.scrollTo(0, 0);
    console.log(facture);
    console.log("code" + code_facture);
    
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
    }, {
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
      title: 'Ville',
      dataIndex: 'ville',
      render: (text, record) => (
        <span>
          { `${record?.ville?.nom}`}
        </span>
      ),
    },
    {
      title: 'Tarif Livraison',
      dataIndex: 'tarif_livreur',
      key: 'tarif_livreur',
      render: (tarif_livreur, record) => (
        <span>
          { `${tarif_livreur} DH`}
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
      render: (text , record) => `${record?.prix - record?.tarif_livreur} DH`,
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
        tp = facture.totalPrixColis

        // Sum 'tarif_total' for all 'Livrée' colis (tarif_livraison + 0 + 0)
        tt = facture.totalTarifLivreur;
      }
    }

    // Calculate netAPayer based on facture type
    const np = facture?.type === 'livreur' ? tp - tt: 0;

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
              <p>{facture?.livreur?.nom || 'N/A'}</p>
              <p>{facture?.livreur?.tele || 'N/A'}</p>
            </div>
            <div className="bon-livraison">
              <p>
                <strong>Bon Livraison:</strong>
              </p>
              <p>#{facture?.code_facture || 'N/A'}</p>
              <p>
                {facture?.createdAt
                  ? new Date(facture.createdAt).toLocaleDateString('fr-FR', {
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
