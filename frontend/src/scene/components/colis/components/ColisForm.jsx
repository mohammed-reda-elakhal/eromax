import React, { useEffect, useState } from 'react';
import { InfoCircleOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { Input, Tooltip, Select, Col, Row, Checkbox } from 'antd';
import { MdOutlineWidgets } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createColis } from '../../../../redux/apiCalls/colisApiCalls';
import { getAllVilles } from '../../../../redux/apiCalls/villeApiCalls'; // API call to fetch villes
import { toast } from 'react-toastify';

const { TextArea } = Input;

const ColisTypes = [
  { id: 1, name: 'Colis Simple' },
  { id: 2, name: 'Colis du Stock' },
];

const ColisOuvrir = [
  { id: 1, name: 'Ouvrir Colis', value: true },
  { id: 2, name: 'Ne pas Ouvrir Colis', value: false },
];

const NumericInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    const inputValue = e.target.value;
    const reg = /^-?\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
      onChange(inputValue);
    }
  };

  const handleBlur = () => {
    let tempValue = value;
    if (value.endsWith('.') || value === '-') {
      tempValue = value.slice(0, -1);
    }
    onChange(tempValue.replace(/0*(\d+)/, '$1'));
  };

  const title = value ? (
    <span className="numeric-input-title">{value !== '-' ? value : '-'}</span>
  ) : 'Tél Exemple : 0655124822';

  return (
    <Tooltip trigger={['focus']} title={title} placement="topLeft" overlayClassName="numeric-input">
      <Input
        size="large"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Numéro"
        maxLength={10}
        prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
        suffix={
          <Tooltip title="Entrer Numéro de téléphone de destinataire">
            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
          </Tooltip>
        }
      />
    </Tooltip>
  );
};

function ColisForm({ theme, type }) {
  const [formData, setFormData] = useState({
    nom: '',
    tele: '',
    ville: '', // Ville will be selected from the fetched villes
    adress: '',
    commentaire: '',
    prix: '',
    produit: '',
    colisType: ColisTypes[0].name,
    remplaceColis: false,
    ouvrirColis: true,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch villes from Redux store
  const { villes } = useSelector((state) => state.ville);

  useEffect(() => {
    // Fetch villes on component mount
    dispatch(getAllVilles());
  }, [dispatch]);

  // Set the initial colis type based on the 'type' prop
  useEffect(() => {
    if (type === 'simple') {
      setFormData(prev => ({ ...prev, colisType: ColisTypes[0].name }));
    } else if (type === 'stock') {
      setFormData(prev => ({ ...prev, colisType: ColisTypes[1].name }));
    }
  }, [type]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCleanData = () => {
    setFormData({
      nom: '',
      tele: '',
      ville: '', // Reset ville
      adress: '',
      commentaire: '',
      prix: '',
      produit: '',
      colisType: ColisTypes[0].name,
      remplaceColis: false,
      ouvrirColis: true,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const { nom, tele, ville, adress, commentaire, prix, produit, ouvrirColis, remplaceColis } = formData;

    // Ensure ville is selected
    if (!ville) {
      toast.error("Veuillez sélectionner une ville.");
      return;
    }

    const colis = {
      nom,
      tele,
      ville, // This will now be the ville ID
      adresse: adress,
      commentaire,
      prix,
      nature_produit: produit,
      ouvrir: ouvrirColis,
      is_remplace: remplaceColis,
    };

    dispatch(createColis(colis));
    navigate('/dashboard/list-colis');
  };

  const darkStyle = {
    backgroundColor: 'transparent',
    color: '#fff',
    borderColor: 'gray',
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="colis-form-header">
        <button>
          <MdOutlineWidgets />
          Nouveau Colis
        </button>
        <Select
          options={ColisTypes.map(option => ({ value: option.name, label: option.name }))}
          value={formData.colisType}
          onChange={value => handleInputChange('colisType', value)}
          className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
        />
        <Checkbox
          onChange={e => handleInputChange('remplaceColis', e.target.checked)}
          style={theme === 'dark' ? darkStyle : {}}
          checked={formData.remplaceColis}
        >
          Colis à remplacer
          <p>(Le colis sera remplacé avec l'ancien à la livraison.)</p>
        </Checkbox>
        <Select
          options={ColisOuvrir.map(option => ({ value: option.value, label: option.name }))}
          value={formData.ouvrirColis}
          onChange={value => handleInputChange('ouvrirColis', value)}
          className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
        />
      </div>

      <div className="colis-form-inputs">
        <Row gutter={16}>
          <Col span={12}>
            <div className="colis-form-input">
              <label htmlFor="nom">Nom <span className="etoile">*</span></label>
              <Input
                placeholder="Nom"
                size="large"
                value={formData.nom}
                onChange={e => handleInputChange('nom', e.target.value)}
                style={theme === 'dark' ? darkStyle : {}}
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                suffix={
                  <Tooltip title="Entrer nom de destinataire">
                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                  </Tooltip>
                }
              />
            </div>
          </Col>
          <Col span={12}>
            <div className="colis-form-input">
              <label htmlFor="tele">Téléphone <span className="etoile">*</span></label>
              <NumericInput
                value={formData.tele}
                onChange={value => handleInputChange('tele', value)}
                style={theme === 'dark' ? darkStyle : {}}
              />
            </div>
          </Col>
        </Row>

        <div className="colis-form-input">
            <label htmlFor="ville">Ville <span className="etoile">*</span></label>
            <Select
                showSearch
                placeholder="Rechercher une ville"
                options={villes.map(ville => ({ value: ville._id, label: ville.nom }))}
                value={formData.ville}
                onChange={value => handleInputChange('ville', value)}
                className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
                filterOption={(input, option) => 
                option.label.toLowerCase().includes(input.toLowerCase())
                }
            />
        </div>


        <div className="colis-form-input">
          <label htmlFor="adress">Adresse <span className="etoile">*</span></label>
          <TextArea
            size="large"
            showCount
            maxLength={300}
            value={formData.adress}
            onChange={e => handleInputChange('adress', e.target.value)}
            placeholder="Votre adresse"
            style={theme === 'dark' ? darkStyle : {}}
          />
        </div>

        <div className="colis-form-input">
          <label htmlFor="commentaire">Commentaire</label>
          <TextArea
            size="large"
            showCount
            maxLength={300}
            value={formData.commentaire}
            onChange={e => handleInputChange('commentaire', e.target.value)}
            placeholder="Commentaire, (Autre numéro de téléphone, date de livraison ...)"
            style={theme === 'dark' ? darkStyle : {}}
          />
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <div className="colis-form-input">
              <label htmlFor="prix">Prix <span className="etoile">*</span></label>
              <Input
                placeholder="Prix"
                size="large"
                value={formData.prix}
                onChange={e => handleInputChange('prix', e.target.value)}
                style={theme === 'dark' ? darkStyle : {}}
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                suffix={
                  <Tooltip title="Entrer le prix de produit">
                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                  </Tooltip>
                }
              />
            </div>
          </Col>
          <Col span={12}>
            <div className="colis-form-input">
              <label htmlFor="produit">Nature de produit</label>
              <Input
                placeholder="Nature de produit"
                size="large"
                value={formData.produit}
                onChange={e => handleInputChange('produit', e.target.value)}
                style={theme === 'dark' ? darkStyle : {}}
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                suffix={
                  <Tooltip title="Entrer la nature de produit">
                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                  </Tooltip>
                }
              />
            </div>
          </Col>
        </Row>

        <button className='btn-dashboard' style={{ marginTop: '12px' }} type="submit">
          {type === 'simple' ? 'Confirmer & Demande Ramassage' : 'Confirmer & Choisir Produit'}
        </button>
      </div>
    </form>
  );
}

export default ColisForm;
