import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import reclamationData from '../../../../data/reclamation.json';
import TableDashboard from '../../../global/TableDashboard';

function ReclamationComplete({ theme }) {
    const [filteredData, setFilteredData] = useState([]);

    const columns = [
        {
            title: 'Nom Store',
            dataIndex: 'nom',
            key: 'nom'
        },
        {
            title: 'Client',
            dataIndex: 'client',
            key: "client"
        },
        {
            title: 'Telephone',
            dataIndex: 'tele',
            key: 'tele',
        },
        {
            title: 'Code Suivi',
            dataIndex: 'code_suivi',
            key: 'code_suivi',
        },
        {
            title: 'Reclamation',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Etat',
            dataIndex: 'etat',
            key: 'etat',
            render: (etat) => (
                <span style={{ color: etat ? 'green' : 'red' }}>
                    {etat ? 'Complète' : 'Incomplète'}
                </span>
            )
        },
    ];

    useEffect(() => {
        // Filter the data to show only those with etat true
        const completeReclamations = reclamationData.filter(item => item.etat === true);
        setFilteredData(completeReclamations);
    }, []);

    return (
        <TableDashboard theme={theme} column={columns} id="id" data={filteredData} />
    );
}

export default ReclamationComplete;
