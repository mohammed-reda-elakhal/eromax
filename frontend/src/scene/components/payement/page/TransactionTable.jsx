import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getAlldemandeRetrait, getdemandeRetraitByClient, validerDemandeRetrait } from '../../../../redux/apiCalls/demandeRetraitApiCall';
import { CheckCircleOutlined, SyncOutlined, DollarOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'; // Added DollarOutlined icon
import { Button, Statistic, Tag , Input , DatePicker  } from 'antd';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { getAllTransaction, getTransactionByClient } from '../../../../redux/apiCalls/trasactionApiCallls';

function TransactionTable() {
    const { theme } = useContext(ThemeContext);
    const { transactions, user, store } = useSelector((state) => ({
        transactions: state.transaction.transactions,
        user: state.auth.user,
        store: state.auth.store,
    }));

    const dispatch = useDispatch();

    const [loadingId, setLoadingId] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [filteredData, setFilteredData] = useState([]);

    const getData =()=>{
        if (user.role === "admin") {
            dispatch(getAllTransaction());
        } else if (user.role === "client") {
            dispatch(getTransactionByClient(store?._id));
        }
    }
    useEffect(() => {
        getData()
        window.scrollTo(0, 0);
    }, [dispatch, user.role, store?._id]);

    useEffect(() => {
        filterData();
    }, [transactions, searchText, startDate, endDate]);

    const filterData = () => {
        const lowerCaseSearchText = searchText.toLowerCase();
        const filtered = transactions.filter((transaction) => {
            const createdAt = new Date(transaction.createdAt);
            const matchesSearch =
                transaction?.id_store?.id_client?.nom?.toLowerCase().includes(lowerCaseSearchText) ||
                transaction?.id_store?.storeName?.toLowerCase().includes(lowerCaseSearchText);

            const withinDateRange =
                (!startDate || dayjs(createdAt).isAfter(startDate)) &&
                (!endDate || dayjs(createdAt).isBefore(endDate));

            return matchesSearch && withinDateRange;
        });
        setFilteredData(filtered);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text, record) => <span>{formatDate(record.createdAt)}</span>,
        },
        {
            title: 'Client',
            dataIndex: 'nom',
            key: 'nom',
            render: (text, record) => <span>{record?.id_store?.id_client?.nom}</span>,
        },
        {
            title: 'Store',
            dataIndex: 'store',
            key: 'store',
            render: (text, record) => <span>{record.id_store.storeName}</span>,
        },
        {
            title: 'Telephone',
            dataIndex: 'tele',
            key: 'tele',
            render: (text, record) => <span>{record?.id_store?.id_client?.tele}</span>,
        },
        {
            title: 'Montant',
            dataIndex: 'montant',
            key: 'montant',
            render: (text, record) => (
                <div>
                    <strong>{record?.montant} </strong> DH
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (text, record) => (
                record.type === "credit" ? (
                    <Statistic
                        title={record.type}
                        value={record.montant}
                        precision={2}
                        valueStyle={{ color: '#cf1322', fontSize: '14px' }}
                        prefix={<ArrowDownOutlined style={{ fontSize: '16px' }} />}
                        suffix="DH"
                    />
                ) : (
                    <Statistic
                        title={record.type}
                        value={record.montant}
                        precision={2}
                        valueStyle={{ color: '#3f8600', fontSize: '14px' }}
                        prefix={<ArrowUpOutlined style={{ fontSize: '16px' }} />}
                        suffix="DH"
                    />
                )
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
                        <Title nom='Transaction' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <div className="bar-action-data" style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
                            <Button
                                type="primary"
                                onClick={() => {
                                    setSearchText("");
                                    setStartDate(null);
                                    setEndDate(null);
                                    setFilteredData(transactions);
                                    getData()
                                }}
                            >
                                Refresh
                            </Button>
                            {user.role === "admin" && (
                                <Input
                                    placeholder="Search by client or store"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    style={{ width: '200px' }}
                                />
                            )}
                            <DatePicker
                                placeholder="Start Date"
                                onChange={(date) => setStartDate(date)}
                                style={{ width: '150px' }}
                            />
                            <DatePicker
                                placeholder="End Date"
                                onChange={(date) => setEndDate(date)}
                                style={{ width: '150px' }}
                            />
                            
                        </div>
                        <TableDashboard
                            theme={theme}
                            id="_id"
                            column={columns}
                            data={filteredData}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TransactionTable;
