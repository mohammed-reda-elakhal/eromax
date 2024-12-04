import React, { useEffect } from 'react'
import TableDashboard from '../../../global/TableDashboard'
import { useDispatch, useSelector } from 'react-redux';
import { getFacture, getFactureDetailsByLivreur, setFactureEtat } from '../../../../redux/apiCalls/factureApiCalls';
import { Button, Tag } from 'antd';
import { FaRegFolderOpen } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlinePayment } from 'react-icons/md';

function FactureLivreurTable({theme}) {

  const navigate = useNavigate()

  const dispatch = useDispatch();
  const { facture, user, store } = useSelector((state) => ({
    facture: state.facture.facture,
    user: state.auth.user,
    store: state.auth.store,
  }));


  useEffect(() => {
    if(user?.role ==="admin"){
      dispatch(getFacture('livreur'));
    }else if(user?.role === "livreur"){
      dispatch(getFactureDetailsByLivreur(user?._id))
    }
    window.scrollTo(0, 0);
}, [dispatch]);


const columns = [
  {
      title: 'Date Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString(), // Format the date
  },
  {
      title: 'Code Facture',
      dataIndex: 'code_facture',
      key: 'code_facture',
  },
  {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1), // Capitalize
  },
  {
      title: 'Livreur Name',
      key: 'name',
      render: (text, record) => {
          if (record.type === 'client' && record.store) {
              return record.store.storeName;
          } else if (record.type === 'livreur' && record.livreur) {
              // Assuming livreur has a 'name' field; adjust if necessary
              return record.livreur.nom || 'N/A';
          }
          return 'N/A';
      },
  },
  {
      title: 'Total Prix',
      dataIndex: 'totalPrix',
      key: 'totalPrix',
      render: (prix) => `${prix} DH`, // Format the price
  },
  {
    title: 'État',
    dataIndex: 'etat',
    key: 'etat',
    render: (text, record) => (
      <>
        {record.etat ? (
          <Tag color="green">Payé</Tag>
        ) : (
          <Tag color="red">Non Payé</Tag>
        )}
      </>
    ),
  },
  {
      title: 'Number of Colis',
      key: 'countColis',
      render: (text, record) => record.colis.length,
  },
  {
    title: 'Options',
    key: 'options',
    render: (text, record) => (
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button icon={<FaRegFolderOpen/>} onClick={()=>navigate(`/dashboard/facture/detail/livreur/${record.code_facture}`)} type='primary'>
        </Button>
        {user?.role === 'admin' && !record.etat ? (
            <Button
              icon={<MdOutlinePayment />}
              onClick={() => setFacturePay(record?._id)}
              type="primary"
            />
          ) : null}
      </div>
    ),
},
];

const setFacturePay = (id) => {
  dispatch(setFactureEtat(id));
};

  return (
    <div>
      <TableDashboard
        id="_id"
        column={columns}
        data={facture}
        theme={theme}
      />
    </div>
  )
}

export default FactureLivreurTable