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
import { Button, Tag, Input, Switch, Modal, Row, Col, Descriptions, Badge, Divider, Table, Card, Popconfirm, Select, Space } from 'antd';
import { FaRegFolderOpen, FaSyncAlt, FaCog, FaPlus } from "react-icons/fa";
import { IoSend } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import moment from 'moment';

const { Option } = Select;

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

  const columns = [
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => moment(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Code Facture',
      dataIndex: 'code_facture',
      key: 'code_facture',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1),
    },
    {
      title: 'Livreur',
      key: 'name',
      render: (text, record) => {
        if (record.type === 'client' && record.store) {
          return record.store.storeName;
        } else if (record.type === 'livreur' && record.livreur) {
          return record.livreur.nom || 'N/A';
        }
        return 'N/A';
      },
    },
    {
      title: 'Total à payer',
      dataIndex: 'prixPayer',
      key: 'prixPayer',
      render: (text) => (
        <Tag color='blue'>
          {text} DH
        </Tag>
      ),
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      render: (etat, record) => {
        if (record.type === 'livreur' && user?.role === 'admin') {
          return (
            <Switch
              checked={etat}
              checkedChildren="Payé"
              unCheckedChildren="Non Payé"
              onChange={() => toggleFacturePay(record._id)}
            />
          );
        } else {
          return etat ? <Tag color="green">Payé</Tag> : <Tag color="red">Non Payé</Tag>;
        }
      },
    },
    {
      title: 'Number of Colis',
      dataIndex:'colisCount',
      key: 'colisCount',
    },
    {
      title: 'Options',
      key: 'options',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            icon={<FaRegFolderOpen />}
            onClick={() => {
              const url = `/dashboard/facture/detail/livreur/${record.code_facture}`;
              window.open(url, '_blank');
            }}
            type="primary"
          />
          {user?.role === 'admin' && (
            <>
              <Button
                icon={<FaCog />}
                onClick={() => handleOpenModal(record)}
                type="default"
              />

              <Popconfirm
                title={`Are you sure you want to delete facture ${record.code_facture}?`}
                onConfirm={() => dispatch(deleteFacture(record.code_facture))}
                okText="Yes"
                cancelText="No"
              >
                <Button icon={<MdDelete />} type="default" danger />
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
            <Button icon={<MdDelete />} type="default" danger />
          </Popconfirm>
        ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px', alignItems: 'center' }}>
        <Col xs={24} sm={24} md={6}>
          <Input
            placeholder="Rechercher ..."
            value={searchText}
            onChange={handleSearchChange}
            allowClear
          />
        </Col>
        <Col xs={24} sm={24} md={6} >
          <Select
            value={selectedDateRange}
            onChange={handleDateRangeSelectChange}
            style={{ width: '100%' }}
            disabled={loading}
          >
            <Option value="last_week">Dernière semaine</Option>
            <Option value="last_2_weeks">2 dernières semaines</Option>
            <Option value="last_month">Dernier mois</Option>
            <Option value="last_2_months">2 derniers mois</Option>
            <Option value="custom">Personnalisé</Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={6} >
          <Row gutter={8}>
            <Col span={12}>
              <Input
                type="date"
                placeholder="Date début"
                disabled={selectedDateRange !== 'custom' || loading}
                onChange={handleStartDateChange}
                value={startDate ? moment(startDate).format('YYYY-MM-DD') : ''}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <Input
                type="date"
                placeholder="Date fin"
                disabled={selectedDateRange !== 'custom' || loading}
                onChange={handleEndDateChange}
                value={endDate ? moment(endDate).format('YYYY-MM-DD') : ''}
                style={{ width: '100%' }}
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
            >
              Refresh
            </Button>
            {user?.role === 'admin' && (
              <Button
                type="primary"
                icon={<FaRegFolderOpen />}
                disabled={selectedRowKeys.length < 2}
                onClick={handleMerge}
              >
                Fusionner
              </Button>
            )}
          </Space>
        </Col>
      </Row>
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
      <Modal
        title={selectedFacture?.code_facture}
        visible={isModalVisible}
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
      >
        {selectedFacture && (
          <div>
            <Descriptions
              title="Calcule Detail :"
              bordered
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
            <Divider/>
            <Table
              size="small"
              columns={modalColisColumns}
              dataSource={selectedFacture?.colis || []}
              rowKey="code_suivi" // Updated key to use code_suivi
              pagination={false}
              scroll={{ y: 300 }}
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
        visible={isTransferModalVisible}
        onCancel={handleCloseTransferModal}
        footer={null}
        width="60%"
      >
        <Input
          placeholder="Rechercher par code facture ..."
          value={searchFactureText}
          onChange={handleSearchFactureChange}
          allowClear
          style={{ marginBottom: '20px' }}
        />
        <Row gutter={[16, 16]}>
          {filteredFactures.map((factureItem) => (
            <Col span={8} key={factureItem._id}>
              <Card
                hoverable
                onClick={() => handleFactureClick(factureItem)}
              >
                <strong>{factureItem.code_facture}</strong>
                <p>{moment(factureItem.createdAt).format('DD/MM/YYYY')}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    </div>
  );
}

export default FactureLivreurTable;
