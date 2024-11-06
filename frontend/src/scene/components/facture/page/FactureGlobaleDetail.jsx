import React, { useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import '../facture.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getFactureRamasserDetailsByCode } from '../../../../redux/apiCalls/factureApiCalls';
import { Table } from 'antd';

const FactureGlobaleDetail = () => {
  const printRef = useRef();
  const dispatch = useDispatch();
  const facture = useSelector((state) => state.facture.detailFactureRamasser);
  const { code_facture } = useParams();

  useEffect(() => {
    dispatch(getFactureRamasserDetailsByCode(code_facture));
    window.scrollTo(0, 0);
  }, [dispatch, code_facture]);

  // Function to generate PDF and download
  const handleDownloadPdf = () => {
    const element = printRef.current;

    const opt = {
      margin: [10, 10, 10, 10], // Margins: [top, left, bottom, right]
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

  // Calculate the sums for prix and tarif
  const totalPrix =
    facture?.id_colis?.reduce((acc, col) => acc + (col.prix || 0), 0) || 0;
  const totalTarif =
    facture?.id_colis?.reduce((acc, col) => acc + (col.ville?.tarif || 0), 0) || 0;
  const difference = totalPrix - totalTarif;

  // Prepare dataSource for the Table
  const dataSource =
    facture?.id_colis?.map((col, index) => ({
      key: col._id || index,
      code_suivi: col.code_suivi,
      nom: col.nom,
      tele: col.tele,
      ville: col.ville?.nom || 'N/A',
      prix: col.prix,
    })) || [];

  // Define columns for the colis table
  const columns = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
    },
    {
      title: 'Destinataire',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Téléphone',
      dataIndex: 'tele',
      key: 'tele',
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
    },
    {
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
      render: (text) => (text ? text.toFixed(2) : 'N/A'),
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
              <p>{facture?.id_store?.storeName || 'N/A'}</p>
              <p>{facture?.id_store?.tele || 'N/A'}</p>
              <p>{facture?.id_store?.adress || 'N/A'}</p>
            </div>
            <div className="bon-livraison">
              <p>
                <strong>Bon Livraison:</strong>
              </p>
              <p>#{facture?.code_facture}</p>
              <p>{new Date(facture?.createdAt).toLocaleString()}</p>
              <p>{facture?.id_colis?.length || 0} Colis</p>
            </div>
          </div>
        </div>

        {/* Table to display the colis details */}
        <div className="table-facture">
          <Table
            className="table-data"
            columns={columns}
            dataSource={dataSource}
            pagination={false}
          />
        </div>

        {/* Table to display the calculation of totals */}
        <div className="table-calcul">
          <Table
            className="table-calc-data"
            columns={calcColumns}
            dataSource={calcData}
            pagination={false}
          />
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

export default FactureGlobaleDetail;
