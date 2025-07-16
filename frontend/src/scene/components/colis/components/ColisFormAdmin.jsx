// ColisFormAdmin.jsx

import React, { useEffect, useState, useContext } from 'react';
import { TfiMenuAlt, TfiMoney } from "react-icons/tfi";
import { FaPhoneAlt } from 'react-icons/fa';
import { AiFillProduct } from "react-icons/ai";
import { FaMapLocation } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createColisAdmin,
  fetchOptions,
  searchColisByCodeSuivi,
} from '../../../../redux/apiCalls/colisApiCalls';
import {
  getAllVilles,
  getVilleById,
  resetVille,
} from '../../../../redux/apiCalls/villeApiCalls';
import { getStoreList } from '../../../../redux/apiCalls/storeApiCalls';
import { toast } from 'react-toastify';
import { ThemeContext } from '../../../ThemeContext';
import './ColisForm.css';
import Select from 'react-select';

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
  store: '',
};

function ColisFormAdmin({ type }) {
  const { theme } = useContext(ThemeContext);

  const [formData, setFormData] = useState(initialFormData);
  const [phoneError, setPhoneError] = useState('');
  const [villeSearch, setVilleSearch] = useState(''); // For ville search

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { villes, selectedVille } = useSelector((state) => state.ville);
  const { stores } = useSelector((state) => state.store);
  const { loading } = useSelector((state) => state.colis);

  useEffect(() => {
    dispatch(getStoreList());
    dispatch(resetVille());
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
      store,
    } = formData;

    if (!nom) {
      toast.error('Veuillez entrer un nom.');
      return;
    }
    if (!store) {
      toast.error('Veuillez sélectionner un magasin.');
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
    if (!selectedVille || !selectedVille.nom) {
      toast.error('Ville sélectionnée invalide.');
      return;
    }
    if (!prix || isNaN(parseFloat(prix)) || parseFloat(prix) < 0) {
      toast.error('Veuillez entrer un prix valide.');
      return;
    }
    const colis = {
      nom,
      tele,
      ville: selectedVille.nom,
      adresse: adress,
      commentaire,
      prix: parseFloat(prix),
      nature_produit: produit,
      ouvrir: ouvrirColis,
      is_remplace,
      is_fragile,
      store,
    };
    try {
      await dispatch(createColisAdmin(colis));
      setFormData(initialFormData);
      setPhoneError('');
      dispatch(resetVille());
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Erreur lors de la création du colis:', error);
      toast.error('Erreur lors de la création du colis. Veuillez réessayer.');
    }
  };

  const getUniqueVilles = (villes) => {
    const unique = [];
    const seen = new Set();
    for (const ville of villes) {
      if (!seen.has(ville._id)) {
        seen.add(ville._id);
        unique.push(ville);
      }
    }
    return unique;
  };

  const uniqueVilles = getUniqueVilles(villes);
  // Filter villes by search
  const filteredVilles = villeSearch.trim()
    ? uniqueVilles.filter(ville => ville.nom.toLowerCase().includes(villeSearch.trim().toLowerCase()))
    : uniqueVilles;

  return (
    <div className={`colis-form-container-${theme}`}> {/* Main container */}
      <form onSubmit={handleSubmit} className={`colis-form-${theme}`}> 
        {/* Two-column layout */}
        <div className={`colis-form-flex-${theme}`} style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Left/Main Section */}
          <div className={`colis-form-main-${theme}`} style={{ flex: 2, minWidth: 0 }}>
            <div className={`colis-form-inputs-${theme}`}>          
              <div className={`colis-form-line-${theme}`}>            
                {/* Store Selection Dropdown */}
                <div className={`colis-form-input-${theme}`} style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="store">
                    Magasin <span className="required-star">*</span>
                  </label>
                  <Select
                    id="store"
                    options={stores.map(store => ({ value: store._id, label: store.storeName }))}
                    value={stores
                      .map(store => ({ value: store._id, label: store.storeName }))
                      .find(opt => opt.value === formData.store) || null}
                    onChange={option => handleInputChange('store', option ? option.value : '')}
                    placeholder="Sélectionner un magasin"
                    isClearable
                    classNamePrefix="react-select"
                    styles={{
                      menu: provided => ({ ...provided, zIndex: 9999 }),
                      control: provided => ({ ...provided, minHeight: 40, borderRadius: 10, fontSize: 15 }),
                    }}
                  />
                </div>

                {/* Name Input */}
                <div className={`colis-form-input-${theme}`}>
                  <label htmlFor="nom">
                    Nom <span className="required-star">*</span>
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8, color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}><svg width="16" height="16"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="2" /></svg></span>
                    <input
                      id="nom"
                      placeholder="Entrez le nom du destinataire"
                      value={formData.nom}
                      onChange={e => handleInputChange('nom', e.target.value)}
                      className={`ant-input`}
                      required
                      style={{ flex: 1 }}
                    />
                    <span title="Entrer nom de destinataire" style={{ marginLeft: 8, color: theme === 'dark' ? '#94a3b8' : '#6b7280', cursor: 'help' }}>i</span>
                  </div>
                </div>

                {/* Phone Input */}
                <div className={`colis-form-input-${theme}`}>
                  <label htmlFor="tele">
                    Téléphone <span className="required-star">*</span>
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8, color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}><FaPhoneAlt /></span>
                    <input
                      id="tele"
                      placeholder="Ex: 0612345678"
                      value={formData.tele}
                      onChange={e => {
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
                      className={`ant-input`}
                      maxLength={10}
                      required
                      style={{ flex: 1 }}
                    />
                    <span title="Entrer Numéro de téléphone de destinataire" style={{ marginLeft: 8, color: theme === 'dark' ? '#94a3b8' : '#6b7280', cursor: 'help' }}>i</span>
                  </div>
                  {phoneError && (
                    <div className={`phone-error-${theme}`}>{phoneError}</div>
                  )}
                </div>

                {/* City Selection with Search */}
                <div className={`colis-form-input-${theme}`}>
                  <label htmlFor="ville">
                    Ville <span className="required-star">*</span>
                  </label>
                  {/* Searchable Select for ville using react-select */}
                  <Select
                    id="ville"
                    options={uniqueVilles.map(ville => ({ value: ville._id, label: ville.nom }))}
                    value={uniqueVilles
                      .map(ville => ({ value: ville._id, label: ville.nom }))
                      .find(opt => opt.value === formData.ville) || null}
                    onChange={option => handleVilleChange(option ? option.value : '')}
                    placeholder="Choisir une ville"
                    isClearable
                    classNamePrefix="react-select"
                    styles={{
                      menu: provided => ({ ...provided, zIndex: 9999 }),
                      control: provided => ({ ...provided, minHeight: 40, borderRadius: 10, fontSize: 15 }),
                    }}
                  />
                </div>

                {/* Price Input */}
                <div className={`colis-form-input-${theme}`}>
                  <label htmlFor="prix">
                    Prix <span className="required-star">*</span>
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8, color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}><TfiMoney /></span>
                    <input
                      id="prix"
                      placeholder="Ex: 250.00"
                      type="number"
                      value={formData.prix}
                      onChange={e => handleInputChange('prix', e.target.value)}
                      className={`ant-input`}
                      required
                      min={0}
                      step="0.01"
                      style={{ flex: 1 }}
                    />
                    <span title="Entrer le prix du produit en DH" style={{ marginLeft: 8, color: theme === 'dark' ? '#94a3b8' : '#6b7280', cursor: 'help' }}>i</span>
                  </div>
                </div>

                {/* Product Nature Input */}
                <div className={`colis-form-input-${theme}`}>
                  <label htmlFor="produit">
                    Nature de produit
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8, color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}><AiFillProduct /></span>
                    <input
                      id="produit"
                      placeholder="Ex: Vêtements, Électronique..."
                      value={formData.produit}
                      onChange={e => handleInputChange('produit', e.target.value)}
                      className={`ant-input`}
                      style={{ flex: 1 }}
                    />
                    <span title="Entrer la nature de produit" style={{ marginLeft: 8, color: theme === 'dark' ? '#94a3b8' : '#6b7280', cursor: 'help' }}>i</span>
                  </div>
                </div>

                {/* Address Input */}
                <div className={`colis-form-input-${theme}`}>
                  <label htmlFor="adress">
                    Adresse
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8, color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}><FaMapLocation /></span>
                    <input
                      id="adress"
                      maxLength={300}
                      value={formData.adress}
                      onChange={e => handleInputChange('adress', e.target.value)}
                      placeholder="Ex: Rue 123, Quartier..."
                      className={`ant-input`}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              {/* TextArea for Commentaire */}
              <div className={`colis-form-input-${theme}`} style={{ width: '100%' }}>
                <label htmlFor="commentaire">
                  Commentaire
                </label>
                <textarea
                  id="commentaire"
                  maxLength={300}
                  value={formData.commentaire}
                  onChange={e => handleInputChange('commentaire', e.target.value)}
                  placeholder="Commentaire (Autre numéro, date de livraison...)"
                  rows={3}
                  className={`ant-input`}
                  style={{ borderRadius: 10, padding: '10px 14px', fontSize: 15, resize: 'vertical', minHeight: 60 }}
                />
              </div>
            </div>
          </div>

          {/* Right/Sidebar Section */}
          <div className={`colis-form-sidebar-${theme}`} style={{ flex: 1, minWidth: 220, maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Selected Ville Info */}
            {selectedVille && (
              <div className={`selected-ville-info-${theme}`} style={{ marginBottom: 16 }}>
                <div className='selected-ville-info-content'>
                  <h3>
                    <span role="img" aria-label="location">📍</span> {selectedVille.nom} - {selectedVille.tarif} DH
                  </h3>
                  <div className={`days-checkbox-list-${theme}`}>
                    {daysOfWeek.map((day) => (
                      <label key={day} className={selectedVille.disponibility && selectedVille.disponibility.includes(day) ? 'checked' : ''} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                        <input
                          type="checkbox"
                          checked={selectedVille.disponibility ? selectedVille.disponibility.includes(day) : false}
                          disabled
                          readOnly
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Professional Options Card for Checkboxes */}
            <div className={`option_colis_form-${theme} option_colis_form-card-${theme}`} style={{ marginBottom: 16 }}>
              <div className={`option_colis_form-title-${theme}`}>Options</div>
              <label className={`option-checkbox-label-${theme}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={formData.ouvrirColis}
                  onChange={e => handleInputChange('ouvrirColis', e.target.checked)}
                />
                <span role="img" aria-label="ouvrir">📦</span> Ouvrir Colis
              </label>
              <label className={`option-checkbox-label-${theme}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={formData.is_fragile}
                  onChange={e => handleInputChange('is_fragile', e.target.checked)}
                />
                <span role="img" aria-label="fragile">📎</span> Colis fragile
              </label>
              <label className={`option-checkbox-label-${theme}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={formData.is_remplace}
                  onChange={e => handleInputChange('is_remplace', e.target.checked)}
                />
                <span role="img" aria-label="remplace">🔄</span> Colis à remplacer
              </label>
            </div>

            {/* Footer Buttons */}
            <div className={`colis-form-footer-${theme}`} style={{ flexDirection: 'column', gap: 12, alignItems: 'stretch', marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
              <button
                type="submit"
                className="ant-btn ant-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
                disabled={loading}
              >
                {type === 'simple'
                  ? '✓ Confirmer & Demande Ramassage'
                  : '✓ Confirmer & Choisir Produit'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ColisFormAdmin;
