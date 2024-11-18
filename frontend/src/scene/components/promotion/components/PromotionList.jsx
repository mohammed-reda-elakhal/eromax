// src/components/Promotions.js

import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Checkbox,
  Spin,
  Avatar,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
} from '../../../../redux/apiCalls/promotionApiCalls';
import { getProfileList } from '../../../../redux/apiCalls/profileApiCalls'; // Import the client API call
import { promotionActions } from '../../../../redux/slices/promotionSlice';
import { toast, ToastContainer } from 'react-toastify';
import moment from 'moment';
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify styles

const { Option } = Select;
const { RangePicker } = DatePicker;

const PromotionList = () => {
  const dispatch = useDispatch();
  const newbranch = developement ;
  const {
    promotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = useSelector((state) => state.promotion);

  const { profileList, user } = useSelector((state) => ({
    profileList: state.profile.profileList,
    user: state.auth.user
}));

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);

  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);

  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(getAllPromotions());
    dispatch(getProfileList("client")); // Fetch client profiles on mount
  }, [dispatch]);

  useEffect(() => {
    if (promotionsError) {
      toast.error(promotionsError);
      dispatch(promotionActions.fetchPromotionsFailure(null)); // Reset error
    }
  }, [promotionsError, dispatch]);


  const showAddModal = () => {
    setIsEditMode(false);
    setCurrentPromotion(null);
    form.resetFields();
    setSelectedStoreIds([]);
    setIsModalVisible(true);
  };

  const showEditModal = (promotion) => {
    setIsEditMode(true);
    setCurrentPromotion(promotion);
    form.setFieldsValue({
      type: promotion.type,
      value: promotion.value,
      dateRange: [moment(promotion.startDate), moment(promotion.endDate)],
      appliesTo: promotion.appliesTo,
      clients: promotion.appliesTo === 'specific' ? promotion.clients : [],
    });
    setSelectedStoreIds(promotion.clients || []);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentPromotion(null);
    form.resetFields();
    setSelectedStoreIds([]);
  };

  const handleClientModalCancel = () => {
    setIsClientModalVisible(false);
  };

  const handleClientSelectionConfirm = () => {
    form.setFieldsValue({ clients: selectedStoreIds });
    setIsClientModalVisible(false);
  };

  const onFinish = (values) => {
    const promotionData = {
      type: values.type,
      value: Number(values.value), // Ensure it's a number
      startDate: values.dateRange[0].toISOString(),
      endDate: values.dateRange[1].toISOString(),
      appliesTo: values.appliesTo,
      clients: values.appliesTo === 'specific' ? selectedStoreIds : [],
    };

    if (isEditMode && currentPromotion) {
      dispatch(updatePromotion(currentPromotion._id, promotionData));
    } else {
      dispatch(createPromotion(promotionData));
    }

    setIsModalVisible(false);
    form.resetFields();
    setSelectedStoreIds([]);
  };

  const handleDelete = (id) => {
    dispatch(deletePromotion(id));
  };

  const handleToggle = (id) => {
    dispatch(togglePromotionStatus(id));
  };

  const handleAppliesToChange = (value) => {
    if (value === 'specific') {
      setIsClientModalVisible(true);
    } else {
      setSelectedStoreIds([]);
      form.setFieldsValue({ clients: [] });
    }
  };

  const handleStoreSelect = (storeId) => {
    if (selectedStoreIds.includes(storeId)) {
      setSelectedStoreIds(selectedStoreIds.filter((id) => id !== storeId));
    } else {
      setSelectedStoreIds([...selectedStoreIds, storeId]);
    }
  };

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

  // Client Selection Modal Content with Stores Displayed as Cards
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
        <Row gutter={[16, 16]}>
          {profileList.map((client) =>
            client.stores.map((store) => (
              <Col xs={24} sm={12} md={8} lg={6} key={store._id}>
                <Card
                  hoverable
                  onClick={() => handleStoreSelect(store._id)}
                  style={{
                    border:
                      selectedStoreIds.includes(store._id)
                        ? '2px solid #1890ff'
                        : '1px solid #f0f0f0',
                  }}
                >
                  <Card.Meta
                    title={store.storeName}
                    description={`Solde: ${store.solde} DH`}
                  />
                  <div style={{ marginTop: '10px' }}>
                    <Avatar src={store.image.url}></Avatar>
                    <Checkbox
                      checked={selectedStoreIds.includes(store._id)}
                      onChange={() => handleStoreSelect(store._id)}
                    >
                      Select
                    </Checkbox>
                  </div>
                </Card>
              </Col>
            ))
          )}
        </Row>
    </Modal>
  );

  return (
    <div style={{ padding: '24px' }}>
      <ToastContainer />
      <Button
        type="primary"
        onClick={showAddModal}
        style={{ marginBottom: '16px' }}
        disabled={promotionsLoading}
      >
        Ajouter Promotion
      </Button>
      <Table
        columns={columns}
        dataSource={Array.isArray(promotions) ? promotions : []}
        rowKey="_id"
        loading={promotionsLoading}
        pagination={{ pageSize: 10 }}
        responsive
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
            rules={[{ required: true, message: 'Please select the promotion type!' }]}
          >
            <Select placeholder="Select Promotion Type">
              <Option value="fixed_tarif">Fixed Tarif</Option>
              <Option value="percentage_discount">Percentage Discount</Option>
            </Select>
          </Form.Item>

          {/* Promotion Value */}
          <Form.Item
            name="value"
            label="Value (DH)"
            rules={[
              { required: true, message: 'Please enter the promotion value!' },
              { type: 'number', min: 0, message: 'Value must be positive!' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter value"
              formatter={(value) => `${value} DH`}
              parser={(value) => value.replace(/ DH\s?|(,*)/g, '')}
            />
          </Form.Item>

          {/* Promotion Period */}
          <Form.Item
            name="dateRange"
            label="Promotion Period"
            rules={[
              { type: 'array', required: true, message: 'Please select the promotion period!' },
              {
                validator: (_, value) =>
                  value && value[0].isBefore(value[1])
                    ? Promise.resolve()
                    : Promise.reject(new Error('Start date must be before end date')),
              },
            ]}
          >
            <RangePicker
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < moment().startOf('day')}
            />
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
              <InputNumber
                readOnly
                style={{ width: '100%' }}
                placeholder="Click to select stores"
                value={selectedStoreIds.length > 0 ? `${selectedStoreIds.length} Selected` : null}
                onClick={() => setIsClientModalVisible(true)}
              />
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
