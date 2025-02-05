// src/pages/colis/Crbt.jsx

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { Button, Table, Modal, Form, Input, Tag } from 'antd';
import { EditOutlined, ReloadOutlined } from '@ant-design/icons';
import '../colis.css';
import { getAllCrbtInfo, updateCrbtInfo } from '../../../../redux/apiCalls/colisApiCalls';

function Crbt() {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  // Get CRBT data, count, loading, and error from Redux state
  const { crbtData, count, loading, error } = useSelector((state) => state.colis);
  
  // Local state for modal, selected row, and search term
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [updateForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to render a value as a green Tag with currency
  const renderCurrencyTag = (value) => (
    <Tag color="green">
      {value} MAD
    </Tag>
  );

  // Fetch all CRBT info when the component mounts
  useEffect(() => {
    dispatch(getAllCrbtInfo());
  }, [dispatch]);

  // Frontend filtering of the loaded data based on the searchTerm.
  const filteredData = useMemo(() => {
    if (!searchTerm) return crbtData;
    const lowerTerm = searchTerm.toLowerCase();
    return crbtData.filter(item => {
      const codeSuivi = item.code_suivi ? item.code_suivi.toLowerCase() : "";
      const storeName = item.store?.storeName ? item.store.storeName.toLowerCase() : "";
      const villeName = item.ville?.nom ? item.ville.nom.toLowerCase() : "";
      const statut = item.statu_final ? item.statu_final.toLowerCase() : "";
      // Convert all CRBT values to a string and lower-case for searching
      const crbtValues = item.crbt ? Object.values(item.crbt).join(" ").toLowerCase() : "";
      return (
        codeSuivi.includes(lowerTerm) ||
        storeName.includes(lowerTerm) ||
        villeName.includes(lowerTerm) ||
        statut.includes(lowerTerm) ||
        crbtValues.includes(lowerTerm)
      );
    });
  }, [searchTerm, crbtData]);

  // Handle search input change: update search term
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle refresh: clear search field and dispatch a new fetch for fresh data
  const handleRefresh = () => {
    setSearchTerm("");
    dispatch(getAllCrbtInfo());
  };

  // Handle opening the modal and pre-filling the form with the selected row's CRBT data
  const handleEdit = (record) => {
    setSelectedRow(record);
    updateForm.setFieldsValue({
      ...record.crbt, // assuming record.crbt holds the CRBT details
    });
    setIsModalVisible(true);
  };

  // Close the modal and reset form and selected row
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRow(null);
    updateForm.resetFields();
  };

  // Handle form submission and dispatch the update action
  const handleUpdate = () => {
    updateForm
      .validateFields()
      .then((values) => {
        dispatch(updateCrbtInfo(selectedRow._id, values));
        setIsModalVisible(false);
      })
      .catch((info) => {
        console.log('Validation Failed:', info);
      });
  };

  // Define columns for the Ant Design Table with each CRBT attribute as its own column
  const columns = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      responsive: ['lg'],
    },
    {
      title: 'Statu Final',
      dataIndex: 'statu_final',
      key: 'statu_final',
      render: (value) =>
        value === "Livrée" ? (
          <Tag color="blue">{value}</Tag>
        ) : (
          <Tag color="red">{value}</Tag>
        ),
    },
    {
      title: 'Prix Colis',
      dataIndex: ['crbt', 'prix_colis'],
      key: 'prix_colis',
      render: (value) => renderCurrencyTag(value),
    },
    {
      title: 'Tarif Livraison',
      dataIndex: ['crbt', 'tarif_livraison'],
      key: 'tarif_livraison',
      render: (value) => renderCurrencyTag(value),
    },
    {
      title: 'Tarif Refuse',
      dataIndex: ['crbt', 'tarif_refuse'],
      key: 'tarif_refuse',
      render: (value) => renderCurrencyTag(value),
    },
    {
      title: 'Tarif Fragile',
      dataIndex: ['crbt', 'tarif_fragile'],
      key: 'tarif_fragile',
      render: (value) => renderCurrencyTag(value),
    },
    {
      title: 'Tarif Sup',
      dataIndex: ['crbt', 'tarif_supplementaire'],
      key: 'tarif_supplementaire',
      render: (value) => renderCurrencyTag(value),
    },
    {
      title: 'Prix à Payant',
      dataIndex: ['crbt', 'prix_a_payant'],
      key: 'prix_a_payant',
      render: (value) => renderCurrencyTag(value),
    },
    {
      title: 'Total Tarif',
      dataIndex: ['crbt', 'total_tarif'],
      key: 'total_tarif',
      render: (value) => renderCurrencyTag(value),
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
      render: (ville) => ville?.nom || 'N/A',
    },
    {
      title: 'Store',
      dataIndex: 'store',
      key: 'store',
      render: (store) => store?.storeName || 'N/A',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className='page-dashboard'>
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div
          className="page-content"
          style={{
            backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
            color: theme === 'dark' ? '#fff' : '#002242',
          }}
        >
          <div
            className="content"
            style={{
              backgroundColor: theme === 'dark' ? '#001529' : '#fff',
              padding: '20px',
              borderRadius: '8px',
            }}
          >
            <h4>CRBT Info (Total: {count})</h4>
            {/* Single search input field and refresh button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ width: 250 }}
                allowClear
              />
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Refresh
              </Button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <Table 
              dataSource={filteredData}
              columns={columns}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
            />
          </div>
        </div>
      </main>
      <Modal
        title="Update CRBT Info"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleUpdate}
        okText="Update"
      >
        <Form form={updateForm} layout="vertical">
          <Form.Item
            name="prix_colis"
            label="Prix Colis"
            rules={[{ required: true, message: 'Please input Prix Colis!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tarif_livraison"
            label="Tarif Livraison"
            rules={[{ required: true, message: 'Please input Tarif Livraison!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="tarif_refuse" label="Tarif Refuse">
            <Input />
          </Form.Item>
          <Form.Item name="tarif_fragile" label="Tarif Fragile">
            <Input />
          </Form.Item>
          <Form.Item name="tarif_supplementaire" label="Tarif Supplémentaire">
            <Input />
          </Form.Item>
          <Form.Item name="prix_a_payant" label="Prix à Payant">
            <Input />
          </Form.Item>
          <Form.Item name="total_tarif" label="Total Tarif">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Crbt;
