import React, { useEffect } from 'react'
import TableDashboard from '../../../global/TableDashboard'
import { useDispatch, useSelector } from 'react-redux';
import { getFacture, getFactureDetailsByClient, setFactureEtat } from '../../../../redux/apiCalls/factureApiCalls';
import { Button, Tag } from 'antd';
import { FaRegFolderOpen } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlinePayment } from 'react-icons/md';

function FactureClientTable({theme}) {

  const navigate = useNavigate()

  const dispatch = useDispatch();
  const { facture, user, store } = useSelector((state) => ({
    facture: state.facture.facture,
    user: state.auth.user,
    store: state.auth.store,
}));

  useEffect(() => {
    if(user?.role ==="admin"){
      dispatch(getFacture('client'));
    }else if(user?.role === "client"){
      dispatch(getFactureDetailsByClient(store?._id))
    }
    window.scrollTo(0, 0);
}, [dispatch]);

const setFacturePay = (id) =>{
  dispatch(setFactureEtat(id))
}

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
      title: 'Store',
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
      title: 'Number of Colis',
      key: 'countColis',
      render: (text, record) => record.colis.length,
  },
  {
    title: 'Etat',
    dataIndex: 'etat',
    key: 'etat',
    render: (text,record) =>(
      <>
        {
          record.etat ?
          <Tag color='green'>
            Payer
          </Tag>
          :
          <Tag color='red'>
            Non Payer
          </Tag>
        }
      </>
      
    ), // Format the price
  },
  {
    title: 'Options',
    key: 'options',
    render: (text, record) => (
      <div style={{display:"flex" , gap:"10px"}}>
        <Button icon={<FaRegFolderOpen/>} onClick={()=>navigate(`/dashboard/facture/detail/client/${record.code_facture}`)} type='primary'>
        </Button>
        {
          user?.role === "admin" ?
          <Button icon={<MdOutlinePayment />} onClick={()=>setFacturePay(record?._id)} type='primary'/>
          :''
        }
        
      </div>
    ),
},
];

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

export default FactureClientTable