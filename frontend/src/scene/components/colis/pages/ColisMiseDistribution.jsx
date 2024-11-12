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
  Card,
  Col,
  Row,
  Tag,
  Typography,
  Grid,
  Space,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { MdAccessTimeFilled, MdOutlineDangerous } from "react-icons/md";
import { CgDanger } from "react-icons/cg";
import { IoMdRefresh } from 'react-icons/io';
import { IoQrCodeSharp } from 'react-icons/io5'; // Corrected import path
import { FiRefreshCcw } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import {
  colisProgramme,
  getColisForLivreur,
  updateStatut,
} from '../../../../redux/apiCalls/colisApiCalls';

const { Option } = Select;
const { Text, Title: TextTitle } = Typography;
const { useBreakpoint } = Grid;

// List of allowed statuses for the modal

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

// Predefined comments for specific statuses
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
  // Add more statuses with predefined comments if needed
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
      // Fetch colis for livreur with allowed statuses
      dispatch(getColisForLivreur(user._id, allowedStatusesGet))
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
    // Handle other roles if needed
  };

  useEffect(() => {
    getDataColis();
    setData(colisData);
  }, [colisData]);

  // Function to handle opening the Change Status modal
  const handleChangeStatus = (record) => {
    setSelectedColis(record);
    setStatusType(""); // Reset status type
    setIsStatusModalVisible(true);
  };

  // Function to handle confirming the status change
  const handleStatusOk = () => {
    form.validateFields().then(values => {
      const { status, comment, deliveryTime } = values;

      // If status is 'Programmée', ensure deliveryTime is provided
      if (status === "Programmée" && !deliveryTime) {
        message.error("Veuillez sélectionner un temps de livraison pour une livraison programmée.");
        return;
      }

      // Dispatch updateStatut with or without deliveryTime
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

  // Function to handle cancelling the status change
  const handleStatusCancel = () => {
    setIsStatusModalVisible(false);
    setSelectedColis(null);
    setStatusType("");
    form.resetFields();
  };

  // Function to display success messages
  const success = (text) => {
    messageApi.open({
      type: 'success',
      content: text,
    });
  };

  // Function to format date strings
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Function to determine Tag color based on status
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
          <div className="page-content-header">
            <Title nom='Colis Mise en Distribution' />
          </div>

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
                onClick={() => navigate("/scan")} // Adjust the route as needed
                loading={loading}
              >
                Scan
              </Button>
            </div>

            {/* Responsive Cards for Colis */}
            <Row gutter={[16, 16]}>
              {data.map(item => (
                <Col
                  xs={24} sm={12} md={8} lg={6} xl={6}
                  key={item._id}
                >
                  <Card
                    hoverable
                    bordered={false}
                    style={{ borderRadius: '10px', overflow: 'hidden' }}
                    loading={loading}
                    title={
                      <TextTitle level={4}>
                        {item.code_suivi}
                        <Space />
                        {
                          item.replacedColis &&
                            <Tag icon={<FiRefreshCcw />} color="geekblue">
                              Remplacée
                            </Tag>
                        }
                      </TextTitle>
                    }
                    actions={[
                      <Button
                        type="default"
                        icon={<CgDanger />}
                        onClick={() => handleChangeStatus(item)}
                        style={{ backgroundColor: '#f5222d', borderColor: '#f5222d', color: '#fff' }}
                        title="Changer Statut"
                      >
                        Changer Statut
                      </Button>
                    ]}
                  >
                    <p><Text strong>Destinataire:</Text> {item.nom} - {item.tele}</p>
                    <p><Text strong>Ville:</Text> {item.ville.nom}</p>
                    <p><Text strong>Adresse:</Text> {item.adresse}</p>
                    <p><Text strong>Prix:</Text> {item.prix} DH</p>
                    <p>
                      <Text strong>Statut:</Text>{' '}
                      <Tag
                        color={getStatusTagColor(item.statut)}
                      >
                        {item.statut}
                      </Tag>
                    </p>
                    {/* Display Delivery Time if status is 'Programmée' */}
                    {item.statut === "Programmée" && item.deliveryTime && (
                      <p><Text strong>Temps de Livraison:</Text> {item.deliveryTime}</p>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
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
            {/* Display statuses as a list of clickable Tags */}
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

          {/* Conditionally render comment field based on selected status */}
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
              rules={[{ required: false, message: 'Ajouter un commentaire (facultatif)' }]}
            >
              <Input.TextArea placeholder="Ajouter un commentaire" rows={3} />
            </Form.Item>
          ))}

          {/* Conditionally render deliveryTime field if status is 'Programmée' */}
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
    </div>
  );
}

export default ColisMiseDistribution;
