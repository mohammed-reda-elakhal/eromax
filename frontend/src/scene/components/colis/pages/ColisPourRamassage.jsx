import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled, DownOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Dropdown, Menu, message, Modal, Form, Input } from 'antd';
//import ColisData from '../../../../data/colis.json';
import { Link, useNavigate } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { BsUpcScan } from "react-icons/bs";
import { getColis, getColisForClient, getColisForLivreur, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import { useDispatch, useSelector } from 'react-redux';
function ColisPourRamassage({ search }) {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentColis, setCurrentColis] = useState(null);
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate(); // Get history for redirection


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
  //-----------------------------
  const { colisData, user, store } = useSelector((state) => ({
    colisData: state.colis.colis || [],  // Corrected the casing of colisData
    user: state.auth.user,
    store: state.auth.store,
  }));

 
  // Recuperation des colis selon le role
  useEffect(() => {
    if (user?.role) {
      if (user.role === "admin") {
        dispatch(getColis("attente de ramassage"));
      } else if (user.role === "client" && store?._id) {
        dispatch(getColisForClient(store._id , "attente de ramassage"));
      }else if (user.role === "team") {
        dispatch(getColisForClient(user._id,'attente de ramassage'));  // Use getColisForLivreur for 'livreur'
      }
    }
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id, user._id]);
  
  // Filter colis for "Attente de Ramassage"
  useEffect(() => {
    setData(colisData)
  }, [colisData ]);

  // Hide page for "livreur" role
  if (user?.role === 'livreur') {
    return null; // This will hide the entire page content for "livreur"
  }

  


  const handleRamasse = (colisId) => {
    if (colisId) {
      // Dispatch the updateStatut action to update the server
      dispatch(updateStatut(colisId, 'Ramassée')).then(() => {
        // Filter out the colis with the changed status
        const updatedData = data.filter(item => item._id !== colisId);
        setData(updatedData); // Update the local state to reflect the new data without the modified colis
      });
    } else {
      warning("Veuillez sélectionner une colonne");
    }
  };
  

  const showModal = (record) => {
    setCurrentColis(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModifier = () => {
    if (selectedRowKeys.length === 1) {
      const record = colisData.find(item => item.id === selectedRowKeys[0]);
      showModal(record);
    } else {
      warning("Veuillez sélectionner une seule colonne.");
    }
  };

  const confirmSuppression = () => {
    const newData = colisData.filter(item => !selectedRowKeys.includes(item.id));
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
      const newData = colisData.map(item => {
        if (item._id === currentColis._id) {
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
  };

  const menu = (
    <Menu>
      <Menu.Item key="ramasse" onClick={() => handleRamasse()}>
        Ramasse
      </Menu.Item>
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
      dataIndex: 'updatedAt',
      key: 'updatedAt',
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
      render: (text, record) => (
        <span>
          {record.ville.nom}
        </span>
      ),
    },
    {
      title: 'Tarif',
      dataIndex: 'ville',
      key: 'ville',
      render: (text, record) => (
        <span>
          {record.ville.tarif}
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
        <>
          {user.role !== 'client' && (
            <Popconfirm
              title="Ramassage Colis"
              description="Tu es sûr de faire ramassage pour ce colis?"
              onConfirm={() => handleRamasse(record._id)}
              okText="Oui"
              cancelText="Non"
            >
              <Button
                type="primary"
                icon={<MdDeliveryDining />}
              >
                Ramasse
              </Button>
            </Popconfirm>
          )}
        </>
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
              data={data}
              id="_id"
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
    </div>
  );
}

export default ColisPourRamassage;
