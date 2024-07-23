import React from 'react';
import './ticket.css';
import Barcode from 'react-barcode';
import QRCode from "react-qr-code";

function TicketColis({ colis }) {
  return (
    <>
      <div className="ticket-colis">
        <div className="ticket-colis-header">
          <div className="ticket-colis-header-logo">
            <h2>Eromax Service</h2>
            <img src="/image/logo-light.png" alt="" width="90px" />
          </div>
          <div className="ticket-colis-header-code">
            <div className="code-bar">
              <Barcode value={colis.code_suivi} width={0.6} height={30} fontSize = {12} />
            </div>
            <div className="qr-code">
              <QRCode value="hey" size={50}/>
            </div>
            <p>{colis.ville}</p>
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
              <img src="/image/logo-light.png" alt="" width="80px" />
              <h3>Nom de Store</h3>
              <p>06 03 22 41 78</p>
              <p>2024/07/16 10:43</p>
            </div>
            <div className="ticket-colis-main-destinataire">
              <h5>Destinataire :</h5>
              <p> <strong>Nom :</strong> {colis.nom} </p>
              <p><strong>Téléphone :</strong> {colis.tele}</p>
              <p><strong>Ville :</strong> {colis.ville}</p>
              <p><strong>Adresse :</strong> {colis.adresse}</p>
              <h2>{colis.prix} DH </h2>
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
      <img src="/image/rotate_phone.gif" alt="" width="300px" className='rotate_phone_ticket' />
    </>
  );
}

export default TicketColis;
