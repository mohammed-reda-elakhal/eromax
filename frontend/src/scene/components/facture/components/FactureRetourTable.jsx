import React, { useState, useEffect } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getFactureRetour, setFactureEtat } from '../../../../redux/apiCalls/factureApiCalls';
import { Button, Tag, Input } from 'antd';
import { FaRegFolderOpen } from "react-icons/fa6";
import { MdOutlinePayment } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

function FactureRetourTable({ theme }) {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { factureRetour, user } = useSelector((state) => ({
    factureRetour: state.facture.factureRetour,
    user: state.auth.user,
  }));

  const [searchText, setSearchText] = useState(''); // State for search input
  const [filteredData, setFilteredData] = useState(factureRetour); // State for filtered data

  useEffect(() => {
    dispatch(getFactureRetour());
    window.scrollTo(0, 0);
  }, [dispatch]);

  // Filter data based on searchText
  useEffect(() => {
    if (searchText) {
      setFilteredData(
        factureRetour.filter(item =>
          item.code_facture.toLowerCase().includes(searchText.toLowerCase()) ||
          item.type.toLowerCase().includes(searchText.toLowerCase()) ||
          (item.store && item.store.storeName.toLowerCase().includes(searchText.toLowerCase())) ||
          (item.livreur && item.livreur[0]?.nom.toLowerCase().includes(searchText.toLowerCase()))
        )
      );
    } else {
      setFilteredData(factureRetour); // Reset the filtered data when search is cleared
    }
  }, [searchText, factureRetour]);

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
      ),
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
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            icon={<FaRegFolderOpen />}
            onClick={() => navigate(`/dashboard/facture/retour/${record.code_facture}`)}
            type="primary"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Search input */}
      <Input
        placeholder="Rechercher ..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: '20px', width: '300px' }}
      />

      {/* Table with filtered data */}
      <TableDashboard
        id="_id"
        column={columns}
        data={filteredData} // Pass filtered data to the table
        theme={theme}
      />
    </div>
  );
}

export default FactureRetourTable;
