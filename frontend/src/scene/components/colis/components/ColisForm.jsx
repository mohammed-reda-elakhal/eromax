// ColisForm.jsx

import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  InfoCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { TfiMenuAlt, TfiMoney } from "react-icons/tfi";
import {
  Input,
  Tooltip,
  Select,
  Checkbox,
  Button,
  Modal,
  Drawer,
  message,
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
import debounce from 'lodash/debounce';
import { FaPhoneAlt } from 'react-icons/fa';
import { AiFillProduct } from "react-icons/ai";
import { FaMapLocation } from "react-icons/fa6";
import { ThemeContext } from '../../../ThemeContext'; // Ensure ThemeContext is imported

const { TextArea } = Input;
const { Option } = Select;

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
  { id: 2, name: 'Colis Stock' },
];

const ColisOuvrir = [
  { id: 1, name: 'Ouvrir Colis', value: true },
  { id: 2, name: 'Ne pas Ouvrir Colis', value: false },
];

function ColisForm({ type }) {
  const { theme } = useContext(ThemeContext); // Access theme from ThemeContext
  const initialFormData = {
    nom: '',
    tele: '',
    ville: '',
    adress: '',
    commentaire: '',
    prix: '',
    produit: '',
    colisType: ColisTypes[0].name,
    is_remplace: false,
    ouvrirColis: true,
    is_fragile: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [phoneError, setPhoneError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [openOption, setOpenOption] = useState(false);

  // States for the simple input search in the modal
  const [oldColisSearch, setOldColisSearch] = useState('');
  const [oldColisSuggestions, setOldColisSuggestions] = useState([]);
  const [loadingOldColis, setLoadingOldColis] = useState(false);

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
      is_remplace,
      is_fragile,
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
      is_remplace,
      is_fragile,
    };

    try {
      await dispatch(createColis(colis));
      message.success('Colis créé avec succès !');
      setFormData(initialFormData);
      setPhoneError('');
      dispatch(resetVille());
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Erreur lors de la création du colis:', error);
      toast.error('Erreur lors de la création du colis. Veuillez réessayer.');
    }
  };

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  return (
    <div className={`colis-form-container ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <form onSubmit={handleSubmit}>
        {/* Display selected ville details if available */}
        {selectedVille && (
          <div
            className="selected-ville-info"
            style={{
              padding: '16px 0',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{ flex: 2 }} className='selected-ville-info-content'>
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
                  backgroundColor: theme === 'dark' ? '#001529' : '#f0f2f5',
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
                        ? (theme === 'dark' ? '#1890ff' : '#e6f7ff')
                        : '#fff',
                      color: theme === 'dark' && selectedVille.disponibility.includes(day) ? '#fff' : '#000',
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
          <div className="colis-form-line" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="colis-form-input">
              <label htmlFor="nom">
                Nom <span style={{ color: 'red' }}>*</span>
              </label>
              <Input
                placeholder="Nom"
                size="large"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                prefix={<UserOutlined style={{ color: theme === 'dark' ? '#ffffff' : 'rgba(0,0,0,.25)' }} />}
                suffix={
                  <Tooltip title="Entrer nom de destinataire">
                    <InfoCircleOutlined style={{ color: theme === 'dark' ? '#cccccc' : 'rgba(0,0,0,.45)' }} />
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
                prefix={<FaPhoneAlt style={{ color: theme === 'dark' ? '#ffffff' : 'rgba(0,0,0,.25)' }} />}
                suffix={
                  <Tooltip title="Entrer Numéro de téléphone de destinataire">
                    <InfoCircleOutlined style={{ color: theme === 'dark' ? '#cccccc' : 'rgba(0,0,0,.45)' }} />
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
                className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                required
                style={{ width: '100%' }}
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
                prefix={<TfiMoney style={{ color: theme === 'dark' ? '#ffffff' : 'rgba(0,0,0,.25)' }} />}
                suffix={
                  <Tooltip title="Entrer le prix du produit">
                    <InfoCircleOutlined style={{ color: theme === 'dark' ? '#cccccc' : 'rgba(0,0,0,.45)' }} />
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
                prefix={<AiFillProduct style={{ color: theme === 'dark' ? '#ffffff' : 'rgba(0,0,0,.25)' }} />}
                suffix={
                  <Tooltip title="Entrer la nature de produit">
                    <InfoCircleOutlined style={{ color: theme === 'dark' ? '#cccccc' : 'rgba(0,0,0,.45)' }} />
                  </Tooltip>
                }
              />
            </div>

            <div className="colis-form-input">
              <label htmlFor="adress">
                Adresse <span style={{ color: 'red' }}>*</span>
              </label>
              <Input
                size="large"
                showCount
                maxLength={300}
                value={formData.adress}
                onChange={(e) => handleInputChange('adress', e.target.value)}
                placeholder="Adresse de client"
                prefix={<FaMapLocation style={{ color: theme === 'dark' ? '#ffffff' : 'rgba(0,0,0,.25)' }} />}
                required
              />
            </div>
          </div>

          {/* TextArea for Commentaire */}
          <div className="colis-form-input" style={{ width: '100%', marginTop: '16px' }}>
            <label htmlFor="commentaire">
              Commentaire
            </label>
            <TextArea
              size="large"
              showCount
              maxLength={300}
              value={formData.commentaire}
              onChange={(e) => handleInputChange('commentaire', e.target.value)}
              placeholder="Commentaire (Autre numéro, date de livraison...)"
            />
          </div>

          {openOption ? (
            <div className="option_colis_form">
              {/* Checkbox for Ouvrir Colis */}
              <Checkbox
                checked={formData.ouvrirColis}
                onChange={(e) => handleInputChange('ouvrirColis', e.target.checked)}
                className={`colis-checkbox ${theme === 'dark' ? 'dark-mode' : ''}`}
                style={{ marginBottom: '16px', color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Ouvrir Colis
              </Checkbox>

              <Checkbox
                onChange={(e) => handleInputChange('is_fragile', e.target.checked)}
                checked={formData.is_fragile}
                style={{ marginBottom: '16px', color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Colis fragile
              </Checkbox>

              <Checkbox
                onChange={(e) => handleInputChange('is_remplace', e.target.checked)}
                checked={formData.is_remplace}
                style={{ marginBottom: '16px', color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Colis à remplacer
              </Checkbox>
            </div>
          ) : (
            ""
          )}

          {/* Footer Buttons */}
          <div className="colis-form-footer" style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
            <Button type="primary" onClick={() => setOpenOption((prev) => !prev)} icon={<TfiMenuAlt />}>
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
    </div>
  );
}

export default ColisForm;
