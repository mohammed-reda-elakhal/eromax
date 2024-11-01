// src/components/PayementProfile.js

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { useParams } from 'react-router-dom';
import { 
  getPaymentsByClientId, 
  createPayement, 
  ModifierPayement, 
  deletePayement 
} from '../../../../redux/apiCalls/payementApiCalls';
import { getMeth_payement } from '../../../../redux/apiCalls/methPayementApiCalls';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Spin, 
  Alert, 
  Drawer, 
  Modal, 
  Tag, 
  Space, 
  Tooltip, 
  Avatar, 
  Form, 
  Input, 
  Select 
} from 'antd';
import { 
  FaInfoCircle,
  FaPenFancy, 
  FaPlus, 
  FaStoreAlt 
} from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const { Meta } = Card;
const { Option } = Select;

function PayementProfile() {
  // Retrieve the logged-in user from cookies
  const user = JSON.parse(Cookies.get('user'));
  
  const dispatch = useDispatch();
  const { id } = useParams(); // Get user ID from route parameters if available

  // Extract payments and fetching state from Redux store
  const { payements, isFetching, error } = useSelector((state) => state.payement);
  
  // Extract payment methods from Redux store
  const meth_payement = useSelector((state) => state.meth_payement.meth_payement); // array

  // Local state for managing Drawer visibility and editing state
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingPayement, setEditingPayement] = useState(null);

  // Initialize Ant Design's Form
  const [form] = Form.useForm();

  // Fetch payments and payment methods on component mount
  useEffect(() => {
    const userId = id || user._id;
    dispatch(getPaymentsByClientId(userId));
    dispatch(getMeth_payement());
    window.scrollTo(0, 0); // Scroll to top on component load
  }, [dispatch, id, user._id]);

  /**
   * Show the Drawer for adding a new payment
   */
  const showDrawer = () => {
    setEditingPayement(null);
    form.resetFields();
    setIsDrawerVisible(true);
  };

  /**
   * Show the Drawer for editing an existing payment
   * @param {Object} payement - The payment object to edit
   */
  const showEditDrawer = (payement) => {
    setEditingPayement(payement);
    form.setFieldsValue({
      nom: payement.nom,
      rib: payement.rib,
      idBank: payement.idBank ? payement.idBank._id : undefined,
    });
    setIsDrawerVisible(true);
  };

  /**
   * Handle deletion of a payment
   * @param {string} payementId - The ID of the payment to delete
   */
  const handleDelete = (payementId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this payment method?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await dispatch(deletePayement(payementId));
          toast.success("Payment deleted successfully");
        } catch (error) {
          toast.error("Failed to delete payment");
        }
      },
    });
  };

  /**
   * Handle viewing details of a payment
   * @param {Object} payement - The payment object to view
   */
  const handleView = (payement) => {
    Modal.info({
      title: 'Payment Details',
      content: (
        <div>
          <p><strong>Name:</strong> {payement.nom}</p>
          <p><strong>RIB:</strong> {payement.rib}</p>
          <p><strong>Bank:</strong> {payement.idBank?.Bank || 'N/A'}</p>
          {payement.idBank?.image?.url && (
            <Avatar src={payement.idBank.image.url} size={100} />
          )}
        </div>
      ),
      onOk() {},
    });
  };

  /**
   * Handle form submission for adding or updating a payment
   * @param {Object} values - The form values
   */
  const handleAddOrUpdate = async (values) => {
    const { nom, rib, idBank } = values;
    const clientId = user._id ;
    const payementData = {
      clientId,
      nom,
      rib,
      idBank,
    };

    try {
      if (editingPayement) {
        // Update existing payment
        await dispatch(ModifierPayement(editingPayement._id, payementData));
        toast.success("Payment updated successfully");
      } else {
        // Create new payment
        await dispatch(createPayement(payementData));
        toast.success("Payment created successfully");
      }
      setIsDrawerVisible(false);
      form.resetFields();
      // No need to refetch, as Redux state is updated via reducers
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  return (
    <>
      {/* Button to add a new payment */}
      <Button 
        type="primary" 
        icon={<FaPlus />} 
        onClick={showDrawer} 
        style={{ marginBottom: '20px' }}
      >
        Add New Payment
      </Button>

      {/* Loading Spinner */}
      {isFetching ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        /* Error Alert with Retry Option */
        <Alert 
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="text" onClick={() => dispatch(getPaymentsByClientId(id || user._id))}>
              Retry
            </Button>
          }
          style={{ marginBottom: '20px' }}
        />
      ) : payements.length === 0 ? (
        /* Informative Alert when no payments are found */
        <Alert 
          message="No Payments Found"
          description="You have not added any payment methods yet."
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      ) : (
        /* Responsive Grid Layout for Payments */
        <Row gutter={[16, 16]}>
          {payements.map(payement => (
            <Col xs={24} sm={12} md={8} lg={6} key={payement._id}>
              <Card
                hoverable
                style={{
                  borderColor: undefined, // Remove if not needed
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }}
                cover={
                  payement.idBank?.image?.url ? (
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                      <Avatar 
                        src={payement.idBank.image.url} 
                        size={64} 
                        style={{ border: '2px solid #f0f0f0' }}
                      />
                    </div>
                  ) : (
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                      <FaStoreAlt size={64} color="#ccc" />
                    </div>
                  )
                }
                actions={[
                  /* Edit Payment Button */
                  <Tooltip title="Edit Payment" key="edit">
                    <Button 
                      type="link" 
                      icon={<FaPenFancy />} 
                      onClick={() => showEditDrawer(payement)}
                    />
                  </Tooltip>,
                  /* Delete Payment Button */
                  <Tooltip title="Delete Payment" key="delete">
                    <Button 
                      type="link" 
                      icon={<MdDelete />} 
                      onClick={() => handleDelete(payement._id)}
                    />
                  </Tooltip>,
                  /* View Details Button */
                  <Tooltip title="View Details" key="view">
                    <Button 
                      type="link" 
                      icon={<FaInfoCircle />} 
                      onClick={() => handleView(payement)}
                    />
                  </Tooltip>,
                ]}
              >
                <Meta 
                  title={
                    <Space>
                      {payement.nom}
                      {/* Uncomment if 'default' exists in Meth_Payement */}
                      {/* {payement.idBank?.default && <Tag color="green">Default</Tag>} */}
                    </Space>
                  }
                  description={
                    <>
                      <p><strong>RIB:</strong> {payement.rib || 'N/A'}</p>
                      <p><strong>Bank:</strong> {payement.idBank?.Bank || 'N/A'}</p>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Drawer for Adding or Editing Payments */}
      <Drawer
        title={editingPayement ? "Edit Payment" : "Add New Payment"}
        width={400}
        onClose={() => setIsDrawerVisible(false)}
        visible={isDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleAddOrUpdate}
          initialValues={{
            nom: '',
            rib: '',
            idBank: undefined,
          }}
        >
          {/* Payment Name Field */}
          <Form.Item
            name="nom"
            label="Name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input placeholder="Enter payment name" />
          </Form.Item>

          {/* RIB Field */}
          <Form.Item
            name="rib"
            label="RIB"
            rules={[{ required: true, message: 'Please enter the RIB' }]}
          >
            <Input placeholder="Enter RIB" />
          </Form.Item>

          {/* Payment Method Select Field */}
          <Form.Item
            name="idBank"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select a payment method' }]}
          >
            <Select
              placeholder="Select a payment method"
              loading={meth_payement.length === 0}
              allowClear
            >
              {meth_payement.map(meth => (
                <Option key={meth._id} value={meth._id}>
                  <Space>
                    {meth.image?.url && <Avatar src={meth.image.url} size={24} />}
                    {meth.Bank}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Form Action Buttons */}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPayement ? "Update Payment" : "Add Payment"}
              </Button>
              <Button onClick={() => setIsDrawerVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}

export default PayementProfile;
