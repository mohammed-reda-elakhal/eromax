import React, { useEffect, useState } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFacture,
  getFactureDetailsByClient,
  setFactureEtat,
  mergeFactures,
  getFactureByUser,
  getFactureDetailsByCode, // Action for fetching facture detail by code
  removeColisFromClientFacture,
  getFactureClient, // Action for removing a colis from a facture (client)
} from '../../../../redux/apiCalls/factureApiCalls';
import { IoMdRemoveCircle } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
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
} from 'antd';
import { FaRegFolderOpen, FaSyncAlt } from 'react-icons/fa';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CiSettings } from 'react-icons/ci';

const { RangePicker } = DatePicker;

function FactureClientTable({ theme, id }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { facture, user, store } = useSelector((state) => ({
    facture: state.facture.facture,
    user: state.auth.user,
    store: state.auth.store,
  }));
  // Use facture detail from Redux for modal content
  const factureDetail = useSelector((state) => state.facture.detailFacture);

  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  // Modal states for displaying facture detail
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFactureCode, setSelectedFactureCode] = useState(null);

  // When the modal opens (i.e. when selectedFactureCode changes), fetch facture details by code.
  useEffect(() => {
    if (selectedFactureCode) {
      dispatch(getFactureDetailsByCode(selectedFactureCode));
    }
  }, [dispatch, selectedFactureCode]);

  // Log the factureDetail structure (for debugging)
  useEffect(() => {
    console.log('Facture Detail Structure:', factureDetail);
  }, [factureDetail]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user) {
        await dispatch(getFactureClient(id, 'client'));
      }
    } catch (error) {
      // Error handling is already done in the API call
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
    },
    {
      title: 'Store',
      key: 'name',
      render: (text, record) => {
          return record?.store?.storeName;
      },
    },
    {
      title: 'Total Prix',
      dataIndex: 'totalPrixAPayant',
      key: 'totalPrixAPayant',
      render: (text) => (
        <Tag color="blue">{text} DH</Tag>
      ),
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
            return etat ? (
              <Tag color="green">Payé</Tag>
            ) : (
              <Tag color="red">Non Payé</Tag>
            );
          }
        } else {
          return etat ? (
            <Tag color="green">Payé</Tag>
          ) : (
            <Tag color="red">Non Payé</Tag>
          );
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
          <Button
            type="default"
            onClick={() => {
              setSelectedFactureCode(record.code_facture);
              setIsModalVisible(true);
            }}
            icon={<CiSettings/>}
          >
          </Button>
        </div>
      ),
    },
  ];

  // For row selection in the main table.
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
          // Error handling is done in the API call.
        }
      }
    });
  };

  // New columns for the modal table to display colis details.
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
      width: 120,
      render: (code_suivi, record) => {
        let badgeColor = 'default';
        if (record.statut === 'Livrée') {
          badgeColor = 'green';
        } else if (record.statut === 'Refusée') {
          badgeColor = 'red';
        }
        return <Tag color={badgeColor}>{code_suivi}</Tag>;
      },
    },
    {
      title: 'Date Livraison',
      dataIndex: 'date_livraison',
      key: 'date_livraison',
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
      dataIndex: 'prix',
      key: 'prix',
      width: 100,
      render: (prix) => `${prix} DH`,
    },
    {
      title: 'Options',
      key: 'option',
      width: 200,
      render: (text, record) => (
        <Button
          icon={<MdDelete />}
          type="primary"
          disabled
          danger
          onClick={() => {
            Modal.confirm({
              title: 'Confirmer la suppression',
              content: `Voulez-vous vraiment supprimer le colis ${record.code_suivi} de la facture ?`,
              okText: 'Oui',
              cancelText: 'Non',
              onOk: async () => {
                await dispatch(removeColisFromClientFacture(selectedFactureCode, record.code_suivi));
                // Refresh the facture detail in the modal
                dispatch(getFactureDetailsByCode(selectedFactureCode));
              },
            });
          }}
        />
      ),
    },
  ];

  // Modal content using factureDetail from Redux with horizontal Descriptions for the summary.
  const ModalContent = () => {
    return (
      <div>
        <Descriptions
          title="Récapitulatif de la Facture"
          layout="horizontal"
          bordered
          size="small"
          column={2}
          style={{ marginBottom: '20px' }}
        >
          <Descriptions.Item label="Total Prix">
            {factureDetail?.totalPrix} DH
          </Descriptions.Item>
          <Descriptions.Item label="Total Tarif">
            {factureDetail?.totalTarif} DH
          </Descriptions.Item>
          <Descriptions.Item label="Frais Refus">
            {factureDetail?.totalFraisRefus} DH
          </Descriptions.Item>
          <Descriptions.Item label="Total Tarif Suppl.">
            {factureDetail?.totalTarifAjouter} DH
          </Descriptions.Item>
          <Descriptions.Item label="Net à Payer">
            {factureDetail?.netAPayer} DH
          </Descriptions.Item>
          <Descriptions.Item label="État">
            {factureDetail?.etat ? (
              <Tag color="green">Payé</Tag>
            ) : (
              <Tag color="red">Non Payé</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
        <Table
          size="small"
          columns={modalColisColumns}
          dataSource={factureDetail?.colis || []}
          rowKey="code_suivi"
          pagination={false}
          scroll={{ y: 300 }}
          sticky
        />
      </div>
    );
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px', alignItems: 'center' }}>
        <Col span={8}>
          <Input
            placeholder="Rechercher ..."
            value={searchText}
            onChange={handleSearchChange}
            allowClear
          />
        </Col>
        <Col span={8}>
          <RangePicker onChange={handleDateRangeChange} />
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Button
            type="default"
            icon={<FaSyncAlt />}
            onClick={fetchData}
            style={{ marginRight: '10px' }}
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
      {/* Modal to display facture detail using factureDetail from Redux */}
      <Modal
        title={`Facture: ${selectedFactureCode}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="80%"
        bodyStyle={{ height: '80vh', overflowY: 'auto' }}
      >
        <ModalContent />
      </Modal>
    </div>
  );
}

export default FactureClientTable;
