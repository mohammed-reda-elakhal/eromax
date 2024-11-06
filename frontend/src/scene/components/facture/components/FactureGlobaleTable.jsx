import React, { useEffect } from 'react'
import TableDashboard from '../../../global/TableDashboard'
import { useDispatch, useSelector } from 'react-redux';
import { getFacture, getFactureDetailsByClient, getFactureRamasser, setFactureEtat } from '../../../../redux/apiCalls/factureApiCalls';
import { Button, Tag } from 'antd';
import { FaRegFolderOpen } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlinePayment } from 'react-icons/md';

function FactureGlobaleTable({theme}) {

  const navigate = useNavigate()

  const dispatch = useDispatch();
  const { factureRamasser, user, store } = useSelector((state) => ({
    factureRamasser: state.facture.factureRamasser,
    user: state.auth.user,
    store: state.auth.store,
}));

  useEffect(() => {
    dispatch(getFactureRamasser())
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
      title: 'Store',
      dataIndex: 'storeName',
      key: 'storeName',
  },
  {
    title: 'Telephone',
    dataIndex: 'tele',
    key: 'tele',
  },
  {
    title: 'Nombre de Colis',
    dataIndex: 'count_colis',
    key: 'count_colis',
  },
  {
    title: 'Options',
    key: 'options',
    render: (text, record) => (
      <div style={{display:"flex" , gap:"10px"}}>
        <Button icon={<FaRegFolderOpen/>} onClick={()=>navigate(`/dashboard/facture/globale/${record.code_facture}`) } type='primary'>
        </Button>
      </div>
    ),
},
];

  return (
    <div>
      <TableDashboard
        id="_id"
        column={columns}
        data={factureRamasser}
        theme={theme}
      />
    </div>
  )
}

export default FactureGlobaleTable