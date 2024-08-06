import React, { useState } from 'react';
import ColisData from '../../../../data/colis.json';
import ProduitData from '../../../../data/produit.json';
import ProduitColisTable from './ProduitColisTable';
import { Table, Button } from 'antd';
import { AiOutlineDelete } from 'react-icons/ai';

function ProduitColisForm({ theme }) {
  const colis = ColisData[1];
  const [selectedItems, setSelectedItems] = useState([]);

  const handleAddVariant = (product, variant) => {
    const newItem = { product, variant };
    setSelectedItems((prevItems) => [...prevItems, newItem]);
  };

  const handleDeleteItem = (itemToDelete) => {
    setSelectedItems((prevItems) =>
      prevItems.filter(
        (item) =>
          item.product.id !== itemToDelete.product.id ||
          (item.variant && item.variant.id !== itemToDelete.variant.id)
      )
    );
  };

  const selectedColumns = [
    {
      title: 'Produit',
      dataIndex: ['product', 'nom'],
      key: 'nom',
    },
    {
      title: 'Variante',
      dataIndex: ['variant', 'nom'],
      key: 'variant',
      render: (text, record) => (record.variant ? record.variant.nom : 'N/A'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button
          type="danger"
          icon={<AiOutlineDelete />}
          onClick={() => handleDeleteItem(record)}
          className='btn-delete'
        />
      ),
    },
  ];

  return (
    <div className='produit-colis'>
      <div className="colis-info">
        <div className='colis-info-content'>
          <p><strong>Code Suivi:</strong> {colis.code_suivi}</p>
          <p><strong>Dernière Mise à Jour:</strong> {colis.derniere_mise_a_jour}</p>
          <p><strong>Destinataire:</strong> {colis.destinataire}</p>
          <p><strong>Téléphone:</strong> {colis.telephone}</p>
          <p><strong>État:</strong> {colis.etat ? 'Payée' : 'Non Payée'}</p>
          <p><strong>Statut:</strong> {colis.statut}</p>
          <p><strong>Date de Livraison:</strong> {colis.date_livraison}</p>
          <p><strong>Ville:</strong> {colis.ville}</p>
          <p><strong>Prix:</strong> {colis.prix}</p>
          <p><strong>Nature de Produit:</strong> {colis.nature_de_produit}</p>
        </div>
      </div>
      <div className="tables-produits">
        <ProduitColisTable produit={ProduitData} theme={theme} onAddVariant={handleAddVariant} />
        <div className="produit-table">
            <h2>Produits Sélectionnés :</h2>
            <Table
            columns={selectedColumns}
            dataSource={selectedItems}
            rowKey={(record) => `${record.product.id}-${record.variant ? record.variant.id : 'no-variant'}`}
            className={theme === 'dark' ? 'table-dark' : 'table-light'}
            />
        </div>
      </div>
      
      <button className='btn-dashboard'>
        Prét pour la preparation
      </button>
    </div>
  );
}

export default ProduitColisForm;
