import React, { useState, useEffect } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getFacture, getFactureDetailsByLivreur, setFactureEtat } from '../../../../redux/apiCalls/factureApiCalls';
import { Button, Tag, Input } from 'antd';
import { FaRegFolderOpen } from "react-icons/fa6";
import { MdOutlinePayment } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

function FactureLivreurTable({ theme }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { facture, user } = useSelector((state) => ({
    facture: state.facture.facture,
    user: state.auth.user,
  }));

  const [searchText, setSearchText] = useState(''); // State for search input
  const [filteredData, setFilteredData] = useState(facture); // State to store filtered data

  useEffect(() => {
    if (user?.role === "admin") {
      dispatch(getFacture('livreur'));
    } else if (user?.role === "livreur") {
      dispatch(getFactureDetailsByLivreur(user?._id));
    }
    window.scrollTo(0, 0);
  }, [dispatch, user]);

  // This effect filters the data based on the searchText state
  useEffect(() => {
    if (searchText) {
      setFilteredData(
        facture.filter(item =>
          item.code_facture.toLowerCase().includes(searchText.toLowerCase()) ||
          item.type.toLowerCase().includes(searchText.toLowerCase()) ||
          (item.livreur && item.livreur.nom.toLowerCase().includes(searchText.toLowerCase())) ||
          (item.store && item.store.storeName.toLowerCase().includes(searchText.toLowerCase()))
        )
      );
    } else {
      setFilteredData(facture); // Reset the filtered data when search is cleared
    }
  }, [searchText, facture]);

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
        <>{record.etat ? <Tag color="green">Payé</Tag> : <Tag color="red">Non Payé</Tag>}</>
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
          <Button
            icon={<FaRegFolderOpen />}
            onClick={() => {
              const url = `/dashboard/facture/detail/livreur/${record.code_facture}`;
              window.open(url, '_blank'); // Open the URL in a new tab
            }}
            type="primary"
          />
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

export default FactureLivreurTable;
