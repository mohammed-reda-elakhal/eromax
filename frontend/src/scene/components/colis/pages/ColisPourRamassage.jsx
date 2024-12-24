import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled, DownOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Dropdown, Menu, message, Modal, Form, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { BsUpcScan } from "react-icons/bs";
import { getColis, getColisForClient, getColisForLivreur, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';
import { FaBoxesStacked, FaDownload } from 'react-icons/fa6';
import { IoQrCodeSharp } from 'react-icons/io5';
import request from '../../../../utils/request';
import { toast } from 'react-toastify';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// **Add the following imports:**
import { FiRefreshCcw } from 'react-icons/fi';
import { Typography } from 'antd';
import { ExclamationCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { IoMdRefresh } from 'react-icons/io';

function ColisPourRamassage() { // Removed 'search' prop as it's handled internally
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
  const [loading, setLoading] = useState(false);
  
  
  // **Add search state**
  const [searchQuery, setSearchQuery] = useState('');

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

  const { colisData, user, store } = useSelector((state) => ({
    colisData: state.colis.colis || [],  // Corrected the casing of colisData
    user: state.auth.user,
    store: state.auth.store,
  }));

  // Recuperation des colis selon le role
  const getDataColis = () => {
    if (user?.role) {
      if (user.role === "admin") {
        dispatch(getColis("attente de ramassage"));
      } else if (user.role === "client" && store?._id) {
        dispatch(getColisForClient(store._id, "attente de ramassage"));
      } else if (user.role === "team") {
        dispatch(getColisForClient(user._id, 'attente de ramassage'));  // Use getColisForLivreur for 'livreur'
      }
    }
  };

  useEffect(() => {
    getDataColis();
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id, user._id]);

  // Filter colis for "Attente de Ramassage"
  useEffect(() => {
    setData(colisData);
  }, [colisData]);

  // **Implement search functionality**
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setData(colisData);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredData = colisData.filter(colis => {
        // Customize the fields you want to search through
        return (
          colis.code_suivi.toLowerCase().includes(lowerCaseQuery) ||
          colis.nom.toLowerCase().includes(lowerCaseQuery) ||
          colis.tele.toLowerCase().includes(lowerCaseQuery) ||
          (colis.ville?.nom && colis.ville.nom.toLowerCase().includes(lowerCaseQuery)) ||
          (colis.store?.storeName && colis.store.storeName.toLowerCase().includes(lowerCaseQuery))
        );
      });
      setData(filteredData);
    }
  }, [searchQuery, colisData]);

  // Hide page for "livreur" role
  if (user?.role === 'livreur') {
    return null; // This will hide the entire page content for "livreur"
  }

  const handleRamasse = async () => {
    if (selectedRowKeys.length > 0) {
      // Dispatch the updateStatut action to update the server
      setLoading(true);
      try {
        // Send a PUT request to update the status of selected colis
        const response = await request.put('/api/colis/statu/update', {
          colisCodes: selectedRowKeys,
          new_status: 'Ramassée'
        });
        setLoading(false);
        setSelectedRowKeys([]);
        toast.success(response.data.message);
        // Update the local data to remove the updated colis
        const newData = data.filter(item => !selectedRowKeys.includes(item.code_suivi));
        setData(newData);
      } catch (err) {
        setLoading(false);
        error("Erreur lors de la mise à jour des colis.");
      }

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
      const record = colisData.find(item => item.code_suivi === selectedRowKeys[0]);
      showModal(record);
    } else {
      warning("Veuillez sélectionner une seule colonne.");
    }
  };

  const confirmSuppression = () => {
    const newData = colisData.filter(item => !selectedRowKeys.includes(item.code_suivi));
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
        if (item.code_suivi === currentColis.code_suivi) {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const exportToExcel = () => {
    try {
      if (selectedRowKeys.length === 0) {
        toast.error("Veuillez sélectionner au moins un colis à exporter.");
        return;
      }

      // Filter selected rows from the data
      const selectedData = data.filter(item => selectedRowKeys.includes(item.code_suivi));

      // Map selectedData to a format suitable for Excel
      const dataToExport = selectedData.map(colis => ({
        "Code Suivi": colis.code_suivi,
        "Destinataire": colis.nom,
        "Téléphone": colis.tele,
        "Ville": colis.ville?.nom || 'N/A',
        "Adresse": colis.adresse || 'N/A',
        "Prix (DH)": colis.prix,
        "Statut": colis.statut,
        "Tarif Ajouter (DH)": colis.tarif_ajouter?.value || 0,
        // Add more fields as needed
      }));

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Colis Sélectionnés");

      // Generate a buffer
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

      // Create a blob from the buffer
      const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

      // Save the file
      saveAs(dataBlob, `Colis_Sélectionnés_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);

      // Success toast
      toast.success("Exporté vers Excel avec succès!");

    } catch (error) {
      console.error("Erreur lors de l'exportation vers Excel:", error);
      toast.error("Échec de l'exportation vers Excel.");
    }
  };

  const columns = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      render: (text, record) => (
        <>
          {record.replacedColis ? 
            <Tag icon={<FiRefreshCcw />} color="geekblue">
              Remplacée
            </Tag>
            : ""
          }
          <Typography.Text
            copyable
            style={{ width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {text}
          </Typography.Text>
          {record.expedation_type === "ameex" ? 
            <p style={{color:"gray", fontSize:"10px"}}>{record.code_suivi_ameex}</p> 
            : ""
          }
        </>
      ),
    },
    {
      title: 'Bussiness',
      dataIndex: 'store',
      key: 'store',
      render : (text , record) => (
        <>
          <strong>{record.store?.storeName} <br/> {record.store?.tele || 'N/A'}</strong>
          {
            user?.role === "admin" ? <p> <strong>Adress : </strong>{record.store?.adress || 'N/A'} </p> : ""
          }
        </>
      )
    },
    {
      title: 'Livreur',
      dataIndex: ['livreur', 'nom'],
      key: 'livreur_nom',
      render: (text ,record) => (
        <>
            {record.livreur ? <p>{record.livreur.nom} <br/> {record.livreur.tele} </p> : <Tag icon={<ClockCircleOutlined />} color="default">Operation de Ramassage</Tag>}
        </>
      ),
    },
    {
      title: 'Destinataire',
      dataIndex: 'nom',
      key: 'nom',
      render : (text , record) =>(
        <>
          <span>{record.nom}</span>
          <br />
          <span>{record.tele}</span>
          <br />
          <span>{record.ville.nom}</span>
          <br />
          <span>{record.prix}</span>
        </>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (text, record) => {
        let color = 'processing';
        let icon = <SyncOutlined spin />;
        switch (record.statut) {
          case 'Livrée':
            color = 'success';
            icon = <CheckCircleOutlined />;
            break;
          case 'Annulée':
          case 'Refusée':
            color = 'error';
            icon = <CloseCircleOutlined />;
            break;
          case 'Programme':
            color = 'default';
            icon = <ClockCircleOutlined />;
            break;
          case 'Remplacée':
          case 'En Retour':
            color = 'warning';
            icon = <ExclamationCircleOutlined />;
            break;
          case 'Fermée':
            color = 'default';
            icon = <MinusCircleOutlined />;
            break;
          default:
            color = 'processing';
            icon = <SyncOutlined spin />;
        }
        return <Tag icon={icon} color={color}>{record.statut}</Tag>;
      },
    },
    {
      title: 'Tarif',
      dataIndex: 'ville',
      key: 'tarif',
      render: (text, record) => (
        <span>
          {record.ville?.tarif || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Nature de Produit',
      dataIndex: 'nature_produit',
      key: 'nature_produit',
      render: (text) => text || 'N/A',
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
            {
                user?.role === "client" ?
                <Link to={`/dashboard/ajouter-colis/simple`} className='btn-dashboard'>
                    <PlusCircleFilled style={{marginRight:"8px"}} />
                    Ajouter Colis
                </Link>:""
            }
          </div>
          <div
            className="content"
            style={{
              backgroundColor: theme === 'dark' ? '#001529' : '#fff',
            }}
          >
            <h4>Colis attend de ramassage</h4>
            {
              user?.role === "admin" 
              ?
              <div className="bar-action-data" style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button 
                  icon={<IoMdRefresh />} 
                  type="primary" 
                  onClick={getDataColis} 
                  style={{ marginRight: '8px' }}
                >
                  Refresh
                </Button>
                <Button 
                  icon={<FaBoxesStacked />} 
                  type="primary" 
                  onClick={handleRamasse} 
                  loading={loading}
                  style={{ marginRight: '8px' }}
                >
                  Ramasser
                </Button>
                <Button 
                  icon={<IoQrCodeSharp />} 
                  type="primary" 
                  onClick={() => navigate("/dashboard/scan/statu/Ramassée")} 
                  loading={loading}
                  style={{ marginRight: '8px' }}
                >
                  Scan
                </Button>
                <Button 
                  icon={<FaDownload />} 
                  type="default" 
                  onClick={exportToExcel}
                  disabled={selectedRowKeys.length === 0}
                >
                  Export to Excel
                </Button>
              </div>
              :
              "" 
            }

            {/* **Add Search Input Here** */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                placeholder="Rechercher des colis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                style={{ width: '300px' }}
              />
            </div>

            <TableDashboard
              column={columns}
              data={data}
              id="code_suivi"
              theme={theme}
              rowSelection={{
                selectedRowKeys: selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
            />
            {contextHolder}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ColisPourRamassage;
