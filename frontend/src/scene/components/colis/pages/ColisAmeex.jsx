import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { PlusCircleFilled, DownOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Modal, Form, message, Tag, Typography, Menu } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { colisActions } from '../../../../redux/slices/colisSlice';
import { getColisAmeex, getColisAmeexAsyncStatu, getColisForClient, getColisForLivreur, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import { BiTagAlt } from 'react-icons/bi';
import { MdFactCheck } from 'react-icons/md';
import { IoMdRefresh } from 'react-icons/io';
import { CiImport } from 'react-icons/ci';
import { Tag as AntTag } from 'antd';
import Title from '../../../global/Title';
import { FiRefreshCcw } from 'react-icons/fi';

const { Text } = Typography;

function ColisAmeex({ search }) {
    const { theme } = useContext(ThemeContext);
    const [data, setData] = useState([]);
    const dispatch = useDispatch();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentColis, setCurrentColis] = useState(null);
    const [form] = Form.useForm();
    // Remove local loading state since it's managed by Redux

    const navigate = useNavigate();

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

    const { colisData, user, store, loading } = useSelector((state) => ({
        colisData: state.colis.colis || [], // Corrected the casing of colisData
        user: state.auth.user,
        store: state.auth.store,
        loading: state.colis.loading, // Select loading state from Redux
    }));

    const getDataColis = () => {
        if (user.role === "admin") {
            dispatch(getColisAmeex());
        }
    }

    useEffect(() => {
        getDataColis();
        window.scrollTo(0, 0);
    }, [dispatch, user?.role, store?._id, user._id]);

    useEffect(() => {
        if (colisData) {
            setData(colisData); // Update data state with the fetched colis
        }
    }, [colisData]);

    const handleStatuAmeex = () => {
        dispatch(getColisAmeexAsyncStatu());
    }

    const showModal = (record) => {
        setCurrentColis(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleModifier = () => {
        if (selectedRowKeys.length === 1) {
            const record = colisData.find(item => item.id === selectedRowKeys[0]);
            showModal(record);
        } else {
            warning("Veuillez sélectionner une seule colonne.");
        }
    };

    const confirmSuppression = () => {
        const newData = colisData.filter(item => !selectedRowKeys.includes(item.id));
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const columns = [
        {
            title: 'Code Suivi',
            dataIndex: 'code_suivi',
            key: 'code_suivi',
            // ...search('code_suivi'), // Ensure the 'search' function is correctly implemented
            width: 200,
            render: (text, record) => (
                <>
                    {record.replacedColis ? 
                        <Tag icon={<FiRefreshCcw />} color="default" style={{ marginRight: '5px' }} />
                        : ""
                    }
                    <Typography.Text
                        copyable
                        style={{ width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                        {text}
                    </Typography.Text>
                    {record.expedation_type === "ameex" && (
                        <p style={{ color: "gray", fontSize: "10px", margin: 0 }}>{record.code_suivi_ameex}</p>
                    )}
                </>
            ),
        },
        {
            title: 'Livreur',
            dataIndex: 'livreur',
            key: 'livreur',
            render: (text, record) => (
                <span>
                    {
                        record.livreur 
                        ? 
                            `${record.livreur.nom} - ${record.livreur.tele}` 
                        : 
                            <Tag icon={<ClockCircleOutlined />} color="default">
                                Operation de Ramassage
                            </Tag>
                    }
                </span> // Check if 'livreur' exists, otherwise show default message
            )
        },
        {
            title: 'Business',
            dataIndex: 'store',
            key: 'store',
            render: (text, record) => (
                <>
                    <strong>{record.store?.storeName} <br/> {record.store?.tele || 'N/A'}</strong>
                    {
                        user?.role === "admin" ? <p><strong>Adress : </strong>{record.store?.adress || 'N/A'}</p> : ""
                    }
                </>
            )
        },
        {
            title: 'Destinataire',
            dataIndex: 'nom',
            key: 'nom',
            render: (text, record) => (
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
            render: (text, record) => (
                <Tag icon={<SyncOutlined spin />} color="processing">{text}</Tag>
            ) 
        },
    ];

    return (
        <div className='page-dashboard'>
            {contextHolder}
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
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <Title nom="Colis Ameex" />
                        <div className="bar-action-data">
                            <Button 
                                icon={<IoMdRefresh />} 
                                type="primary" 
                                onClick={() => getDataColis()} 
                                disabled={loading}
                                loading={loading} // Show loading spinner
                            >
                                Refresh
                            </Button>
                            <Button 
                                icon={<CiImport />} 
                                type="primary" 
                                onClick={() => handleStatuAmeex()} 
                                disabled={loading}
                                loading={loading} // Show loading spinner
                            >
                                Get New Statu
                            </Button>
                        </div>
                        <TableDashboard
                            column={columns}
                            data={data} // Use the local data state, not the Redux state
                            id="code_suivi"
                            theme={theme}
                            onSelectChange={setSelectedRowKeys}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ColisAmeex;
