import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from 'antd';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TicketColis from './TicketColis';
import { IoMdDownload } from "react-icons/io";

const TicketBatch = () => {
  const location = useLocation();
  const { selectedColis } = location.state || { selectedColis: [] };

  const componentRef = useRef();

  // Handle printing all selected colis tickets
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Batch-Tickets',
  });

  // Handle downloading all selected colis tickets as PDF
  
  const handleDownloadPdf = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 120],  // Custom page size, 80mm width for thermal printers, height can be adjusted
    });
  
    const input = componentRef.current;
    const tickets = input.getElementsByClassName('ticket-item'); // Grab each ticket
  
    // Iterate over each ticket
    Array.from(tickets).forEach((ticket, index) => {
      html2canvas(ticket, { scale: 3, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
  
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = 80;  // Fixed width for thermal printers (58mm, 80mm, etc.)
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;  // Adjust height based on image aspect ratio
  
        // Add the ticket image to the PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
        // Add a new page for the next ticket if it is not the last one
        if (index < tickets.length - 1) {
          pdf.addPage([80, 120], 'portrait');  // Create a new page for each ticket
        }
  
        // Save the PDF at the end of iteration
        if (index === tickets.length - 1) {
          pdf.save('Batch-Tickets.pdf');
        }
      });
    });
  };
  
  return (
    <div className="ticket-batch-container">
        <div className="ticket-actions-all">
            <Button icon={<IoMdDownload/>} type='primary' onClick={handleDownloadPdf}>Télécharger Tous en PDF</Button>
        </div>
        <div ref={componentRef} className="ticket-list">
            {selectedColis.map((colis) => (
            <div key={colis.code_suivi} className="ticket-item">
                <TicketColis colis={colis} />
            </div>
            ))}
        </div>
    </div>
  );
};

export default TicketBatch;
