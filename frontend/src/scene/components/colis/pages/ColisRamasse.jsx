import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled } from '@ant-design/icons';
import { Button, Modal, Form, Input, message, Card, Divider } from 'antd';
import { Link } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { affecterLivreur, getColis, getColisForClient } from '../../../../redux/apiCalls/colisApiCalls';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { toast } from 'react-toastify';
import { BsFillInfoCircleFill } from "react-icons/bs";

function ColisRamasse({ search }) {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentColis, setCurrentColis] = useState(null);
  const [livreurId, setLivreurId] = useState(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { livreurList, colisData, user, store } = useSelector(state => ({
    livreurList: state.livreur.livreurList,
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store: state.auth.store,
  }));

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
    dispatch(getLivreurList());
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id]);

  useEffect(() => {
    setData(colisData);
  }, [colisData]);

  const success = (text) => messageApi.success(text);
  const warning = (text) => messageApi.warning(text);
  const error = (text) => messageApi.error(text);

  const showModal = (record) => {
    setCurrentColis(record);
    setLivreurId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleAffecterLivreur = async () => {
    if (currentColis && livreurId) {
      try {
        await dispatch(affecterLivreur(currentColis._id, livreurId));
        const updatedData = data.filter(item => item._id !== currentColis._id);
        setData(updatedData);
        setIsModalVisible(false);
        form.resetFields();
        setCurrentColis(null);
        setLivreurId(null);
      } catch (err) {
        error('Erreur lors de l\'assignation du livreur');
      }
    } else {
      warning('Veuillez sélectionner un livreur');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCurrentColis(null);
    setLivreurId(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const selectLivreur = (id) => {
    setLivreurId(id);
  };

  const columns = [
    { title: 'Code Suivi', dataIndex: 'code_suivi', key: 'code_suivi', ...search('code_suivi') },
    { title: 'Livreur', dataIndex: 'livreur', key: 'livreur', render: (text, record) => (
      <span>
        {record.livreur ? record.livreur.nom + ' - ' + record.livreur.tele : <Tag icon={<ClockCircleOutlined />} color="default">Operation de Ramassage</Tag>}
      </span>
    ) },
    { title: 'Dernière Mise à Jour', dataIndex: 'updatedAt', key: 'updatedAt', render: formatDate },
    { title: 'Destinataire', dataIndex: 'nom', key: 'nom' },
    { title: 'Téléphone', dataIndex: 'tele', key: 'tele' },
    { title: 'État', dataIndex: 'etat', key: 'etat', render: (text, record) => (
      record.etat ? <Tag color="success" icon={<CheckCircleOutlined />}>Payée</Tag> : <Tag color="error" icon={<CloseCircleOutlined />}>Non Payée</Tag>
    ) },
    { title: 'Statut', dataIndex: 'statut', key: 'statut', render: (text, record) => (
      <Tag icon={<SyncOutlined spin />} color="processing">{record.statut}</Tag>
    ) },
    { title: 'Ville', dataIndex: 'ville', key: 'ville', render: (text, record) => <span>{record.ville.nom}</span> },
    { title: 'Option', render: (text, record) => (
      <Button type="primary" icon={<MdDeliveryDining />} onClick={() => showModal(record)}>Expidée</Button>
    ) },
  ];

  const filteredLivreurs = livreurList.reduce(
    (acc, person) => {
      if (person.villes.includes(currentColis?.ville.nom)) {
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
          <div className="page-content-header">
            <Title nom='Colis attend de ramassage' />
          </div>
          <div className="content" style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff' }}>
            <h4>Colis attend de ramassage</h4>
            <TableDashboard column={columns} data={data} id="_id" theme={theme} onSelectChange={setSelectedRowKeys} />
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
          <h3>Livreurs Proposer</h3>
          <div className="livreur_list_modal_card">
            {filteredLivreurs.preferred.length ? filteredLivreurs.preferred.map(person => (
              <Card
                key={person._id}
                hoverable
                style={{ width: 240, margin: '10px', border: livreurId === person._id ? '2px solid #1890ff' : '1px solid #f0f0f0' }}
                onClick={() => selectLivreur(person._id)}
              >
                <Card.Meta
                  title={
                    <div>
                      {person.username}
                      
                    </div>
                  } 
                  description={
                    <>
                      {person.tele}
                      <Button 
                        icon={<BsFillInfoCircleFill />} 
                        onClick={() => toast.info(`Villes: ${person.villes.join(', ')}`)} 
                        type='primary' 
                        style={{ float: 'right' }}
                      />
                    </>
                  } 
                />
              </Card>
            )) : <p>No preferred livreurs available</p>}
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
                style={{ width: 240, margin: '10px', border: livreurId === person._id ? '2px solid #1890ff' : '1px solid #f0f0f0' }}
                onClick={() => selectLivreur(person._id)}
              >
                <Card.Meta
                  title={
                    <div>
                      {person.username}
                    </div>
                  } 
                  description={
                    <>
                      {person.tele}
                      <Button 
                        icon={<BsFillInfoCircleFill />} 
                        onClick={() => toast.info(`Villes: ${person.villes.join(', ')}`)} 
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