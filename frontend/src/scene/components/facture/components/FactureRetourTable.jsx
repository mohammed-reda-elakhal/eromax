import React, { useEffect } from 'react'
import TableDashboard from '../../../global/TableDashboard'
import { useDispatch, useSelector } from 'react-redux';
import { getFacture, getFactureDetailsByClient, getFactureRamasser, getFactureRetour, setFactureEtat } from '../../../../redux/apiCalls/factureApiCalls';
import { Button, Tag } from 'antd';
import { FaRegFolderOpen } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlinePayment } from 'react-icons/md';

function FactureRetourTable({theme}) {

  const navigate = useNavigate()

  const dispatch = useDispatch();
  const { factureRetour, user, store } = useSelector((state) => ({
    factureRetour: state.facture.factureRetour,
    user: state.auth.user,
    store: state.auth.store,
}));

  useEffect(() => {
    dispatch(getFactureRetour())
    window.scrollTo(0, 0);
}, [dispatch]);



const columns = [
    {
        title: 'Date Created',
        dataIndex: 'date_created',
        key: 'date_created',
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
    },
    {
      title: 'Utilisateur',
      dataIndex: 'user',
      render: (text, record) => (
          <>
              {(() => {
                  switch (record.type) {
                      case "client":
                          return <p>{record?.store?.storeName}</p>;
                      case "livreur":
                          // Access the first item in the 'livreur' array and display 'nom'
                          return <p>{record?.livreur[0]?.nom}</p>;
                      default:
                          return <p>Unknown Type</p>; // Optional: Handle unexpected types
                  }
              })()}
          </>
      )
    },
    {
      title: 'Nombre de Colis',
      dataIndex: 'colis_count',
      key: 'colis_count',
    },
    {
      title: 'Options',
      key: 'options',
      render: (text, record) => (
        <div style={{display:"flex" , gap:"10px"}}>
          <Button icon={<FaRegFolderOpen/>} onClick={()=>navigate(`/dashboard/facture/retour/${record.code_facture}`) } type='primary'>
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
        data={factureRetour}
        theme={theme}
      />
    </div>
  )
}

export default FactureRetourTable