import React, { useState } from 'react';
import { Table, Tag, Typography, Button, Space, Avatar, Tooltip, Form, message } from 'antd';
import { HistoryOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import UploadProofModal from './UploadProofModal';

const StyledTable = styled(motion.div)`
  .ant-table {
    background: ${props => props.theme === 'dark' ? '#001529' : '#fff'};
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .ant-table-thead > tr > th {
    background: ${props => props.theme === 'dark' ? '#002140' : '#f5f5f5'};
    color: ${props => props.theme === 'dark' ? '#fff' : 'inherit'};
  }

  .ant-table-tbody > tr:hover > td {
    background: ${props => props.theme === 'dark' ? '#003a6d' : '#f0f7ff'};
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    
    button {
      transition: transform 0.2s;
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .status-tag {
    min-width: 100px;
    text-align: center;
    font-weight: 500;
  }

  .amount-tag {
    font-size: 1.1em;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .ant-table {
      font-size: 0.9em;
    }
    
    .action-buttons {
      flex-direction: column;
    }
  }
`;

const WithdrawalTable = ({ data, loading, onHistoryClick, onStatusUpdate, onUpload, isAdmin, theme }) => {
  const [uploadModal, setUploadModal] = useState({
    visible: false,
    withdrawal: null
  });
  const [form] = Form.useForm();

  const handleUpload = async (values) => {
    try {
      await onUpload(uploadModal.withdrawal._id, values);
      setUploadModal({ visible: false, withdrawal: null });
      form.resetFields();
    } catch (error) {
      message.error('Failed to upload proof of payment');
    }
  };

  // ... your existing columns definition with the styled components

  return (
    <>
      <StyledTable
        theme={theme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          scroll={{ x: true }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
          components={{
            body: {
              row: motion.tr,
              cell: motion.td
            }
          }}
        />
      </StyledTable>

      <UploadProofModal
        visible={uploadModal.visible}
        onCancel={() => {
          setUploadModal({ visible: false, withdrawal: null });
          form.resetFields();
        }}
        onUpload={handleUpload}
        form={form}
        theme={theme}
      />
    </>
  );
};

export default WithdrawalTable;
