import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled } from '@ant-design/icons';
import ColisData from '../../../../data/colis.json';
import { Link } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { selectColisLivre } from '../../../../redux/slices/colisSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getColis, getColisForClient } from '../../../../redux/apiCalls/colisApiCalls';

function ColisLivrée({search}) {
    const { theme } = useContext(ThemeContext);
    const [data, setData] = useState([]);
    const dispatch = useDispatch();
    const ColisLivrée= useSelector(selectColisLivre); 
    
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
      if (ColisLivrée) {
          setData(ColisLivrée); // Update data state with the fetched colis
      }
    }, [ColisLivrée]);
    console.log("colis recu",ColisLivrée);
     useEffect(() => {
        const colis = ColisLivrée.filter(item => item.statut === 'Ramassé');
        setData(colis);
      }, []); 
    
      useEffect(() => {
        const colis = ColisLivrée.filter(item => item.statut === 'Attente de Ramassage');
        setData(colis);
      }, []);
    useEffect(() => {
        const colis = ColisLivrée.filter(item => item.statut === 'Livrée');
        setData(colis);
    }, []);

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
                        <Title nom='Colis Expidie' />
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
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ColisLivrée;
