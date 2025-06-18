import React, { useState } from 'react';
import { Table, Tag, Typography, Button, Space, Avatar, Tooltip, Form, message } from 'antd';
import { HistoryOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion'; // AnimatePresence is usually for component enter/exit, not needed here
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

// IMPORTANT: Define your columns array. It was missing in your original snippet.
// This is a placeholder, adapt it to your actual data structure.
const getColumns = (onHistoryClick, onStatusUpdate, openUploadModal, isAdmin) => [
  {
    title: 'User',
    dataIndex: 'user', // Assuming 'user' is an object with 'name' and 'avatar'
    key: 'user',
    render: (user) => (
      <Space>
        <Avatar src={user?.avatar} />
        <Typography.Text>{user?.name || 'N/A'}</Typography.Text>
      </Space>
    ),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (amount) => (
      <Tag color="blue" className="amount-tag">
        ${amount?.toFixed(2)}
      </Tag>
    ),
  },
  {
    title: 'Date',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date) => new Date(date).toLocaleDateString(),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      let color;
      switch (status) {
        case 'pending': color = 'gold'; break;
        case 'approved': color = 'green'; break;
        case 'rejected': color = 'red'; break;
        default: color = 'default';
      }
      return <Tag color={color} className="status-tag">{status?.toUpperCase()}</Tag>;
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Space className="action-buttons">
        <Tooltip title="View History">
          <Button icon={<HistoryOutlined />} onClick={() => onHistoryClick(record)} />
        </Tooltip>
        {isAdmin && record.status === 'pending' && (
          <>
            <Tooltip title="Approve">
              <Button type="primary" ghost onClick={() => onStatusUpdate(record._id, 'approved')}>Approve</Button>
            </Tooltip>
            <Tooltip title="Reject">
              <Button danger ghost onClick={() => onStatusUpdate(record._id, 'rejected')}>Reject</Button>
            </Tooltip>
          </>
        )}
        {isAdmin && record.status === 'approved' && !record.proofOfPayment && (
          <Tooltip title="Upload Proof">
            <Button icon={<UploadOutlined />} onClick={() => openUploadModal(record)}>Upload Proof</Button>
          </Tooltip>
        )}
        {record.proofOfPayment && (
          <Tooltip title="View Proof">
            <Button icon={<EyeOutlined />} onClick={() => window.open(record.proofOfPayment, '_blank')} />
          </Tooltip>
        )}
      </Space>
    ),
  },
];


const WithdrawalTable = ({
  data,
  loading,
  onHistoryClick,
  onStatusUpdate,
  onUpload,
  isAdmin,
  theme,
}) => {
  const [uploadModal, setUploadModal] = useState({
    visible: false,
    withdrawal: null
  });
  const [form] = Form.useForm();

  const handleUploadProofSubmit = async (values) => {
    if (!uploadModal.withdrawal || !uploadModal.withdrawal._id) {
        message.error('Withdrawal information is missing.');
        return;
    }
    try {
      await onUpload(uploadModal.withdrawal._id, values); // onUpload should handle the actual API call
      message.success('Proof of payment uploaded successfully!');
      setUploadModal({ visible: false, withdrawal: null });
      form.resetFields();
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.message || 'Failed to upload proof of payment');
    }
  };

  const openUploadModal = (withdrawal) => {
    setUploadModal({ visible: true, withdrawal });
  };

  // Define columns inside the component or pass them as a prop if they depend on component state/props
  const columns = getColumns(onHistoryClick, onStatusUpdate, openUploadModal, isAdmin);

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
        onUpload={handleUploadProofSubmit} // Use the correctly named handler
        form={form}
        theme={theme}
      />
    </>
  );
};

export default WithdrawalTable;