import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getAlldemandeRetrait, getdemandeRetraitByClient, validerDemandeRetrait } from '../../../../redux/apiCalls/demandeRetraitApiCall';
import { CheckCircleOutlined, SyncOutlined, DollarOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'; // Added DollarOutlined icon
import { Button, Statistic, Tag } from 'antd';
import { toast } from 'react-toastify';
import { getAllTransaction, getTransactionByClient } from '../../../../redux/apiCalls/trasactionApiCallls';

function TransactionTable() {
    const { theme } = useContext(ThemeContext);
    const { transactions, user, store } = useSelector((state) => ({
        transactions: state.transaction.transactions,
        user: state.auth.user,
        store: state.auth.store,
    }));

    const dispatch = useDispatch();
    
    // Loading state for the button
    const [loadingId, setLoadingId] = useState(null); // Track which button is loading

    useEffect(() => {
        if (user.role === "admin") {
            dispatch(getAllTransaction());
        } else if (user.role === "client") {
            dispatch(getTransactionByClient(store?._id));
        }

        window.scrollTo(0, 0);
    }, [dispatch, user.role, store?._id]);

   

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
                <span>{record.id_store.storeName}</span>
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
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (text, record) => (
                <>
    {
        record.type === "credit" ?
            <Statistic
                title={record.type}
                value={record.montant}
                precision={2}
                valueStyle={{
                    color: '#cf1322',
                    fontSize: '14px', // Adjust font size
                }}
                prefix={<ArrowDownOutlined style={{ fontSize: '16px' }} />} // Adjust icon size
                suffix="DH"
                style={{ fontSize: '12px', margin: 0 }} // Adjust overall size
            />
            :
            <Statistic
                title={record.type}
                value={record.montant}
                precision={2}
                valueStyle={{
                    color: '#3f8600',
                    fontSize: '14px', // Adjust font size
                }}
                prefix={<ArrowUpOutlined style={{ fontSize: '16px' }} />} // Adjust icon size
                suffix="DH"
                style={{ fontSize: '12px', margin: 0 }} // Adjust overall size
            />
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
                        <Title nom='Transaction' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <TableDashboard
                            theme={theme} id="_id" column={columns} data={transactions}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TransactionTable;
