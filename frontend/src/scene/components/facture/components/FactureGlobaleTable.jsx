import React, { useState, useEffect } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getFactureRamasser, setFactureEtat } from '../../../../redux/apiCalls/factureApiCalls';
import { Button, Tag, Input } from 'antd';
import { FaRegFolderOpen } from "react-icons/fa6";
import { MdOutlinePayment } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

function FactureGlobaleTable({ theme }) {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { factureRamasser, user } = useSelector((state) => ({
    factureRamasser: state.facture.factureRamasser,
    user: state.auth.user,
  }));

  const [searchText, setSearchText] = useState('');  // State for search input
  const [filteredData, setFilteredData] = useState(factureRamasser); // State for filtered data

  useEffect(() => {
    dispatch(getFactureRamasser());
    window.scrollTo(0, 0);
  }, [dispatch]);

  // Filter data based on searchText
  useEffect(() => {
    if (searchText) {
      setFilteredData(
        factureRamasser.filter(item =>
          item.code_facture.toLowerCase().includes(searchText.toLowerCase()) ||
          item.storeName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.tele.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    } else {
      setFilteredData(factureRamasser); // Reset the filtered data when search is cleared
    }
  }, [searchText, factureRamasser]);

  const setFacturePay = (id) => {
    dispatch(setFactureEtat(id));
  };

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
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            icon={<FaRegFolderOpen />}
            onClick={() => navigate(`/dashboard/facture/globale/${record.code_facture}`)}
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

export default FactureGlobaleTable;
