import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getReclamation, updateReclamationStatus } from '../../../../redux/apiCalls/reclamationApiCalls';
import { toast } from 'react-toastify';  // Assuming you're using toast for notifications

function ReclamationIncomplete({ theme }) {
    const [filteredData, setFilteredData] = useState([]);
    const dispatch = useDispatch();
    const { reclamations } = useSelector((state) => state.reclamation);

    useEffect(() => {
        dispatch(getReclamation(false));
        window.scrollTo(0, 0);
    }, [dispatch]);

    useEffect(() => {
        // Filter to show only incomplete reclamations
        const incompleteReclamations = reclamations.filter(item => item.resoudre === false);
        setFilteredData(incompleteReclamations);
    }, [reclamations]);

    // Function to handle status change
    const handleStatusChange = async (id) => {
        try {
            await dispatch(updateReclamationStatus(id));
            // After updating, automatically filter out the resolved reclamation
            setFilteredData(filteredData.filter(item => item._id !== id));
        } catch (error) {
            toast.error("Failed to update reclamation status");
        }
    };

    const columns = [
        {
            title: 'Nom Store',
            dataIndex: 'nom',
            key: 'nom',
            render: (text, record) => (
                <span>{record.store.storeName}</span>
            )
        },
        {
            title: 'Client',
            dataIndex: 'client',
            key: "client",
            render: (text, record) => (
                <span>{record.store.id_client.nom + " " + record.store.id_client.prenom}</span>
            )
        },
        {
            title: 'Telephone',
            dataIndex: 'tele',
            key: 'tele',
            render: (text, record) => (
                <span>{record.store.id_client.tele}</span>
            )
        },
        {
            title: 'Code Suivi',
            dataIndex: 'code_suivi',
            key: 'code_suivi',
            render: (text, record) => (
                <span>{record.colis.code_suivi}</span>
            )
        },
        {
            title: 'Reclamation',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Statu',
            dataIndex: 'resoudre',
            key: 'resoudre',
            render: (resoudre) => (
                <span style={{ color: resoudre ? 'green' : 'red' }}>
                    {resoudre ? 'Complète' : 'Incomplète'}
                </span>
            )
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => (
                <div className='action_user'>
                    {!record.resoudre && (
                        <Button 
                            type='primary'
                            onClick={() => handleStatusChange(record._id)}
                        >
                            Complete
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <TableDashboard theme={theme} column={columns} id="id" data={filteredData} />
    );
}

export default ReclamationIncomplete;
