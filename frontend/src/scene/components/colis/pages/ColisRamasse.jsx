import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled, DownOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Dropdown, Menu, message } from 'antd';
import ColisData from '../../../../data/colis.json';
import { Link } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { BsUpcScan } from "react-icons/bs";

function ColisRamasse({search}) {
    const { theme } = useContext(ThemeContext);
    const [data, setData] = useState([]);
    

    useEffect(() => {
        const colis = ColisData.filter(item => item.statut === 'Ramassé');
        setData(colis);
    }, []);

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
  
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
  
    useEffect(() => {
      const colis = ColisData.filter(item => item.statut === 'Ramassé');
      setData(colis);
    }, []);
  
    useEffect(() => {
      console.log('Selected row keys: ', selectedRowKeys);
    }, [selectedRowKeys]);
  
    const handleExpidie = (id) => {
      if (selectedRowKeys.length > 0) {
        success( `${selectedRowKeys.length} colis Expidie , veuille vérifier sur la table de statu Expidée`)
      } else {
        warning("S'il vout pliz selectionner une colonne");
      }
    };
  
    const handleModifier = () => {
      if (selectedRowKeys.length == 1  ) {
        success( `${selectedRowKeys.length} colis ramassé , veuille vérifier sur la table de statu Ramasse`)
      } else {
        warning("S'il vout pliz selectionner une colonne seul .");
      }
      // Add your handling code here
    };
  
    const handleSuppremer = () => {
      if (selectedRowKeys.length > 0) {
        success( `${selectedRowKeys.length} colis Suprémmer .`)
      } else {
        warning("S'il vout pliz selectionner une colonne");
      }
      // Add your handling code here
    };
  
    const menu = (
      <Menu>
        <Menu.Item key="expidie" onClick={handleExpidie}>
          Expidie
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
                    size="small" 
                    icon = {<MdDeliveryDining/>}
                >
                    Expidie
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
                        <Title nom='Colis Ramasse' />
                        <Link to={`/dashboard/ajouter-colis/simple`} className='btn-dashboard'>
                            <PlusCircleFilled style={{marginRight:"8px"}} />
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
                        {contextHolder}
                        <div className="control-option">
                            <div className="select-option">
                                <h3>Options :</h3>
                                <Dropdown overlay={menu}>
                                <Button>
                                    Choisir une operation : <DownOutlined />
                                </Button>
                                </Dropdown>
                            </div>
                            <div className="scane-option">
                                <h3>Scan :</h3>
                                <Link
                                to={`/dashboard/scan`}
                                >
                                    <Button 
                                        icon={<BsUpcScan/>}
                                    >
                                        Scan Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ColisRamasse;
