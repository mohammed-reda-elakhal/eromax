import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Button, Modal, Form, message, Card, Divider, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { affectationColisAmeex, getColis, getColisForClient } from '../../../../redux/apiCalls/colisApiCalls';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, MinusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { BsFillInfoCircleFill } from "react-icons/bs";
import { FaBoxesStacked } from 'react-icons/fa6';
import { IoQrCodeSharp } from 'react-icons/io5';
import request from '../../../../utils/request';
import { IoMdRefresh } from 'react-icons/io';
import { 
  PhoneOutlined, 
  EnvironmentOutlined, 
  ShopOutlined,
  CalendarOutlined,
  EditOutlined,
  DollarOutlined,
  TagOutlined,
  CopyOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { Typography } from 'antd';

const getTableCellStyles = (theme) => ({
  codeCell: {
    background: theme === 'dark' ? '#1a1a1a' : '#f6f8ff',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${theme === 'dark' ? '#333' : '#e6e8f0'}`,
  },
  dateCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dateItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: theme === 'dark' ? '#b3b3b3' : '#666',
  },
  destinataireCard: {
    background: theme === 'dark' ? '#1f1f1f' : '#fff',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
  },
  priceTag: {
    background: 'linear-gradient(135deg, #00b96b 0%, #008148 100%)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 4px rgba(0,153,85,0.2)',
  },
  businessBadge: {
    background: theme === 'dark' ? '#1a2733' : '#f0f7ff',
    border: `1px solid ${theme === 'dark' ? '#234' : '#bae0ff'}`,
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: theme === 'dark' ? '#4c9eff' : '#0958d9',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '500',
  }
});


function ColisRamasse({ search }) {
  const { theme } = useContext(ThemeContext);
  const tableCellStyles = getTableCellStyles(theme);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedLivreur, setSelectedLivreur] = useState(null);

  const { livreurList, colisData, user, store } = useSelector(state => ({
    livreurList: state.livreur.livreurList,
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store: state.auth.store,
  }));
  

  const getDataColis = () => {
    if (user?.role) {
      const queryParams = {
        statut: "Ramassée",
      };
      dispatch(getColis(queryParams));
    }
  };

  useEffect(() => {
    getDataColis();
    dispatch(getLivreurList());
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id]);

  useEffect(() => {
    setData(colisData);
  }, [colisData]);

  const success = (text) => messageApi.success(text);
  const warning = (text) => messageApi.warning(text);
  const error = (text) => messageApi.error(text);

  const showModal = () => {
    if (selectedRowKeys.length > 0) {
      setSelectedLivreur(null);
      form.resetFields();
      setIsModalVisible(true);
    } else {
      toast.warn("Veuillez sélectionner au moins un colis !");
    }
  };

  const handleAffecterLivreur = async () => {
    if (selectedRowKeys.length > 0 && selectedLivreur) {
      // Get the selected colis data
      const selectedColisData = data.filter(item => selectedRowKeys.includes(item.code_suivi));

      if (selectedLivreur.nom === 'ameex') {
        // Dispatch the custom function for "ameex"
        dispatch(affectationColisAmeex(selectedColisData));
        // Optionally reset selections and close modal
        setSelectedRowKeys([]);
        setSelectedLivreur(null);
        setIsModalVisible(false);
      } else {
        // Existing code for other livreurs
        setLoading(true);
        try {
          // Send a PUT request to update the status of selected colis
          const response = await request.put('/api/colis/statu/affecter', {
            codesSuivi: selectedRowKeys,
            livreurId: selectedLivreur._id
          });
          setLoading(false);
          toast.success(response.data.message);
          setSelectedRowKeys([]);
          // Update the local data to remove the updated colis
          const newData = data.filter(item => !selectedRowKeys.includes(item.code_suivi));
          setData(newData);
          setSelectedLivreur(null);
          setIsModalVisible(false);
        } catch (err) {
          setLoading(false);
          toast.error("Erreur lors de la mise à jour des colis.");
        }
      }
    } else {
      warning('Veuillez sélectionner un livreur');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedLivreur(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const selectLivreur = (livreur) => {
    setSelectedLivreur(livreur);
  };

  const columns = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 200,
      render: (text) => (
        <div style={tableCellStyles.codeCell}>
          <Typography.Text
            copyable={{
              tooltips: ['Copier', 'Copié!'],
              icon: [<CopyOutlined key="copy" />, <CheckOutlined key="copied" />],
            }}
            style={{ fontWeight: '600', fontSize: '14px', color: '#1677ff' }}
          >
            {text}
          </Typography.Text>
        </div>
      ),
    },
    {
       title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 200,
            render: (text, record) => (
              <div style={tableCellStyles.dateCell}>
                <div style={tableCellStyles.dateItem}>
                  <CalendarOutlined style={{ color: '#1677ff' }} />
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
      title: 'Destinataire',
      dataIndex: 'nom',
      key: 'nom',
      render: (text, record) => (
        <div style={tableCellStyles.destinataireCard}>
          <Typography.Text strong style={{ fontSize: '15px', marginBottom: '8px' }}>
            {record.nom}
          </Typography.Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Tag icon={<PhoneOutlined />} color="blue">{record.tele}</Tag>
            <Tag icon={<EnvironmentOutlined />} color="orange">{record.ville.nom}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
      width: 140,
      render: (text) => (
        <div style={tableCellStyles.priceTag}>
          <DollarOutlined />
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#52c41a' }}>
            {text || 'N/A'} DH
          </span>
        </div>
      ),
    },
    {
      title: 'Nature',
      dataIndex: 'nature_produit',
      key: 'nature_produit',
      width: 150,
      render: (text) => (
        <Tag icon={<TagOutlined />} color="cyan" style={{ padding: '6px 12px', borderRadius: '4px' }}>
          {text || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Business',
      dataIndex: 'store',
      key: 'store',
      render: (text, record) => (
        <div style={tableCellStyles.businessBadge}>
          <ShopOutlined />
          <Typography.Text strong>{record.store?.storeName}</Typography.Text>
        </div>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (text, record) => {
        let color = 'processing';
        let icon = <SyncOutlined spin />;
        switch (record.statut) {
          case 'Livrée':
            color = 'success';
            icon = <CheckCircleOutlined />;
            break;
          case 'Annulée':
          case 'Refusée':
            color = 'error';
            icon = <CloseCircleOutlined />;
            break;
          case 'Programme':
            color = 'default';
            icon = <ClockCircleOutlined />;
            break;
          case 'Remplacée':
          case 'En Retour':
            color = 'warning';
            icon = <ExclamationCircleOutlined />;
            break;
          case 'Fermée':
            color = 'default';
            icon = <MinusCircleOutlined />;
            break;
          default:
            color = 'processing';
            icon = <SyncOutlined spin />;
        }
        return <Tag icon={icon} color={color}>{record.statut}</Tag>;
      },
     },
  ];

  // Collect unique villes from selected colis
  const selectedColisVilles = data
    .filter(colis => selectedRowKeys.includes(colis.code_suivi))
    .map(colis => colis.ville.nom);

  const uniqueSelectedColisVilles = [...new Set(selectedColisVilles)];

  // Filter livreurs based on whether they cover all the selected colis villes
  const filteredLivreurs = livreurList.reduce(
    (acc, person) => {
      const personVilles = person.villes; // This should be an array of city names
      const coversAllVilles = uniqueSelectedColisVilles.every(ville => personVilles.includes(ville));
      if (coversAllVilles) {
        acc.preferred.push(person);
      } else {
        acc.other.push(person);
      }
      return acc;
    },
    { preferred: [], other: [] }
  );

  return (
    <div className='page-dashboard'>
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div className="page-content" style={{ backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)', color: theme === 'dark' ? '#fff' : '#002242' }}>
          <div className="content" style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff' }}>
            <div className="bar-action-data">
              <Button icon={<IoMdRefresh />} type="primary" onClick={() => getDataColis()} >Rafraîchir</Button>
              <Button icon={<FaBoxesStacked />} type="primary" onClick={() => showModal()} loading={loading}>Expédier</Button>
              <Button icon={<IoQrCodeSharp />} type="primary" onClick={() => navigate("/dashboard/scan/statu/Expediée")} loading={loading}>Scanner</Button>
            </div>
            <TableDashboard 
              column={columns} 
              data={data} 
              id="code_suivi" 
              theme={theme}  
              rowSelection={{
                selectedRowKeys: selectedRowKeys,
                onChange: setSelectedRowKeys,
              }} 
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
            {contextHolder}
          </div>
        </div>
      </main>

      <Modal
        title="Sélectionner Livreur"
        visible={isModalVisible}
        onOk={handleAffecterLivreur}
        onCancel={handleCancel}
        width={"90vw"}
      >
        <div className='livreur_list_modal'>
          <h3>Livreurs Préférés</h3>
          <div className="livreur_list_modal_card">
            {filteredLivreurs.preferred.length ? filteredLivreurs.preferred.map(person => (
              <Card
                key={person._id}
                hoverable
                style={{
                  width: 240,
                  margin: '10px',
                  border:
                    selectedLivreur && selectedLivreur._id === person._id
                      ? '2px solid #1890ff'
                      : '1px solid #f0f0f0',
                }}
                onClick={() => selectLivreur(person)}
              >
                <Card.Meta
                  title={<div>{person.username}</div>}
                  description={
                    <>
                      {person.tele}
                      <Button
                        icon={<BsFillInfoCircleFill />}
                        onClick={() =>
                          toast.info(`Villes: ${person.villes.join(', ')}`)
                        }
                        type='primary'
                        style={{ float: 'right' }}
                      />
                    </>
                  }
                />
              </Card>
            )) : <p>Aucun livreur préféré disponible</p>}
          </div>
        </div>
        <Divider />
        <div className='livreur_list_modal'>
          <h3>Autres Livreurs</h3>
          <div className="livreur_list_modal_card">
            {filteredLivreurs.other.map(person => (
              <Card
                key={person._id}
                hoverable
                style={{
                  width: 240,
                  margin: '10px',
                  border:
                    selectedLivreur && selectedLivreur._id === person._id
                      ? '2px solid #1890ff'
                      : '1px solid #f0f0f0',
                }}
                onClick={() => selectLivreur(person)}
              >
                <Card.Meta
                  title={<div>{person.username}</div>}
                  description={
                    <>
                      {person.tele}
                      <Button
                        icon={<BsFillInfoCircleFill />}
                        onClick={() =>
                          toast.info(`Villes: ${person.villes.join(', ')}`)
                        }
                        type='primary'
                        style={{ float: 'right' }}
                      />
                    </>
                  }
                />
              </Card>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ColisRamasse;
