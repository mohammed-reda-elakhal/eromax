// FactureClientTable.jsx

import React, { useEffect, useState } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFacture,
  getFactureDetailsByClient,
  setFactureEtat,
  mergeFactures, // Importer la nouvelle action
} from '../../../../redux/apiCalls/factureApiCalls';
import { Input, DatePicker, Row, Col, Switch, Tag, Button, Modal } from 'antd';
import { FaRegFolderOpen, FaSyncAlt } from 'react-icons/fa'; // Importer une icône de rafraîchissement
import moment from 'moment'; // Importer moment
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const { RangePicker } = DatePicker;

function FactureClientTable({ theme }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // État de chargement ajouté
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
  
  // Nouvel état pour les factures sélectionnées
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'admin') {
        await dispatch(getFacture('client'));
      } else if (user?.role === 'client') {
        await dispatch(getFactureDetailsByClient(store?._id));
      }
    } catch (error) {
      // La gestion des erreurs est déjà gérée dans les appels API
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les factures au montage du composant ou lorsque l'utilisateur ou le store change
  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [dispatch, user, store]);

  // Définir la fonction filterData
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

  // Mettre à jour les données filtrées lorsque facture ou les filtres changent
  useEffect(() => {
    filterData(searchText.toLowerCase(), startDate, endDate);
  }, [facture, searchText, startDate, endDate]);

  // Fonction pour basculer l'état de paiement d'une facture
  const toggleFacturePay = (id) => {
    dispatch(setFactureEtat(id));
    // Le slice Redux et l'action mettront immédiatement à jour le store,
    // donc l'interface reflétera le nouvel état sans rechargement de la page.
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  // Définir correctement handleDateRangeChange
  const handleDateRangeChange = (dates) => {
    if (dates) {
      setStartDate(moment(dates[0]).startOf('day'));
      setEndDate(moment(dates[1]).endOf('day'));
    } else {
      setStartDate(null);
      setEndDate(null);
    }
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
          // Switch pour les admins uniquement
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
            // Si pas admin, afficher simplement un tag
            return etat ? (
              <Tag color="green">Payé</Tag>
            ) : (
              <Tag color="red">Non Payé</Tag>
            );
          }
        } else {
          // Si c'est un type 'livreur', afficher un tag (pas de toggle)
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
              window.open(url, '_blank'); // Ouvrir l'URL dans un nouvel onglet
            }}
            type="primary"
          />
        </div>
      ),
    },
  ];

  // Gestion de la sélection des lignes
  const onSelectChange = (selectedKeys) => {
    setSelectedRowKeys(selectedKeys);
  };

  // Fonction pour fusionner les factures sélectionnées
  const handleMerge = () => {
    if (selectedRowKeys.length < 2) {
      toast.error("Veuillez sélectionner au moins deux factures à fusionner.");
      return;
    }

    // Confirmer l'action de fusion
    Modal.confirm({
      title: 'Confirmer la fusion',
      content: `Voulez-vous vraiment fusionner ${selectedRowKeys.length} factures ?`,
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        try {
          // Récupérer les codes des factures sélectionnées
          const selectedFactures = facture.filter(f => selectedRowKeys.includes(f._id));
          const factureCodes = selectedFactures.map(f => f.code_facture);

          await dispatch(mergeFactures(factureCodes));

          // Rafraîchir les données après la fusion
          await fetchData();

          // Réinitialiser la sélection après la fusion
          setSelectedRowKeys([]);
        } catch (error) {
          // La gestion des erreurs est déjà gérée dans les appels API
        }
      }
    });
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px', alignItems: 'center' }}>
        <Col span={8}>
          <Input
            placeholder="Rechercher ..."
            value={searchText}
            onChange={handleSearchChange}
            allowClear
          />
        </Col>
        <Col span={8}>
          <RangePicker onChange={handleDateRangeChange} />
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Button
            type="default"
            icon={<FaSyncAlt />}
            onClick={fetchData}
            style={{ marginRight: '10px' }}
            loading={loading}
          >
            Refresh
          </Button>
          {
            user?.role === 'admin' && (
              <Button
                type="primary"
                icon={<FaRegFolderOpen />}
                disabled={selectedRowKeys.length < 2}
                onClick={handleMerge}
              >
                Fusionner
              </Button>
            )
          }
          
        </Col>
      </Row>
      <TableDashboard
        id="_id"
        column={columns}
        data={filteredData}
        theme={theme}
        loading={loading} // Passer l'état de chargement
        onSelectChange={onSelectChange}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
        }}
      />
    </div>
  );
}

export default FactureClientTable;
