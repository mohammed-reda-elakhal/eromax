import React, { useState } from 'react';
import { Modal, Radio } from 'antd';

const TicketFormatModal = ({ visible, onClose, onFormatSelect }) => {
  const [selectedFormat, setSelectedFormat] = useState('half');

  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
  };

  const handleConfirm = () => {
    onFormatSelect(selectedFormat);
    onClose();
  };

  return (
    <Modal visible={visible} onCancel={onClose} onOk={handleConfirm} title="Select Ticket Format">
      <Radio.Group onChange={handleFormatChange} value={selectedFormat}>
        <Radio value="half">1/2</Radio>
        <Radio value="quarterVertical">1/4 Vertical</Radio>
        <Radio value="quarterHorizontal">1/4 Horizontal</Radio>
        <Radio value="sixth">1/6</Radio>
        <Radio value="square">10cm x 10cm</Radio>
      </Radio.Group>
    </Modal>
  );
};

export default TicketFormatModal;
