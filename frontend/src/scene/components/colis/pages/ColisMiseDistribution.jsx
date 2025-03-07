import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Typography,
  Grid,
  Space,
  Table,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { MdAccessTimeFilled, MdOutlineDangerous } from "react-icons/md";
import { CgDanger } from "react-icons/cg";
import { IoMdRefresh } from 'react-icons/io';
import { IoQrCodeSharp } from 'react-icons/io5';
import { FiRefreshCcw } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import {
  colisProgramme,
  getColisForLivreur,
  updateStatut,
} from '../../../../redux/apiCalls/colisApiCalls';
import TableDashboard from '../../../global/TableDashboard';
import { BsBoxSeam } from 'react-icons/bs';
import { HiPhone } from 'react-icons/hi';
import { FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';

const { Option } = Select;
const { Text, Title: TextTitle } = Typography;
const { useBreakpoint } = Grid;

const allowedStatuses = [
  "Livrée",
  "Annulée",
  "Programmée",
  "Refusée",
  "Boite vocale",
  "Pas de reponse jour 1",
  "Pas de reponse jour 2",
  "Pas de reponse jour 3",
  "Pas reponse + sms / + whatsap",
  "En voyage",
  "Injoignable",
  "Hors-zone",
  "Intéressé",
  "Numéro Incorrect",
  "Reporté",
  "Confirmé Par Livreur",
  "Endomagé",
];

const allowedStatusesGet = [
  "Boite vocale",
  "Pas de reponse jour 1",
  "Pas de reponse jour 2",
  "Pas de reponse jour 3",
  "Pas reponse + sms / + whatsap",
  "En voyage",
  "Injoignable",
  "Hors-zone",
  "Intéressé",
  "Numéro Incorrect",
  "Reporté",
  "Confirmé Par Livreur",
  "Endomagé",
  "Mise en Distribution",
];

const statusComments = {
  "Annulée": [
    "Client a annulé la commande",
    "Le produit n'est plus disponible",
    "Erreur dans la commande",
  ],
  "Refusée": [
    "Le client a refusé la livraison",
    "Le destinataire était absent",
    "Le produit était endommagé",
  ],
};

function ColisMiseDistribution({ search }) {
  const { theme } = useContext(ThemeContext);
  const screens = useBreakpoint();
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const [selectedColis, setSelectedColis] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [statusType, setStatusType] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { colisData, user, store } = useSelector((state) => ({
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store: state.auth.store,
  }));

  const getDataColis = () => {
    setLoading(true);
    if (user?.role === "livreur") {
      dispatch(getColisForLivreur(user._id, allowedStatusesGet))
        .then(() => setLoading(false))
    }
    // Handle other roles if needed
  };

  useEffect(() => {
    getDataColis();
  }, [dispatch]);
  const handleChangeStatus = (record) => {
    setSelectedColis(record);
    setStatusType("");
    setIsStatusModalVisible(true);
  };

  const handleStatusOk = () => {
    form.validateFields().then(values => {
      const { status, comment, deliveryTime } = values;

      if (status === "Programmée" && !deliveryTime) {
        message.error("Veuillez sélectionner un temps de livraison pour une livraison programmée.");
        return;
      }

      if (status === "Programmée") {
        dispatch(updateStatut(selectedColis._id, status, comment, deliveryTime));
      } else {
        dispatch(updateStatut(selectedColis._id, status, comment));
      }

      const newData = colisData.map(item => {
        if (item._id === selectedColis._id) {
          return { ...item, statut: status, comment, deliveryTime };
        }
        return item;
      });
      setData(newData);
      setIsStatusModalVisible(false);
    }).catch(info => {
      console.log('Validation Failed:', info);
    });
  };

  const handleStatusCancel = () => {
    setIsStatusModalVisible(false);
    setSelectedColis(null);
    setStatusType("");
    form.resetFields();
  };

  const getStatusTagColor = (status) => {
    switch (status) {
      case "Livrée":
        return "green";
      case "Annulée":
        return "volcano";
      case "Programmée":
        return "geekblue";
      case "Refusée":
        return "red";
      case "Boite vocale":
        return "purple";
      case "Pas de reponse jour 1":
      case "Pas de reponse jour 2":
      case "Pas de reponse jour 3":
      case "Pas reponse + sms / + whatsap":
        return "gold";
      case "En voyage":
        return "cyan";
      case "Injoignable":
        return "magenta";
      case "Hors-zone":
        return "red";
      case "Intéressé":
        return "blue";
      case "Numéro Incorrect":
        return "orange";
      case "Reporté":
        return "geekblue";
      case "Confirmé Par Livreur":
        return "blue";
      case "Endomagé":
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BsBoxSeam /> Code Suivi
        </div>
      ),
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="code-container">
            <Text strong style={{ fontSize: '14px' }}>{text}</Text>
            {record.replacedColis && (
              <Tag 
                icon={<FiRefreshCcw />} 
                color="blue"
                style={{ marginLeft: '8px', borderRadius: '12px' }}
              >
                Remplacée
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiPhone /> Destinataire
        </div>
      ),
      dataIndex: 'nom',
      key: 'nom',
      render: (text, record) => (
        <div className="contact-info">
          <Text strong style={{ display: 'block' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.tele}
          </Text>
        </div>
      ),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaMapMarkerAlt /> Ville
        </div>
      ),
      dataIndex: ['ville', 'nom'],
      key: 'ville',
      render: (text) => (
        <Tag 
          color="cyan" 
          style={{ 
            borderRadius: '12px', 
            padding: '4px 12px',
            fontSize: '13px'
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Adresse',
      dataIndex: 'adresse',
      key: 'adresse',
      render: (text) => (
        <div className="address-cell">
          <Text
            ellipsis={{ tooltip: text }}
            style={{ maxWidth: '200px' }}
          >
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaMoneyBillWave /> Prix
        </div>
      ),
      dataIndex: 'prix',
      key: 'prix',
      render: (price) => (
        <div className="price-tag">
          <Text strong style={{ color: '#52c41a' }}>
            {price} DH
          </Text>
        </div>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (status, record) => (
        <div className="status-container">
          <Tag 
            color={getStatusTagColor(status)}
            style={{
              borderRadius: '12px',
              padding: '4px 12px',
              fontSize: '13px',
              textTransform: 'uppercase'
            }}
          >
            {status}
          </Tag>
          {status === "Programmée" && record.deliveryTime && (
            <div className="delivery-time">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Livraison: {record.deliveryTime}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button
          type="primary"
          danger
          icon={<CgDanger />}
          onClick={() => handleChangeStatus(record)}
          style={{ 
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            height: 'auto'
          }}
        >
          Changer Statut
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
            }}
          >
            <h4>Colis Mise en Distribution</h4>
            <div className="bar-action-data" style={{ marginBottom: '20px' }}>
              <Button
                icon={<IoMdRefresh />}
                type="primary"
                onClick={() => getDataColis()}
                loading={loading}
                style={{ marginRight: '10px' }}
              >
                Refresh
              </Button>
              <Button
                icon={<IoQrCodeSharp />}
                type="primary"
                onClick={() => navigate("/dashboard/scan")}
                loading={loading}
              >
                Scan
              </Button>
            </div>

            {/* Table for Colis */}
            <TableDashboard
              data={colisData}
              column={columns}
              rowKey="_id"
              theme={theme}
              loading={loading}
            />
          </div>
        </div>
      </main>
      {contextHolder}

      {/* Change Status Modal */}
      <Modal
        title={`Changer le Statut de ${selectedColis ? selectedColis.code_suivi : ''}`}
        visible={isStatusModalVisible}
        onOk={handleStatusOk}
        onCancel={handleStatusCancel}
        okText="Confirmer"
        cancelText="Annuler"
      >
        <Form form={form} layout="vertical" name="form_status">
          <Form.Item
            name="status"
            label="Nouveau Statut"
            rules={[{ required: true, message: 'Veuillez sélectionner un statut!' }]}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allowedStatuses.map((status, index) => (
                <Tag.CheckableTag
                  key={index}
                  checked={statusType === status}
                  onChange={() => {
                    form.setFieldsValue({ status, comment: undefined, deliveryTime: undefined });
                    setStatusType(status);
                  }}
                  style={{ cursor: 'pointer' }}
                  color={getStatusTagColor(status)}
                >
                  {status}
                </Tag.CheckableTag>
              ))}
            </div>
          </Form.Item>

          {statusType && (statusComments[statusType] ? (
            <Form.Item
              name="comment"
              label="Commentaire"
              rules={[{ required: true, message: 'Veuillez sélectionner un commentaire!' }]}
            >
              <Select placeholder="Sélectionner un commentaire">
                {statusComments[statusType].map((comment, idx) => (
                  <Option key={idx} value={comment}>
                    {comment}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              name="comment"
              label="Commentaire"
            >
              <Input.TextArea placeholder="Ajouter un commentaire (facultatif)" rows={3} />
            </Form.Item>
          ))}

          {statusType === "Programmée" && (
            <Form.Item
              name="deliveryTime"
              label="Temps de Livraison"
              rules={[{ required: true, message: 'Veuillez sélectionner un temps de livraison!' }]}
            >
              <Select placeholder="Sélectionner un temps de livraison">
                <Option value="1 jours">Demain</Option>
                <Option value="2 jours">Dans 2 jours</Option>
                <Option value="3 jours">Dans 3 jours</Option>
                <Option value="4 jours">Dans 4 jours</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
      <style jsx>{`
        .code-container {
          padding: 4px 0;
        }
        .contact-info {
          padding: 4px 0;
        }
        .address-cell {
          padding: 4px 0;
        }
        .price-tag {
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(82, 196, 26, 0.1);
          display: inline-block;
        }
        .status-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .delivery-time {
          margin-top: 4px;
        }
        :global(.ant-table-row) {
          transition: all 0.3s ease;
        }
        :global(.ant-table-row:hover) {
          background-color: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'} !important;
        }
        :global(.ant-table-cell) {
          padding: 12px 16px !important;
        }
      `}</style>
    </div>
  );
}

export default ColisMiseDistribution;
