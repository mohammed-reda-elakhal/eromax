import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, message} from 'antd';
import ColisData from '../../../../data/colis.json';
import { Link } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { annulerColis, colisProgramme, getColis, getColisForClient, getColisForLivreur, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';
const { Option } = Select;

function ColisMiseDistribution({ search }) {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const [selectedColis, setSelectedColis] = useState(null);
  const [isAnnuléeModalVisible, setIsAnnuléeModalVisible] = useState(false);
  const [isProgrammeModalVisible, setIsProgrammeModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [programmeForm] = Form.useForm();
  // Recuperation des colis selon le role 
  const { colisData, user, store } = useSelector((state) => ({
    colisData: state.colis.colis || [],  // Corrected the casing of colisData
    user: state.auth.user,
    store: state.auth.store,
  }));

  const getColisFunction = () => {
    if (user?.role) {
      if (user.role === "admin") {
        dispatch(getColis("Mise en Distribution"));
      } else if (user.role === "client" && store?._id) {
        dispatch(getColisForClient(store._id ,'Mise en Distribution'));
      }else if (user.role === "livreur"){
        dispatch(getColisForLivreur(user._id , "Mise en Distribution"));
      }else if (user.role === "team") {
        dispatch(getColisForClient(user._id,'Mise en Distribution'));  // Use getColisForLivreur for 'livreur'
      }
    }
    window.scrollTo(0, 0);
  };  // This closing bracket was missing 
useEffect(() => {
    getColisFunction()
    setData(colisData); // Update data state with the fetched colis
}, [colisData]);
  //----------------------------------

  const handleLivrée = (record) => {
    const newData = colisData.map(item => {
      if (item.id === record._id) {
        item.statut = 'Livrée';
      }
      return item;
    });
    setData(newData);
    dispatch(updateStatut(record._id, 'Livrée'));
    success(`Colis ${record._id} marqué comme Livrée.`);
    
    
  };

  const handleAnnulée = (record) => {
    setSelectedColis(record);
    
    setIsAnnuléeModalVisible(true);
  };

  const handleProgramme = (record) => {
    setSelectedColis(record);
    setIsProgrammeModalVisible(true);
  };

  const handleAnnuléeOk = () => {
    if (!selectedColis || !selectedColis._id) {
      console.error('selectedColis is undefined or missing _id');
      return;
    }
    form.validateFields().then(values => {
      const { comment } = values; // Récupérez le commentaire depuis les valeurs validées
      dispatch(annulerColis(selectedColis._id, comment)); 
      console.log('id colis annule',selectedColis._id);

      const newData = colisData.map(item => {
        if (item._id === selectedColis._id) {
          return {
            ...item, // Spread the existing properties
            statut: 'Annulée', // Update the statut
            comment: comment // Update the deliveryTime
          };
        }
        return item;
        
      });
      setData(newData);  // Mets à jour l'état local `data`
      setIsAnnuléeModalVisible(false);  // Ferme la modal
      success(`Colis ${selectedColis._id} marqué comme annulée.`);
  
      // Ajoute un appel API pour persister cette modification
    
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleProgrammeOk = () => {
    if (!selectedColis || !selectedColis._id) {
      console.error('selectedColis is undefined or missing _id');
      return;
    }
    programmeForm.validateFields().then(values => {
      const deliveryTime = parseInt(values.deliveryTime.replace(/\D/g, ''), 10); // Extract number from delivery time
      if (isNaN(deliveryTime)) {
        console.error('Invalid delivery time');
        return;
      }
      const newData = colisData.map(item => {
        
        if (item._id === selectedColis._id) {
          return {
            ...item, // Spread the existing properties
            statut: 'Programmé', // Update the statut
            deliveryTime: deliveryTime // Update the deliveryTime
          };
        }
        return item;
      });
      setData(newData);
      setIsProgrammeModalVisible(false);
      dispatch(colisProgramme(selectedColis._id,deliveryTime));
      console.log('selected',selectedColis._id);
      console.log('delevery time',deliveryTime);


      success(`Colis ${selectedColis._id} programmé pour livraison dans ${values.deliveryTime}.`);
    }).catch(info => {
      console.log('Validate Failed:', info);
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

  const columns = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      ...search('code_suivi')
    },
    {
      title: 'Livreur',
      dataIndex: 'livreur',
      key: 'livreur',
      render: (text, record) => (
        <span>
          {
            record.livreur 
            ? 
            record.livreur.nom + ' - ' + record.livreur.tele 
            : 
            <Tag icon={<ClockCircleOutlined />} color="default">
               Operation de Ramassage
            </Tag>
           
          }
        </span> // Check if 'livreur' exists, otherwise show default message
      )
    },
    { title: 'Dernière Mise à Jour', dataIndex: 'updatedAt', key: 'updatedAt', render: formatDate },
    {
      title: 'Destinataire',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Téléphone',
      dataIndex: 'tele',
      key: 'tele',
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      render: (text, record) => (
        record.etat ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Payée
          </Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Non Payée
          </Tag>
        )
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (text, record) => (
        <Tag icon={<SyncOutlined spin />} color="processing">
          {record.statut}
        </Tag>
      ),
    },
    {
      title: 'Date de Livraison',
      dataIndex: 'date_livraison',
      key: 'date_livraison',
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
      render: (text, record) => (
        <span>
          {record.ville.nom}
        </span>
      ),
    },
    {
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
    },
    {
      title: 'Nature de Produit',
      dataIndex: 'nature_produit',
      key: 'nature_produit',
    },
    {
      title: 'Option',
      render: (text, record) => (
        <div className='option_btn'>
          <Button
            type="primary"
            size="small"
            icon={<MdDeliveryDining />}
            onClick={() => handleLivrée(record)}
          >
            Livrée
          </Button>
          <Button
            danger
            type="primary"
            size="small"
            icon={<MdDeliveryDining />}
            onClick={() => handleAnnulée(record)}
          >
            Annulée
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<MdDeliveryDining />}
            onClick={() => handleProgramme(record)}
            style={{ backgroundColor: '#FFD700', borderColor: '#FFD700', color: '#000' }}
          >
            Programmer
          </Button>
        </div>
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
          <div className="page-content-header">
            <Title nom='Colis Mise en Distribution' />
            <Link to={`/dashboard/ajouter-colis/simple`} className='btn-dashboard'>
              <PlusCircleFilled style={{ marginRight: "8px" }} />
              Ajouter Colis
            </Link>
          </div>
          <div
            className="content"
            style={{
              backgroundColor: theme === 'dark' ? '#001529' : '#fff',
            }}
          >
            <h4>Colis attend de ramassage</h4>
            <TableDashboard
              column={columns}
              data={data}
              id="id"
              theme={theme}
            />
          </div>
        </div>
      </main>
      {contextHolder}
      <Modal
        title="Annuler Colis"
        visible={isAnnuléeModalVisible}
        onOk={handleAnnuléeOk}
        onCancel={() => setIsAnnuléeModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          name="form_annulée"
        >
          <Form.Item
            name="comment"
            label="Commentaire"
            rules={[{ required: true, message: 'Veuillez entrer un commentaire!' }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Programmer Livraison"
        visible={isProgrammeModalVisible}
        onOk={handleProgrammeOk}
        onCancel={() => setIsProgrammeModalVisible(false)}
      >
        <Form
          form={programmeForm}
          layout="vertical"
          name="form_programme"
        >
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

