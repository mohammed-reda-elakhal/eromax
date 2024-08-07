import { Avatar, Table, Button } from 'antd';
import React from 'react';
import { AiFillProduct } from 'react-icons/ai';
import { PlusOutlined } from '@ant-design/icons';

function ProduitColisTable({ produit, theme, onAddVariant }) {
  const handleAddVariant = (product, variant) => {
    onAddVariant(product, variant);
  };

  const columns = [
    {
      title: 'Produit',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Photo',
      dataIndex: 'image',
      key: 'image',
      render: () => (
        <Avatar size={50} icon={<AiFillProduct />} />
      ),
    },
    {
      title: 'Variantes',
      dataIndex: 'variant',
      key: 'variant',
      render: (text, record) => (
        record.is_variant ? 
          record.variant.map(v => (
            <ul key={v.id} style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center' , margin:'16px 0' }}>
                
                {v.nom}
                <Button 
                  icon={<PlusOutlined />} 
                  size="small" 
                  onClick={() => handleAddVariant(record, v)}
                  style={{ marginRight: 8 }}
                  className='btn-add-produit'
                />
              </li>
            </ul>
          ))
        :
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{
            backgroundColor: '#4096ff',
            color: 'white',
            padding: '5px',
            borderRadius: '3px',
            display: 'inline-block',
            whiteSpace: 'pre-wrap',
            textAlign: 'center'
          }}>
            Aucun Variantes
          </span>
          <Button 
            icon={<PlusOutlined />} 
            size="small" 
            onClick={() => handleAddVariant(record, null)}
            style={{ marginRight: 8 }}
            className='btn-add-produit'
          />
        </div>
      )
    },
  ];

  return (
    <div className='produit-table'>
        <h2>List Produits :</h2>
      <Table
        columns={columns}
        dataSource={produit}
        rowKey="id"
        className={theme === 'dark' ? 'table-dark' : 'table-light'}
      />
    </div>
  );
}

export default ProduitColisTable;
