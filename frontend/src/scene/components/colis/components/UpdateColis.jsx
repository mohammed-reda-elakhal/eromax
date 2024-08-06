import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Checkbox, Button, Select } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

function UpdateColis({ colis }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (colis) {
      setFormData({ ...colis });
    } else {
      setFormData(null); // Reset formData when colis is null
    }
  }, [colis]);
  
  if (!formData) {
    return <p>Loading...</p>;
  }
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Handle form submission logic
    console.log('Updated colis data:', formData);
  };

  if (!formData) {
    return <p>Loading...</p>;
  }

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={formData}
    >
      <Form.Item label="Code Suivi" name="code_suivi">
        <Input 
          name="code_suivi" 
          value={formData.code_suivi} 
          onChange={handleInputChange} 
        />
      </Form.Item>
      <Form.Item label="Nom" name="nom">
        <Input 
          name="nom" 
          value={formData.nom} 
          onChange={handleInputChange} 
        />
      </Form.Item>
      <Form.Item label="Téléphone" name="tele">
        <Input 
          name="tele" 
          value={formData.tele} 
          onChange={handleInputChange} 
        />
      </Form.Item>
      <Form.Item label="Ville" name="ville">
        <Input 
          name="ville" 
          value={formData.ville} 
          onChange={handleInputChange} 
        />
      </Form.Item>
      <Form.Item label="Adresse" name="adresse">
        <Input 
          name="adresse" 
          value={formData.adresse} 
          onChange={handleInputChange} 
        />
      </Form.Item>
      <Form.Item label="Commentaire" name="commentaire">
        <TextArea 
          name="commentaire" 
          value={formData.commentaire} 
          onChange={handleInputChange} 
        />
      </Form.Item>
      <Form.Item label="Prix" name="prix">
        <InputNumber 
          name="prix" 
          value={formData.prix} 
          onChange={(value) => handleSelectChange(value, 'prix')} 
        />
      </Form.Item>
      <Form.Item label="Nature du Produit" name="nature_produit">
        <Input 
          name="nature_produit" 
          value={formData.nature_produit} 
          onChange={handleInputChange} 
        />
      </Form.Item>
      <Form.Item label="Statut" name="statut">
        <Select
          value={formData.statut}
          onChange={(value) => handleSelectChange(value, 'statut')}
        >
          <Option value="Attente de Ramassage">Attente de Ramassage</Option>
          <Option value="Ramassé">Ramassé</Option>
          <Option value="Expédié">Expédié</Option>
          <Option value="Reçu">Reçu</Option>
          <Option value="Mise en Distribution">Mise en Distribution</Option>
          <Option value="Livrée">Livrée</Option>
          <Option value="Annulé">Annulé</Option>
          <Option value="Refusée">Refusée</Option>
        </Select>
      </Form.Item>
      <Form.Item name="etat" valuePropName="checked">
        <Checkbox
          name="etat"
          checked={formData.etat}
          onChange={handleCheckboxChange}
        >
          État
        </Checkbox>
      </Form.Item>
      <Form.Item name="ouvrir" valuePropName="checked">
        <Checkbox
          name="ouvrir"
          checked={formData.ouvrir}
          onChange={handleCheckboxChange}
        >
          Ouvrir
        </Checkbox>
      </Form.Item>
      <Form.Item name="is_simple" valuePropName="checked">
        <Checkbox
          name="is_simple"
          checked={formData.is_simple}
          onChange={handleCheckboxChange}
        >
          Simple
        </Checkbox>
      </Form.Item>
      <Form.Item name="is_remplace" valuePropName="checked">
        <Checkbox
          name="is_remplace"
          checked={formData.is_remplace}
          onChange={handleCheckboxChange}
        >
          Remplace
        </Checkbox>
      </Form.Item>
      <Form.Item name="is_fragile" valuePropName="checked">
        <Checkbox
          name="is_fragile"
          checked={formData.is_fragile}
          onChange={handleCheckboxChange}
        >
          Fragile
        </Checkbox>
      </Form.Item>
      <Form.Item label="Remarque Livreur" name="remarque_livreur">
        <TextArea
          name="remarque_livreur"
          value={formData.remarque_livreur}
          onChange={handleInputChange}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Update Colis
        </Button>
      </Form.Item>
    </Form>
  );
}

export default UpdateColis;
