import React, { useEffect, useState } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import {
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
  Typography
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FaRegFolderOpen, FaSyncAlt } from 'react-icons/fa';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CiSettings } from 'react-icons/ci';

const { RangePicker } = DatePicker;
const { Paragraph, Text } = Typography;


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

  // State for destination facture search in second modal
  const [destinationSearchText, setDestinationSearchText] = useState("");

  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Modal state for the first modal (colis details)
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Modal state for the second modal (destination facture selection)
  const [isDestinationModalVisible, setIsDestinationModalVisible] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user) {
        await dispatch(getFactureClient(id, 'client'));
      }
    } catch (error) {
      // Error handling is done in the API call
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [dispatch, user, store]);

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

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setStartDate(moment(dates[0]).startOf('day'));
      setEndDate(moment(dates[1]).endOf('day'));
    } else {
      setStartDate(null);
      setEndDate(null);
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
  ];

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
    const selectedCodes = selectedModalRows.map(row => row.code_suivi);
    dispatch(transferColisClient({
      code_facture_source: selectedFacture.code_facture,
      code_facture_distinataire: "", // No destination facture code; API will create a new one.
      colisCodeSuivi: selectedCodes,
      type: 'client',
    }));
    setIsModalVisible(false);
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
          {filteredDestinationCandidates.map((dest) => (
            <Col key={dest._id} xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card
                hoverable
                onClick={() => {
                  const selectedCodes = selectedModalRows.map(row => row.code_suivi);
                  dispatch(transferColisClient({
                    code_facture_source: selectedFacture.code_facture,
                    code_facture_distinataire: dest.code_facture,
                    colisCodeSuivi: selectedCodes,
                    type: 'client',
                  }));
                  setIsDestinationModalVisible(false);
                  setIsModalVisible(false);
                }}
              >
                <Card.Meta 
                  title={dest.code_facture} 
                  description={`Créé le: ${moment(dest.createdAt).format('DD/MM/YYYY HH:mm')}`} 
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px', alignItems: 'center' }}>
  <Col xs={24} sm={24} md={8}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
      <Input
        placeholder="Rechercher ..."
        value={searchText}
        onChange={handleSearchChange}
        allowClear
      />
    </div>
  </Col>
  <Col xs={24} sm={24} md={8} style={{ marginTop: '10px' }}>
    <RangePicker 
      onChange={handleDateRangeChange} 
      style={{ width: '100%' }} 
    />
  </Col>
  <Col xs={24} sm={24} md={8} style={{ textAlign: 'right', marginTop: '10px' }}>
    <Button
      type="default"
      icon={<FaSyncAlt />}
      onClick={fetchData}
      style={{ margin: '5px' }}
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
        style={{ margin: '5px' }}
      >
        Fusionner
      </Button>
    )}
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
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="80%"
        bodyStyle={{ height: '80vh', overflowY: 'auto' }}
      >
        <ModalContent />
      </Modal>
      <Modal
        title="Sélectionnez la Facture Distinataire"
        visible={isDestinationModalVisible}
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
