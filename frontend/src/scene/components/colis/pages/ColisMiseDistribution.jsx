import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import ColisData from '../../../../data/colis.json';
import { Link } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { selectColisMiseDistrubution } from '../../../../redux/slices/colisSlice';
import { getColis, getColisForClient, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';

const { Option } = Select;

function ColisMiseDistribution({ search }) {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const colisMiseDistrubution= useSelector(selectColisMiseDistrubution); 
  const [selectedColis, setSelectedColis] = useState(null);
  const [isAnnuléeModalVisible, setIsAnnuléeModalVisible] = useState(false);
  const [isProgrammeModalVisible, setIsProgrammeModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [programmeForm] = Form.useForm();
  const {colisData,user,store} = useSelector((state) => ({
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store:state.auth.store
  }));

  // Recuperation des colis selon le role 
  useEffect(() => {

    if (user?.role) {
      if (user.role === "admin") {
        dispatch(getColis());
      } else if (user.role === "client"&&store?._id) {
        dispatch(getColisForClient(store._id));
      }
    }
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id]);
  useEffect(() => {
    if (Array.isArray(colisData)) {
      setData(colisData);
    } else {
      console.error("colisData is not an array", colisData);
      setData([]); // Default to an empty array if colisData is not an array
    }
  }, [colisData]);
  useEffect(() => {
    dispatch(getColisForClient()); // Fetch tous les colis
}, [dispatch]);

useEffect(() => {
  if (colisMiseDistrubution) {
      setData(colisMiseDistrubution); // Update data state with the fetched colis
  }
}, [colisMiseDistrubution]);
console.log("colis recu",colisMiseDistrubution);
 
  useEffect(() => {
    const colis = colisMiseDistrubution.filter(item => item.statut === 'Mise en Distribution');
    setData(colis);
  }, []);

  const handleLivrée = (record) => {
    const newData = colisMiseDistrubution.map(item => {
      if (item.id === record.id) {
        item.statut = 'Livrée';
      }
      return item;
    });
    setData(newData);
    success(`Colis ${record.id} marqué comme livrée.`);
    dispatch(updateStatut(record._id, 'Livrée'));
    
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
    form.validateFields().then(values => {
      const newData = colisMiseDistrubution.map(item => {
        if (item.id === selectedColis.id) {
          item.statut = 'Annulée';
          item.comment = values.comment;
        }
        return item;
      });
      setData(newData);  // Mets à jour l'état local `data`
      setIsAnnuléeModalVisible(false);  // Ferme la modal
      success(`Colis ${selectedColis.id} marqué comme annulée.`);
  
      // Ajoute un appel API pour persister cette modification
      dispatch(updateStatut(selectedColis.id, 'Annulée', values.comment));
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleProgrammeOk = () => {
    programmeForm.validateFields().then(values => {
      const newData = colisMiseDistrubution.map(item => {
        if (item.id === selectedColis.id) {
          item.statut = 'Programmé';
          item.deliveryTime = values.deliveryTime;
        }
        return item;
      });
      setData(newData);
      setIsProgrammeModalVisible(false);
      success(`Colis ${selectedColis.id} programmé pour livraison dans ${values.deliveryTime}.`);
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

  const columns = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      ...search('code_suivi')
    },
    {
      title: 'Dernière Mise à Jour',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: 'Livreur',
      dataIndex: 'livreur',
      key: 'livreur',
      render: (text, record) => (
        <span>
          <p>{record.livreur.nom}</p>
          <p>{record.livreur.tele}</p>
        </span>
      ),
    },
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
        <span style={{
          backgroundColor: record.etat ? 'green' : '#4096ff',
          color: 'white',
          padding: '5px',
          borderRadius: '3px',
          display: 'inline-block',
          whiteSpace: 'pre-wrap',
          textAlign: 'center'
        }}>
          {record.etat ? 'Payée' : 'Non\nPayée'}
        </span>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (text, record) => (
        <span style={{
          backgroundColor: record.statut.trim() === 'Livrée' ? 'green' : '#4096ff',
          color: 'white',
          padding: '5px',
          borderRadius: '3px',
          display: 'inline-block',
          whiteSpace: 'pre-wrap',
          textAlign: 'center'
        }}>
          {record.statut}
        </span>
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
              data={colisMiseDistrubution}
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
              <Option value="Demain">Demain</Option>
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

