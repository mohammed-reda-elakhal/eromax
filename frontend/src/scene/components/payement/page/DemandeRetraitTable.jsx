import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getAlldemandeRetrait, getdemandeRetraitByClient, validerDemandeRetrait } from '../../../../redux/apiCalls/demandeRetraitApiCall';
import { CheckCircleOutlined, SyncOutlined, DollarOutlined } from '@ant-design/icons'; // Added DollarOutlined icon
import { Button, Tag } from 'antd';
import { toast } from 'react-toastify';

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

    useEffect(() => {
        if (user.role === "admin") {
            dispatch(getAlldemandeRetrait());
        } else if (user.role === "client") {
            dispatch(getdemandeRetraitByClient(store?._id));
        }

        window.scrollTo(0, 0);
    }, [dispatch, user.role, store?._id]);

    // Function to handle status update
    const handleValiderDemandeRetrait = async (id_demande) => {
        setLoadingId(id_demande); // Set the loading state for this button

        try {
            const updatedDemande = await dispatch(validerDemandeRetrait(id_demande));

            // Immediately update the state to reflect the new status
            const updatedDemandes = demandesRetraits.map(demande => 
                demande._id === id_demande ? { ...demande, verser: true } : demande
            );

            // Optionally, you can dispatch the action to update the Redux store here
            // dispatch(demandeRetraitActions.updateDemandeRetrait(updatedDemande));

            toast.success("Demande de retrait validée avec succès !");
        } catch (error) {
            toast.error("Erreur lors de la validation de la demande de retrait");
        } finally {
            setLoadingId(null); // Reset loading state regardless of success or failure
        }
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
                            style={{
                                backgroundColor: '#4CAF50', // Green background
                                color: 'white', // White text
                                border: 'none', // No border
                                borderRadius: '4px', // Rounded corners
                                padding: '10px 20px', // Padding
                                margin: '0 5px', // Margin for spacing
                                display: 'flex', // Flexbox for icon alignment
                                alignItems: 'center', // Center icon and text vertically
                            }}
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
                        <TableDashboard
                            theme={theme} id="_id" column={columns} data={demandesRetraits}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DemandeRetraitTable;
