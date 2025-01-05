import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllTarifLivreurs,
  deleteTarifLivreur,
  getTarifLivreurByLivreur,
} from "../../../../redux/apiCalls/tarifLivreurApiCalls";
import { Table, Button, Space, Drawer, Input } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import TarifLivreurForm from "./TarifLivreurForm";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

function TarifLivreurTable() {
  const { idLivreur } = useParams(); // If you have a param for livreur
  const dispatch = useDispatch();

  const { tarifLivreurs, loading } = useSelector((state) => state.tarifLivreur);

  // Drawer & Edit states
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTarifLivreur, setSelectedTarifLivreur] = useState(null);

  // Filter input & filtered data
  const [filterText, setFilterText] = useState("");
  const [filteredData, setFilteredData] = useState(tarifLivreurs);

  // Fetch data on mount or when idLivreur changes
  useEffect(() => {
    if (idLivreur) {
      dispatch(getTarifLivreurByLivreur(idLivreur));
    } else {
      dispatch(getAllTarifLivreurs());
    }
  }, [dispatch, idLivreur]);

  // Update filtered data whenever tarifLivreurs or filterText changes
  useEffect(() => {
    const filtered = tarifLivreurs.filter((item) => {
      // Safely check if required fields exist
      if (
        !item ||
        typeof item.tarif === "undefined" ||
        !item.id_livreur ||
        !item.id_ville
      ) {
        return false;
      }

      // Convert all to strings for text-based filtering
      const tarifStr = item.tarif.toString();
      const livreurStr = `${item.id_livreur.nom} ${item.id_livreur.prenom}`.toLowerCase();
      const villeStr = item.id_ville.nom.toLowerCase();
      const searchText = filterText.toLowerCase();

      // Return true if any field includes the filter text
      return (
        tarifStr.includes(searchText) ||
        livreurStr.includes(searchText) ||
        villeStr.includes(searchText)
      );
    });
    setFilteredData(filtered);
  }, [filterText, tarifLivreurs]);

  // Deletion
  const handleDelete = (id) => {
    dispatch(deleteTarifLivreur(id));
    toast.success("TarifLivreur deleted successfully!");
  };

  // Open Drawer to Add
  const openDrawerForAdd = () => {
    setEditMode(false);
    setSelectedTarifLivreur(null);
    setVisible(true);
  };

  // Open Drawer to Edit
  const openDrawerForEdit = (tarifLivreur) => {
    setEditMode(true);
    setSelectedTarifLivreur(tarifLivreur);
    setVisible(true);
  };

  const handleCloseDrawer = () => {
    setVisible(false);
    setEditMode(false);
    setSelectedTarifLivreur(null);
  };

  // Refresh the data
  const handleRefresh = () => {
    if (idLivreur) {
        dispatch(getTarifLivreurByLivreur(idLivreur));
    } else {
        dispatch(getAllTarifLivreurs());
    }
    toast.info("Data refreshed!");
  };

  // Table Columns
  const columns = [
    {
      title: "Tarif",
      dataIndex: "tarif",
      key: "tarif",
      // You can also use "render" if you want special formatting
    },
    {
      title: "Livreur",
      dataIndex: "livreur",
      key: "livreur",
      render: (_, record) => {
        if (!record.id_livreur) return "N/A";
        return `${record.id_livreur.nom} ${record.id_livreur.prenom}`;
      },
    },
    {
      title: "Ville",
      dataIndex: "ville",
      key: "ville",
      render: (_, record) => {
        if (!record.id_ville) return "N/A";
        return record.id_ville.nom;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => openDrawerForEdit(record)}>
            Update
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openDrawerForAdd}>
          Add TarifLivreur
        </Button>
        <Button type="default" icon={<ReloadOutlined />} onClick={handleRefresh}>
          Refresh
        </Button>
      </Space>

      <br />

      {/* Filter Input */}
      <Input
        placeholder="Filter by Tarif, Livreur, or Ville"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{ marginBottom: 16, width: 300 }}
        allowClear
      />

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="_id"
        pagination={false}
      />

      <Drawer
        title={editMode ? "Update TarifLivreur" : "Add TarifLivreur"}
        visible={visible}
        onClose={handleCloseDrawer}
        width={600}
      >
        <TarifLivreurForm
          editMode={editMode}
          selectedTarifLivreur={selectedTarifLivreur}
          onClose={handleCloseDrawer}
        />
      </Drawer>
    </div>
  );
}

export default TarifLivreurTable;
