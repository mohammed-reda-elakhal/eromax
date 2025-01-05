import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTarifLivreur,
  updateTarifLivreur,
} from "../../../../redux/apiCalls/tarifLivreurApiCalls"; 
import { Form, Input, Button, Select, Spin } from "antd";
import { getLivreurList } from "../../../../redux/apiCalls/livreurApiCall";
import { getAllVilles } from "../../../../redux/apiCalls/villeApiCalls";
import { toast } from "react-toastify";

function TarifLivreurForm({ editMode, selectedTarifLivreur, onClose }) {
  const dispatch = useDispatch();

  const [tarif, setTarif] = useState("");
  const [livreur, setLivreur] = useState("");
  const [ville, setVille] = useState("");
  const [loading, setLoading] = useState(false);

  // You might store these in Redux
  const { livreurList: storeLivreurList, villes: storeVilleList } = useSelector(
    (state) => ({
      livreurList: state.livreur.livreurList || [],
      villes: state.ville.villes || [],
    })
  );

  // Local arrays for populating the selects
  const [livreurList, setLivreurList] = useState([]);
  const [villeList, setVilleList] = useState([]);

  useEffect(() => {
    // If needed, fetch from server if not already loaded
    if (storeLivreurList.length === 0) {
      dispatch(getLivreurList());
    }
    if (storeVilleList.length === 0) {
      dispatch(getAllVilles());
    }

    // Update local states
    setLivreurList(storeLivreurList);
    setVilleList(storeVilleList);

    if (editMode && selectedTarifLivreur) {
      setTarif(selectedTarifLivreur.tarif ?? "");
      setLivreur(selectedTarifLivreur.id_livreur?._id ?? "");
      setVille(selectedTarifLivreur.id_ville?._id ?? "");
    } else {
      // Reset if not editing
      setTarif("");
      setLivreur("");
      setVille("");
    }
  }, [
    dispatch,
    editMode,
    selectedTarifLivreur,
    storeLivreurList,
    storeVilleList,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Build the payload
    const payload = {
      tarif,
      livreur,
      ville,
    };

    if (editMode) {
      dispatch(updateTarifLivreur(selectedTarifLivreur._id, payload));
      toast.success("TarifLivreur updated successfully!");
    } else {
      dispatch(createTarifLivreur(payload));
      toast.success("TarifLivreur added successfully!");
    }
    setLoading(false);
    onClose(); // close the drawer
  };

  return (
    <div>
      {loading && <Spin style={{ marginBottom: 16 }} />}
      <Form onSubmitCapture={handleSubmit} layout="vertical">
        {/* TARIF FIELD */}
        <Form.Item label="Tarif" required>
          <Input
            type="number"
            value={tarif}
            onChange={(e) => setTarif(e.target.value)}
            placeholder="Enter tarif amount"
            required
          />
        </Form.Item>

        {/* LIVREUR SELECT */}
        <Form.Item label="Livreur" required>
          <Select
            showSearch
            value={livreur}
            onChange={(value) => setLivreur(value)}
            placeholder="Select Livreur"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children
                ?.toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            style={{ width: "100%" }}
            required
          >
            {livreurList.map((item) => (
              <Select.Option key={item._id} value={item._id}>
                {item.nom} {item.prenom}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* VILLE SELECT */}
        <Form.Item label="Ville" required>
          <Select
            showSearch
            value={ville}
            onChange={(value) => setVille(value)}
            placeholder="Select Ville"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children
                ?.toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            style={{ width: "100%" }}
            required
          >
            {villeList.map((item) => (
              <Select.Option key={item._id} value={item._id}>
                {item.nom}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {editMode ? "Update" : "Add"} TarifLivreur
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default TarifLivreurForm;
