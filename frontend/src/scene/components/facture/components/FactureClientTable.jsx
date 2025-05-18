import React, { useEffect, useState } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteFacture,
  getFactureClient,
  mergeFactures,
  setFactureEtat,
  transferColisClient, // Import the transfer action here
} from '../../../../redux/apiCalls/factureApiCalls';
import { IoMdRemoveCircle } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { IoSend, IoSettingsSharp } from "react-icons/io5";
import {
  Input,
  DatePicker,
  Row,
  Col,
  Switch,
  Tag,
  Button,
  Modal,
  Table,
  Descriptions,
  Badge,
  Divider,
  Card,
  Typography,
  Select,
  Space
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FaRegFolderOpen, FaSyncAlt } from 'react-icons/fa';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CiSettings } from 'react-icons/ci';
// Import Popconfirm from antd (if not already imported)
import { Popconfirm } from 'antd';

// Ensure removeColisFromFacture is imported from apiCalls:
import { removeColisFromFacture } from '../../../../redux/apiCalls/factureApiCalls';


const { Paragraph, Text } = Typography;
const { Option } = Select;


function FactureClientTable({ theme, id }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { facture, user, store } = useSelector((state) => ({
    facture: state.facture.facture,
    user: state.auth.user,
    store: state.auth.store,
  }));

  // Local state for selected facture details (source facture)
  const [selectedFacture, setSelectedFacture] = useState(null);
  // State for the modal table row selection (selected colis)
  const [selectedModalRowKeys, setSelectedModalRowKeys] = useState([]);
  const [selectedModalRows, setSelectedModalRows] = useState([]);
  // We don't need a separate state for duplicates as we calculate them on-the-fly

  // State for destination facture search in second modal
  const [destinationSearchText, setDestinationSearchText] = useState("");

  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('last_week'); // Default to last week

  // Modal state for the first modal (colis details)
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Modal state for the second modal (destination facture selection)
  const [isDestinationModalVisible, setIsDestinationModalVisible] = useState(false);

  const fetchData = async (dateRange = selectedDateRange) => {
    setLoading(true);
    try {
      if (user) {
        if (dateRange === 'custom') {
          if (startDate && endDate) {
            // If custom date range is selected and dates are set
            dispatch(getFactureClient(id, 'custom', startDate, endDate));
          } else {
            // If custom is selected but no dates are set yet, don't fetch
            toast.info('Veuillez sélectionner une plage de dates');
          }
        } else {
          // For predefined date ranges
          dispatch(getFactureClient(id, dateRange));
        }
      }
    } catch (error) {
      // Error handling is done in the API call
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveColis = (record) => {
    if (selectedFacture) {
      dispatch(removeColisFromFacture(selectedFacture.code_facture, record.code_suivi));
    }
  };

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [dispatch, user, store]);

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

  const filterData = (text, start, end) => {
    let filtered = [...facture];
    if (text) {
      filtered = filtered.filter((item) =>
        item.store?.storeName?.toLowerCase().includes(text)
      );
    }
    if (start || end) {
      filtered = filtered.filter((item) => {
        const itemDate = moment(item.createdAt);
        if (start && end) {
          return itemDate.isBetween(start, end, null, '[]');
        } else if (start) {
          return itemDate.isSameOrAfter(start);
        } else if (end) {
          return itemDate.isSameOrBefore(end);
        }
        return true;
      });
    }
    setFilteredData(filtered);
  };

  useEffect(() => {
    filterData(searchText.toLowerCase(), startDate, endDate);
  }, [facture, searchText, startDate, endDate]);

  const toggleFacturePay = (id) => {
    dispatch(setFactureEtat(id));
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value ? moment(e.target.value).startOf('day') : null;
    setStartDate(newStartDate);

    // If both dates are set and custom is selected, fetch data
    if (newStartDate && endDate && selectedDateRange === 'custom') {
      setLoading(true); // Set loading state before fetching
      fetchData('custom');
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value ? moment(e.target.value).endOf('day') : null;
    setEndDate(newEndDate);

    // If both dates are set and custom is selected, fetch data
    if (startDate && newEndDate && selectedDateRange === 'custom') {
      setLoading(true); // Set loading state before fetching
      fetchData('custom');
    }
  };

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
      render: (text, record) => <span>{formatDate(record.createdAt)}</span>,
    },
    {
      title: 'Code Facture',
      dataIndex: 'code_facture',
      key: 'code_facture',
      render: (text) => <Paragraph copyable>{text}</Paragraph>, // You can also add copyable Typography here if desired
    },
    {
      title: 'Store',
      key: 'name',
      render: (text, record) => record?.store?.storeName,
    },
    {
      title: 'Total Prix',
      dataIndex: 'totalPrixAPayant',
      key: 'totalPrixAPayant',
      render: (text) => <Tag color="blue">{text} DH</Tag>,
    },
    {
      title: 'Nombre de Colis',
      key: 'countColis',
      render: (text, record) => record.colis.length,
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      render: (etat, record) => {
        if (record.type === 'client') {
          if (user?.role === 'admin') {
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
        } else {
          return etat ? <Tag color="green">Payé</Tag> : <Tag color="red">Non Payé</Tag>;
        }
      },
    },
    {
      title: 'Options',
      key: 'options',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            icon={<FaRegFolderOpen />}
            onClick={() => {
              const url = `/dashboard/facture/detail/client/${record.code_facture}`;
              window.open(url, '_blank');
            }}
            type="primary"
          />
          {
            user?.role === 'admin' && (
              <Button
                type="default"
                onClick={() => {
                  // Set the selected facture from local state and open the first modal
                  const foundFacture = facture.find(
                    (f) => f.code_facture === record.code_facture
                  );
                  setSelectedFacture(foundFacture);
                  // Reset modal selection states when opening the modal
                  setSelectedModalRowKeys([]);
                  setSelectedModalRows([]);
                  setDestinationSearchText("");
                  setIsModalVisible(true);
                }}
                icon={<CiSettings />}
              />
            )
          }

          {user?.role === 'admin' && (
        <>
          <Button
            type="default"
            onClick={() => {
              // Open modal or action for editing/setting up, etc.
              // For deletion, you can simply call the API after a confirmation.
              Modal.confirm({
                title: 'Delete Facture',
                content: `Are you sure you want to delete facture ${record.code_facture}?`,
                okText: 'Yes',
                cancelText: 'No',
                onOk: () => dispatch(deleteFacture(record.code_facture))
              });
            }}
            icon={<MdDelete />}
            danger
          />
        </>
      )}

        </div>
      ),
    },
  ];

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
          const selectedFactures = facture.filter((f) =>
            selectedRowKeys.includes(f._id)
          );
          const factureCodes = selectedFactures.map((f) => f.code_facture);
          await dispatch(mergeFactures(factureCodes));
          await fetchData();
          setSelectedRowKeys([]);
        } catch (error) {
          // Error handling is done in API call.
        }
      },
    });
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
    // Add the following new column in your modalColisColumns definition:
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (text, record) => (
        user?.role === 'admin' && (
          <Popconfirm
            title="Are you sure you want to remove this colis?"
            onConfirm={() => handleRemoveColis(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button  icon={<MdDelete />} type="primary" danger />
          </Popconfirm>
        )
      ),
    },
  ];

  // Function to check for duplicate colis by code_suivi
  const checkDuplicateColis = (destinationFacture, selectedColis) => {
    if (!destinationFacture || !destinationFacture.colis || !selectedColis) return [];

    // Extract code_suivi values from destination facture colis
    const destinationColisCodes = destinationFacture.colis.map(colis => colis.code_suivi);

    // Find duplicates by comparing selected colis with destination facture colis
    return selectedColis.filter(colis =>
      destinationColisCodes.includes(colis.code_suivi)
    ).map(colis => colis.code_suivi);
  };

  // First modal's Transfer button handler:
  // If at least one colis is selected, open the destination selection modal.
  const handleTransferModal = () => {
    if (selectedModalRows.length === 0) {
      toast.error("Veuillez sélectionner au moins un colis.");
      return;
    }
    setIsDestinationModalVisible(true);
  };

  // New Facture handler: directly dispatch transfer with no destination code.
  const handleNewFacture = () => {
    if (selectedModalRows.length === 0) {
      toast.error("Veuillez sélectionner au moins un colis.");
      return;
    }

    // For new facture, we don't need to check for duplicates since it's a new facture
    // But we should check for duplicate code_suivi within the selected colis
    const selectedCodes = selectedModalRows.map(row => row.code_suivi);

    // Check for duplicates within the selected colis
    const uniqueCodes = new Set(selectedCodes);
    if (uniqueCodes.size < selectedCodes.length) {
      // Find the duplicates
      const codeCount = {};
      selectedCodes.forEach(code => {
        codeCount[code] = (codeCount[code] || 0) + 1;
      });

      const duplicates = Object.entries(codeCount)
        .filter(([_, count]) => count > 1)
        .map(([code]) => code);

      Modal.confirm({
        title: 'Colis Duplicates Détectés',
        content: (
          <div>
            <p>Les colis suivants ont des codes de suivi en double:</p>
            <ul>
              {duplicates.map(code => (
                <li key={code}><Tag color="red">{code}</Tag></li>
              ))}
            </ul>
            <p>Voulez-vous continuer avec seulement une instance de chaque code?</p>
          </div>
        ),
        okText: 'Continuer avec uniques',
        cancelText: 'Annuler',
        onOk: () => {
          // Use only unique codes
          dispatch(transferColisClient({
            code_facture_source: selectedFacture.code_facture,
            code_facture_distinataire: "", // No destination facture code; API will create a new one.
            colisCodeSuivi: [...uniqueCodes],
            type: 'client',
          }));
          setIsModalVisible(false);
        }
      });
    } else {
      // No duplicates, proceed normally
      dispatch(transferColisClient({
        code_facture_source: selectedFacture.code_facture,
        code_facture_distinataire: "", // No destination facture code; API will create a new one.
        colisCodeSuivi: selectedCodes,
        type: 'client',
      }));
      setIsModalVisible(false);
    }
  };

  // Content for the first modal (colis details)
  const ModalContent = () => {
    return (
      <div>
        <Descriptions
          title="Calcule Detail :"
          bordered
        >
          <Descriptions.Item label="Total Prix">
            <Tag color="green">{selectedFacture?.totalPrix} DH</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Prix A Payer">
            <Tag color="green">{selectedFacture?.totalPrixAPayant} DH</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Tarifs">
            <Tag color="green">{selectedFacture?.totalTarif} DH</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Tarif Livraison">
            <Tag color="green">{selectedFacture?.totalTarifLivraison} DH</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Supplementaire">
            <Tag color="green">{selectedFacture?.totalSupplementaire} DH</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Fragile">
            <Tag color="green">{selectedFacture?.totalFragile} DH</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Refusee">
            <Tag color="red">{selectedFacture?.totalRefuse} DH</Tag>
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

        <Divider />

        {/* Container for Transfer and New Facture Buttons */}
        <div style={{ marginBottom: '10px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button icon={<IoSend />} type="primary" onClick={handleTransferModal}>
            Transfer
          </Button>
          <Button icon={<PlusOutlined />} type="default" onClick={handleNewFacture}>
            New Facture
          </Button>
        </div>

        <Table
          size="small"
          columns={modalColisColumns}
          dataSource={selectedFacture?.colis || []}
          rowKey="_id"
          pagination={false}
          scroll={{ y: 300 }}
          sticky
          rowSelection={{
            selectedRowKeys: selectedModalRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedModalRowKeys(selectedRowKeys);
              setSelectedModalRows(selectedRows);
            },
          }}
        />
      </div>
    );
  };

  // Second modal: Destination Facture Selection
  // Filter candidate factures by store id (same as source) and exclude the source facture.
  const destinationCandidates = facture.filter(
    (f) =>
      f.store?._id === selectedFacture?.store?._id &&
      f.code_facture !== selectedFacture?.code_facture
  );

  const DestinationModalContent = () => {
    const filteredDestinationCandidates = destinationCandidates.filter((dest) =>
      dest.code_facture.toLowerCase().includes(destinationSearchText.toLowerCase())
    );
    return (
      <div>
        <Input
          placeholder="Tapez le code facture ou recherchez..."
          value={destinationSearchText}
          onChange={(e) => setDestinationSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Row gutter={[16, 16]}>
          {filteredDestinationCandidates.map((dest) => {
            // Check for duplicate colis in this destination facture
            const duplicates = checkDuplicateColis(dest, selectedModalRows);
            const hasDuplicates = duplicates.length > 0;

            return (
              <Col key={dest._id} xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card
                  hoverable
                  onClick={() => {
                    const selectedCodes = selectedModalRows.map(row => row.code_suivi);

                    // If duplicates exist, show a confirmation dialog
                    if (hasDuplicates) {
                      Modal.confirm({
                        title: 'Colis Duplicates Détectés',
                        content: (
                          <div>
                            <p>Les colis suivants existent déjà dans cette facture:</p>
                            <ul>
                              {duplicates.map(code => (
                                <li key={code}><Tag color="red">{code}</Tag></li>
                              ))}
                            </ul>
                            <p>Voulez-vous continuer sans ces colis?</p>
                          </div>
                        ),
                        okText: 'Continuer sans duplicates',
                        cancelText: 'Annuler',
                        onOk: () => {
                          // Filter out duplicate colis
                          const nonDuplicateCodes = selectedCodes.filter(code => !duplicates.includes(code));

                          if (nonDuplicateCodes.length === 0) {
                            toast.error("Tous les colis sélectionnés sont des duplicates.");
                            return;
                          }

                          // Proceed with transfer of non-duplicate colis
                          dispatch(transferColisClient({
                            code_facture_source: selectedFacture.code_facture,
                            code_facture_distinataire: dest.code_facture,
                            colisCodeSuivi: nonDuplicateCodes,
                            type: 'client',
                          }));
                          setIsDestinationModalVisible(false);
                          setIsModalVisible(false);
                        }
                      });
                    } else {
                      // No duplicates, proceed normally
                      dispatch(transferColisClient({
                        code_facture_source: selectedFacture.code_facture,
                        code_facture_distinataire: dest.code_facture,
                        colisCodeSuivi: selectedCodes,
                        type: 'client',
                      }));
                      setIsDestinationModalVisible(false);
                      setIsModalVisible(false);
                    }
                  }}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{dest.code_facture}</span>
                        {hasDuplicates && (
                          <Tag color="red">{duplicates.length} duplicates</Tag>
                        )}
                      </div>
                    }
                    description={`Créé le: ${moment(dest.createdAt).format('DD/MM/YYYY HH:mm')}`}
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px', alignItems: 'center' }}>
  <Col xs={24} sm={24} md={6}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
      <Input
        placeholder="Rechercher ..."
        value={searchText}
        onChange={handleSearchChange}
        allowClear
      />
    </div>
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
  <Col xs={24} sm={24} md={6} style={{ textAlign: 'right' }}>
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
        title={`Facture: ${selectedFacture?.code_facture}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="80%"
        styles={{ body: { height: '80vh', overflowY: 'auto' } }}
      >
        <ModalContent />
      </Modal>
      <Modal
        title="Sélectionnez la Facture Distinataire"
        open={isDestinationModalVisible}
        onCancel={() => setIsDestinationModalVisible(false)}
        footer={null}
        width="80%"
      >
        <DestinationModalContent />
      </Modal>
    </div>
  );
}

export default FactureClientTable;
