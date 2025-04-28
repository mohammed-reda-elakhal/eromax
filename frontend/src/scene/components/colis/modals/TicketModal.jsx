// components/ColisTable/modals/TicketModal.jsx

import React, { useRef } from 'react';
import { Modal, Button } from 'antd';
import { useReactToPrint } from 'react-to-print';
import TicketColis from '../../tickets/TicketColis';

/**
 * TicketModal component handles displaying and printing tickets.
 *
 * Props:
 * - visible: boolean to control modal visibility
 * - onClose: function to handle modal close
 * - selectedColis: object containing colis data
 * - theme: 'dark' or 'light'
 */
const TicketModal = React.memo(({
  visible,
  onClose,
  selectedColis,
  theme,
}) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Ticket-${selectedColis?.code_suivi}`,
  });

  return (
    <Modal
      title="Ticket Colis"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="print" type="primary" onClick={handlePrint}>
          Imprimer
        </Button>,
        <Button key="close" onClick={onClose}>
          Fermer
        </Button>
      ]}
      width={600}
      className={theme === 'dark' ? 'dark-mode' : ''}
    >
      {selectedColis && (
        <div ref={componentRef}>
          <TicketColis colis={selectedColis} showDownloadButton={true} />
        </div>
      )}
    </Modal>
  );
});

export default TicketModal;
