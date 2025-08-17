import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClientProfile,
  updateClientProfileV2,
  updateClientStoreV2,
  updateClientPasswordV2,
  generateClientApiSecretV2,
} from "../../../../redux/apiCalls/profileApiCalls2";
import { 
  createPayement, 
  ModifierPayement, 
  deletePayement,
  getPaymentsByClientId
} from "../../../../redux/apiCalls/payementApiCalls";
import { getMeth_payement } from "../../../../redux/apiCalls/methPayementApiCalls";
import { 
  FaUser, 
  FaStore, 
  FaWallet, 
  FaCreditCard, 
  FaShieldAlt, 
  FaChartBar,
  FaKey,
  FaSave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaChevronDown
} from "react-icons/fa";

function ProfileClientV2({ theme }) {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const userId = authUser?._id;
  
  const { loading, error, successMessage, client, store, wallet, payments, stats } = useSelector(
    (state) => state.profileV2
  );
  const { meth_payement, isFetching: methodsLoading } = useSelector(
    (state) => state.meth_payement
  );

  const [profileForm, setProfileForm] = useState({});
  const [storeForm, setStoreForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [paymentForm, setPaymentForm] = useState({ 
    methodeId: "", 
    nom: "",
    rib: ""
  });
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [ribSections, setRibSections] = useState({
    codeBanque: "",
    codeVille: "",
    numeroCompte: "",
    cleRib: ""
  });
  const [ribError, setRibError] = useState("");
  
  const dropdownRef = useRef(null);
  const codeBanqueRef = useRef(null);
  const codeVilleRef = useRef(null);
  const numeroCompteRef = useRef(null);
  const cleRibRef = useRef(null);

  const [editingPayment, setEditingPayment] = useState(null);

  // Ephemeral API secret display state
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [generatedSecret, setGeneratedSecret] = useState(null); // { secret, fingerprint, keyId, apiKey, status }

  useEffect(() => {
    if (userId) {
      dispatch(fetchClientProfile(userId));
      // Fetch payments using the correct API
      dispatch(getPaymentsByClientId(userId));
    }
    // Fetch available payment methods
    dispatch(getMeth_payement());
  }, [dispatch, userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPaymentMethods(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (client) {
      setProfileForm({
        nom: client.nom || "",
        prenom: client.prenom || "",
        email: client.email || "",
        tele: client.tele || "",
        ville: client.ville || "",
        adresse: client.adresse || "",
        username: client.username || "",
        cin: client.cin || "",
      });
    }
    if (store) {
      setStoreForm({
        storeName: store.storeName || "",
        adress: store.adress || "",
        tele: store.tele || "",
        Bio: store.Bio || "",
        message: store.message || "",
        default: !!store.default,
      });
    }
  }, [client, store]);

  const onChange = (setter) => (e) => {
    const { name, value, type, checked } = e.target;
    setter((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRibSectionChange = (section, value) => {
    // Only allow digits
    const numericValue = value.replace(/\D/g, '');
    
    setRibSections(prev => ({ ...prev, [section]: numericValue }));
    
    // Combine all sections for the main rib field
    const combinedRib = Object.values({ ...ribSections, [section]: numericValue }).join('');
    setPaymentForm(prev => ({ ...prev, rib: combinedRib }));
    
    // Clear error when user starts typing
    if (ribError) setRibError("");

    // Auto-focus to next section when current section is complete
    if (numericValue.length === getMaxLength(section)) {
      focusNextSection(section);
    }
  };

  const getRibSectionClassName = (section) => {
    const value = ribSections[section];
    const maxLength = getMaxLength(section);
    const isCompleted = value.length === maxLength;
    const isEmpty = value.length === 0;
    
    let className = "rib-input-section";
    if (isCompleted) className += " completed";
    else if (!isEmpty) className += " typing";
    
    return className;
  };

  const getMaxLength = (section) => {
    switch (section) {
      case 'codeBanque': return 3;
      case 'codeVille': return 3;
      case 'numeroCompte': return 16;
      case 'cleRib': return 2;
      default: return 0;
    }
  };

  const focusNextSection = (currentSection) => {
    switch (currentSection) {
      case 'codeBanque':
        codeVilleRef.current?.focus();
        break;
      case 'codeVille':
        numeroCompteRef.current?.focus();
        break;
      case 'numeroCompte':
        cleRibRef.current?.focus();
        break;
      case 'cleRib':
        // Last section, no need to focus anywhere else
        break;
      default:
        break;
    }
  };

  const handleRibKeyDown = (e, section) => {
    // Handle backspace to go to previous section when current section is empty
    if (e.key === 'Backspace' && ribSections[section].length === 0) {
      e.preventDefault();
      focusPreviousSection(section);
    }
  };

  const focusPreviousSection = (currentSection) => {
    switch (currentSection) {
      case 'codeVille':
        codeBanqueRef.current?.focus();
        break;
      case 'numeroCompte':
        codeVilleRef.current?.focus();
        break;
      case 'cleRib':
        numeroCompteRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const handleRibFocus = (section) => {
    // Clear any existing errors when user focuses on any RIB field
    if (ribError) setRibError("");
  };

  const handleRibPaste = (e, section) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numericValue = pastedText.replace(/\D/g, '');
    
    if (numericValue.length === 24) {
      // If pasting a complete RIB, populate all sections
      populateRibSections(numericValue);
      setPaymentForm(prev => ({ ...prev, rib: numericValue }));
    } else {
      // If pasting partial data, handle it section by section
      const maxLength = getMaxLength(section);
      const sectionValue = numericValue.substring(0, maxLength);
      handleRibSectionChange(section, sectionValue);
    }
  };

  const validateRib = () => {
    const { codeBanque, codeVille, numeroCompte, cleRib } = ribSections;
    
    if (codeBanque.length !== 3) {
      setRibError("Code Banque must be exactly 3 digits");
      return false;
    }
    if (codeVille.length !== 3) {
      setRibError("Code Ville must be exactly 3 digits");
      return false;
    }
    if (numeroCompte.length !== 16) {
      setRibError("N° Compte must be exactly 16 digits");
      return false;
    }
    if (cleRib.length !== 2) {
      setRibError("Clé RIB must be exactly 2 digits");
      return false;
    }
    
    setRibError("");
    return true;
  };

  const onSubmitProfile = (e) => {
    e.preventDefault();
    if (userId) dispatch(updateClientProfileV2(userId, profileForm));
  };

  const onSubmitStore = (e) => {
    e.preventDefault();
    if (userId) dispatch(updateClientStoreV2(userId, storeForm));
  };

  const onSubmitPassword = (e) => {
    e.preventDefault();
    if (userId) dispatch(updateClientPasswordV2(userId, passwordForm));
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const onSubmitPayment = (e) => {
    e.preventDefault();
    if (!validateRib()) return;
    
    if (!userId) {
      alert('User authentication error. Please refresh the page and try again.');
      return;
    }
    
    if (userId && paymentForm.methodeId && paymentForm.nom) {
      // Find the selected payment method to get the name
      const selectedMethod = meth_payement.find(m => m._id === paymentForm.methodeId);
      if (selectedMethod) {
        const paymentData = {
          clientId: userId,
          nom: paymentForm.nom,
          rib: paymentForm.rib,
          idBank: paymentForm.methodeId
        };
        
        if (editingPayment) {
          // Update existing payment
          dispatch(ModifierPayement(editingPayment._id, paymentData));
        } else {
          // Create new payment
          dispatch(createPayement(paymentData));
        }
        resetPaymentForm();
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({ methodeId: "", nom: "", rib: "" });
    setRibSections({ codeBanque: "", codeVille: "", numeroCompte: "", cleRib: "" });
    setRibError("");
    setEditingPayment(null);
  };

  const cancelEdit = () => {
    resetPaymentForm();
  };

  const getPaymentMethodName = (paymentId) => {
    const method = meth_payement.find(m => m._id === paymentId);
    return method ? method.Bank : 'Unknown Method';
  };

  const getPaymentMethodImage = (paymentId) => {
    const method = meth_payement.find(m => m._id === paymentId);
    return method?.image?.url || null;
  };

  // Mask API key for display: show first 4 and last 4 chars
  const maskApiKey = (key) => {
    if (!key || typeof key !== 'string') return '—';
    if (key.length <= 8) return '********';
    return `${key.slice(0,4)}••••••••${key.slice(-4)}`;
  };

  // Copy helper
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '');
      // Optional: quick feedback
      alert('API Key copied');
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text || '';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('API Key copied');
    }
  };

  const populateRibSections = (ribString) => {
    if (ribString && ribString.length === 24) {
      setRibSections({
        codeBanque: ribString.substring(0, 3),
        codeVille: ribString.substring(3, 6),
        numeroCompte: ribString.substring(6, 22),
        cleRib: ribString.substring(22, 24)
      });
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    if (payment.rib) {
      populateRibSections(payment.rib);
      setPaymentForm(prev => ({ 
        ...prev, 
        nom: payment.nom || "",
        rib: payment.rib,
        methodeId: payment.idBank?._id || payment.methodeId || ""
      }));
    }
  };

  const handleDeletePayment = (paymentId) => {
    if (!userId) {
      alert('User authentication error. Please refresh the page and try again.');
      return;
    }
    
    if (userId && paymentId) {
      // Show confirmation modal before deleting
      if (window.confirm('Are you sure you want to delete this payment method?')) {
        dispatch(deletePayement(paymentId));
      }
    }
  };



  return (
    <div className="profile-container">
      <div className="profile-grid">
        {/* Messages */}
        {error && (
          <div className="message message-error">
            <FaShieldAlt />
            {error}
          </div>
        )}
        {successMessage && (
          <div className="message message-success">
            <FaCheck />
            {successMessage}
          </div>
        )}

        {/* Client Profile Section */}
        <section className="profile-section">
          <h3>
            <FaUser />
            Personal Information
          </h3>
          {client ? (
            <form onSubmit={onSubmitProfile} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    className="profile-input"
                    name="nom"
                    value={profileForm.nom || ""}
                    onChange={onChange(setProfileForm)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    className="profile-input"
                    name="prenom"
                    value={profileForm.prenom || ""}
                    onChange={onChange(setProfileForm)}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    className="profile-input"
                    name="email"
                    type="email"
                    value={profileForm.email || ""}
                    onChange={onChange(setProfileForm)}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    className="profile-input"
                    name="tele"
                    value={profileForm.tele || ""}
                    onChange={onChange(setProfileForm)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    className="profile-input"
                    name="ville"
                    value={profileForm.ville || ""}
                    onChange={onChange(setProfileForm)}
                    placeholder="Enter city"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    className="profile-input"
                    name="adresse"
                    value={profileForm.adresse || ""}
                    onChange={onChange(setProfileForm)}
                    placeholder="Enter address"
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    className="profile-input"
                    name="username"
                    value={profileForm.username || ""}
                    onChange={onChange(setProfileForm)}
                    placeholder="Enter username"
                  />
                </div>
                <div className="form-group">
                  <label>CIN</label>
                  <input
                    className="profile-input"
                    name="cin"
                    value={profileForm.cin || ""}
                    onChange={onChange(setProfileForm)}
                    placeholder="Enter CIN"
                  />
                </div>
              </div>
              <button type="submit" className="profile-btn btn-primary" disabled={loading}>
                {loading ? <div className="loading-spinner" /> : <FaSave />}
                Save Profile
              </button>
            </form>
          ) : (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              Loading profile...
            </div>
          )}
        </section>

        {/* API Integration Section */}
        <section className="profile-section">
          <h3>
            <FaKey />
            API Integration
          </h3>
          <div className="wallet-info">
            <div className="wallet-item">
              <div className="wallet-label">Key ID</div>
              <div className="wallet-value">{client?.keyId || 'Not assigned'}</div>
            </div>
            <div className="wallet-item">
              <div className="wallet-label">API Key</div>
              <div className="wallet-value" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  className="profile-input"
                  value={client?.apiKey || ''}
                  readOnly
                  style={{ maxWidth: 360 }}
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  className="profile-btn btn-secondary"
                  onClick={() => copyToClipboard(client?.apiKey)}
                  disabled={!client?.apiKey}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="wallet-item">
              <div className="wallet-label">Status</div>
              <div className={`wallet-value ${client?.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                {client?.status || 'inactive'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              className="profile-btn btn-primary"
              disabled={loading || !userId}
              onClick={async () => {
                try {
                  const data = await dispatch(generateClientApiSecretV2(userId));
                  if (data && data.secret) {
                    setGeneratedSecret(data);
                    setShowSecretModal(true);
                  }
                } catch (e) {
                  // errors are toasted in thunk
                }
              }}
            >
              <FaKey /> Generate API Secret
            </button>
          </div>
        </section>

        {showSecretModal && generatedSecret && (
          <div className="modal-overlay">
            <div className="modal">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaKey /> Your New API Secret
              </h4>
              <p style={{ color: 'var(--warning-color)', fontSize: 14 }}>
                This secret is shown only once. Copy and store it securely. You won't be able to see it again.
              </p>
              <div className="modal-body">
                <div className="wallet-info">
                  <div className="wallet-item">
                    <div className="wallet-label">Key ID</div>
                    <div className="wallet-value">{generatedSecret.keyId}</div>
                  </div>
                  <div className="wallet-item">
                    <div className="wallet-label">Fingerprint</div>
                    <div className="wallet-value">{generatedSecret.fingerprint}</div>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 8 }}>
                  <label>API Secret</label>
                  <input
                    type="text"
                    className="profile-input"
                    value={generatedSecret.secret}
                    readOnly
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="profile-btn btn-secondary"
                  onClick={() => {
                    setShowSecretModal(false);
                    setGeneratedSecret(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Store Section */}
        <section className="profile-section">
          <h3>
            <FaStore />
            Store Information
          </h3>
          <form onSubmit={onSubmitStore} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Store Name</label>
                <input
                  className="profile-input"
                  name="storeName"
                  value={storeForm.storeName || ""}
                  onChange={onChange(setStoreForm)}
                  placeholder="Enter store name"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  className="profile-input"
                  name="adress"
                  value={storeForm.adress || ""}
                  onChange={onChange(setStoreForm)}
                  placeholder="Enter store address"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  className="profile-input"
                  name="tele"
                  value={storeForm.tele || ""}
                  onChange={onChange(setStoreForm)}
                  placeholder="Enter store phone"
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <input
                  className="profile-input"
                  name="Bio"
                  value={storeForm.Bio || ""}
                  onChange={onChange(setStoreForm)}
                  placeholder="Enter store description"
                />
              </div>
              <div className="form-group">
                <label>Welcome Message</label>
                <input
                  className="profile-input"
                  name="message"
                  value={storeForm.message || ""}
                  onChange={onChange(setStoreForm)}
                  placeholder="Enter welcome message"
                />
              </div>
            </div>
            <button type="submit" className="profile-btn btn-primary" disabled={loading}>
              {loading ? <div className="loading-spinner" /> : <FaSave />}
              Save Store
            </button>
          </form>
        </section>

        {/* Wallet Section */}
        <section className="profile-section">
          <h3>
            <FaWallet />
            Wallet Information
          </h3>
          <div className="wallet-info">
            <div className="wallet-item">
              <div className="wallet-label">Wallet Key</div>
              <div className="wallet-value">{wallet?.key || "Not available"}</div>
            </div>
            <div className="wallet-item">
              <div className="wallet-label">Balance</div>
              <div className="wallet-value">{wallet?.solde ? `${wallet.solde} MAD` : "0 MAD"}</div>
            </div>
            <div className="wallet-item">
              <div className="wallet-label">Status</div>
              <div className={`wallet-value ${wallet?.active ? 'status-active' : 'status-inactive'}`}>
                {wallet?.active ? "Active" : "Inactive"}
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods Section */}
        <section className="profile-section">
          <h3>
            <FaCreditCard />
             {editingPayment ? 'Edit Payment Method' : 'Payment Methods'}
          </h3>
          <form onSubmit={onSubmitPayment} className="payment-form">
            <div className="form-group">
              <label>Payment Method</label>
              <div className="payment-method-selector" ref={dropdownRef}>
                <div 
                  className="payment-method-dropdown"
                  onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                >
                  <span>
                    {paymentForm.methodeId 
                      ? meth_payement.find(m => m._id === paymentForm.methodeId)?.Bank || 'Select Payment Method'
                      : 'Select Payment Method'
                    }
                  </span>
                  <FaChevronDown className={`dropdown-arrow ${showPaymentMethods ? 'rotated' : ''}`} />
                </div>
                {showPaymentMethods && (
                  <div className="payment-methods-dropdown">
                    {methodsLoading ? (
                      <div className="dropdown-loading">Loading...</div>
                    ) : meth_payement.length > 0 ? (
                      meth_payement.map((method) => (
                        <div
                          key={method._id}
                          className="payment-method-option"
                          onClick={() => {
                            setPaymentForm(prev => ({ ...prev, methodeId: method._id }));
                            setShowPaymentMethods(false);
                          }}
                        >
                          {method.image?.url && (
                            <img 
                              src={method.image.url} 
                              alt={method.Bank} 
                              className="payment-method-icon"
                            />
                          )}
                          <span>{method.Bank}</span>
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-empty">No payment methods available</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                className="profile-input"
                name="nom"
                value={paymentForm.nom || ""}
                onChange={onChange(setPaymentForm)}
                placeholder="Enter payment method name"
                required
              />
            </div>
            <div className="form-group">
              <label>RIB</label>
              <div className="rib-input-container">
                <div className="rib-section">
                                     <input
                     className={getRibSectionClassName('codeBanque')}
                     type="text"
                     value={ribSections.codeBanque}
                     onChange={(e) => handleRibSectionChange('codeBanque', e.target.value)}
                     onKeyDown={(e) => handleRibKeyDown(e, 'codeBanque')}
                     onFocus={() => handleRibFocus('codeBanque')}
                     onPaste={(e) => handleRibPaste(e, 'codeBanque')}
                     ref={codeBanqueRef}
                     placeholder="000"
                     maxLength={3}
                   />
                  <span className="rib-section-label">Code Banque</span>
                </div>
                <div className="rib-separator">-</div>
                <div className="rib-section">
                  <input
                     className={getRibSectionClassName('codeVille')}
                     type="text"
                     value={ribSections.codeVille}
                     onChange={(e) => handleRibSectionChange('codeVille', e.target.value)}
                     onKeyDown={(e) => handleRibKeyDown(e, 'codeVille')}
                     onFocus={() => handleRibFocus('codeVille')}
                     onPaste={(e) => handleRibPaste(e, 'codeVille')}
                     ref={codeVilleRef}
                     placeholder="000"
                     maxLength={3}
                   />
                  <span className="rib-section-label">Code Ville</span>
                </div>
                <div className="rib-separator">-</div>
                <div className="rib-section">
                                     <input
                     className={getRibSectionClassName('numeroCompte')}
                     type="text"
                     value={ribSections.numeroCompte}
                     onChange={(e) => handleRibSectionChange('numeroCompte', e.target.value)}
                     onKeyDown={(e) => handleRibKeyDown(e, 'numeroCompte')}
                     onFocus={() => handleRibFocus('numeroCompte')}
                     onPaste={(e) => handleRibPaste(e, 'numeroCompte')}
                     ref={numeroCompteRef}
                     placeholder="0000000000000000"
                     maxLength={16}
                   />
                  <span className="rib-section-label">N° Compte</span>
                </div>
                <div className="rib-separator">-</div>
                <div className="rib-section">
                <input
                     className="rib-input-section"
                     type="text"
                     value={ribSections.cleRib}
                     onChange={(e) => handleRibSectionChange('cleRib', e.target.value)}
                     onKeyDown={(e) => handleRibKeyDown(e, 'cleRib')}
                     onFocus={() => handleRibFocus('cleRib')}
                     onPaste={(e) => handleRibPaste(e, 'cleRib')}
                     ref={cleRibRef}
                     placeholder="00"
                     maxLength={2}
                   />
                  <span className="rib-section-label">Clé RIB</span>
                </div>
              </div>
              {ribError && <div className="rib-error">{ribError}</div>}
              <div className="rib-info">
                <small>Format: XXX-XXX-XXXXXXXXXXXXXXXX-XX (24 digits total)</small>
              </div>
            </div>
            <div className="payment-form-actions">
            <button 
              type="submit" 
              className="profile-btn btn-primary" 
                disabled={loading || !paymentForm.methodeId || !paymentForm.nom}
            >
              {loading ? <div className="loading-spinner" /> : <FaPlus />}
                {editingPayment ? 'Update Payment Method' : 'Add Payment Method'}
              </button>
              <button 
                type="button" 
                className="profile-btn btn-secondary" 
                onClick={resetPaymentForm}
                disabled={loading}
              >
                Clear Form
              </button>
                             {editingPayment && (
                 <button 
                   type="button" 
                   className="profile-btn btn-secondary" 
                   onClick={cancelEdit}
                   disabled={loading}
                 >
                   Cancel Edit
            </button>
               )}
            </div>
          </form>
          
          <div className="payment-methods">
            {payments && payments.length > 0 ? (
              payments.map((p) => (
                <div key={p._id} className="payment-item">
                  <div className="payment-info">
                     <h4>{p.nom}</h4>
                    <div className="payment-rib">{p.rib}</div>
                     <div className="payment-bank">
                       {p.idBank?.Bank || p.methodeId || 'Unknown Bank'}
                     </div>
                  </div>
                  <div className="payment-actions">
                    <button 
                       onClick={() => handleEditPayment(p)} 
                      className="profile-btn btn-secondary" 
                       disabled={loading}
                    >
                      <FaEdit />
                       Edit
                    </button>
                    <button 
                       onClick={() => handleDeletePayment(p._id)} 
                      className="profile-btn btn-danger" 
                      disabled={loading}
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--placeholder-color)' }}>
                No payment methods added yet
              </div>
            )}
          </div>
        </section>

        {/* Security Section */}
        <section className="profile-section">
          <h3>
            <FaShieldAlt />
            Security Settings
          </h3>
          <form onSubmit={onSubmitPassword} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  className="profile-input"
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={onChange(setPasswordForm)}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  className="profile-input"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={onChange(setPasswordForm)}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  className="profile-input"
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={onChange(setPasswordForm)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>
            <button type="submit" className="profile-btn btn-primary" disabled={loading}>
              {loading ? <div className="loading-spinner" /> : <FaShieldAlt />}
              Update Password
            </button>
          </form>
        </section>

        {/* Statistics Section */}
        <section className="profile-section">
          <h3>
            <FaChartBar />
            Account Statistics
          </h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.totalColis ?? 0}</div>
              <div className="stat-label">Total Colis</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.walletBalance ?? 0} MAD</div>
              <div className="stat-label">Wallet Balance</div>
              </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.paymentMethodsCount ?? 0}</div>
              <div className="stat-label">Payment Methods</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfileClientV2;
