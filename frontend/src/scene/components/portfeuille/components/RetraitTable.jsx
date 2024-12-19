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
import { Button, Tag, Input, DatePicker } from 'antd';
import { toast } from 'react-toastify';
import { IoMdRefresh } from 'react-icons/io';
import dayjs from 'dayjs';

function RetraitTable() {
    const { theme } = useContext(ThemeContext);
    const { demandesRetraits, user, store } = useSelector((state) => ({
        demandesRetraits: state.demandeRetrait.demandesRetraits,
        user: state.auth.user,
        store: state.auth.store,
    }));

    const dispatch = useDispatch();

    // State for filtering and loading
    const [filteredData, setFilteredData] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [searchText, setSearchText] = useState("");

    const getDataDR = () => {
        if (user.role === "admin") {
            dispatch(getAlldemandeRetrait());
        } else if (user.role === "client") {
            dispatch(getdemandeRetraitByClient(store?._id));
        }
    };

    useEffect(() => {
        getDataDR();
        window.scrollTo(0, 0);
    }, [dispatch, user.role, store?._id]);

    useEffect(() => {
        filterData();
    }, [demandesRetraits, startDate, endDate, searchText]);
    

    const filterData = () => {
        const lowerCaseSearchText = searchText.toLowerCase();
        const filtered = demandesRetraits.filter((item) => {
            const createdAt = new Date(item.createdAt);
            const matchesSearch =
                item?.id_store?.id_client?.nom?.toLowerCase().includes(lowerCaseSearchText) ||
                item?.id_store?.storeName?.toLowerCase().includes(lowerCaseSearchText);

            const withinDateRange =
                (!startDate || dayjs(createdAt).isAfter(startDate)) &&
                (!endDate || dayjs(createdAt).isBefore(endDate));

            return matchesSearch && withinDateRange;
        });
        setFilteredData(filtered);
    };

    const handleValiderDemandeRetrait = async (id_demande) => {
        setLoadingId(id_demande);
        try {
            await dispatch(validerDemandeRetrait(id_demande)).unwrap();
            toast.success("Demande de retrait validée avec succès !");
        } catch (error) {
            console.error(error.response?.data?.message || "Erreur lors de la validation de la demande de retrait");
        } finally {
            setLoadingId(null);
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
            title: 'Montant',
            dataIndex: 'montant',
            key: 'montant',
            render: (text, record) => (
                <div>
                    <strong>{user?.role === "admin" ? record?.montant : record?.montant +5} </strong> DH
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
                                Encours
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
            <main className="page-main">
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <TableDashboard
                            theme={theme} 
                            id="_id" 
                            column={columns} 
                            data={filteredData}
                        />
                    </div>
            </main>
        </div>
    );
}

export default RetraitTable;
