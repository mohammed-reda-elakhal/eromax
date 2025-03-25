import React from 'react';
import { Modal, Form, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledUploadArea = styled(motion.div)`
  .ant-upload-list-picture-card {
    display: flex;
    justify-content: center;
  }

  .ant-upload.ant-upload-select {
    width: 100%;
    height: 150px;
    border-radius: 8px;
    border: 2px dashed #d9d9d9;
    background: ${props => props.theme === 'dark' ? '#141414' : '#fafafa'};
    
    &:hover {
      border-color: #1890ff;
    }
  }

  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    
    .anticon {
      font-size: 24px;
      margin-bottom: 8px;
      color: #1890ff;
    }
    
    .upload-text {
      color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
    }
  }
`;

const UploadProofModal = ({ visible, onCancel, onUpload, form, theme }) => {
  return (
    <Modal
      title="Upload Proof of Payment"
      open={visible}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
      destroyOnClose
    >
      <Form
        form={form}
        onFinish={onUpload}
        layout="vertical"
      >
        <StyledUploadArea
          theme={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Form.Item
            name="verment_preuve"
            rules={[{ required: true, message: 'Please upload an image' }]}
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList || [];
            }}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
            >
              <div className="upload-content">
                <UploadOutlined />
                <div className="upload-text">Click or drag file to upload</div>
              </div>
            </Upload>
          </Form.Item>
        </StyledUploadArea>

        <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">Upload</Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadProofModal;
