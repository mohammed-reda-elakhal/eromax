import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import reclamationData from '../../../../data/reclamation.json';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getReclamation } from '../../../../redux/apiCalls/reclamationApiCalls';
import { MdDelete } from 'react-icons/md';


function ReclamationComplete({ theme }) {
    const [filteredData, setFilteredData] = useState([]);

    const dispatch = useDispatch();
    const { reclamations } = useSelector((state) => state.reclamation);

    useEffect(() => {
        dispatch(getReclamation(true));
        window.scrollTo(0, 0);
    }, [dispatch]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      };
    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text, record) => (
                <span>
                    {formatDate(record.createdAt)}
                </span>
            )
        },
        {
            title: 'Nom Store',
            dataIndex: 'nom',
            key: 'nom',
            render: (text , record) => (
                <span>
                    {record.store.storeName}
                </span>
            )
        },
        {
            title: 'Client',
            dataIndex: 'client',
            key: "client",
            render: (text , record) => (
                <span>
                    {record.store.id_client.nom + "  " +record.store.id_client.prenom}
                </span>
            )
        },
        {
            title: 'Telephone',
            dataIndex: 'tele',
            key: 'tele',
            render: (text , record) => (
                <span>
                    {record.store.id_client.tele}
                </span>
            )
        },
        {
            title: 'Code Suivi',
            dataIndex: 'code_suivi',
            key: 'code_suivi',
            render: (text , record) => (
                <span>
                    {record.colis.code_suivi}
                </span>
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
        }
    ];

    useEffect(() => {
        // Filter the data to show only those with etat true
        const completeReclamations = reclamationData.filter(item => item.etat === false);
        setFilteredData(completeReclamations);
    }, []);

    return (
        <TableDashboard theme={theme} column={columns} id="id" data={reclamations} />
    );
}

export default ReclamationComplete;
