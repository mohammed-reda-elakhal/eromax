import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled, DownOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Dropdown, Menu, message, Modal, Form, Input, Select } from 'antd';
//import ColisData from '../../../../data/colis.json';
import { Link } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { BsUpcScan } from "react-icons/bs";
import { useDispatch, useSelector } from 'react-redux';
import { selectColisPourRamassage, selectColisRamasse } from '../../../../redux/slices/colisSlice';
import { getColis, getColisForClient } from '../../../../redux/apiCalls/colisApiCalls';

const { Option } = Select;

function ColisRamasse({ search }) {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const ColisRamasse = useSelector(selectColisRamasse); 
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExpidieModalVisible, setIsExpidieModalVisible] = useState(false);
  const [currentColis, setCurrentColis] = useState(null);
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [form] = Form.useForm();

  const deliveryPersonnel = ['Livreur 1', 'Livreur 2', 'Livreur 3']; // Example delivery personnel

  const success = (text) => {
    messageApi.open({
      type: 'success',
      content: text,
    });
  };

  const error = (text) => {
    messageApi.open({
      type: 'error',
      content: text,
    });
  };

  const warning = (text) => {
    messageApi.open({
      type: 'warning',
      content: text,
    });
  };
  //-------------------------------------------------------
  const {colisData,user,store} = useSelector((state) => ({
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store:state.auth.store
  }));
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
  if (ColisRamasse) {
      setData(ColisRamasse); // Update data state with the fetched colis
  }
}, [ColisRamasse]);
console.log("colis recu",ColisRamasse);
 useEffect(() => {
    const colis = ColisRamasse.filter(item => item.statut === 'Ramassé');
    setData(colis);
  }, []); 
  //------------------------------------------------------------------

  useEffect(() => {
    console.log('Selected row keys: ', selectedRowKeys);
  }, [selectedRowKeys]);

  const showExpidieModal = (record) => {
    setCurrentColis(record);
    setIsExpidieModalVisible(true);
  };

  const handleExpidie = () => {
    if (deliveryPerson) {
      const newData = ColisRamasse.map(item => {
        if (item.id === currentColis.id) {
          item.statut = 'Expidie';
          item.deliveryPerson = deliveryPerson;
        }
        return item;
      });
      setData(newData);
      setIsExpidieModalVisible(false);
      success(`Colis expédié par ${deliveryPerson}, veuillez vérifier sur la table de statut Expidie`);
    } else {
      warning("Veuillez sélectionner un livreur");
    }
  };

  const showModal = (record) => {
    setCurrentColis(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModifier = () => {
    if (selectedRowKeys.length === 1) {
      const record = ColisRamasse.find(item => item.id === selectedRowKeys[0]);
      showModal(record);
    } else {
      warning("Veuillez sélectionner une seule colonne.");
    }
  };

  const confirmSuppression = () => {
    const newData = ColisRamasse.filter(item => !selectedRowKeys.includes(item.id));
    setData(newData);
    setSelectedRowKeys([]);
    success(`${selectedRowKeys.length} colis supprimés.`);
  };

  const handleSuppremer = () => {
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: 'Confirmation de suppression',
        content: `Êtes-vous sûr de vouloir supprimer ${selectedRowKeys.length} colis ?`,
        okText: 'Oui',
        cancelText: 'Non',
        onOk: confirmSuppression,
      });
    } else {
      warning("Veuillez sélectionner une colonne");
    }
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const newData = ColisRamasse.map(item => {
        if (item.id === currentColis.id) {
          return { ...item, ...values };
        }
        return item;
      });
      setData(newData);
      setIsModalVisible(false);
      success("Colis modifié avec succès");
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsExpidieModalVisible(false);
  };

  const menu = (
    <Menu>
      <Menu.Item key="modifier" onClick={handleModifier}>
        Modifier
      </Menu.Item>
      <Menu.Item key="suppremer" onClick={handleSuppremer}>
        Suppremer
      </Menu.Item>
    </Menu>
  );

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
        <Button
          type="primary"
          icon={<MdDeliveryDining />}
          onClick={() => showExpidieModal(record)}
        >
          Expédie
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
          <div className="page-content-header">
            <Title nom='Colis attend de ramassage' />
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
              data={ColisRamasse}
              id="id"
              theme={theme}
              onSelectChange={setSelectedRowKeys}
            />
            {contextHolder}
            <div className="control-option">
              <div className="select-option">
                <h3>Options :</h3>
                <Dropdown overlay={menu}>
                  <Button>
                    Choisir une opération : <DownOutlined />
                  </Button>
                </Dropdown>
              </div>
              <div className="scane-option">
                <h3>Scan :</h3>
                <Link
                  to={`/dashboard/scan`}
                >
                  <Button 
                    icon={<BsUpcScan />}
                  >
                    Scan Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal
        title="Modifier Colis"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
        >
          <Form.Item
            name="code_suivi"
            label="Code Suivi"
            rules={[{ required: true, message: 'Veuillez entrer le code suivi!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="nom"
            label="Destinataire"
            rules={[{ required: true, message: 'Veuillez entrer le nom du destinataire!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tele"
            label="Téléphone"
            rules={[{ required: true, message: 'Veuillez entrer le téléphone!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="etat"
            label="État"
            rules={[{ required: true, message: 'Veuillez entrer l\'état!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="statut"
            label="Statut"
            rules={[{ required: true, message: 'Veuillez entrer le statut!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="date_livraison"
            label="Date de Livraison"
            rules={[{ required: false, message: 'Veuillez entrer la date de livraison!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ville"
            label="Ville"
            rules={[{ required: true, message: 'Veuillez entrer la ville!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="prix"
            label="Prix"
            rules={[{ required: true, message: 'Veuillez entrer le prix!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="nature_produit"
            label="Nature de Produit"
            rules={[{ required: true, message: 'Veuillez entrer la nature du produit!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Sélectionner Livreur"
        visible={isExpidieModalVisible}
        onOk={handleExpidie}
        onCancel={handleCancel}
      >
        <Form
          layout="vertical"
          name="select_delivery_person"
        >
          <Form.Item
            name="deliveryPerson"
            label="Livreur"
            rules={[{ required: true, message: 'Veuillez sélectionner un livreur!' }]}
          >
            <Select
              placeholder="Sélectionner un livreur"
              onChange={(value) => setDeliveryPerson(value)}
            >
              {deliveryPersonnel.map(person => (
                <Option key={person} value={person}>{person}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ColisRamasse;
