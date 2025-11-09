import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getTrashedColis,
  getTrashStatistics,
  restoreColisFromTrash,
  batchRestoreColisFromTrash,
  permanentlyDeleteColis,
  batchPermanentlyDeleteColis,
  emptyTrash
} from '../../../../redux/apiCalls/colisTrashApiCalls';
import {
  DeleteOutlined, ReloadOutlined, RollbackOutlined, SearchOutlined,
  ExclamationCircleOutlined, InfoCircleOutlined, WarningOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import {
  Table, Button, Space, Spin, message, Popconfirm, Tooltip,
  Typography, Tag, Modal, Card, Statistic, Row, Col, Input, Select
} from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text } = Typography;

function ColisCorbeille() {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState({
    code_suivi: '',
    tele: '',
    statut: '',
  });

  const { trashedColis, total, loading, statistics } = useSelector((state) => state.colisTrash);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(getTrashedColis({ page: currentPage, limit: pageSize, ...filters }));
      dispatch(getTrashStatistics());
    }
  }, [dispatch, currentPage, pageSize, user]);

  const handleSearch = () => {
    dispatch(getTrashedColis({ page: 1, limit: pageSize, ...filters }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({ code_suivi: '', tele: '', statut: '' });
    dispatch(getTrashedColis({ page: 1, limit: pageSize }));
    setCurrentPage(1);
  };

  const handleRestore = async (colisId) => {
    try {
      await dispatch(restoreColisFromTrash(colisId));
      dispatch(getTrashedColis({ page: currentPage, limit: pageSize, ...filters }));
      dispatch(getTrashStatistics());
    } catch (error) {
      console.error('Restore error:', error);
    }
  };

  const handleBatchRestore = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Veuillez sélectionner au moins un colis');
      return;
    }
    try {
      await dispatch(batchRestoreColisFromTrash(selectedRowKeys));
      setSelectedRowKeys([]);
      dispatch(getTrashedColis({ page: currentPage, limit: pageSize, ...filters }));
      dispatch(getTrashStatistics());
    } catch (error) {
      console.error('Batch restore error:', error);
    }
  };

  const handlePermanentDelete = async (colisId) => {
    try {
      await dispatch(permanentlyDeleteColis(colisId));
      dispatch(getTrashedColis({ page: currentPage, limit: pageSize, ...filters }));
      dispatch(getTrashStatistics());
    } catch (error) {
      console.error('Permanent delete error:', error);
    }
  };

  const handleBatchPermanentDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Veuillez sélectionner au moins un colis');
      return;
    }
    try {
      await dispatch(batchPermanentlyDeleteColis(selectedRowKeys));
      setSelectedRowKeys([]);
      dispatch(getTrashedColis({ page: currentPage, limit: pageSize, ...filters }));
      dispatch(getTrashStatistics());
    } catch (error) {
      console.error('Batch permanent delete error:', error);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await dispatch(emptyTrash());
      setSelectedRowKeys([]);
      dispatch(getTrashedColis({ page: 1, limit: pageSize }));
      dispatch(getTrashStatistics());
    } catch (error) {
      console.error('Empty trash error:', error);
    }
  };

  const columns = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 150,
      render: (text) => (
        <Text
          copyable
          style={{
            fontFamily: 'monospace',
            color: '#3b82f6',
            fontWeight: 600
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Destinataire',
      dataIndex: 'nom',
      key: 'nom',
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: theme === 'dark' ? '#e5e7eb' : '#1f2937' }}>
            {text}
          </div>
          <div style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
            {record.tele}
          </div>
        </div>
      ),
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
      width: 120,
      render: (ville) => ville?.nom || 'N/A',
    },
    {
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
      width: 100,
      render: (prix) => (
        <Tag color="green" style={{ fontWeight: 600 }}>
          {prix} DH
        </Tag>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      width: 150,
      render: (statut) => {
        const colorMap = {
          'Livrée': 'success',
          'Refusée': 'error',
          'Annulée': 'error',
          'En Retour': 'warning',
          default: 'default'
        };
        return <Tag color={colorMap[statut] || colorMap.default}>{statut}</Tag>;
      },
    },
    {
      title: 'Store',
      dataIndex: 'store',
      key: 'store',
      width: 150,
      render: (store) => store?.storeName || 'N/A',
    },
    {
      title: 'Supprimé le',
      dataIndex: 'trashedAt',
      key: 'trashedAt',
      width: 150,
      render: (date) => (
        <div style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          {moment(date).format('DD/MM/YYYY HH:mm')}
        </div>
      ),
    },
    {
      title: 'Supprimé par',
      dataIndex: 'trashedBy',
      key: 'trashedBy',
      width: 120,
      render: (trashedBy) => trashedBy?.nom || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Restaurer ce colis">
            <Popconfirm
              title="Restaurer ce colis?"
              description="Le colis sera restauré et visible à nouveau dans la liste principale."
              onConfirm={() => handleRestore(record._id)}
              okText="Restaurer"
              cancelText="Annuler"
            >
              <Button
                type="primary"
                icon={<RollbackOutlined />}
                size="small"
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a'
                }}
              >
                Restaurer
              </Button>
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Supprimer définitivement">
            <Popconfirm
              title="Supprimer définitivement?"
              description={
                <div style={{ maxWidth: 250 }}>
                  <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                  Cette action est <strong>irréversible</strong>. Le colis sera supprimé de manière permanente.
                </div>
              }
              onConfirm={() => handlePermanentDelete(record._id)}
              okText="Supprimer"
              cancelText="Annuler"
              okType="danger"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                Supprimer
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  if (user?.role !== 'admin') {
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
            <div style={{ padding: 40, textAlign: 'center' }}>
              <ExclamationCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
              <Title level={3}>Accès refusé</Title>
              <Text>Seuls les administrateurs peuvent accéder à la corbeille.</Text>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              padding: 24
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <Title level={3} style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#002242' }}>
                  🗑️ Corbeille des Colis
                </Title>
                <Text type="secondary">Gérer les colis supprimés</Text>
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    dispatch(getTrashedColis({ page: currentPage, limit: pageSize, ...filters }));
                    dispatch(getTrashStatistics());
                  }}
                >
                  Actualiser
                </Button>
                <Popconfirm
                  title="Vider la corbeille?"
                  description={
                    <div style={{ maxWidth: 300 }}>
                      <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                      <strong>Attention!</strong> Tous les colis de la corbeille seront supprimés définitivement. Cette action est irréversible.
                    </div>
                  }
                  onConfirm={handleEmptyTrash}
                  okText="Vider la corbeille"
                  cancelText="Annuler"
                  okType="danger"
                  disabled={total === 0}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={total === 0}
                  >
                    Vider la corbeille
                  </Button>
                </Popconfirm>
              </Space>
            </div>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Statistic
                    title="Total dans la corbeille"
                    value={statistics.totalTrashed || 0}
                    prefix={<DeleteOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Statistic
                    title="Supprimés cette semaine"
                    value={statistics.recentTrashed || 0}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Statistic
                    title="Sélectionnés"
                    value={selectedRowKeys.length}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }} size="small">
              <Space wrap>
                <Input
                  placeholder="Code Suivi"
                  value={filters.code_suivi}
                  onChange={(e) => setFilters({ ...filters, code_suivi: e.target.value })}
                  style={{ width: 200 }}
                  allowClear
                />
                <Input
                  placeholder="Téléphone"
                  value={filters.tele}
                  onChange={(e) => setFilters({ ...filters, tele: e.target.value })}
                  style={{ width: 200 }}
                  allowClear
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                >
                  Rechercher
                </Button>
                <Button onClick={handleReset}>
                  Réinitialiser
                </Button>
              </Space>
            </Card>

            {/* Batch Actions */}
            {selectedRowKeys.length > 0 && (
              <Card
                style={{
                  marginBottom: 16,
                  backgroundColor: theme === 'dark' ? '#1f1f1f' : '#e6f7ff',
                  borderColor: '#1890ff'
                }}
                size="small"
              >
                <Space>
                  <Text strong>
                    {selectedRowKeys.length} colis sélectionné(s)
                  </Text>
                  <Popconfirm
                    title={`Restaurer ${selectedRowKeys.length} colis?`}
                    onConfirm={handleBatchRestore}
                    okText="Restaurer"
                    cancelText="Annuler"
                  >
                    <Button
                      type="primary"
                      icon={<RollbackOutlined />}
                      style={{
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a'
                      }}
                    >
                      Restaurer la sélection
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title={`Supprimer définitivement ${selectedRowKeys.length} colis?`}
                    description="Cette action est irréversible!"
                    onConfirm={handleBatchPermanentDelete}
                    okText="Supprimer"
                    cancelText="Annuler"
                    okType="danger"
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                    >
                      Supprimer la sélection
                    </Button>
                  </Popconfirm>
                </Space>
              </Card>
            )}

            {/* Table */}
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={trashedColis}
              loading={loading}
              rowKey="_id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                  dispatch(getTrashedColis({ page, limit: size, ...filters }));
                },
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} colis`,
              }}
              scroll={{ x: 1200 }}
              locale={{
                emptyText: (
                  <div style={{ padding: 40 }}>
                    <InfoCircleOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <div>
                      <Title level={4} type="secondary">Corbeille vide</Title>
                      <Text type="secondary">Aucun colis dans la corbeille</Text>
                    </div>
                  </div>
                )
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default ColisCorbeille;

