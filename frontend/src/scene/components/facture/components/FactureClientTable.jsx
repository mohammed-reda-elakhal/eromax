import React, { useEffect, useState } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getFacture, getFactureDetailsByClient, setFactureEtat } from '../../../../redux/apiCalls/factureApiCalls';
import { Button, Tag, Input, DatePicker, Row, Col } from 'antd';
import { FaRegFolderOpen } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlinePayment } from 'react-icons/md';
import moment from 'moment';

function FactureClientTable({ theme }) {
  const navigate = useNavigate();
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

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(getFacture('client'));
    } else if (user?.role === 'client') {
      dispatch(getFactureDetailsByClient(store?._id));
    }
    window.scrollTo(0, 0);
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(facture); // Initialize filtered data
  }, [facture]);

  // Handle facture payment update
  const setFacturePay = (id) => {
    dispatch(setFactureEtat(id));
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    filterData(value, startDate, endDate);
  };

  // Handle start date change
  const handleStartDateChange = (date) => {
    const start = date ? moment(date).format('YYYY-MM-DD') : null;
    setStartDate(start);
    filterData(searchText, start, endDate);
  };

  // Handle end date change
  const handleEndDateChange = (date) => {
    const end = date ? moment(date).format('YYYY-MM-DD') : null;
    setEndDate(end);
    filterData(searchText, startDate, end);
  };

  // Filter data based on search text and date range
  const filterData = (text, start, end) => {
    let filtered = facture;

    if (text) {
      filtered = filtered.filter((item) =>
        item.store?.storeName?.toLowerCase().includes(text)
      );
    }

    if (start && end) {
      filtered = filtered.filter((item) => {
        const itemDate = moment(item.createdAt).format('YYYY-MM-DD');
        return itemDate >= start && itemDate <= end;
      });
    }

    setFilteredData(filtered);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
      title: 'Store',
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
      title: 'Number of Colis',
      key: 'countColis',
      render: (text, record) => record.colis.length,
    },
    {
      title: 'Etat',
      dataIndex: 'etat',
      key: 'etat',
      render: (text, record) => (
        <>
          {record.etat ? (
            <Tag color="green">Payer</Tag>
          ) : (
            <Tag color="red">Non Payer</Tag>
          )}
        </>
      ),
    },
    {
      title: 'Options',
      key: 'options',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            icon={<FaRegFolderOpen />}
            onClick={() =>
              navigate(`/dashboard/facture/detail/client/${record.code_facture}`)
            }
            type="primary"
          />
          {user?.role === 'admin' ? (
            <Button
              icon={<MdOutlinePayment />}
              onClick={() => setFacturePay(record?._id)}
              type="primary"
            />
          ) : (
            ''
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col span={8}>
          <Input
            placeholder="Search Store Name"
            value={searchText}
            onChange={handleSearchChange}
          />
        </Col>
        <Col span={8}>
          <DatePicker
            onChange={handleStartDateChange}
            style={{ width: '100%' }}
            placeholder="Start Date"
          />
        </Col>
        <Col span={8}>
          <DatePicker
            onChange={handleEndDateChange}
            style={{ width: '100%' }}
            placeholder="End Date"
          />
        </Col>
      </Row>
      <TableDashboard id="_id" column={columns} data={filteredData} theme={theme} />
    </div>
  );
}

export default FactureClientTable;
