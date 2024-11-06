import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, message, Card, Col, Row, Tag, Typography, Grid, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { MdDeliveryDining } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { annulerColis, colisProgramme, getColis, getColisForClient, getColisForLivreur, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { MdAccessTimeFilled } from "react-icons/md";
import { CgDanger } from "react-icons/cg";
import { MdOutlineDangerous } from "react-icons/md";
import { IoMdRefresh } from 'react-icons/io';
import { IoQrCodeSharp } from 'react-icons/io5';
import { FiRefreshCcw } from 'react-icons/fi';

const { Option } = Select;
const { Text, Title: TextTitle } = Typography;
const { useBreakpoint } = Grid;

function ColisMiseDistribution({ search }) {
  const { theme } = useContext(ThemeContext);
  const screens = useBreakpoint();
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const [selectedColis, setSelectedColis] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isProgrammeModalVisible, setIsProgrammeModalVisible] = useState(false);
  const [statusType, setStatusType] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [programmeForm] = Form.useForm();  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const { colisData, user, store } = useSelector((state) => ({
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store: state.auth.store,
  }));

  const getDataColis = () => {
    setLoading(true)
    if (user?.role) {
      if (user.role === "admin") {
        dispatch(getColis("Mise en Distribution"));
      } else if (user.role === "client" && store?._id) {
        dispatch(getColisForClient(store._id, 'Mise en Distribution'));
      } else if (user.role === "livreur") {
        dispatch(getColisForLivreur(user._id, "Mise en Distribution"));
      }
    }
    setLoading(false)

  };

  useEffect(() => {
    getDataColis();
    setData(colisData);
  }, [colisData]);

  const handleLivrée = (record) => {
    dispatch(updateStatut(record._id, 'Livrée', ""));
    success(`Colis ${record._id} marqué comme Livrée.`);
  };

  const handleStatusChange = (record, status) => {
    setSelectedColis(record);
    setStatusType(status);
    setIsStatusModalVisible(true);
  };

  const handleStatusOk = () => {
    form.validateFields().then(values => {
      const { comment } = values;
      dispatch(updateStatut(selectedColis._id, statusType, comment));

      const newData = colisData.map(item => {
        if (item._id === selectedColis._id) {
          return { ...item, statut: statusType, comment };
        }
        return item;
      });
      setData(newData);
      setIsStatusModalVisible(false);
      success(`Colis ${selectedColis._id} marqué comme ${statusType}.`);
    }).catch(info => {
      console.log('Validation Failed:', info);
    });
  };

  const handleProgramme = (record) => {
    setSelectedColis(record);
    setIsProgrammeModalVisible(true);
  };

  const handleProgrammeOk = () => {
    programmeForm.validateFields().then(values => {
      const deliveryTime = parseInt(values.deliveryTime.replace(/\D/g, ''), 10);
      const newData = colisData.map(item => {
        if (item._id === selectedColis._id) {
          return { ...item, statut: 'Programmé', deliveryTime };
        }
        return item;
      });
      setData(newData);
      setIsProgrammeModalVisible(false);
      dispatch(colisProgramme(selectedColis._id, deliveryTime));
      success(`Colis ${selectedColis._id} programmé pour livraison dans ${values.deliveryTime}.`);
    }).catch(info => {
      console.log('Validation Failed:', info);
    });
  };

  const success = (text) => {
    messageApi.open({
      type: 'success',
      content: text,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const popularComments = statusType === 'Annulée'
    ? ['Client a annulé la commande', 'Le produit n\'est plus disponible', 'Erreur dans la commande']
    : ['Le client a refusé la livraison', 'Le destinataire était absent', 'Le produit était endommagé'];

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
            <div className="bar-action-data">
              <Button icon={<IoMdRefresh />} type="primary" onClick={()=>getDataColis()} loading={loading}>Refresh </Button>
              <Button icon={<IoQrCodeSharp/>} type="primary" onClick={()=>navigate("")} loading={loading}>Scan</Button>
            </div>

            {/* Responsive Cards for Colis */}
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
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
                      <Space/>
                      {
                        item.replacedColis ? 
                        <Tag icon={<FiRefreshCcw />}>
                        </Tag>
                        :
                        ""
                        }
                      </TextTitle>
                    }
                    actions={[
                      <Button
                        type="primary"
                        icon={<MdDeliveryDining />}
                        onClick={() => handleLivrée(item)}
                      >
                        L
                      </Button>,
                      <Button icon={<CgDanger/>} danger onClick={() => handleStatusChange(item, 'Annulée')}>
                        A
                      </Button>,
                      <Button icon={<MdOutlineDangerous/>} danger onClick={() => handleStatusChange(item, 'Refusée')}>
                        R
                      </Button>,
                      <Button
                        icon={<MdAccessTimeFilled />}
                        type="primary"
                        style={{ backgroundColor: '#FFD700', borderColor: '#FFD700', color: '#000' }}
                        onClick={() => handleProgramme(item)}
                      >
                        P
                      </Button>
                    ]}
                  >
                    <p><Text strong>Destinataire:</Text> {item.nom} - {item.tele}</p>
                    <p><Text strong>Ville:</Text> {item.ville.nom}</p>
                    <p><Text strong>Adresse:</Text> {item.adresse}</p>
                    <p><Text strong>Prix:</Text> {item.prix} DH</p>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </main>
      {contextHolder}

      <Modal
        title={`Colis ${statusType}`}
        visible={isStatusModalVisible}
        onOk={handleStatusOk}
        onCancel={() => setIsStatusModalVisible(false)}
      >
        <Form form={form} layout="vertical" name="form_status">
          <Form.Item
            name="comment"
            label="Commentaire"
            rules={[{ required: true, message: 'Veuillez sélectionner un commentaire!' }]}
          >
            <Select placeholder={`Sélectionner un commentaire pour ${statusType}`}>
              {popularComments.map((comment, index) => (
                <Option key={index} value={comment}>
                  {comment}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Programmer Livraison"
        visible={isProgrammeModalVisible}
        onOk={handleProgrammeOk}
        onCancel={() => setIsProgrammeModalVisible(false)}
      >
        <Form form={programmeForm} layout="vertical" name="form_programme">
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
        </Form>
      </Modal>
    </div>
  );
}

export default ColisMiseDistribution;
