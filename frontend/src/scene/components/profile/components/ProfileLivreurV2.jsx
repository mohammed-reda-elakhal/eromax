import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLivreurProfile,
  updateLivreurProfileV2,
  updateLivreurPasswordV2,
  generateLivreurApiSecretV2,
} from "../../../../redux/apiCalls/profileApiCalls2";
import {
  FaUser,
  FaShieldAlt,
  FaChartBar,
  FaSave,
  FaCheck,
  FaPlus,
  FaTimes,
  FaKey,
} from "react-icons/fa";

function ProfileLivreurV2({ theme }) {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const userId = authUser?._id;

  const { loading, error, successMessage, livreur, stats } = useSelector(
    (state) => state.profileV2
  );

  const [profileForm, setProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [initialProfileSnapshot, setInitialProfileSnapshot] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Ephemeral API secret display state
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [generatedSecret, setGeneratedSecret] = useState(null); // { secret, fingerprint, keyId, apiKey, status }

  useEffect(() => {
    if (userId) {
      dispatch(fetchLivreurProfile(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (livreur) {
      setProfileForm({
        nom: livreur.nom || "",
        prenom: livreur.prenom || "",
        email: livreur.email || "",
        tele: livreur.tele || "",
        ville: livreur.ville || "",
        adresse: livreur.adresse || "",
        username: livreur.username || "",
        cin: livreur.cin || "",
        type: livreur.type || "simple",
        domaine: livreur.domaine || "",
        // tarif hidden in UI, keep in state if provided but not shown
        tarif: livreur.tarif ?? "",
        // keep villes as array
        villes: Array.isArray(livreur.villes) ? livreur.villes : [],
      });
    }
  }, [livreur]);

  // Set initial snapshot when profile form first populated or when profile changes
  useEffect(() => {
    if (livreur) {
      const snapshot = {
        nom: livreur.nom || "",
        prenom: livreur.prenom || "",
        email: livreur.email || "",
        tele: livreur.tele || "",
        ville: livreur.ville || "",
        adresse: livreur.adresse || "",
        username: livreur.username || "",
        cin: livreur.cin || "",
        type: livreur.type || "simple",
        domaine: livreur.domaine || "",
        tarif: livreur.tarif ?? "",
        villes: Array.isArray(livreur.villes) ? livreur.villes : [],
      };
      setInitialProfileSnapshot(snapshot);
    }
  }, [livreur]);

  // Track dirty state: profile changes or any password field filled
  useEffect(() => {
    const profileChanged = initialProfileSnapshot
      ? JSON.stringify({
          ...profileForm,
          // normalize arrays order/content
          villes: Array.isArray(profileForm.villes) ? profileForm.villes : [],
        }) !== JSON.stringify({
          ...initialProfileSnapshot,
          villes: Array.isArray(initialProfileSnapshot.villes)
            ? initialProfileSnapshot.villes
            : [],
        })
      : false;

    const passwordChanged = Boolean(
      passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword
    );

    setIsDirty(profileChanged || passwordChanged);
  }, [profileForm, passwordForm, initialProfileSnapshot]);

  // Warn before leaving the page if there are unsaved changes
  useEffect(() => {
    const handler = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitProfile = (e) => {
    e.preventDefault();
    if (!userId) return;
    const payload = {
      ...profileForm,
      // tarif hidden; do not send if empty
      tarif:
        profileForm.tarif === "" || profileForm.tarif === null
          ? undefined
          : Number(profileForm.tarif),
      // villes already maintained as array
      villes: Array.isArray(profileForm.villes) ? profileForm.villes : [],
    };
    dispatch(updateLivreurProfileV2(userId, payload));
  };

  const onChangePassword = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitPassword = (e) => {
    e.preventDefault();
    if (!userId) return;
    dispatch(updateLivreurPasswordV2(userId, passwordForm));
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
      alert('API Key copied');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text || '';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('API Key copied');
    }
  };

  // Reset dirty state on successful save (profile or password)
  useEffect(() => {
    if (successMessage) {
      setInitialProfileSnapshot(profileForm);
      setIsDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successMessage]);

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

        {/* Livreur Profile Section */}
        <section className="profile-section">
          <h3>
            <FaUser />
            Personal Information (Livreur)
          </h3>
          {livreur ? (
            <form onSubmit={onSubmitProfile} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    className="profile-input"
                    name="nom"
                    value={profileForm.nom || ""}
                    onChange={onChange}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    className="profile-input"
                    name="prenom"
                    value={profileForm.prenom || ""}
                    onChange={onChange}
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
                    onChange={onChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    className="profile-input"
                    name="tele"
                    value={profileForm.tele || ""}
                    onChange={onChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    className="profile-input"
                    name="ville"
                    value={profileForm.ville || ""}
                    onChange={onChange}
                    placeholder="Enter city"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    className="profile-input"
                    name="adresse"
                    value={profileForm.adresse || ""}
                    onChange={onChange}
                    placeholder="Enter address"
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    className="profile-input"
                    name="username"
                    value={profileForm.username || ""}
                    onChange={onChange}
                    placeholder="Enter username"
                  />
                </div>
                <div className="form-group">
                  <label>CIN</label>
                  <input
                    className="profile-input"
                    name="cin"
                    value={profileForm.cin || ""}
                    onChange={onChange}
                    placeholder="Enter CIN"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <input
                    className="profile-input"
                    name="type"
                    value={profileForm.type || ""}
                    onChange={onChange}
                    disabled
                    placeholder="simple / ..."
                  />
                </div>
                <div className="form-group">
                  <label>Domaine</label>
                  <input
                    className="profile-input"
                    name="domaine"
                    value={profileForm.domaine || ""}
                    onChange={onChange}
                    placeholder="Enter domain"
                  />
                </div>
                {/* Tarif hidden */}
                {/* Villes chip-style input */}
                <VillesInput
                  villes={Array.isArray(profileForm.villes) ? profileForm.villes : []}
                  setVilles={(v) => setProfileForm((prev) => ({ ...prev, villes: v }))}
                />
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
              <div className="wallet-value">{livreur?.keyId || 'Not assigned'}</div>
            </div>
            <div className="wallet-item">
              <div className="wallet-label">API Key</div>
              <div className="wallet-value" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  className="profile-input"
                  value={livreur?.apiKey || ''}
                  readOnly
                  style={{ maxWidth: 360 }}
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  className="profile-btn btn-secondary"
                  onClick={() => copyToClipboard(livreur?.apiKey)}
                  disabled={!livreur?.apiKey}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="wallet-item">
              <div className="wallet-label">Status</div>
              <div className={`wallet-value ${livreur?.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                {livreur?.status || 'inactive'}
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
                  const data = await dispatch(generateLivreurApiSecretV2(userId));
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
                  onChange={onChangePassword}
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
                  onChange={onChangePassword}
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
                  onChange={onChangePassword}
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
            Delivery Statistics
          </h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.totalColis ?? 0}</div>
              <div className="stat-label">Total Colis</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.delivered ?? 0}</div>
              <div className="stat-label">Delivered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.inProgress ?? 0}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfileLivreurV2;

// Villes chip list component (local to this file)
function VillesInput({ villes, setVilles }) {
  const [input, setInput] = useState("");

  const addVille = () => {
    const v = input.trim();
    if (!v) return;
    if (!villes.includes(v)) {
      setVilles([...villes, v]);
    }
    setInput("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addVille();
    }
  };

  const removeVille = (name) => {
    setVilles(villes.filter((v) => v !== name));
  };

  return (
    <div className="form-group">
      <label>Villes</label>
      <div className="villes-input" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          className="profile-input"
          type="text"
          placeholder="Type a city and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="profile-btn btn-secondary" onClick={addVille}>
          <FaPlus /> Add
        </button>
      </div>
      <div className="villes-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {villes.length === 0 && (
          <span style={{ color: 'var(--placeholder-color)' }}>No cities added</span>
        )}
        {villes.map((v) => (
          <span key={v} className="chip" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            background: 'var(--gray2)',
            borderRadius: 999,
            color: 'inherit'
          }}>
            {v}
            <button
              type="button"
              onClick={() => removeVille(v)}
              className="chip-remove"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit' }}
              aria-label={`Remove ${v}`}
            >
              <FaTimes />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
