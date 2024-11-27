// components/ColisForm.js

import React, { useEffect, useState } from 'react';
import {
  InfoCircleOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import {
  Input,
  Tooltip,
  Select,
  Col,
  Row,
  Checkbox,
  Alert,
  Button,
  Descriptions,
  Card,
} from 'antd';
import { MdOutlineWidgets } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createColis,
  fetchOptions,
  searchColisByCodeSuivi,
} from '../../../../redux/apiCalls/colisApiCalls';
import {
  getAllVilles,
  getVilleById,
} from '../../../../redux/apiCalls/villeApiCalls';
import { toast } from 'react-toastify';
import SelectAsync from 'react-select/async';
import debounce from 'lodash/debounce';

const { TextArea } = Input;

const daysOfWeek = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

const ColisTypes = [
  { id: 1, name: 'Colis Simple' },
  { id: 2, name: 'Colis du Stock' },
];

const ColisOuvrir = [
  { id: 1, name: 'Ouvrir Colis', value: true },
  { id: 2, name: 'Ne pas Ouvrir Colis', value: false },
];

// Custom styles for dark mode
const darkStyle = {
  backgroundColor: 'transparent',
  color: '#fff',
  borderColor: 'gray',
};

// Function to load options for react-select asynchronously with additional data
const loadOptions = (inputValue, callback, dispatch) => {
  if (!inputValue) {
    callback([]);
    return;
  }

  dispatch(searchColisByCodeSuivi(inputValue))
    .then((result) => {
      const { searchResults } = result;
      const options = searchResults.map((colis) => ({
        value: colis._id,
        label: `${colis.code_suivi} - ${colis.nom}`,
        data: {
          nom: colis.nom,
          tele: colis.tele,
          ville: colis.ville?.nom || 'N/A',
          adresse: colis.adresse,
          prix: colis.prix,
          commentaire: colis.commentaire,
          // Include any other fields you need
        },
      }));
      callback(options);
    })
    .catch(() => {
      callback([]);
    });
};

// Debounced loadOptions function to prevent excessive API calls
const debouncedLoadOptions = debounce(
  (inputValue, callback, dispatch) => {
    loadOptions(inputValue, callback, dispatch);
  },
  500
);

function ColisForm({ theme, type }) {
  const [formData, setFormData] = useState({
    nom: '',
    tele: '',
    ville: '',
    adress: '',
    commentaire: '',
    prix: '',
    produit: '',
    colisType: ColisTypes[0].name,
    remplaceColis: false,
    ouvrirColis: true,
    is_fragile: false,
    oldColis: null, // To store the selected old colis data
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch villes and options from Redux store
  const { villes, selectedVille } = useSelector((state) => state.ville);
  const { loading } = useSelector((state) => state.colis);

  useEffect(() => {
    dispatch(getAllVilles());
    dispatch(fetchOptions()); // Fetch stores, livreurs, produits
  }, [dispatch]);

  useEffect(() => {
    if (type === 'simple') {
      setFormData((prev) => ({ ...prev, colisType: ColisTypes[0].name }));
    } else if (type === 'stock') {
      setFormData((prev) => ({ ...prev, colisType: ColisTypes[1].name }));
    }
  }, [type]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch data of selected ville
  const handleVilleChange = (value) => {
    handleInputChange('ville', value);
    dispatch(getVilleById(value)); // Dispatch to getVilleById with selected ID
  };

  // Handle change when oldColis is selected
  const handleOldColisChange = (selectedOption) => {
    if (selectedOption) {
      handleInputChange('oldColis', {
        value: selectedOption.value,
        label: selectedOption.label,
        ...selectedOption.data,
      });
    } else {
      handleInputChange('oldColis', null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      nom,
      tele,
      ville,
      adress,
      commentaire,
      prix,
      produit,
      ouvrirColis,
      remplaceColis,
      is_fragile,
      oldColis,
    } = formData;

    if (!ville) {
      toast.error('Veuillez sélectionner une ville.');
      return;
    }

    // Prepare colis data
    const colis = {
      nom,
      tele: tele.startsWith('0') ? tele : `0${tele}`,
      ville,
      adresse: adress,
      commentaire,
      prix: parseFloat(prix),
      nature_produit: produit,
      ouvrir: ouvrirColis,
      is_remplace: remplaceColis,
      is_fragile,
    };

    // If remplaceColis is true, include replacedColis ID
    if (remplaceColis) {
      if (!oldColis) {
        toast.error('Veuillez sélectionner un colis à remplacer.');
        return;
      }
      colis.replacedColis = oldColis.value; // Single Colis ID
    }

    try {
      await dispatch(createColis(colis));
      navigate('/dashboard/list-colis');
    } catch (error) {
      console.error('Erreur lors de la création du colis:', error);
      // Error handling is managed in the API call
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div
          className="colis-form-header"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <Button type="primary" icon={<MdOutlineWidgets />} disabled>
            Nouveau Colis
          </Button>

          {/* Colis Type Selection */}
          <Select
            options={ColisTypes.map((option) => ({
              value: option.name,
              label: option.name,
            }))}
            value={formData.colisType}
            onChange={(value) => handleInputChange('colisType', value)}
            className={`colis-select-ville ${
              theme === 'dark' ? 'dark-mode' : ''
            }`}
          />

          {/* Checkbox to Replace Colis */}
          <Checkbox
            onChange={(e) =>
              handleInputChange('remplaceColis', e.target.checked)
            }
            style={theme === 'dark' ? darkStyle : {}}
            checked={formData.remplaceColis}
          >
            Colis à remplacer
            <p>(Le colis sera remplacé avec l'ancien à la livraison.)</p>
          </Checkbox>

          {/* Select Old Colis to Replace */}
          {formData.remplaceColis && (
            <div
              className="old-colis-select"
              style={{ marginBottom: '16px' }}
            >
              <label htmlFor="oldColis">
                Sélectionnez le Colis à remplacer{' '}
                <span style={{ color: 'red' }}>*</span>
              </label>
              <SelectAsync
                cacheOptions
                defaultOptions
                loadOptions={(inputValue, callback) =>
                  debouncedLoadOptions(inputValue, callback, dispatch)
                }
                isMulti={false} // Allow only single selection
                onChange={handleOldColisChange}
                placeholder="Rechercher par code suivi..."
                noOptionsMessage={() => 'Aucun colis trouvé'}
              />
              <small>
                Recherchez et sélectionnez le colis déjà livré que vous
                souhaitez remplacer.
              </small>
            </div>
          )}

          {/* Display selected old Colis details */}
          {formData.remplaceColis && formData.oldColis && (
            <Card
              title="Colis sélectionné à remplacer"
              style={{
                marginTop: '16px',
                borderColor: '#d9d9d9',
                borderRadius: '8px',
              }}
            >
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Code Suivi">
                  {formData.oldColis.label.split(' - ')[0]}
                </Descriptions.Item>
                <Descriptions.Item label="Nom">
                  {formData.oldColis.nom ||
                    formData.oldColis.label.split(' - ')[1]}
                </Descriptions.Item>
                <Descriptions.Item label="Téléphone">
                  {"+212 "+formData.oldColis.tele || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Ville">
                  {formData.oldColis.ville || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Adresse">
                  {formData.oldColis.adresse || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Prix">
                  {formData.oldColis.prix
                    ? `${formData.oldColis.prix} MAD`
                    : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Commentaire">
                  {formData.oldColis.commentaire || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Checkbox for Fragile Colis */}
          <Checkbox
            onChange={(e) =>
              handleInputChange('is_fragile', e.target.checked)
            }
            style={theme === 'dark' ? darkStyle : {}}
            checked={formData.is_fragile}
          >
            Colis fragile
          </Checkbox>

          {/* Ouvrir Colis Selection */}
          <Select
            options={ColisOuvrir.map((option) => ({
              value: option.value,
              label: option.name,
            }))}
            value={formData.ouvrirColis}
            onChange={(value) => handleInputChange('ouvrirColis', value)}
            className={`colis-select-ville ${
              theme === 'dark' ? 'dark-mode' : ''
            }`}
          />
        </div>

        {/* Form Inputs */}
        <div
          className="colis-form-inputs"
          style={{ marginTop: '24px' }}
        >
              <div className="colis-form-input">
                <label htmlFor="nom">
                  Nom <span style={{ color: 'red' }}>*</span>
                </label>
                <Input
                  placeholder="Nom"
                  size="large"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  style={theme === 'dark' ? darkStyle : {}}
                  prefix={
                    <UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  suffix={
                    <Tooltip title="Entrer nom de destinataire">
                      <InfoCircleOutlined
                        style={{ color: 'rgba(0,0,0,.45)' }}
                      />
                    </Tooltip>
                  }
                  required
                />
              </div>
              <div className="colis-form-input">
                <label htmlFor="tele">
                  Téléphone <span style={{ color: 'red' }}>*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="Numéro de téléphone"
                  size="large"
                  value={formData.tele}
                  onChange={(e) => handleInputChange('tele', e.target.value)}
                  style={theme === 'dark' ? darkStyle : {}}
                  prefix={
                    <span style={{ color: 'rgba(0,0,0,.25)' }}>+212</span>
                  }
                  suffix={
                    <Tooltip title="Entrer Numéro de téléphone de destinataire">
                      <InfoCircleOutlined
                        style={{ color: 'rgba(0,0,0,.45)' }}
                      />
                    </Tooltip>
                  }
                  maxLength={9}
                  required
                />
              </div>

          {/* Ville Selection */}
          <div className="colis-form-input">
            <label htmlFor="ville">
              Ville <span style={{ color: 'red' }}>*</span>
            </label>
            <Select
              showSearch
              placeholder="Rechercher une ville"
              options={villes.map((ville) => ({
                value: ville._id,
                label: ville.nom,
              }))}
              value={formData.ville}
              onChange={handleVilleChange}
              className={`colis-select-ville ${
                theme === 'dark' ? 'dark-mode' : ''
              }`}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              required
            />
          </div>

          {/* Display selected ville details if available */}
          {selectedVille && (
            <div
              className="selected-ville-info"
              style={{ padding: '16px 0' }}
            >
              <Alert
                message={`Tarif : ${selectedVille.tarif}`}
                description={selectedVille.nom}
                type="info"
                showIcon
              />
            </div>
          )}
         {
          selectedVille && (
            <div className="selected-ville-info" style={{ padding: '16px 0' }}>
              <h3>Disponibility pour {selectedVille.nom}:</h3>
              <div
                className="days-checkbox-list"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexWrap: 'wrap',  // Allow wrapping for small screens
                  gap: '8px',
                  padding: '16px',
                  backgroundColor: '#f0f2f5',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                {daysOfWeek.map((day) => (
                  <Checkbox
                    key={day}
                    checked={selectedVille.disponibility.includes(day)}
                    disabled
                    style={{
                      fontSize: '16px',
                      padding: '8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      backgroundColor: selectedVille.disponibility.includes(day)
                        ? '#e6f7ff'
                        : '#fff',
                    }}
                  >
                    {day}
                  </Checkbox>
                ))}
              </div>
            </div>
          )
         }

          {/* Adresse Input */}
          <div className="colis-form-input">
            <label htmlFor="adress">
              Adresse <span style={{ color: 'red' }}>*</span>
            </label>
            <TextArea
              size="large"
              showCount
              maxLength={300}
              value={formData.adress}
              onChange={(e) => handleInputChange('adress', e.target.value)}
              placeholder="Votre adresse"
              style={theme === 'dark' ? darkStyle : {}}
              required
            />
          </div>

          {/* Commentaire Input */}
          <div className="colis-form-input">
            <label htmlFor="commentaire">Commentaire</label>
            <TextArea
              size="large"
              showCount
              maxLength={300}
              value={formData.commentaire}
              onChange={(e) =>
                handleInputChange('commentaire', e.target.value)
              }
              placeholder="Commentaire, (Autre numéro de téléphone, date de livraison ...)"
              style={theme === 'dark' ? darkStyle : {}}
            />
          </div>

         
              <div className="colis-form-input">
                <label htmlFor="prix">
                  Prix <span style={{ color: 'red' }}>*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Prix"
                  size="large"
                  value={formData.prix}
                  onChange={(e) => handleInputChange('prix', e.target.value)}
                  style={theme === 'dark' ? darkStyle : {}}
                  prefix={
                    <UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  suffix={
                    <Tooltip title="Entrer le prix de produit">
                      <InfoCircleOutlined
                        style={{ color: 'rgba(0,0,0,.45)' }}
                      />
                    </Tooltip>
                  }
                  required
                  min={0}
                />
              </div>
              <div className="colis-form-input">
                <label htmlFor="produit">Nature de produit</label>
                <Input
                  placeholder="Nature de produit"
                  size="large"
                  value={formData.produit}
                  onChange={(e) =>
                    handleInputChange('produit', e.target.value)
                  }
                  style={theme === 'dark' ? darkStyle : {}}
                  prefix={
                    <UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  suffix={
                    <Tooltip title="Entrer la nature de produit">
                      <InfoCircleOutlined
                        style={{ color: 'rgba(0,0,0,.45)' }}
                      />
                    </Tooltip>
                  }
                />
              </div>

          {/* Submit Button */}
          <Button
            type="primary"
            htmlType="submit"
            className="btn-dashboard"
            style={{ marginTop: '12px' }}
            loading={loading}
          >
            {type === 'simple'
              ? 'Confirmer & Demande Ramassage'
              : 'Confirmer & Choisir Produit'}
          </Button>
        </div>
      </form>
    </>
  );
}

export default ColisForm;
