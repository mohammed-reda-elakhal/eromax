import React, { useRef, useState } from 'react';
import { Button, Select, Spin } from 'antd';
import { IoMdDownload } from "react-icons/io";
import TicketColis from './TicketColis';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLocation } from 'react-router-dom';

const TicketBatch = () => {
  const location = useLocation();
  const { selectedColis } = location.state || { selectedColis: [] };

  const componentRef = useRef();
  
  // State for loading indicator and format selection
  const [loading, setLoading] = useState(false);
  const [format] = useState("10x10cm"); // Only 10x10cm format now

  // Handle PDF download with loading indicator
  const handleDownloadPdf = () => {
    setLoading(true); // Start loading

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 100], // Fixed size for 10x10cm
    });

    const input = componentRef.current;
    const tickets = input.getElementsByClassName('ticket-item'); // Grab each ticket

    Array.from(tickets).forEach((ticket, index) => {
      html2canvas(ticket, { scale: 3, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.width;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Add the ticket image to the PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // Add a new page if necessary
        if (index < tickets.length - 1) {
          pdf.addPage();
        }

        // Save the PDF after all tickets are added
        if (index === tickets.length - 1) {
          pdf.save('Batch-Tickets.pdf');
          setLoading(false); // Stop loading when done
        }
      });
    });
  };

  return (
    <div className="ticket-batch-container">
      {/* Removed Format Selection Dropdown since we only use 10x10cm */}
      
      {/* Button to download PDF with loading indicator */}
      <div className="ticket-actions-all">
        <Button
          icon={<IoMdDownload />}
          type='primary'
          onClick={handleDownloadPdf}
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Téléchargement en cours...' : 'Télécharger Tous en PDF'}
        </Button>
        {loading && <Spin style={{ marginLeft: 10 }} />} {/* Show loading spinner */}
      </div>

      {/* Display the tickets before downloading */}
      <div ref={componentRef} className="ticket-list">
        {selectedColis.map((colis) => (
          <div key={colis.code_suivi} className={`ticket-item`}>
            <TicketColis colis={colis} showDownloadButton={false} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketBatch;
