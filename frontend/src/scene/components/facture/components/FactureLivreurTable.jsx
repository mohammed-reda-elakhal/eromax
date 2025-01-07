// FactureLivreurTable.jsx

import React, { useState, useEffect } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFacture,
  getFactureDetailsByLivreur,
  setFactureEtat,
  mergeFactures, // Importer la nouvelle action
} from '../../../../redux/apiCalls/factureApiCalls';
import { Button, Tag, Input, Switch, Modal, Row, Col } from 'antd';
import { FaRegFolderOpen, FaSyncAlt } from "react-icons/fa"; // Importer une icône de rafraîchissement
import moment from 'moment'; // Importer moment
import { toast } from 'react-toastify';

function FactureLivreurTable({ theme }) {
  const dispatch = useDispatch();
  const { facture, user } = useSelector((state) => ({
    facture: state.facture.facture,
    user: state.auth.user,
  }));

  const [searchText, setSearchText] = useState(''); 
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false); // État de chargement ajouté

  // Nouvel état pour les factures sélectionnées
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'admin') {
        await dispatch(getFacture('livreur'));
      } else if (user?.role === 'livreur') {
        await dispatch(getFactureDetailsByLivreur(user?._id));
      }
    } catch (error) {
      // La gestion des erreurs est déjà gérée dans les appels API
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les données au montage du composant ou lorsque l'utilisateur change
  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [dispatch, user]);

  // Définir la fonction filterData
  const filterData = (text) => {
    let filtered = [...facture];

    if (text) {
      filtered = filtered.filter((item) =>
        item.code_facture.toLowerCase().includes(text.toLowerCase()) ||
        item.type.toLowerCase().includes(text.toLowerCase()) ||
        (item.livreur &&
          item.livreur.nom.toLowerCase().includes(text.toLowerCase())) ||
        (item.store &&
          item.store.storeName.toLowerCase().includes(text.toLowerCase()))
      );
    }

    setFilteredData(filtered);
  };

  // Mettre à jour les données filtrées lorsque facture ou searchText change
  useEffect(() => {
    filterData(searchText);
  }, [facture, searchText]);

  // Fonction pour basculer l'état de paiement d'une facture
  const toggleFacturePay = (id) => {
    dispatch(setFactureEtat(id));
    // Le slice Redux et l'action mettront immédiatement à jour le store,
    // donc l'interface reflétera le nouvel état sans rechargement de la page.
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

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

  const columns = [
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => moment(text).format('DD/MM/YYYY HH:mm'),
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
      title: 'Livreur',
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
        // Si l'utilisateur est admin, afficher un switch pour toute facture livreur
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
          // Pour les non-admin ou autres conditions, afficher un tag
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
              window.open(url, '_blank'); // Ouvrir l'URL dans un nouvel onglet
            }}
            type="primary"
          />
        </div>
      ),
    },
  ];

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
        <Col span={16} style={{ textAlign: 'right' }}>
          <Button
            type="default"
            icon={<FaSyncAlt />}
            onClick={fetchData}
            style={{ marginRight: '10px' }}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<FaRegFolderOpen />}
            disabled={selectedRowKeys.length < 2}
            onClick={handleMerge}
          >
            Fusionner
          </Button>
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

export default FactureLivreurTable;
