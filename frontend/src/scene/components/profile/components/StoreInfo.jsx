import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStoreByUser, deleteStore } from '../../../../redux/apiCalls/storeApiCalls';
import { Row, Col, Card, Button, Spin, Alert, Drawer, Modal, Tag, Space, Tooltip, Avatar, Progress } from 'antd';
import { FaInfoCircle, FaPenFancy, FaPlus, FaStoreAlt } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import Cookies from 'js-cookie';
import StoreForm from './StoreForm';
import { toast } from 'react-toastify';

const { Meta } = Card;

/**
 * Utility function to calculate the completeness percentage of store data.
 * @param {Object} store - The store object containing its attributes.
 * @returns {number} - Percentage of completed fields.
 */
const calculateCompletion = (store) => {
  let completed = 0;
  const total = 5; // tele, adress, Bio, message, image

  if (store.tele) completed += 1;
  if (store.adress) completed += 1;
  if (store.Bio) completed += 1;
  if (store.message) completed += 1;
  if (store.image && store.image.url) completed += 1;

  return (completed / total) * 100;
};

function StoreInfo() {
  const dispatch = useDispatch();
  const { stores, loading, error } = useSelector((state) => state.store);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  // Extract user ID from cookies
  const {user} = useSelector((state) => state.auth);

  useEffect(() => {
    if (  user?.role==="client") {
      dispatch(getStoreByUser(user?._id));
    }
  }, [dispatch]);

  // Sort stores to have default store(s) first
  const sortedStores = [...stores].sort((a, b) => {
    if (a.default && !b.default) return -1;
    if (!a.default && b.default) return 1;
    return 0;
  });

  const handleEdit = (store) => {
    setEditingStore(store);
    setDrawerVisible(true);
  };

  const handleDelete = (storeId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this store?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await dispatch(deleteStore(storeId));
          toast.success("Store deleted successfully");
        } catch (error) {
          toast.error("Failed to delete store");
        }
      },
    });
  };

  const handleView = (store) => {
    Modal.info({
      title: 'Store Details',
      content: (
        <div>
          <p><strong>Name:</strong> {store.storeName}</p>
          <p><strong>Address:</strong> {store.adress}</p>
          <p><strong>Telephone:</strong> {store.tele}</p>
          <p><strong>Bio:</strong> {store.Bio}</p>
          <p><strong>Message:</strong> {store.message}</p>
          <p><strong>Solde:</strong> DH {store.solde}</p>
          {store.image && store.image.url && (
            <Avatar src={store.image.url} size={100} />
          )}
        </div>
      ),
      onOk() {},
    });
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setEditingStore(null);
  };

  return (
    <div>
      {loading && (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      )}
      {error && (
        <Alert 
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="text" onClick={() => dispatch(getStoreByUser(user?._id))}>
              Retry
            </Button>
          }
          style={{ marginBottom: '20px' }}
        />
      )}

      <Row gutter={[16, 16]}>
        {sortedStores.map(store => {
          const completion = calculateCompletion(store);
          const progressColor = completion === 100 ? '#52c41a' : completion >= 60 ? '#faad14' : '#f5222d';

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={store._id}>
              <Card
                hoverable
                bordered={store.default}
                style={{
                  borderColor: store.default ? '#52c41a' : undefined, // Green border for default store
                  borderWidth: store.default ? '2px' : undefined,
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }}
                cover={
                  store.image && store.image.url ? (
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                      <Avatar 
                        src={store.image.url} 
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
                  <Tooltip title="Edit Store" key="edit">
                    <Button 
                      type="link" 
                      icon={<FaPenFancy />} 
                      onClick={() => handleEdit(store)}
                    />
                  </Tooltip>,
                  <Tooltip title="View Details" key="view">
                    <Button 
                      type="link" 
                      icon={<FaInfoCircle />} 
                      onClick={() => handleView(store)}
                    />
                  </Tooltip>,
                ]}
              >
                <Meta 
                  title={
                    <Space>
                      {store.storeName}
                      {store.default && <Tag color="green">Default</Tag>}
                    </Space>
                  }
                  description={
                    <>
                      <p><strong>Address:</strong> {store.adress || 'N/A'}</p>
                      <p><strong>Telephone:</strong> {store.tele || 'N/A'}</p>
                      <p><strong>Solde:</strong> DH {store.solde}</p>
                      <p><strong> Auto D-R : </strong> {store.auto_DR ? <Tag color='green'>Active</Tag> : <Tag color='red'>Desactive</Tag>}</p>
                    </>
                  }
                />
                {/* Progress Indicator */}
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <Progress 
                    type="circle" 
                    percent={completion} 
                    width={80} 
                    strokeColor={progressColor}
                    format={percent => `${percent}%`}
                  />
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Drawer
        title={editingStore ? "Edit Store" : "Add New Store"}
        placement="right"
        onClose={handleDrawerClose}
        visible={drawerVisible}
        width={400}
      >
        <StoreForm 
          onClose={handleDrawerClose} 
          initialValues={editingStore} 
          isEdit={!!editingStore} 
        />
      </Drawer>
    </div>
  );
}

export default StoreInfo;
