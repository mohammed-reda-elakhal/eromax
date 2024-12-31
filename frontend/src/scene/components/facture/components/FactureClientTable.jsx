import React, { useEffect, useState } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFacture,
  getFactureDetailsByClient,
  setFactureEtat,
} from '../../../../redux/apiCalls/factureApiCalls';
import { Input, DatePicker, Row, Col, Switch, Tag, Button } from 'antd';
import { FaRegFolderOpen } from 'react-icons/fa6';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

function FactureClientTable({ theme }) {
  const navigate = useNavigate();
  const [loading , setLoading] = useState(false)
  const dispatch = useDispatch();
  const { facture, user, store } = useSelector((state) => ({
    facture: state.facture.facture,
    user: state.auth.user,
    store: state.auth.store,
  }));

  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const fetchData = () =>{
    setLoading(true)
    if (user?.role === 'admin') {
      dispatch(getFacture('client')).then(setLoading(false))
    } else if (user?.role === 'client') {
      dispatch(getFactureDetailsByClient(store?._id)).then(setLoading(false));
    }
  }

  // Récupérer les factures au chargement du composant
  useEffect(() => {
    fetchData()
    window.scrollTo(0, 0);
  }, [dispatch, user, store]);

  // Mettre à jour les données filtrées lorsque les filtres changent
  useEffect(() => {
    filterData(searchText, startDate, endDate);
  }, [facture, searchText, startDate, endDate]);

  // Toggle etat for the selected facture
  const toggleFacturePay = (id) => {
    dispatch(setFactureEtat(id));
    // The Redux slice and action will immediately update the store,
    // so the UI will reflect the new etat without a page reload.
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const handleStartDateChange = (date) => {
    setStartDate(date ? date.startOf('day') : null);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date ? date.endOf('day') : null);
  };

  const filterData = (text, start, end) => {
    let filtered = [...facture];

    if (text) {
      filtered = filtered.filter((item) =>
        item.store?.storeName?.toLowerCase().includes(text)
      );
    }

    if (start || end) {
      filtered = filtered.filter((item) => {
        const itemDate = moment(item.createdAt);
        if (start && end) {
          return itemDate.isBetween(start, end, null, '[]');
        } else if (start) {
          return itemDate.isSameOrAfter(start);
        } else if (end) {
          return itemDate.isSameOrBefore(end);
        }
        return true;
      });
    }

    setFilteredData(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}/${date.getFullYear()} ${String(
      date.getHours()
    ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text, record) => <span>{formatDate(record.createdAt)}</span>,
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
      title: 'Store / Livreur',
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
      title: 'Nombre de Colis',
      key: 'countColis',
      render: (text, record) => record.colis.length,
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      render: (etat, record) => {
        if (record.type === 'client') {
          // Switch for admin only
          if (user?.role === 'admin') {
            return (
              <Switch
                checked={etat}
                checkedChildren="Payé"
                unCheckedChildren="Non Payé"
                onChange={() => toggleFacturePay(record._id)}
              />
            );
          } else {
            // If not admin, just show a tag
            return etat ? (
              <Tag color="green">Payé</Tag>
            ) : (
              <Tag color="red">Non Payé</Tag>
            );
          }
        } else {
          // If it's a 'livreur' type, display a tag (no toggle)
          return etat ? (
            <Tag color="green">Payé</Tag>
          ) : (
            <Tag color="red">Non Payé</Tag>
          );
        }
      },
    },
    {
      title: 'Options',
      key: 'options',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            icon={<FaRegFolderOpen />}
            onClick={() => {
              const url = `/dashboard/facture/detail/client/${record.code_facture}`;
              window.open(url, '_blank'); // Open the URL in a new tab
            }}
            type="primary"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col span={8}>
          <Input
            placeholder="Rechercher ..."
            value={searchText}
            onChange={handleSearchChange}
          />
        </Col>
      </Row>
      <TableDashboard
        id="_id"
        column={columns}
        data={filteredData}
        theme={theme}
        loading={loading}
      />
    </div>
  );
}

export default FactureClientTable;
