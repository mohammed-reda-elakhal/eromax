import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import reclamationData from '../../../../data/reclamation.json';
import TableDashboard from '../../../global/TableDashboard';

function ReclamationIncomplete({ theme }) {
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
        }, {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => (
                <div className='action_user'>
                    {!record.etat && (
                        <Button 
                            type = 'primary'
                        >
                            Complete
                        </Button>
                    )}
                </div>
            )
        }
    ];

    useEffect(() => {
        // Filter the data to show only those with etat true
        const completeReclamations = reclamationData.filter(item => item.etat === false);
        setFilteredData(completeReclamations);
    }, []);

    return (
        <TableDashboard theme={theme} column={columns} id="id" data={filteredData} />
    );
}

export default ReclamationIncomplete;
