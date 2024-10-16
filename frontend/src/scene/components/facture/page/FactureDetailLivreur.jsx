import React, { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../facture.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getFactureDetailsByCode, getFactureDetailsByLivreur } from '../../../../redux/apiCalls/factureApiCalls';
import { Table, Tag } from 'antd';

const FactureDetailLivreur = () => {
    const printRef = useRef();
    const dispatch = useDispatch();
    const facture = useSelector((state) => state.facture.detailFacture);
    const livreur =useSelector((state)=>state.auth.user._id)
    const { code_facture } = useParams();

    useEffect(() => {
        dispatch(getFactureDetailsByCode(code_facture));
        dispatch(getFactureDetailsByLivreur(livreur,'Livreur'))
        window.scrollTo(0, 0);
        console.log(facture);
    }, [dispatch, code_facture,livreur]);

    // Function to generate PDF and download
    const handleDownloadPdf = async () => {
        const element = printRef.current;
    
        // Optional: Temporarily remove padding or margins for accurate PDF generation
        element.style.padding = '0';
        element.style.margin = '0';
    
        const canvas = await html2canvas(element, { backgroundColor: '#fff' }); // Ensure white background is captured
        const data = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: [595.28, 841.89], // A4 dimensions in points
        });
    
        const width = pdf.internal.pageSize.getWidth();
        const height = canvas.height * width / canvas.width;
    
        pdf.addImage(data, 'PNG', 0, 0, width, height);
        pdf.save(`${facture?.code_facture}.pdf`);
    
        // Restore padding or margins after PDF generation
        element.style.padding = '20px';
        element.style.margin = 'auto';
    };
    

    // Function to print the PDF
    const handlePrintPdf = async () => {
        const element = printRef.current;
        const canvas = await html2canvas(element, { backgroundColor: '#fff' });
        const data = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: [595.28, 841.89], // A4 dimensions in points
        });

        const width = pdf.internal.pageSize.getWidth();
        const height = canvas.height * width / canvas.width;

        pdf.addImage(data, 'PNG', 0, 0, width, height);
        const pdfBlob = pdf.output('blob');
        const url = URL.createObjectURL(pdfBlob);

        // Open the PDF in a new window and automatically trigger print
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        iframe.onload = function () {
            iframe.contentWindow.print();
        };
    };

    // Calculate the sums for prix and tarif
    const totalPrix = facture?.colis?.reduce((acc, col) => acc + (col.prix || 0), 0) || 0;
    const totalTarif = facture?.livreur_tarif * (facture?.colis?.length || 0); 
    const difference = totalPrix - totalTarif;

    // Define columns for TableDashboard
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
            render: (text, record) => facture?.livreur || 'N/A', // Check if store exists, otherwise return 'N/A'
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
            key: 'ville', // Check if ville exists, otherwise return 'N/A'
        },
        {
            title: 'Statut',
            key: 'statut',
            dataIndex: 'statu',
            render: (text, record) => (
                <>
                    <Tag color='green'>
                        {record.statu}
                    </Tag>
                </>
            ),
        },
        {
            title: 'Tarif',
            dataIndex: 'livreur',
            key: 'livreur', // Check if tarif exists, otherwise return 'N/A'
            render: (text) => (
                <span>
                    {facture.livreur_tarif}
                </span>
            ),
        },
        {
            title: 'Prix',
            dataIndex: 'prix',
            key: 'prix',
            render: (text) => text ? text.toFixed(2) : 'N/A', // Check if prix exists, otherwise return 'N/A'
        }
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
            render: (text) => text ? text.toFixed(2) : '0.00',
        }
    ];

    // Data for the calculation table
    const calcData = [
        {
            key: '1',
            description: 'Total Prix',
            total: totalPrix
        },
        {
            key: '2',
            description: 'Total Tarif',
            total: totalTarif
        },
        {
            key: '3',
            description: 'Montant à payer',
            total: difference
        }
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
                            <p><strong>Expéditeur:</strong></p>
                            <p>{facture?.livreur || 'N/A'}</p>
                            <p>{facture?.livreur_tele}</p> {/* Example phone number; adjust as needed */}
                        </div>
                        <div className="bon-livraison">
                            <p><strong>Bon Livraison:</strong></p>
                            <p>#{facture?.code_facture}</p>
                            <p>{facture?.date}</p>
                            <p>{facture?.colis?.length} Colis</p>
                        </div>
                    </div>
                </div>

                {/* Table to display the colis details */}
                <div className="table-facture">
                    <Table className='table-data' columns={columns} dataSource={facture?.colis} pagination={false}/>
                </div>

                {/* Table to display the calculation of totals */}
                <div className="table-calcul">
                    <Table className='table-calc-data' columns={calcColumns} dataSource={calcData} pagination={false} />
                </div>

                <div className="facture-signatures">
                    <div className="signature-client">
                        <p><strong>Signature Client:</strong></p>
                    </div>
                    <div className="signature-livreur">
                        <p><strong>Signature du livreur:</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FactureDetailLivreur;
