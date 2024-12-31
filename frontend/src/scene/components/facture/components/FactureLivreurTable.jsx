import React, { useState, useEffect } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFacture,
  getFactureDetailsByLivreur,
  setFactureEtat,
} from '../../../../redux/apiCalls/factureApiCalls';
import { Button, Tag, Input, Switch } from 'antd';
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

  const [searchText, setSearchText] = useState(''); 
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(getFacture('livreur'));
    } else if (user?.role === 'livreur') {
      dispatch(getFactureDetailsByLivreur(user?._id));
    }
    window.scrollTo(0, 0);
  }, [dispatch, user]);

  useEffect(() => {
    setFilteredData(facture);
  }, [facture]);

  useEffect(() => {
    if (searchText) {
      setFilteredData(
        facture.filter((item) =>
          item.code_facture.toLowerCase().includes(searchText.toLowerCase()) ||
          item.type.toLowerCase().includes(searchText.toLowerCase()) ||
          (item.livreur &&
            item.livreur.nom.toLowerCase().includes(searchText.toLowerCase())) ||
          (item.store &&
            item.store.storeName.toLowerCase().includes(searchText.toLowerCase()))
        )
      );
    } else {
      setFilteredData(facture);
    }
  }, [searchText, facture]);

  const toggleFacturePay = (id) => {
    dispatch(setFactureEtat(id));
  };

  const columns = [
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString(),
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
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1),
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
      render: (prix) => `${prix} DH`,
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      render: (etat, record) => {
        // If user is admin, show a toggle switch for any livreur invoice
        if (record.type === 'livreur' && user?.role === 'admin') {
          return (
            <Switch
              checked={etat}
              checkedChildren="Payé"
              unCheckedChildren="Non Payé"
              onChange={() => toggleFacturePay(record._id)}
            />
          );
        } else {
          // For non-admin or other conditions, display a Tag
          return etat ? <Tag color="green">Payé</Tag> : <Tag color="red">Non Payé</Tag>;
        }
      },
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
              window.open(url, '_blank');
            }}
            type="primary"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Input
        placeholder="Rechercher ..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: '20px', width: '300px' }}
      />
      <TableDashboard
        id="_id"
        column={columns}
        data={filteredData}
        theme={theme}
      />
    </div>
  );
}

export default FactureLivreurTable;
