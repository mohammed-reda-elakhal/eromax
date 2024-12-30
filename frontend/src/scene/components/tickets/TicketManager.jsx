import React, { useState, useRef } from 'react';
import { Button } from 'antd';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TicketBatch from './TicketBatch';
import TicketFormatModal from './TicketFormatModal';

const TicketManager = () => {
    const [ticketFormat, setTicketFormat] = useState('half');
    const [selectedColis, setSelectedColis] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
  
    // Simulate fetching data
    useEffect(() => {
      setTimeout(() => {
        setSelectedColis([
          { code_suivi: '123456', nom: 'John Doe', tele: '0612345678', adresse: '123 Street', nature_produit: 'Product A', prix: 100, store: { storeName: 'Store A', tele: '0676543210', message: 'Delivery Only' } },
          { code_suivi: '789012', nom: 'Jane Doe', tele: '0612345679', adresse: '456 Avenue', nature_produit: 'Product B', prix: 150, store: { storeName: 'Store B', tele: '0676543211', message: 'Delivery Only' } },
        ]);
        setLoading(false);
      }, 2000); // Simulate API delay
    }, []);
  
    if (loading) {
      return <p>Loading...</p>; // Show loading message while data is being fetched
    }
  
    return (
      <div>
        <Button onClick={() => setFormatModalVisible(true)}>Select Ticket Format</Button>
        <TicketFormatModal
          visible={formatModalVisible}
          onClose={() => setFormatModalVisible(false)}
          onFormatSelect={handleFormatSelect}
        />
        
        <TicketBatch selectedColis={selectedColis} format={ticketFormat} />
  
        <div className="ticket-actions">
          <Button type="primary" onClick={printPDF}>Print as PDF</Button>
          <Button type="default" onClick={downloadPDF}>Download as PDF</Button>
        </div>
      </div>
    );
  };
  