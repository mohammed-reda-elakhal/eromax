// ColisForm.jsx

import React, { useEffect, useState, useContext } from 'react';
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
  message,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  createColis,
  fetchOptions,
} from '../../../../redux/apiCalls/colisApiCalls';
import {
  getAllVilles,
  getVilleById,
  resetVille,
} from '../../../../redux/apiCalls/villeApiCalls';
import { toast } from 'react-toastify';
import { FaPhoneAlt } from 'react-icons/fa';
import { AiFillProduct } from "react-icons/ai";
import { FaMapLocation } from "react-icons/fa6";
import { ThemeContext } from '../../../ThemeContext'; // Ensure ThemeContext is imported
import './ColisForm.css'; // Import the new CSS file

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
  { id: 2, name: 'Colis Stock' },
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
  const [openOption, setOpenOption] = useState(false);
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

    // Validate required fields
    if (!nom) {
      toast.error('Veuillez entrer un nom.');
      return;
    }

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

    if (!prix || isNaN(parseFloat(prix)) || parseFloat(prix) < 0) {
      toast.error('Veuillez entrer un prix valide.');
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
      dispatch(createColis(colis));
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

  return (
    <div className={`colis-form-container-${theme}`}>
      <form onSubmit={handleSubmit} className={`colis-form-${theme}`}>
        {/* Display selected ville details if available */}
        {selectedVille && (
          <div className={`selected-ville-info-${theme}`}>
            <div className='selected-ville-info-content'>
              <h3>
                📍 {selectedVille.nom} - {selectedVille.tarif} DH
              </h3>
              <div className={`days-checkbox-list-${theme}`}>
                {daysOfWeek.map((day) => (
                  <Checkbox
                    key={day}
                    checked={selectedVille.disponibility.includes(day)}
                    disabled
                    className={selectedVille.disponibility.includes(day) ? 'checked' : ''}
                  >
                    {day}
                  </Checkbox>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={`colis-form-inputs-${theme}`}>
          {/* Container for simple inputs in multiple columns */}
          <div className={`colis-form-line-${theme}`}>
            <div className={`colis-form-input-${theme}`}>
              <label htmlFor="nom">
                Nom <span className="required-star">*</span>
              </label>
              <Input
                placeholder="Entrez le nom du destinataire"
                size="large"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                prefix={<UserOutlined style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />}
                suffix={
                  <Tooltip title="Entrer nom de destinataire">
                    <InfoCircleOutlined style={{ color: theme === 'dark' ? '#94a3b8' : '#6b7280' }} />
                  </Tooltip>
                }
                required
              />
            </div>

            <div className={`colis-form-input-${theme}`}>
              <label htmlFor="tele">
                Téléphone <span className="required-star">*</span>
              </label>
              <Input
                placeholder="Ex: 0612345678"
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
                prefix={<FaPhoneAlt style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />}
                suffix={
                  <Tooltip title="Entrer Numéro de téléphone de destinataire">
                    <InfoCircleOutlined style={{ color: theme === 'dark' ? '#94a3b8' : '#6b7280' }} />
                  </Tooltip>
                }
                maxLength={10}
                required
              />
              {phoneError && (
                <div className={`phone-error-${theme}`}>
                  {phoneError}
                </div>
              )}
            </div>

            <div className={`colis-form-input-${theme}`}>
              <label htmlFor="ville">
                Ville <span className="required-star">*</span>
              </label>
              <Select
                showSearch
                placeholder="Sélectionnez une ville"
                size="large"
                options={villes.map((ville) => ({
                  value: ville._id,
                  label: ville.nom,
                }))}
                value={formData.ville}
                onChange={handleVilleChange}
                className={`colis-select-ville-${theme}`}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                required
                dropdownStyle={{
                  background: theme === 'dark' ? '#1e293b' : '#ffffff',
                  border: theme === 'dark' ? '1px solid #475569' : '1px solid #e5e7eb'
                }}
              />
            </div>

            <div className={`colis-form-input-${theme}`}>
              <label htmlFor="prix">
                Prix <span className="required-star">*</span>
              </label>
              <Input
                placeholder="Ex: 250.00"
                size="large"
                type="number"
                value={formData.prix}
                onChange={(e) => handleInputChange('prix', e.target.value)}
                prefix={<TfiMoney style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />}
                suffix={
                  <Tooltip title="Entrer le prix du produit en DH">
                    <InfoCircleOutlined style={{ color: theme === 'dark' ? '#94a3b8' : '#6b7280' }} />
                  </Tooltip>
                }
                required
                min={0}
                step="0.01"
              />
            </div>

            <div className={`colis-form-input-${theme}`}>
              <label htmlFor="produit">
                Nature de produit
              </label>
              <Input
                placeholder="Ex: Vêtements, Électronique..."
                size="large"
                value={formData.produit}
                onChange={(e) => handleInputChange('produit', e.target.value)}
                prefix={<AiFillProduct style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />}
                suffix={
                  <Tooltip title="Entrer la nature de produit">
                    <InfoCircleOutlined style={{ color: theme === 'dark' ? '#94a3b8' : '#6b7280' }} />
                  </Tooltip>
                }
              />
            </div>

            <div className={`colis-form-input-${theme}`}>
              <label htmlFor="adress">
                Adresse
              </label>
              <Input
                size="large"
                showCount
                maxLength={300}
                value={formData.adress}
                onChange={(e) => handleInputChange('adress', e.target.value)}
                placeholder="Ex: Rue 123, Quartier..."
                prefix={<FaMapLocation style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />}
              />
            </div>
          </div>

          {/* TextArea for Commentaire */}
          <div className={`colis-form-input-${theme}`} style={{ width: '100%' }}>
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
              rows={4}
            />
          </div>

          {openOption && (
            <div className={`option_colis_form-${theme}`}>
              <Checkbox
                checked={formData.ouvrirColis}
                onChange={(e) => handleInputChange('ouvrirColis', e.target.checked)}
              >
                📦 Ouvrir Colis
              </Checkbox>

              <Checkbox
                onChange={(e) => handleInputChange('is_fragile', e.target.checked)}
                checked={formData.is_fragile}
              >
                📎 Colis fragile
              </Checkbox>

              <Checkbox
                onChange={(e) => handleInputChange('is_remplace', e.target.checked)}
                checked={formData.is_remplace}
              >
                🔄 Colis à remplacer
              </Checkbox>
            </div>
          )}

          {/* Footer Buttons */}
          <div className={`colis-form-footer-${theme}`}>
            <Button
              type="default"
              onClick={() => setOpenOption((prev) => !prev)}
              icon={<TfiMenuAlt />}
              size="large"
            >
              {openOption ? 'Masquer Options' : 'Options Avancées'}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              {type === 'simple'
                ? '✓ Confirmer & Demande Ramassage'
                : '✓ Confirmer & Choisir Produit'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ColisForm;
