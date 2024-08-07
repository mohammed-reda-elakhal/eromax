import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled } from '@ant-design/icons';
import { Table } from 'antd';
import ColisData from '../../../../data/colis.json';
import { Link } from 'react-router-dom';

function ColisStock() {
    const { theme } = useContext(ThemeContext);
    const [data, setData] = useState([]);
    

    useEffect(() => {
        const colis = ColisData.filter(item => item.info.type_colis === 'stock');
        setData(colis);
    }, []);

    const columns = [
        {
            title: 'Code Suivi',
            dataIndex: 'code_suivi',
            key: 'code_suivi',
        },
        {
            title: 'Dernière Mise à Jour',
            dataIndex: 'derniere_mise_a_jour',
            key: 'derniere_mise_a_jour',
        },
        {
            title: 'Destinataire',
            dataIndex: 'destinataire',
            key: 'destinataire',
        },
        {
            title: 'Téléphone',
            dataIndex: 'telephone',
            key: 'telephone',
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
            dataIndex: 'nature_de_produit',
            key: 'nature_de_produit',
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
                        <Title nom='Colis de Stock' />
                        <Link to={`/dashboard/ajouter-colis/stock`} className='btn-dashboard'>
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
                        <Table
                            columns={columns}
                            dataSource={data}
                            rowKey="id"
                            className={theme === 'dark' ? 'table-dark' : 'table-light'}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ColisStock;
