import React, { useEffect } from 'react';
import { Table } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { getTopVille } from '../../../../redux/apiCalls/staticsApiCalls';

function TopCitiesTable({ storeId }) {
    const dispatch = useDispatch();
    const topVilles = useSelector((state) => state.statics.topVilles);
    const user = useSelector(state => state.auth.user);
    const store = useSelector(state => state.auth.store);

    useEffect(() => {
        if (user && store && user.role) {
            if(user.role==='client'){
                dispatch(getTopVille(store._id))
            }
        }
    }, [dispatch, store]);

    // Colonnes du tableau
    const columns = [
        {
            title: 'Ville',
            dataIndex: 'ville',
            key: 'ville',
        },
        {
            title: 'Nombre de Colis',
            dataIndex: 'count',
            key: 'count',
            sorter: (a, b) => a.count - b.count, // Option de tri par nombre de colis
        },
    ];

    return (
    <div className="table-container" >
        <Table
            columns={columns}
            dataSource={topVilles}
            pagination={false}
            rowKey="ville"
            bordered
            title={() => <div className="table-title">Top 10 Villes par Nombre de Colis</div>}
            />
    </div>
    );
}

export default TopCitiesTable;
