import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled, DownOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Dropdown, Menu, message, Modal, Form, Input, Select } from 'antd';
import { Link } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { BsUpcScan } from "react-icons/bs";
import { useDispatch, useSelector } from 'react-redux';
import { affecterLivreur, getColis, getColisForClient } from '../../../../redux/apiCalls/colisApiCalls';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';

const { Option } = Select;

function ColisRamasse({ search }) {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentColis, setCurrentColis] = useState(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { livreurList, colisData, user, store } = useSelector(state => ({
    livreurList: state.livreur.livreurList,
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store: state.auth.store,
  }));

  // Fetch colis and livreur data
  useEffect(() => {
    if (user?.role) {
      if (user.role === "admin" || user.role === "team") {
        dispatch(getColis("Ramassée"));
      } else if (user.role === "client" && store?._id) {
        dispatch(getColisForClient(store._id, "Ramassée"));
      }
    }
    dispatch(getLivreurList()); // Fetch livreur list on mount
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id]);

  // Update the table when colisData changes
  useEffect(() => {
    setData(colisData);
  }, [colisData]);

  const success = (text) => messageApi.success(text);
  const warning = (text) => messageApi.warning(text);
  const error = (text) => messageApi.error(text);

  const showModal = (record, type) => {
    setCurrentColis(record);
    if (type === 'expedie') {
      setIsModalVisible({ type: 'expedie' });
    } else if (type === 'modifier') {
      form.setFieldsValue(record);
      setIsModalVisible({ type: 'modifier' });
    }
  };

  const handleAffecterLivreur = async () => {
    if (currentColis && currentColis.livreurId) {
      try {
        await dispatch(affecterLivreur(currentColis._id, currentColis.livreurId));
        success("Colis Expedié");
        setIsModalVisible(false);
      } catch (err) {
        error('Erreur lors de l\'assignation du livreur');
      }
    } else {
      warning('Veuillez sélectionner un livreur');
    }
  };

  const handleModifierColis = () => {
    form.validateFields()
      .then(values => {
        const updatedData = data.map(item => {
          if (item._id === currentColis._id) {
            return { ...item, ...values };
          }
          return item;
        });
        setData(updatedData);
        setIsModalVisible(false);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
          textAlign: 'center'
        }}>
          {record.statut}
        </span>
      ),
    },
    {
      title: 'Option',
      render: (text, record) => (
        <>
          <Button type="primary" icon={<MdDeliveryDining />} onClick={() => showModal(record, 'expedie')}>
            Affecter Livreur
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className='page-dashboard'>
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div className="page-content" style={{ backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)', color: theme === 'dark' ? '#fff' : '#002242' }}>
          <div className="page-content-header">
            <Title nom='Colis attend de ramassage' />
            <Link to={`/dashboard/ajouter-colis/simple`} className='btn-dashboard'>
              <PlusCircleFilled style={{ marginRight: "8px" }} />  Ajouter Colis
            </Link>
          </div>
          <div className="content" style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff' }}>
            <h4>Colis attend de ramassage</h4>
            <TableDashboard
              column={columns}
              data={data}
              id="id"
              theme={theme}
              onSelectChange={setSelectedRowKeys}
            />
            {contextHolder}
          </div>
        </div>
      </main>
      
      {/* Modifier Colis Modal */}
      <Modal
        title="Modifier Colis"
        visible={isModalVisible?.type === 'modifier'}
        onOk={handleModifierColis}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code_suivi" label="Code Suivi" rules={[{ required: true, message: 'Veuillez entrer le code suivi!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nom" label="Destinataire" rules={[{ required: true, message: 'Veuillez entrer le nom du destinataire!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tele" label="Téléphone" rules={[{ required: true, message: 'Veuillez entrer le téléphone!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="statut" label="Statut" rules={[{ required: true, message: 'Veuillez entrer le statut!' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Affecter Livreur Modal */}
      <Modal
        title="Sélectionner Livreur"
        visible={isModalVisible?.type === 'expedie'}
        onOk={handleAffecterLivreur}
        onCancel={handleCancel}
      >
        <Form layout="vertical">
          <Form.Item name="livreur" label="Livreur" rules={[{ required: true, message: 'Veuillez sélectionner un livreur!' }]}>
            <Select
              placeholder="Sélectionner un livreur"
              onChange={value => setCurrentColis({ ...currentColis, livreurId: value })}
            >
              {livreurList.map(person => (
                <Option key={person._id} value={person._id}>
                  {person.nom}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ColisRamasse;
