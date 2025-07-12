import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { Button, message, Input, Card, Row, Col, Statistic, Tag, Typography, Tooltip, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getAttenteRamassageColis } from '../../../../redux/apiCalls/colisApiCalls';
import { BsUpcScan } from 'react-icons/bs';
import { FaBoxes, FaDownload } from 'react-icons/fa';
import { IoMdRefresh } from 'react-icons/io';
import { SyncOutlined, ExclamationCircleOutlined, EnvironmentOutlined, CalendarOutlined, PhoneOutlined, ShopOutlined, TagOutlined, EditOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import TableDashboard from '../../../global/TableDashboard';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import request from '../../../../utils/request';
import TicketColis2 from '../components/TicketColis2';

const { Text } = Typography;

function ColisPourRamase2() {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openBatchTicket, setOpenBatchTicket] = useState(false);

  const { attenteRamassageColisList } = useSelector(state => state.colis);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(getAttenteRamassageColis());
    window.scrollTo(0, 0);
  }, [dispatch]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const exportToExcel = () => {
    if (selectedRowKeys.length === 0) {
      message.error('Veuillez sélectionner au moins un colis à exporter.');
      return;
    }
    const selectedColis = attenteRamassageColisList.colis.filter(colis => selectedRowKeys.includes(colis.code_suivi));
    const dataToExport = selectedColis.map(colis => ({
      "Code Suivi": colis.code_suivi,
      "Destinataire": colis.nom,
      "Téléphone": colis.tele,
      "Ville": colis.ville?.nom || 'N/A',
      "Adresse": colis.adresse || 'N/A',
      "Prix (DH)": colis.prix,
      "Statut": colis.statut,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Colis Attente Ramassage");
    const fileName = `Colis_Attente_Ramassage_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, fileName);
    message.success('Exporté vers Excel avec succès!');
  };

  const getTableCellStyles = (theme) => ({
    codeCell: {
      background: theme === 'dark' ? '#1e293b' : '#f8fafc',
      padding: '12px',
      borderRadius: '6px',
      border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    },
    dateCell: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    dateItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: theme === 'dark' ? '#94a3b8' : '#64748b',
      fontWeight: '500',
    },
    destinataireCard: {
      background: 'transparent',
      padding: '12px',
      gap: '8px',
    },
    phoneTag: {
      background: theme === 'dark' ? '#1e40af' : '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
    },
    productTag: {
      background: theme === 'dark' ? '#0f766e' : '#14b8a6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
    },
    businessBadge: {
      background: theme === 'dark' ? '#1e293b' : '#f1f5f9',
      border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
      borderRadius: '6px',
      padding: '8px 12px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      color: theme === 'dark' ? '#e2e8f0' : '#475569',
      fontSize: '13px',
      fontWeight: '500',
    },
  });

  const tableCellStyles = getTableCellStyles(theme);

  const columns = [
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BsUpcScan style={{ fontSize: '14px' }} />
          Code Suivi
        </span>
      ),
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 200,
      render: (text, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Text
            copyable={{
              tooltips: ['Copier', 'Copié!'],
              icon: [<CopyOutlined key="copy" />, <CheckOutlined key="copied" />],
            }}
            style={{
              fontWeight: '600',
              fontSize: '13px',
              color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
              fontFamily: 'monospace',
              letterSpacing: '0.5px'
            }}
          >
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CalendarOutlined style={{ fontSize: '14px' }} />
          Date
        </span>
      ),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (text, record) => (
        <div style={tableCellStyles.dateCell}>
          <div style={tableCellStyles.dateItem}>
            <CalendarOutlined style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />
            <span>Créé: {formatDate(record?.createdAt)}</span>
          </div>
          <div style={tableCellStyles.dateItem}>
            <EditOutlined style={{ color: '#52c41a' }} />
            <span>Modifié: {formatDate(record?.updatedAt)}</span>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PhoneOutlined style={{ fontSize: '14px' }} />
          Destinataire
        </span>
      ),
      dataIndex: 'nom',
      key: 'nom',
      render: (text, record) => {
        const nameStyle = {
          color: theme === 'dark' ? '#e2e8f0' : '#475569',
          fontSize: '13px',
          fontWeight: '600',
          textAlign: 'left',
          lineHeight: '1.3',
          marginBottom: '4px'
        };
        const priceStyle = {
          color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
          fontSize: '16px',
          fontWeight: '700',
          textAlign: 'left',
          lineHeight: '1.2'
        };
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <Text style={nameStyle}>
                {record.nom?.length > 18 ? record.nom.substring(0, 18) + '...' : record.nom}
              </Text>
            </div>
            <div>
              <Tag style={tableCellStyles.phoneTag}>
                <PhoneOutlined style={{ marginRight: '4px' }} />
                {record.tele}
              </Tag>
            </div>
            <div>
              <Text style={priceStyle}>
                {record.prix || 'N/A'} DH
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <EnvironmentOutlined style={{ fontSize: '14px' }} />
          Ville
        </span>
      ),
      dataIndex: 'ville',
      key: 'ville',
      width: 120,
      render: (text, record) => (
        <Tag
          icon={<EnvironmentOutlined />}
          style={{
            background: theme === 'dark' ? '#0f766e' : '#14b8a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            padding: '4px 8px'
          }}
        >
          {record.ville?.nom || 'N/A'}
        </Tag>
      ),
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TagOutlined style={{ fontSize: '14px' }} />
          Nature
        </span>
      ),
      dataIndex: 'nature_produit',
      key: 'nature_produit',
      width: 150,
      render: (text) => (
        <Tag
          icon={<TagOutlined />}
          style={tableCellStyles.productTag}
        >
          {text || 'N/A'}
        </Tag>
      ),
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShopOutlined style={{ fontSize: '14px' }} />
          Business
        </span>
      ),
      dataIndex: 'store',
      key: 'store',
      render: (text, record) => (
        <div style={tableCellStyles.businessBadge}>
          <ShopOutlined style={{ fontSize: '12px' }} />
          <Text style={{ fontSize: '13px', fontWeight: '500' }}>
            {record.store?.storeName?.length > 15
              ? record.store.storeName.substring(0, 15) + '...'
              : record.store?.storeName || 'N/A'
            }
          </Text>
        </div>
      ),
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <EnvironmentOutlined style={{ fontSize: '14px' }} />
          Adresse
        </span>
      ),
      dataIndex: 'adresse',
      key: 'adresse',
      render: (text, record) => (
        <span style={{ color: theme === 'dark' ? '#a3e635' : '#0ea5e9', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          <EnvironmentOutlined /> {record.adresse || 'N/A'}
        </span>
      ),
    },
  ];

  // Filtered data
  const filteredColis = attenteRamassageColisList.colis.filter(colis => {
    if (!searchQuery.trim()) return true;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      colis.code_suivi.toLowerCase().includes(lowerCaseQuery) ||
      colis.nom.toLowerCase().includes(lowerCaseQuery) ||
      colis.tele.toLowerCase().includes(lowerCaseQuery) ||
      (colis.ville?.nom && colis.ville.nom.toLowerCase().includes(lowerCaseQuery)) ||
      (colis.store?.storeName && colis.store.storeName.toLowerCase().includes(lowerCaseQuery))
    );
  });

  // Add a function to get selected colis data
  const getSelectedColisData = () => {
    return attenteRamassageColisList.colis.filter(colis => selectedRowKeys.includes(colis.code_suivi));
  };

  return (
    <div className='page-dashboard'>
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div className="page-content" style={{ backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)', color: theme === 'dark' ? '#fff' : '#002242' }}>
          <div className="content" style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff' }}>
            <div className="page-content-header">
              {/* Action Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                borderRadius: '12px',
                boxShadow: theme === 'dark' ? '0 2px 8px #0f172a33' : '0 2px 8px #e0e7ef33',
                marginBottom: '24px',
                flexWrap: 'wrap',
              }}>
                <Button icon={<IoMdRefresh />} type="primary" onClick={() => dispatch(getAttenteRamassageColis())} loading={attenteRamassageColisList.loading}>Refresh</Button>
                <Tooltip title="Exporter les colis sélectionnés vers Excel">
                  <Button icon={<FaDownload />} type="default" onClick={exportToExcel} disabled={selectedRowKeys.length === 0}>Export Excel ({selectedRowKeys.length})</Button>
                </Tooltip>
                <Tooltip title="Générer les tickets PDF pour la sélection">
                  <Button
                    icon={<FaBoxes />}
                    type="default"
                    onClick={() => setOpenBatchTicket(true)}
                    disabled={selectedRowKeys.length === 0}
                  >
                    Tickets PDF ({selectedRowKeys.length})
                  </Button>
                </Tooltip>
                {user?.role === 'admin' && (
                  <Button
                    type="primary"
                    style={{ minWidth: 180, background: '#0ea5e9', borderColor: '#0ea5e9' }}
                    disabled={selectedRowKeys.length === 0 || attenteRamassageColisList.loading}
                    loading={attenteRamassageColisList.loading}
                    onClick={async () => {
                      if (selectedRowKeys.length === 0) return;
                      try {
                        const token = localStorage.getItem('token');
                        const config = {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                        };
                        await request.put('/api/colis/statu/update', {
                          colisCodes: selectedRowKeys,
                          new_status: 'Ramassée'
                        }, config);
                        message.success('Statut changé en "Ramassée" pour les colis sélectionnés.');
                        setSelectedRowKeys([]);
                        dispatch(getAttenteRamassageColis());
                      } catch (err) {
                        message.error('Erreur lors du changement de statut.');
                      }
                    }}
                  >
                    Ramassée ({selectedRowKeys.length})
                  </Button>
                )}
              </div>
            </div>
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic title="Total Colis" value={attenteRamassageColisList.total} valueStyle={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} prefix={<FaBoxes />} />
                </Card>
              </Col>
            </Row>
            <div style={{ marginBottom: '16px' }}>
              <Input placeholder="Rechercher des colis..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} allowClear style={{ width: '300px' }} />
            </div>
            {attenteRamassageColisList.loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <SyncOutlined spin style={{ fontSize: '24px', color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />
                <div style={{ marginTop: '16px' }}>Chargement des colis...</div>
              </div>
            ) : attenteRamassageColisList.error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ff4d4f' }}>
                <ExclamationCircleOutlined style={{ fontSize: '24px' }} />
                <div style={{ marginTop: '16px' }}>{attenteRamassageColisList.error}</div>
              </div>
            ) : (
              <TableDashboard
                column={columns}
                data={filteredColis}
                id="code_suivi"
                theme={theme}
                rowSelection={{
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                }}
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.08)' : '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  marginTop: '8px',
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} colis`,
                  size: 'small',
                  position: ['bottomCenter'],
                }}
              />
            )}
          </div>
        </div>
      </main>
      <Modal
        width={800}
        open={openBatchTicket}
        onCancel={() => setOpenBatchTicket(false)}
        footer={null}
        title="Tickets Colis (Sélection)"
      >
        <TicketColis2 colisList={getSelectedColisData()} />
      </Modal>
    </div>
  );
}

export default ColisPourRamase2; 