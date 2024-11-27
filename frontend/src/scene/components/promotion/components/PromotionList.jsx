// src/components/Promotions.js

import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  Switch,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Checkbox,
  Avatar,
  Input,
  Typography,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
} from '../../../../redux/apiCalls/promotionApiCalls';
import { getStoreList } from '../../../../redux/apiCalls/storeApiCalls';
import { promotionActions } from '../../../../redux/slices/promotionSlice';
import { toast, ToastContainer } from 'react-toastify';
import moment from 'moment';
import 'react-toastify/dist/ReactToastify.css';

const { Option } = Select;
const { Text } = Typography;

const PromotionList = () => {
  const dispatch = useDispatch();

  // Accessing promotion and store state from Redux
  const promotionsState = useSelector((state) => state.promotion);
  const storeState = useSelector((state) => state.store);

  const { promotions, loading: promotionsLoading, error: promotionsError } = promotionsState;
  const { stores, loading: storesLoading, error: storesError } = storeState;

  // Local component states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);

  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [selectedStores, setSelectedStores] = useState([]); // Storing store objects
  const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering stores

  const [form] = Form.useForm();

  // Fetch promotions and stores on component mount
  useEffect(() => {
    dispatch(getAllPromotions());
    dispatch(getStoreList());
  }, [dispatch]);

  // Handle promotions error
  useEffect(() => {
    if (promotionsError) {
      toast.error(promotionsError);
      dispatch(promotionActions.fetchPromotionsFailure(null));
    }
  }, [promotionsError, dispatch]);

  // Handle stores error
  useEffect(() => {
    if (storesError) {
      toast.error(storesError);
      dispatch(promotionActions.fetchPromotionsFailure(null));
    }
  }, [storesError, dispatch]);

  // Function to open the Add Promotion modal
  const showAddModal = () => {
    setIsEditMode(false);
    setCurrentPromotion(null);
    form.resetFields();
    setSelectedStores([]);
    setIsModalVisible(true);
  };

 // Function to open the Edit Promotion modal with existing data
const showEditModal = (promotion) => {
  setIsEditMode(true);
  setCurrentPromotion(promotion);

  // Extract store IDs from the promotion's clients
  const promotionClientIds = promotion.clients.map((client) =>
    typeof client === 'object' && client._id ? client._id : client
  );

  // Find corresponding store objects from the stores list
  const promotionClients = stores.filter((store) =>
    promotionClientIds.includes(store._id)
  );

  // Set form fields with existing promotion data
  form.setFieldsValue({
    type: promotion.type,
    // For percentage_discount, use the stored whole number (e.g., 50 for 50%)
    fixedValue: promotion.type === 'fixed_tarif' ? promotion.value : undefined,
    percentageValue: promotion.type === 'percentage_discount' ? promotion.value : undefined,
    startDate: moment(promotion.startDate).format('YYYY-MM-DD'),
    endDate: moment(promotion.endDate).format('YYYY-MM-DD'),
    appliesTo: promotion.appliesTo,
    clients: promotionClients, // This will be handled by selectedStores
  });

  // Update selectedStores state
  setSelectedStores(promotionClients || []);
  setIsModalVisible(true);
};


  // Function to handle modal cancellation
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentPromotion(null);
    form.resetFields();
    setSelectedStores([]);
  };

  // Function to handle client modal cancellation
  const handleClientModalCancel = () => {
    setIsClientModalVisible(false);
    setSearchTerm('');
  };

  // Function to confirm client selection
  const handleClientSelectionConfirm = () => {
    form.setFieldsValue({ clients: selectedStores });
    setIsClientModalVisible(false);
    setSearchTerm('');
  };

  // Function to handle form submission
const onFinish = (values) => {
  let promotionValue;

  if (values.type === 'fixed_tarif') {
    promotionValue = Number(values.fixedValue);
  } else if (values.type === 'percentage_discount') {
    promotionValue = Number(values.percentageValue); // Store as whole number (e.g., 50 for 50%)
  }

  if (isNaN(promotionValue)) {
    toast.error('Promotion value is invalid.');
    return;
  }

  const promotionData = {
    type: values.type,
    value: promotionValue,
    startDate: moment(values.startDate, 'YYYY-MM-DD').toISOString(),
    endDate: moment(values.endDate, 'YYYY-MM-DD').toISOString(),
    appliesTo: values.appliesTo,
    clients:
      values.appliesTo === 'specific'
        ? selectedStores.map((store) => store._id)
        : [],
  };

  if (isEditMode && currentPromotion) {
    dispatch(updatePromotion(currentPromotion._id, promotionData))
      .then(() => {
        setIsModalVisible(false);
        form.resetFields();
        setSelectedStores([]);
      })
      .catch((error) => {
        // Error handling is already done in the action
      });
  } else {
    dispatch(createPromotion(promotionData))
      .then(() => {
        setIsModalVisible(false);
        form.resetFields();
        setSelectedStores([]);
      })
      .catch((error) => {
        // Error handling is already done in the action
      });
  }
};


  // Function to handle promotion deletion
  const handleDelete = (id) => {
    dispatch(deletePromotion(id));
    toast.success('Promotion deleted successfully!');
  };

  // Function to toggle promotion status
  const handleToggle = (id) => {
    dispatch(togglePromotionStatus(id));
    toast.success('Promotion status updated!');
  };

  // Function to handle change in "Applies To" selection
  const handleAppliesToChange = (value) => {
    if (value === 'specific') {
      setIsClientModalVisible(true);
    } else {
      setSelectedStores([]);
      form.setFieldsValue({ clients: [] });
    }
  };

  // Function to handle store selection/deselection
  const handleStoreSelect = (store) => {
    const isSelected = selectedStores.some((s) => s._id === store._id);
    if (isSelected) {
      setSelectedStores(selectedStores.filter((s) => s._id !== store._id));
    } else {
      setSelectedStores([...selectedStores, store]);
    }
  };

  // Define table columns
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) =>
        type === 'fixed_tarif' ? 'Fixed Tarif' : 'Percentage Discount',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) =>
        record.type === 'fixed_tarif' ? `${value} DH` : `${value}%`,
    },
    
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Applies To',
      dataIndex: 'appliesTo',
      key: 'appliesTo',
      render: (appliesTo) =>
        appliesTo === 'all' ? 'All Clients' : 'Specific Clients',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggle(record._id)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => showEditModal(record)}
            disabled={promotionsLoading}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this promotion?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger disabled={promotionsLoading}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Filtered stores based on search term
  const filteredStores = stores.filter((store) =>
    store.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Client Selection Modal Content with Stores Displayed as Cards and Search
  const ClientSelectionModal = () => (
    <Modal
      title="Select Stores"
      visible={isClientModalVisible}
      onCancel={handleClientModalCancel}
      onOk={handleClientSelectionConfirm}
      okText="Confirm"
      cancelText="Cancel"
      width={800}
      bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
    >
      {/* Search Input */}
      <Input
        placeholder="Search stores by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '16px' }}
        allowClear
      />
      <Row gutter={[16, 16]}>
        {filteredStores && filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <Col xs={24} sm={12} md={8} lg={6} key={store._id}>
              <Card
                hoverable
                onClick={() => handleStoreSelect(store)}
                style={{
                  border: selectedStores.some((s) => s._id === store._id)
                    ? '2px solid #1890ff'
                    : '1px solid #f0f0f0',
                }}
              >
                <Card.Meta
                  title={store.storeName}
                  description={`Solde: ${store.solde} DH`}
                />
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                  <Avatar src={store.image?.url} style={{ marginRight: '8px' }} />
                  <Checkbox
                    checked={selectedStores.some((s) => s._id === store._id)}
                    onChange={() => handleStoreSelect(store)}
                  >
                    Select
                  </Checkbox>
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Text type="secondary">No stores found.</Text>
          </Col>
        )}
      </Row>
    </Modal>
  );

  // Function to remove a selected store
  const removeSelectedStore = (storeId) => {
    setSelectedStores(selectedStores.filter((store) => store._id !== storeId));
  };

  return (
    <div style={{ padding: '24px' }}>
      <ToastContainer />
      <Button
        type="primary"
        onClick={showAddModal}
        style={{ marginBottom: '16px' }}
        disabled={promotionsLoading || storesLoading}
      >
        Ajouter Promotion
      </Button>
      <Table
        columns={columns}
        dataSource={Array.isArray(promotions) ? promotions : []}
        rowKey="_id"
        loading={promotionsLoading || storesLoading}
        pagination={{ pageSize: 10 }}
      />

      {/* Promotion Form Modal */}
      <Modal
        title={isEditMode ? 'Update Promotion' : 'Add New Promotion'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            appliesTo: 'all',
          }}
        >
          {/* Promotion Type */}
          <Form.Item
            name="type"
            label="Type"
            rules={[
              { required: true, message: 'Please select the promotion type!' },
            ]}
          >
            <Select placeholder="Select Promotion Type">
              <Option value="fixed_tarif">Fixed Tarif</Option>
              <Option value="percentage_discount">Percentage Discount</Option>
            </Select>
          </Form.Item>
          {/* Fixed Tarif Value */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'fixed_tarif' ? (
                <Form.Item
                  name="fixedValue"
                  label="Value (DH)"
                  rules={[
                    { required: true, message: 'Please enter the promotion value!' },
                    { type: 'number', min: 0, message: 'Value must be positive!' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Enter value in DH"
                    min={0}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          {/* Percentage Discount Value */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'percentage_discount' ? (
                <Form.Item
                  name="percentageValue"
                  label="Value (%)"
                  rules={[
                    { required: true, message: 'Please enter the promotion value!' },
                    { type: 'number', min: 0, max: 100, message: 'Percentage must be between 0 and 100!' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Enter percentage value"
                    min={0}
                    max={100}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          {/* Promotion Period */}
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[
              { required: true, message: 'Please enter the start date!' },
              {
                pattern: /^\d{4}-\d{2}-\d{2}$/,
                message: 'Please use the format YYYY-MM-DD!',
              },
            ]}
          >
            <Input placeholder="Enter start date (YYYY-MM-DD)" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            rules={[
              { required: true, message: 'Please enter the end date!' },
              {
                pattern: /^\d{4}-\d{2}-\d{2}$/,
                message: 'Please use the format YYYY-MM-DD!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue('startDate');
                  if (
                    startDate &&
                    value &&
                    moment(startDate).isAfter(value)
                  ) {
                    return Promise.reject(
                      new Error('End date must be after start date!')
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input placeholder="Enter end date (YYYY-MM-DD)" />
          </Form.Item>

          {/* Applies To */}
          <Form.Item
            name="appliesTo"
            label="Applies To"
            rules={[{ required: true, message: 'Please select an option!' }]}
          >
            <Select
              placeholder="Select option"
              onChange={handleAppliesToChange}
            >
              <Option value="all">All Clients</Option>
              <Option value="specific">Specific Clients</Option>
            </Select>
          </Form.Item>

          {/* Clients Selection */}
          {form.getFieldValue('appliesTo') === 'specific' && (
            <Form.Item
              name="clients"
              label="Clients"
              rules={[
                {
                  required: true,
                  message: 'Please select at least one store!',
                },
              ]}
            >
              <div>
                <Row gutter={[8, 8]}>
                  {selectedStores.map((store) => (
                    <Col key={store._id}>
                      <Card
                        size="small"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px',
                        }}
                      >
                        <Avatar src={store.image?.url} size="small" />
                        <span style={{ marginLeft: '8px', flex: 1 }}>
                          {store.storeName}
                        </span>
                        <Button
                          type="text"
                          size="small"
                          onClick={() => removeSelectedStore(store._id)}
                          style={{ marginLeft: '4px' }}
                        >
                          ×
                        </Button>
                      </Card>
                    </Col>
                  ))}
                  <Col>
                    <Button
                      type="dashed"
                      shape="circle"
                      icon="+"
                      onClick={() => setIsClientModalVisible(true)}
                      size="small"
                    />
                  </Col>
                </Row>
              </div>
            </Form.Item>
          )}

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={promotionsLoading}
              block
            >
              {isEditMode ? 'Update Promotion' : 'Create Promotion'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Client Selection Modal */}
      <ClientSelectionModal />
    </div>
  );
};

export default PromotionList;
