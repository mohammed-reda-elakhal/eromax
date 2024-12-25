import React, { useRef } from 'react';
import './ticket.css';
import Barcode from 'react-barcode';
import QRCode from "react-qr-code";
import { Button } from 'antd';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IoMdDownload } from "react-icons/io";


function TicketColis({ colis }) {
  const componentRef = useRef();

  // Function to handle print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Ticket-${colis?.code_suivi}`,
  });

  // Function to handle download as PDF
  const handleDownloadPdf = () => {
    const input = componentRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [450, 460] });
      pdf.addImage(imgData, 'PNG', 0, 0, 450, 460);
      pdf.save(`Ticket-${colis?.code_suivi}.pdf`);
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <>
      <div ref={componentRef} className="ticket-colis">
        <div className="ticket-colis-header">
          <div className="ticket-colis-header-logo">
            <h2>Eromax</h2>
            <img src="/image/logo-light.png" alt="" width="70px" />
          </div>
          <div className="ticket-colis-header-code">
            <div className="code-bar">
              <Barcode value={colis.code_suivi} width={1.2} height={50} fontSize={12} />
            </div>
            <div className="qr-code">
              <QRCode value={colis.code_suivi} size={100} />
            </div>
          </div>
        </div>
        <div className="ticket-colis-main">
          <div className="ticket-colis-main-header">
            <p>{colis?.ouvrir ? "Ouvrir Colis" : ""}</p>
            <p>{colis.is_remplace ? "Remplace" : ""}</p>
            <p>{colis.is_fragile ? "Fragile" : ""}</p>
          </div>
          <div className="ticket-colis-main-content">
            <div className="ticket-colis-main-expedateur">
              <h5>Expedateur :</h5>
              <img src={colis?.store?.image?.url} alt="" width="80px" />
              <h3>{colis?.store?.storeName}</h3>
              <p>{colis?.store?.id_client?.tele}</p>
              <p>{formatDate(colis?.createdAt)}</p>
            </div>
            <div className="ticket-colis-main-destinataire">
              <p><strong>Nom :</strong> {colis?.nom}</p> {/* Access 'nom' field */}
              <p><strong>Téléphone :</strong> {colis?.tele}</p>
              <p><strong>Ville :</strong> {colis?.ville?.nom}</p> {/* Access 'nom' field in 'ville' */}
              <p><strong>Adresse :</strong> {colis?.adresse}</p>
              <p><strong>Produit :</strong> {colis?.nature_produit}</p>
              <h3 style={{color:"green"}}>{colis?.prix} DH</h3> {/* Ensure 'prix' is a valid number or string */}
            </div>
          </div>
          <div className="ticket-colis-footer">
            <div className="ticket-colis-footer-store">
              <p>{colis?.store?.message || "current message"}</p>
            </div>
            <div className="ticket-colis-footer-eromax" style={{textAlign: "center"}}>
              <p>اروماكس مسؤولة على التوصيل فقط</p>
            </div>
          </div>
        </div>
      </div>
      <div className="ticket-actions">
        <Button onClick={handleDownloadPdf} icon={<IoMdDownload/>} type="primary"></Button>
      </div>
    </>
  );
}

export default TicketColis;
