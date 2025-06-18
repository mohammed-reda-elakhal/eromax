import React, { useState, useEffect } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFacture,
  getFactureDetailsByLivreur,
  setFactureEtat,
  mergeFactures,
  getFactureByUser,
  getFactureLivreur,
  transferColisClient,
  removeColisFromFacture,
  deleteFacture,
} from '../../../../redux/apiCalls/factureApiCalls';
import { Button, Tag, Input, Switch, Modal, Row, Col, Descriptions, Badge, Divider, Table, Card, Popconfirm, Select, Space, Typography } from 'antd';
import { FaRegFolderOpen, FaSyncAlt, FaCog, FaPlus } from "react-icons/fa";
import { IoSend } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import moment from 'moment';

// Import CSS for styling
import './factureStyles.css';

const { Option } = Select;
const { Paragraph } = Typography;

function FactureLivreurTable({ theme , id }) {
  const dispatch = useDispatch();
  const { facture, user } = useSelector((state) => ({
    facture: state.facture.facture,
    user: state.auth.user,
  }));

  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [selectedColis, setSelectedColis] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchFactureText, setSearchFactureText] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('last_week'); // Default to last week
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchData = async (dateRange = selectedDateRange) => {
    setLoading(true);
    try {
      if (user) {
        if (dateRange === 'custom') {
          if (startDate && endDate) {
            // If custom date range is selected and dates are set
            dispatch(getFactureLivreur(id, 'custom', startDate, endDate));
          } else {
            // If custom is selected but no dates are set yet, don't fetch
            toast.info('Veuillez sélectionner une plage de dates');
          }
        } else {
          // For predefined date ranges
          dispatch(getFactureLivreur(id, dateRange));
        }
      }
    } catch (error) {
      // La gestion des erreurs est déjà gérée dans les appels API
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [dispatch, user]);

  // Handle date range selection change
  const handleDateRangeSelectChange = (value) => {
    setSelectedDateRange(value);

    // If custom is not selected, clear the custom date picker values and fetch data
    if (value !== 'custom') {
      setStartDate(null);
      setEndDate(null);
      setLoading(true); // Set loading state before fetching
      fetchData(value);
    }
    // If custom is selected, don't fetch data yet - wait for date selection
  };

  // Handle start date change
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value ? moment(e.target.value).startOf('day') : null;
    setStartDate(newStartDate);

    // If both dates are set and custom is selected, fetch data
    if (newStartDate && endDate && selectedDateRange === 'custom') {
      setLoading(true); // Set loading state before fetching
      fetchData('custom');
    }
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value ? moment(e.target.value).endOf('day') : null;
    setEndDate(newEndDate);

    // If both dates are set and custom is selected, fetch data
    if (startDate && newEndDate && selectedDateRange === 'custom') {
      setLoading(true); // Set loading state before fetching
      fetchData('custom');
    }
  };

  const filterData = (text) => {
    let filtered = [...facture];

    if (text) {
      filtered = filtered.filter((item) =>
        item.code_facture.toLowerCase().includes(text.toLowerCase()) ||
        item.type.toLowerCase().includes(text.toLowerCase()) ||
        (item.livreur &&
          item.livreur.nom.toLowerCase().includes(text.toLowerCase())) ||
        (item.store &&
          item.store.storeName.toLowerCase().includes(text.toLowerCase()))
      );
    }

    setFilteredData(filtered);
  };

  useEffect(() => {
    filterData(searchText);
  }, [facture, searchText]);

  const toggleFacturePay = (id) => {
    dispatch(setFactureEtat(id));
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const onSelectChange = (selectedKeys) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleMerge = () => {
    if (selectedRowKeys.length < 2) {
      toast.error("Veuillez sélectionner au moins deux factures à fusionner.");
      return;
    }

    Modal.confirm({
      title: 'Confirmer la fusion',
      content: `Voulez-vous vraiment fusionner ${selectedRowKeys.length} factures ?`,
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        try {
          const selectedFactures = facture.filter(f => selectedRowKeys.includes(f._id));
          const factureCodes = selectedFactures.map(f => f.code_facture);

          await dispatch(mergeFactures(factureCodes));

          await fetchData();

          setSelectedRowKeys([]);
        } catch (error) {
          // La gestion des erreurs est déjà gérée dans les appels API
        }
      }
    });
  };

  const handleOpenModal = (facture) => {
    setSelectedFacture(facture);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedFacture(null);
    setIsModalVisible(false);
    setSelectedColis([]);
  };

  const handleOpenTransferModal = () => {
    setIsTransferModalVisible(true);
  };

  const handleCloseTransferModal = () => {
    setIsTransferModalVisible(false);
  };

  const handleColisSelectChange = (selectedKeys, selectedRows) => {
    const selectedCodeSuivi = selectedRows.map(row => row.code_suivi);
    setSelectedColis(selectedCodeSuivi);
  };


  const handleFactureClick = (destinationFacture) => {
    dispatch(transferColisClient({
      code_facture_source: selectedFacture.code_facture,
      code_facture_distinataire: destinationFacture.code_facture,
      colisCodeSuivi: selectedColis,
      type: 'livreur'
    }));
    handleCloseTransferModal();
    handleCloseModal();
  };

  const handleNewFacture = () => {
    dispatch(transferColisClient({
      code_facture_source: selectedFacture.code_facture,
      code_facture_distinataire: null,
      colisCodeSuivi: selectedColis,
      type: 'livreur'
    }));
  };

  const handleSearchFactureChange = (e) => {
    setSearchFactureText(e.target.value);
  };

  const filteredFactures = facture.filter(f =>
    f._id !== selectedFacture?._id &&
    f.code_facture.toLowerCase().includes(searchFactureText.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}/${date.getFullYear()} ${String(
      date.getHours()
    ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (_, record) => (
        <span style={{
          color: theme === 'dark' ? '#cbd5e1' : '#374151',
          fontSize: '13px',
          fontWeight: '500'
        }}>
          {formatDate(record.createdAt)}
        </span>
      ),
    },
    {
      title: 'Code Facture',
      dataIndex: 'code_facture',
      key: 'code_facture',
      width: 200,
      render: (text) => (
        <div className={`facture-code-${theme}`}>
          <Paragraph copyable style={{ margin: 0, color: 'inherit' }}>
            {text}
          </Paragraph>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <span className={`facture-store-${theme}`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      ),
    },
    {
      title: 'Livreur',
      key: 'name',
      width: 150,
      render: (text, record) => {
        if (record.type === 'client' && record.store) {
          return (
            <span className={`facture-store-${theme}`}>
              {record.store.storeName}
            </span>
          );
        } else if (record.type === 'livreur' && record.livreur) {
          return (
            <span className={`facture-store-${theme}`}>
              {record.livreur.nom || 'N/A'}
            </span>
          );
        }
        return (
          <span className={`facture-store-${theme}`}>
            N/A
          </span>
        );
      },
    },
    {
      title: 'Total à payer',
      dataIndex: 'prixPayer',
      key: 'prixPayer',
      width: 140,
      render: (text) => (
        <div className={`facture-price-${theme}`}>
          {text} DH
        </div>
      ),
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      width: 150,
      render: (etat, record) => {
        const statusClass = `facture-status-${theme}`;
        if (record.type === 'livreur' && user?.role === 'admin') {
          return (
            <div className={statusClass}>
              <Switch
                checked={etat}
                checkedChildren="Payé"
                unCheckedChildren="Non Payé"
                onChange={() => toggleFacturePay(record._id)}
                style={{
                  background: etat ? '#059669' : '#6b7280'
                }}
              />
            </div>
          );
        } else {
          return (
            <div className={statusClass}>
              <Tag color={etat ? "green" : "red"}>
                {etat ? 'Payé' : 'Non Payé'}
              </Tag>
            </div>
          );
        }
      },
    },
    {
      title: 'Nombre de Colis',
      dataIndex:'colisCount',
      key: 'colisCount',
      width: 120,
      render: (text) => (
        <div className={`facture-count-${theme}`}>
          {text}
        </div>
      ),
    },
    {
      title: 'Options',
      key: 'options',
      width: 150,
      fixed: 'right',
      render: (text, record) => (
        <div className={`facture-actions-${theme}`}>
          <Button
            icon={<FaRegFolderOpen />}
            onClick={() => {
              const url = `/dashboard/facture/detail/livreur/${record.code_facture}`;
              window.open(url, '_blank');
            }}
            type="primary"
            size="small"
            style={{
              background: '#3b82f6',
              borderColor: '#3b82f6'
            }}
          />
          {user?.role === 'admin' && (
            <>
              <Button
                icon={<FaCog />}
                onClick={() => handleOpenModal(record)}
                type="default"
                size="small"
                style={{
                  background: theme === 'dark' ? '#334155' : '#ffffff',
                  borderColor: theme === 'dark' ? '#475569' : '#d1d5db',
                  color: theme === 'dark' ? '#e2e8f0' : '#374151'
                }}
              />

              <Popconfirm
                title={`Are you sure you want to delete facture ${record.code_facture}?`}
                onConfirm={() => dispatch(deleteFacture(record.code_facture))}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  icon={<MdDelete />} 
                  type="default" 
                  danger
                  size="small"
                  style={{
                    background: '#dc2626',
                    borderColor: '#dc2626',
                    color: '#ffffff'
                  }}
                />
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  // Handler for removing a colis from facture
  const handleRemoveColis = (record) => {
    if (user?.role === 'admin' && selectedFacture) {
      dispatch(removeColisFromFacture(selectedFacture.code_facture, record.code_suivi));
    }
  };

  const modalColisColumns = [
    {
      title: '#',
      key: 'index',
      width: 40,
      fixed: 'left',
      render: (text, record, index) => <span>{index + 1}</span>,
    },
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 210,
      render: (code_suivi, record) => {
        let badgeColor = 'default';
        if (record.statu_final === 'Livrée') {
          badgeColor = 'green';
        } else if (record.statu_final === 'Refusée') {
          badgeColor = 'red';
        }
        return <Tag color={badgeColor}>{code_suivi}</Tag>;
      },
    },
    {
      title: 'Date Livraison',
      dataIndex: 'date_livraisant',
      key: 'date_livraisant',
      width: 160,
      render: (text) =>
        text ? moment(text).format('DD/MM/YYYY HH:mm') : 'N/A',
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
      width: 100,
      render: (text, record) => (record.ville ? record.ville.nom : 'N/A'),
    },
    {
      title: 'Prix',
      dataIndex: 'crbt',
      key: 'prix',
      width: 100,
      render: (crbt) => `${crbt?.prix_colis || 0} DH`,
    },
    // New Action column visible only for admin
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (text, record) =>
        user?.role === 'admin' && (
          <Popconfirm
            title="Are you sure you want to remove this colis?"
            onConfirm={() => handleRemoveColis(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<MdDelete />} type="primary" danger />
          </Popconfirm>
        ),
    },
  ];

  return (
    <div className={`facture-client-container-${theme}`}>
      <div className={`facture-filters-${theme}`}>
        <Row gutter={[16, 16]} style={{ alignItems: 'center' }}>
          <Col xs={24} sm={24} md={6}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Input
                placeholder="Rechercher ..."
                value={searchText}
                onChange={handleSearchChange}
                allowClear
                style={{
                  background: theme === 'dark' ? '#334155' : '#ffffff',
                  borderColor: theme === 'dark' ? '#475569' : '#d1d5db',
                  color: theme === 'dark' ? '#e2e8f0' : '#374151'
                }}
              />
            </div>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Select
              value={selectedDateRange}
              onChange={handleDateRangeSelectChange}
              style={{
                width: '100%',
                background: theme === 'dark' ? '#334155' : '#ffffff'
              }}
              disabled={loading}
              dropdownStyle={{
                background: theme === 'dark' ? '#1e293b' : '#ffffff',
                border: theme === 'dark' ? '1px solid #334155' : '1px solid #d1d5db'
              }}
            >
              <Option value="last_week">Dernière semaine</Option>
              <Option value="last_2_weeks">2 dernières semaines</Option>
              <Option value="last_month">Dernier mois</Option>
              <Option value="last_2_months">2 derniers mois</Option>
              <Option value="last_3_months">3 derniers mois</Option>
              <Option value="last_6_months">6 derniers mois</Option>
              <Option value="custom">Personnalisé</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Row gutter={8}>
              <Col span={12}>
                <Input
                  type="date"
                  placeholder="Date début"
                  disabled={selectedDateRange !== 'custom' || loading}
                  onChange={handleStartDateChange}
                  value={startDate ? moment(startDate).format('YYYY-MM-DD') : ''}
                  style={{
                    width: '100%',
                    background: theme === 'dark' ? '#334155' : '#ffffff',
                    borderColor: theme === 'dark' ? '#475569' : '#d1d5db',
                    color: theme === 'dark' ? '#e2e8f0' : '#374151'
                  }}
                />
              </Col>
              <Col span={12}>
                <Input
                  type="date"
                  placeholder="Date fin"
                  disabled={selectedDateRange !== 'custom' || loading}
                  onChange={handleEndDateChange}
                  value={endDate ? moment(endDate).format('YYYY-MM-DD') : ''}
                  style={{
                    width: '100%',
                    background: theme === 'dark' ? '#334155' : '#ffffff',
                    borderColor: theme === 'dark' ? '#475569' : '#d1d5db',
                    color: theme === 'dark' ? '#e2e8f0' : '#374151'
                  }}
                />
              </Col>
            </Row>
          </Col>
          <Col xs={24} sm={24} md={6} style={{ textAlign: 'right'}}>
            <Space>
              <Button
                type="default"
                icon={<FaSyncAlt />}
                onClick={() => {
                  setLoading(true);
                  fetchData(selectedDateRange);
                }}
                loading={loading}
                style={{
                  background: theme === 'dark' ? '#334155' : '#ffffff',
                  borderColor: theme === 'dark' ? '#475569' : '#d1d5db',
                  color: theme === 'dark' ? '#e2e8f0' : '#374151'
                }}
              >
                Refresh
              </Button>
              {user?.role === 'admin' && (
                <Button
                  type="primary"
                  icon={<FaRegFolderOpen />}
                  disabled={selectedRowKeys.length < 2}
                  onClick={handleMerge}
                  style={{
                    background: '#3b82f6',
                    borderColor: '#3b82f6'
                  }}
                >
                  Fusionner
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      <div className={`facture-table-${theme}`}>
        <TableDashboard
          id="_id"
          column={columns}
          data={filteredData}
          theme={theme}
          loading={loading}
          onSelectChange={onSelectChange}
          rowSelection={{
            selectedRowKeys,
            onChange: onSelectChange,
          }}
        />
      </div>

      <Modal
        title={`Facture: ${selectedFacture?.code_facture}`}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
          <Button key="transfer" type='primary' icon={<IoSend/>} onClick={handleOpenTransferModal}>
            Transfer
          </Button>,
          <Button key="new" icon={<FaPlus />} onClick={handleNewFacture}>
            Nouveau Facture
          </Button>,
        ]}
        width="80%"
        className={`facture-modal-${theme}`}
        styles={{
          body: {
            height: '80vh',
            overflowY: 'auto',
            background: theme === 'dark' ? '#1e293b' : '#ffffff'
          }
        }}
      >
        {selectedFacture && (
          <div>
            <Descriptions
              title="Calcule Detail :"
              bordered
              className={`facture-modal-${theme}`}
              style={{
                background: theme === 'dark' ? '#1e293b' : '#ffffff',
                borderRadius: '8px'
              }}
            >
              <Descriptions.Item label="Total Prix">
                <Tag color="green">{selectedFacture?.totalPrix} DH</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Prix A Payer">
                <Tag color="green">{selectedFacture?.prixPayer} DH</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Tarifs">
                <Tag color="green">{selectedFacture?.totalTarifLivreur} DH</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Colis">
                {selectedFacture?.colisCount} Colis
              </Descriptions.Item>
              <Descriptions.Item label="Etat">
                {selectedFacture?.etat ? (
                  <Badge status="success" text="Payée" />
                ) : (
                  <Badge status="warning" text="Non Payée" />
                )}
              </Descriptions.Item>
            </Descriptions>
            <Divider className={`facture-divider-${theme}`} />
            <Table
              size="small"
              columns={modalColisColumns}
              dataSource={selectedFacture?.colis || []}
              rowKey="code_suivi" // Updated key to use code_suivi
              pagination={false}
              scroll={{ y: 300 }}
              sticky
              rowSelection={{
                selectedRowKeys: selectedColis,
                onChange: handleColisSelectChange,
              }}
            />
          </div>
        )}
      </Modal>

      <Modal
        title="Select Destination Facture"
        open={isTransferModalVisible}
        onCancel={handleCloseTransferModal}
        footer={null}
        width="60%"
        className={`facture-modal-${theme}`}
        styles={{
          body: {
            background: theme === 'dark' ? '#1e293b' : '#ffffff'
          }
        }}
      >
        <Input
          placeholder="Rechercher par code facture ..."
          value={searchFactureText}
          onChange={handleSearchFactureChange}
          allowClear
          style={{ 
            marginBottom: '20px',
            background: theme === 'dark' ? '#334155' : '#ffffff',
            borderColor: theme === 'dark' ? '#475569' : '#d1d5db',
            color: theme === 'dark' ? '#e2e8f0' : '#374151'
          }}
        />
        <Row gutter={[16, 16]}>
          {filteredFactures.map((factureItem) => (
            <Col span={8} key={factureItem._id}>
              <Card
                hoverable
                onClick={() => handleFactureClick(factureItem)}
                className={`facture-card-${theme}`}
              >
                <Card.Meta
                  title={
                    <span style={{ color: theme === 'dark' ? '#e2e8f0' : '#1e293b' }}>
                      {factureItem.code_facture}
                    </span>
                  }
                  description={
                    <span style={{ color: theme === 'dark' ? '#94a3b8' : '#6b7280' }}>
                      {moment(factureItem.createdAt).format('DD/MM/YYYY')}
                    </span>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    </div>
  );
}

export default FactureLivreurTable;
