import React, { useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import '../facture.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getFactureRetourDetailsByCode } from '../../../../redux/apiCalls/factureApiCalls';
import { Table, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';

const FactureRetourDetail = () => {
  const printRef = useRef();
  const dispatch = useDispatch();
  const facture = useSelector((state) => state.facture.detailFactureRetour);
  const { code_facture } = useParams();

  useEffect(() => {
    dispatch(getFactureRetourDetailsByCode(code_facture));
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

  // Prepare dataSource for the Table
  const dataSource = facture?.colis?.map((col, index) => ({
    key: col.code_suivi || index,
    code_suivi: col.code_suivi,
    destinataire: col.destinataire,
    telephone: col.telephone,
    ville: col.ville,
    adresse: col.adresse,
    statut: col.statut,
    prix: col.prix,
    tarif_livraison: col.tarif_livraison,
    tarif_total: col.tarif_total,
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
      title: 'Adresse',
      dataIndex: 'adresse',
      key: 'adresse',
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (text) => {
        switch (text) {
          case 'Livrée':
            return <Tag icon={<CheckCircleOutlined />} color="success">{text}</Tag>;
          case 'Annulée':
          case 'Refusée':
            return <Tag icon={<CloseCircleOutlined />} color="error">{text}</Tag>;
          case 'Remplacée':
            return <Tag icon={<ExclamationCircleOutlined />} color="warning">{text}</Tag>;
          default:
            return <Tag icon={<SyncOutlined spin />} color="processing">{text}</Tag>;
        }
      },
    },
    {
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
      render: (text) => (text ? text.toFixed(2) : 'N/A'),
    },
  ];

  // Calculate totals for all colis
  const totalPrix = facture?.colis?.reduce((acc, col) => acc + (col.prix || 0), 0) || 0;
  const totalTarif = facture?.colis?.reduce((acc, col) => acc + (col.tarif_total || 0), 0) || 0;
  const netAPayer = totalPrix - totalTarif;

  return (
    <div>
      {/* Buttons to download and print the PDF */}
      <div className="facture-buttons">
        <button onClick={handleDownloadPdf}>Télécharger PDF</button>
      </div>

      {/* Facture detail to be converted into PDF */}
      <div className="facture-detail" ref={printRef}>
        <div className="facture-header">
          <div className="facture-title">
            <h2>Facture Code: {facture?.code_facture}</h2>
            <p>Date: {new Date(facture?.date_facture).toLocaleString()}</p>
          </div>
          <div className="facture-info">
            <div className="expediteur">
              <p><strong>Expéditeur:</strong> {facture?.store || 'N/A'}</p>
              <p><strong>Téléphone:</strong> {facture?.client_tele || 'N/A'}</p>
            </div>
            <div className="livreur-info">
              <p><strong>Livreur:</strong> {facture?.livreur || 'N/A'}</p>
              <p><strong>Téléphone:</strong> {facture?.livreur_tele || 'N/A'}</p>
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

      

        <div className="facture-signatures">
          <div className="signature-client">
            <p><strong>Signature Client:</strong> ____________________</p>
          </div>
          <div className="signature-livreur">
            <p><strong>Signature Livre:</strong> ____________________</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactureRetourDetail;
