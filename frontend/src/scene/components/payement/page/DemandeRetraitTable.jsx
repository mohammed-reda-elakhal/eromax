import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { 
    getAlldemandeRetrait, 
    getdemandeRetraitByClient, 
    validerDemandeRetrait 
} from '../../../../redux/apiCalls/demandeRetraitApiCall';
import { CheckCircleOutlined, SyncOutlined, DollarOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import { toast } from 'react-toastify';
import { IoMdRefresh } from 'react-icons/io';

function DemandeRetraitTable() {
    const { theme } = useContext(ThemeContext);
    const { demandesRetraits, user, store } = useSelector((state) => ({
        demandesRetraits: state.demandeRetrait.demandesRetraits,
        user: state.auth.user,
        store: state.auth.store,
    }));

    const dispatch = useDispatch();
    
    // Loading state for the button
    const [loadingId, setLoadingId] = useState(null); // Track which button is loading

    const getDataDR = () =>{
        if (user.role === "admin") {
            dispatch(getAlldemandeRetrait());
        } else if (user.role === "client") {
            dispatch(getdemandeRetraitByClient(store?._id));
        }

    }
    useEffect(() => {
        getDataDR()
        window.scrollTo(0, 0);
    }, [dispatch, user.role, store?._id]);

    // Function to handle status update
    const handleValiderDemandeRetrait = async (id_demande) => {
        setLoadingId(id_demande); // Set the loading state for this button

        try {
            await dispatch(validerDemandeRetrait(id_demande)).unwrap(); // Wait for the action to complete

            // The Redux store will update 'demandesRetraits' via the slice's 'updateDemandeRetrait' reducer
            toast.success("Demande de retrait validée avec succès !");
        } catch (error) {
            console.error(error.response?.data?.message || "Erreur lors de la validation de la demande de retrait");
        } finally {
            setLoadingId(null); // Reset loading state regardless of success or failure
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      };

    const columns = [
        {
            title: 'Client',
            dataIndex: 'nom',
            key: 'nom',
            render: (text, record) => (
                <span>{record?.id_store?.id_client?.nom}</span>
            )
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text, record) => (
                <span>{formatDate(record.createdAt)}</span>
            )
        },
        {
            title: 'Store',
            dataIndex: 'store',
            key: 'store',
            render: (text, record) => (
                <span>{record?.id_store?.storeName}</span>
            )
        },
        {
            title: 'Telephone',
            dataIndex: 'tele',
            key: 'tele',
            render: (text, record) => (
                <span>{record?.id_store?.id_client?.tele}</span>
            )
        },
        {
            title: 'Bank ',
            dataIndex: 'bank',
            key: 'bank',
            render: (text, record) => (
                <div>
                    <p>{record?.id_payement?.idBank?.Bank}</p>
                    <p><span>RIB : </span><strong>{record?.id_payement?.rib}</strong></p>
                </div>
            )
        },
        {
            title: 'Tarif',
            dataIndex: 'tarif',
            key: 'tarif',
            render: (text, record) => (
                <div>
                    <strong>{record?.tarif} </strong> DH
                </div>
            )
        },
        {
            title: 'Montant',
            dataIndex: 'montant',
            key: 'montant',
            render: (text, record) => (
                <div>
                    <strong>{record?.montant} </strong> DH
                </div>
            )
        },
        {
            title: 'État',
            dataIndex: 'verser',
            key: 'verser',
            render: (text, record) => (
                <>
                    {
                        record.verser ?
                            <Tag icon={<CheckCircleOutlined />} color="success">
                                Versé
                            </Tag>
                            :
                            <Tag icon={<SyncOutlined spin />} color="processing">
                                En attente de versement
                            </Tag>
                    }
                </>
            )
        },
        {
            title: 'Option',
            dataIndex: 'option',
            key: 'option',
            render: (text, record) => (
                <>
                    {
                        user?.role === "admin" && !record.verser &&
                        <Button 
                            onClick={() => handleValiderDemandeRetrait(record._id)} 
                            loading={loadingId === record._id} // Show loading spinner
                            icon={<DollarOutlined />} // Add money icon
                            className="verser-button"
                            disabled={loadingId === record._id} // Disable button while loading
                        >
                            Verser
                        </Button>
                    }
                </>
            )
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
                        <Title nom='Demande de Retrait' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <div className="bar-action-data" style={{ marginBottom: '16px' }}>
                            <Button 
                                icon={<IoMdRefresh />} 
                                type="primary" 
                                onClick={getDataDR} 
                                style={{ marginRight: '8px' }}
                            >
                                Refresh
                            </Button>
                        </div>
                        <TableDashboard
                            theme={theme} 
                            id="_id" 
                            column={columns} 
                            data={demandesRetraits}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DemandeRetraitTable;
