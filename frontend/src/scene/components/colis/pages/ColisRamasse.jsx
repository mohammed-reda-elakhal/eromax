import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { Link } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { affecterLivreur, getColis, getColisForClient } from '../../../../redux/apiCalls/colisApiCalls';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';


const { Option } = Select;

function ColisRamasse({ search }) {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentColis, setCurrentColis] = useState(null);
  const [livreurId, setLivreurId] = useState(null); // State for storing selected delivery person
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
      } else if (user.role === "team") {
        dispatch(getColisForClient(user._id,'Ramassée'));
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

  const showModal = (record) => {
    setCurrentColis(record);
    setLivreurId(null); // Reset delivery person selection
    form.resetFields(); // Reset form fields
    setIsModalVisible(true);
  };

  const handleAffecterLivreur = async () => {
    if (currentColis && livreurId) {
      try {
        await dispatch(affecterLivreur(currentColis._id, livreurId));
        const updatedData = data.filter(item => item._id !== currentColis._id);
        setData(updatedData);
        setIsModalVisible(false);
        form.resetFields(); // Clear the form fields after assigning
        setCurrentColis(null); // Clear current colis and reset
        setLivreurId(null); // Reset livreurId after assignment
      } catch (err) {
        error('Erreur lors de l\'assignation du livreur');
      }
    } else {
      warning('Veuillez sélectionner un livreur');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields(); // Reset the form when the modal is cancelled
    setCurrentColis(null); // Clear current colis
    setLivreurId(null); // Reset delivery person selection
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
    },{
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
      title: 'Option',
      render: (text, record) => (
        <>
          <Button type="primary" icon={<MdDeliveryDining />} onClick={() => showModal(record)}>
            Expidée
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
              id="_id"
              theme={theme}
              onSelectChange={setSelectedRowKeys}
            />
            {contextHolder}
          </div>
        </div>
      </main>
      
      {/* Affecter Livreur Modal */}
      <Modal
        title="Sélectionner Livreur"
        visible={isModalVisible}
        onOk={handleAffecterLivreur}
        onCancel={handleCancel}
      >
        <Form layout="vertical">
          <Form.Item name="livreur" label="Livreur" rules={[{ required: true, message: 'Veuillez sélectionner un livreur!' }]}>
            <Select
              placeholder="Sélectionner un livreur"
              value={livreurId} // Controlled select input for livreur
              onChange={value => setLivreurId(value)} // Update livreurId on selection
            >
              {livreurList.map(person => (
                <Option key={person._id} value={person._id}>
                  {person.username}
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
