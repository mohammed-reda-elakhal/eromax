import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import reclamationData from '../../../../data/reclamation.json';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getReclamation } from '../../../../redux/apiCalls/reclamationApiCalls';


function ReclamationIncomplete({ theme }) {
    const [filteredData, setFilteredData] = useState([]);

    const dispatch = useDispatch();
    const { reclamations } = useSelector((state) => state.reclamation);

    useEffect(() => {
        dispatch(getReclamation(false));
        window.scrollTo(0, 0);
    }, [dispatch]);


    const columns = [
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
        <TableDashboard theme={theme} column={columns} id="id" data={reclamations} />
    );
}

export default ReclamationIncomplete;
