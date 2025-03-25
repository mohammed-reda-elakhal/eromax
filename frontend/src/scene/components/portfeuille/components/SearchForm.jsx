import React from 'react';
import { Form, Input, Select, DatePicker, Button, Card } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledCard = styled(motion.div)`
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  .ant-card-body {
    padding: 24px;
  }

  .search-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    align-items: flex-end;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .form-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;

    @media (max-width: 768px) {
      width: 100%;
      margin-top: 16px;
    }
  }
`;

const SearchForm = ({ isAdmin, searchParams, onSearch, onReset }) => {
  const [form] = Form.useForm();

  return (
    <StyledCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSearch}
          initialValues={searchParams}
          className="search-form"
        >
          {isAdmin && (
            <Form.Item name="storeName" label="Store Name">
              <Input
                placeholder="Search by store name"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          )}

          <Form.Item name="walletKey" label="Wallet Key">
            <Input
              placeholder="Search by wallet key"
              prefix={<SearchOutlined />}
              allowClear
            />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select placeholder="Select status" allowClear>
              <Select.Option value="waiting">⏳ Waiting</Select.Option>
              <Select.Option value="seen">👁️ Seen</Select.Option>
              <Select.Option value="checking">🔍 Checking</Select.Option>
              <Select.Option value="accepted">✅ Accepted</Select.Option>
              <Select.Option value="rejected">❌ Rejected</Select.Option>
              <Select.Option value="processing">⚙️ Processing</Select.Option>
              <Select.Option value="done">✨ Done</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="Date Range">
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <div className="form-buttons">
            <Button type="default" onClick={onReset} icon={<ReloadOutlined />}>
              Reset
            </Button>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              Search
            </Button>
          </div>
        </Form>
      </Card>
    </StyledCard>
  );
};

export default SearchForm;
