import React, { useEffect, useState } from 'react';
import {
  InfoCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Input,
  Tooltip,
  Select,
  Checkbox,
  Alert,
  Button,
  Modal,
  Drawer,
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
  resetVille,
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
];

const ColisOuvrir = [
  { id: 1, name: 'Ouvrir Colis', value: true },
  { id: 2, name: 'Ne pas Ouvrir Colis', value: false },
];

const darkStyle = {
  backgroundColor: 'transparent',
  color: '#fff',
  borderColor: 'gray',
};

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
          code_suivi: colis.code_suivi,
          nom: colis.nom,
          tele: colis.tele,
          ville: colis.ville?.nom || 'N/A',
          adresse: colis.adresse,
          prix: colis.prix,
          commentaire: colis.commentaire,
        },
      }));
      callback(options);
    })
    .catch(() => {
      callback([]);
    });
};

const debouncedLoadOptions = debounce(
  (inputValue, callback, dispatch) => {
    loadOptions(inputValue, callback, dispatch);
  },
  500
);

function ColisForm({ theme, type }) {
  const initialFormData = {
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
    oldColis: null,
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [phoneError, setPhoneError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { villes, selectedVille } = useSelector((state) => state.ville);
  const { loading } = useSelector((state) => state.colis);

  useEffect(() => {
    dispatch(getAllVilles());
    dispatch(fetchOptions());
  }, [dispatch]);

  useEffect(() => {
    if (type === 'simple') {
      setFormData((prev) => ({ ...prev, colisType: ColisTypes[0].name }));
    } else if (type === 'stock') {
      setFormData((prev) => ({ ...prev, colisType: ColisTypes[1].name }));
    }
  }, [type]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVilleChange = (value) => {
    handleInputChange('ville', value);
    dispatch(getVilleById(value));
  };

  const handleOldColisSelect = (selectedOption) => {
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

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(tele)) {
      setPhoneError('Le numéro de téléphone doit commencer par 0 et contenir exactement 10 chiffres.');
      toast.error('Veuillez corriger le numéro de téléphone.');
      return;
    }

    if (!ville) {
      toast.error('Veuillez sélectionner une ville.');
      return;
    }

    const colis = {
      nom,
      tele,
      ville,
      adresse: adress,
      commentaire,
      prix: parseFloat(prix),
      nature_produit: produit,
      ouvrir: ouvrirColis,
      is_remplace: remplaceColis,
      is_fragile,
    };

    if (remplaceColis) {
      if (!oldColis) {
        toast.error('Veuillez sélectionner un colis à remplacer.');
        return;
      }
      colis.replacedColis = oldColis.value;
    }

    try {
      await dispatch(createColis(colis));
      setFormData(initialFormData);
      setPhoneError('');
      dispatch(resetVille());
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Erreur lors de la création du colis:', error);
      toast.error('Erreur lors de la création du colis. Veuillez réessayer.');
    }
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleOkModal = () => {
    setIsModalVisible(false);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Minimal top section */}
         {/* Display selected ville details if available */}
         {selectedVille && (
            <div className="selected-ville-info" style={{ padding: '16px 0', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 2 }}>
                <h3 style={{ marginBottom: '8px' }}>
                  {selectedVille.nom} - {selectedVille.tarif} DH
                </h3>
                <div
                  className="days-checkbox-list"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    padding: '8px',
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
                        fontSize: '14px',
                        padding: '4px 8px',
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
            </div>
          )}


        <div className="colis-form-inputs" style={{ marginTop: '24px' }}>

          {/* Container for simple inputs in multiple columns */}
          <div 
            className="colis-form-line" 
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
                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                  </Tooltip>
                }
                required
              />
            </div>

            <div className="colis-form-input" >
              <label htmlFor="tele">
                Téléphone <span style={{ color: 'red' }}>*</span>
              </label>
              <Input
                placeholder="Numéro de téléphone"
                size="large"
                value={formData.tele}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value && !value.startsWith('0')) {
                    value = '0' + value;
                  }
                  if (value.length > 10) {
                    value = value.slice(0, 10);
                  }
                  handleInputChange('tele', value);
                  const phoneRegex = /^0\d{9}$/;
                  if (value && !phoneRegex.test(value)) {
                    setPhoneError('Le numéro de téléphone doit commencer par 0 et contenir exactement 10 chiffres.');
                  } else {
                    setPhoneError('');
                  }
                }}
                style={theme === 'dark' ? darkStyle : {}}
                suffix={
                  <Tooltip title="Entrer Numéro de téléphone de destinataire">
                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                  </Tooltip>
                }
                maxLength={10}
                required
              />
              {phoneError && (
                <div style={{ color: 'red', marginTop: '5px' }}>
                  {phoneError}
                </div>
              )}
            </div>

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
                className={`colis-select-ville ${ theme === 'dark' ? 'dark-mode' : ''}`}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                required
              />
            </div>

            <div className="colis-form-input">
              <label htmlFor="prix">
                Prix <span style={{ color: 'red' }}>*</span>
              </label>
              <Input
                placeholder="Prix"
                size="large"
                value={formData.prix}
                onChange={(e) => handleInputChange('prix', e.target.value)}
                style={theme === 'dark' ? darkStyle : {}}
                prefix={
                  <UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                suffix={
                  <Tooltip title="Entrer le prix du produit">
                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                  </Tooltip>
                }
                required
                min={0}
              />
            </div>

            <div className="colis-form-input">
              <label htmlFor="produit">
                Nature de produit <span style={{ color: 'red' }}>*</span>
              </label>
              <Input
                required
                placeholder="Nature de produit"
                size="large"
                value={formData.produit}
                onChange={(e) => handleInputChange('produit', e.target.value)}
                style={theme === 'dark' ? darkStyle : {}}
                prefix={
                  <UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                suffix={
                  <Tooltip title="Entrer la nature de produit">
                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                  </Tooltip>
                }
              />
            </div>
          </div>
          
         

          {/* TextAreas are separate (full width) */}
          <div className="colis-form-input" style={{ width: '100%' }}>
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

          <div className="colis-form-input" style={{ width: '100%' }}>
            <label htmlFor="commentaire">
              Commentaire <span style={{ color: 'red' }}>*</span>
            </label>
            <TextArea
              size="large"
              showCount
              maxLength={300}
              value={formData.commentaire}
              onChange={(e) => handleInputChange('commentaire', e.target.value)}
              placeholder="Commentaire (Autre numéro, date de livraison...)"
              style={theme === 'dark' ? darkStyle : {}}
            />
          </div>

          <div className="colis-form-footer" style={{ marginTop: '12px' }}>
            <Button type="primary" onClick={showDrawer}>
              Options Avancées
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="btn-dashboard"
              loading={loading}
            >
              {type === 'simple'
                ? 'Confirmer & Demande Ramassage'
                : 'Confirmer & Choisir Produit'}
            </Button>
          </div>
        </div>
      </form>

      {/* Modal for selecting Old Colis */}
      <Modal
        title="Rechercher l'ancien colis"
        visible={isModalVisible}
        onOk={handleOkModal}
        onCancel={handleCancelModal}
        okText="Confirmer"
        cancelText="Annuler"
      >
        <p>Recherche par code suivi:</p>
        <SelectAsync
          cacheOptions
          defaultOptions
          loadOptions={(inputValue, callback) =>
            debouncedLoadOptions(inputValue, callback, dispatch)
          }
          isMulti={false}
          onChange={handleOldColisSelect}
          placeholder="Rechercher par code suivi..."
          noOptionsMessage={() => 'Aucun colis trouvé'}
        />
      </Modal>

      {/* Drawer for advanced options */}
      <Drawer
        title="Options Avancées"
        placement="right"
        onClose={closeDrawer}
        visible={isDrawerVisible}
      >
        <div className="option_colis_form">
          <Select
            options={ColisTypes.map((option) => ({
              value: option.name,
              label: option.name,
            }))}
            value={formData.colisType}
            onChange={(value) => handleInputChange('colisType', value)}
            className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
            style={{ marginBottom: '16px' }}
          />

          <Select
            options={ColisOuvrir.map((option) => ({
              value: option.value,
              label: option.name,
            }))}
            value={formData.ouvrirColis}
            onChange={(value) => handleInputChange('ouvrirColis', value)}
            className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
            style={{ marginBottom: '16px' }}
          />

          <Checkbox
            onChange={(e) => handleInputChange('is_fragile', e.target.checked)}
            style={theme === 'dark' ? darkStyle : {}}
            checked={formData.is_fragile}
          >
            Colis fragile
          </Checkbox>
          <br /><br />
          <Checkbox
            onChange={(e) => handleInputChange('remplaceColis', e.target.checked)}
            style={theme === 'dark' ? darkStyle : {}}
            checked={formData.remplaceColis}
          >
            Colis à remplacer
            <p style={{ fontSize: '12px', marginTop: '4px' }}>
              (Le colis sera remplacé avec l'ancien à la livraison.)
            </p>
          </Checkbox>

          {formData.remplaceColis && !formData.oldColis && (
            <Button type="default" onClick={handleOpenModal}>
              Rechercher l'ancien colis
            </Button>
          )}

          {formData.remplaceColis && formData.oldColis && (
            <div className='colis-form-header-oldColis' style={{ marginTop: '16px' }}>
              <span><strong>Code Suivi</strong> : {formData.oldColis.code_suivi}</span> 
              <span><strong>Ville</strong> : {formData.oldColis.ville}</span>
              <Button type="primary" onClick={handleOpenModal} style={{ marginTop: '8px' }}>
                Modifier
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}

export default ColisForm;
