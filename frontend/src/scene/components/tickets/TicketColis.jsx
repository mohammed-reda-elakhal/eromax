import React, { useRef } from 'react';
import './ticket.css';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function TicketColis() {
  return (
    <div className="ticket-colis" >
      <div className="ticket-colis-header">
        <div className="ticket-colis-header-logo">
          <h2>Eromax Service</h2>
          <img src="/image/logo-light.png" alt="" width="50px" />
        </div>
        <div className="ticket-colis-header-code">
          <div className="code-bar">
            <img src="/image/code_barre.png" alt="" />
          </div>
          <div className="qr-code">
            <img src="/image/qr_code.png" alt="" />
          </div>
          <p>Kenitra</p>
        </div>
      </div>
      <div className="ticket-colis-main">
        <div className="ticket-colis-main-header">
          <p>Ouvrir colis</p>
          <p>Essayage : Oui</p>
          <p>Remplacer</p>
          <p>Fragille</p>
        </div>
        <div className="ticket-colis-main-content">
          <div className="ticket-colis-main-expedateur">
            <h5>Expedateur :</h5>
            <img src="/image/logo-light.png" alt="" width="50px" />
            <h3>Nom de Store</h3>
            <p>06 03 22 41 78</p>
            <p>2024/07/16 10:43</p>
          </div>
          <div className="ticket-colis-main-dstinataire">
            <h5>Distinataire :</h5>
            <p>Nom de distinataire</p>
            <p>06 03 22 41 78</p>
            <p>Ville</p>
            <p>Adress</p>
            <p>Prix</p>
          </div>
        </div>
        <div className="ticket-colis-footer">
          <div className="ticket-colis-footer-store">
            <p>Message store</p>
          </div>
          <div className="ticket-colis-footer-eromax">
            <p>Message Eromax</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketColis;
