import React, { useState, useEffect } from 'react';
import { Avatar, Table } from 'antd';
import { FaPenFancy } from "react-icons/fa6";
import ProduitData from '../../../../data/produit.json';
import { Link } from 'react-router-dom';
import { IoArchive } from "react-icons/io5";
import { AiFillProduct } from "react-icons/ai";

function ProduitTable({ theme }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(ProduitData);
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
        title: 'Photo',
        dataIndex: 'image',
        key: 'image',
        render:()=> (
            <Avatar size={50} icon={<AiFillProduct />} />
        )
      },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Catégorie',
      dataIndex: 'categorie',
      key: 'categorie',
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      render: (text, record) => (
        <span style={{
          backgroundColor: record.etat ? 'green' : '#4096ff',
          color: 'white',
          padding: '5px',
          borderRadius: '3px',
          display: 'inline-block',
          whiteSpace: 'pre-wrap',
          textAlign: 'center'
        }}>
          {record.etat ? 'Reçu' : 'Non reçu'}
        </span>
      ),
    },
    {
      title: 'Variantes',
      dataIndex: 'variant',
      key: 'variant',
      render: (text , record) => (
        record.is_variant ? 
          record.variant.map(v => (
            <ul key={v.id}>
              <li>
                  {v.nom}
              </li>
            </ul>
          ))
        :
        <span style={{
          backgroundColor:'#4096ff',
          color: 'white',
          padding: '5px',
          borderRadius: '3px',
          display: 'inline-block',
          whiteSpace: 'pre-wrap',
          textAlign: 'center'
        }}>
          Auccun Variantes
        </span>
      )
    },
    {
        title: 'Quantité',
        dataIndex: 'variant',
        key: 'variant',
        render: (text , record) => (
          record.is_variant ? 
            record.variant.map(v => (
              <ul key={v.id}>
                <li>
                    {v.qte}
                </li>
              </ul>
            ))
          :
          record.qte
        )
      },
    {
      title: 'ACTIONS',
      key: 'action',
      render: (text, record) => (
        <div className='table-option'>
          <Link to={`/dashboard/update-produit${record.id}`} className='btn-dashboard'>
            <FaPenFancy />
          </Link>
          <Link  className='btn-dashboard' onClick={()=>handleArchive(record.id)}>
            <IoArchive />
          </Link>
        </div>
      ),
    },
  ];

  const handleArchive = (id) => {
    const produit = data.find(item => item.id === id);
    console.log(produit);
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        className={theme === 'dark' ? 'table-dark' : 'table-light'}
      />
    </>
  );
}

export default ProduitTable;
