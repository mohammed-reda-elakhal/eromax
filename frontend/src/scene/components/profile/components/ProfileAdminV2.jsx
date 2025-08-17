import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaSave, FaShieldAlt, FaUser, FaKey, FaCheck } from "react-icons/fa";
import {
  fetchAdminProfile,
  updateAdminProfileV2,
  updateAdminPasswordV2,
} from "../../../../redux/apiCalls/profileApiCalls2";

function ProfileAdminV2({ theme }) {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const userId = authUser?._id;

  const { loading, error, successMessage, admin } = useSelector(
    (state) => state.profileV2
  );

  const [profileForm, setProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Local state for API key backfill action (no Redux)
  const [bfRole, setBfRole] = useState("client");
  const [bfDryRun, setBfDryRun] = useState(true);
  const [bfLimit, setBfLimit] = useState(50);
  const [bfLoading, setBfLoading] = useState(false);
  const [bfResult, setBfResult] = useState(null);

  useEffect(() => {
    if (userId) dispatch(fetchAdminProfile(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (admin) {
      setProfileForm({
        nom: admin.nom || "",
        prenom: admin.prenom || "",
        username: admin.username || "",
        email: admin.email || "",
        tele: admin.tele || "",
        message: admin.message || "",
        permission: admin.permission || "none",
        type: admin.type || "normal",
      });
    }
  }, [admin]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitProfile = (e) => {
    e.preventDefault();
    if (!userId) return;
    dispatch(updateAdminProfileV2(userId, profileForm));
  };

  const onChangePassword = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitPassword = (e) => {
    e.preventDefault();
    if (!userId) return;
    dispatch(updateAdminPasswordV2(userId, passwordForm));
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  // Trigger admin backfill: calls POST /api/admin/apikey/backfill
  const onBackfill = async () => {
    try {
      setBfLoading(true);
      setBfResult(null);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Missing auth token. Please login again.");
        setBfLoading(false);
        return;
      }
      const url = `${import.meta.env.VITE_BASE_URL}/api/admin/apikey/backfill?role=${encodeURIComponent(
        bfRole
      )}&dryRun=${bfDryRun ? "true" : "false"}&limit=${Number(bfLimit) || 50}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Backfill failed");
      setBfResult(data);
      if (data?.results?.length && !bfDryRun) {
        // For immediate visibility, show the first few secrets (will be removed later as requested)
        console.log("Backfill generated keys:", data.results.slice(0, 5));
      }
    } catch (err) {
      alert(err.message || "Failed to backfill API keys");
    } finally {
      setBfLoading(false);
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

        {/* Admin Profile Section */}
        <section className="profile-section">
          <h3>
            <FaUser />
            Personal Information (Admin)
          </h3>
          {admin ? (
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
                  <label>Email</label>
                  <input
                    className="profile-input"
                    type="email"
                    name="email"
                    value={profileForm.email || ""}
                    onChange={onChange}
                    placeholder="Enter email"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    className="profile-input"
                    name="tele"
                    value={profileForm.tele || ""}
                    onChange={onChange}
                    placeholder="Enter phone"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Message</label>
                  <textarea
                    className="profile-input"
                    name="message"
                    rows={3}
                    value={profileForm.message || ""}
                    onChange={onChange}
                    placeholder="Enter message"
                  />
                </div>
                <div className="form-group">
                  <label>Permission</label>
                  <select
                    className="profile-input"
                    name="permission"
                    value={profileForm.permission || "none"}
                    onChange={onChange}
                    disabled
                  >
                    <option value="none">None</option>
                    <option value="all">All</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    className="profile-input"
                    name="type"
                    value={profileForm.type || "normal"}
                    onChange={onChange}
                    disabled
                  >
                    <option value="normal">Normal</option>
                    <option value="super">Super</option>
                  </select>
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

        {/* API Key Backfill (temporary admin tool) */}
        <section className="profile-section">
          <h3>
            <FaKey />
            API Key Backfill (Temporary)
          </h3>
          <div className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Role</label>
                <select
                  className="profile-input"
                  value={bfRole}
                  onChange={(e) => setBfRole(e.target.value)}
                >
                  <option value="client">Client</option>
                  <option value="livreur">Livreur</option>
                </select>
              </div>
              <div className="form-group">
                <label>Dry Run</label>
                <select
                  className="profile-input"
                  value={bfDryRun ? "true" : "false"}
                  onChange={(e) => setBfDryRun(e.target.value === "true")}
                >
                  <option value="true">True (preview only)</option>
                  <option value="false">False (persist keys)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Limit</label>
                <input
                  className="profile-input"
                  type="number"
                  min={1}
                  max={1000}
                  value={bfLimit}
                  onChange={(e) => setBfLimit(e.target.value)}
                />
              </div>
            </div>
            <button type="button" className="profile-btn btn-primary" onClick={onBackfill} disabled={bfLoading}>
              {bfLoading ? <div className="loading-spinner" /> : <FaKey />}
              {bfDryRun ? "Preview Backfill" : "Run Backfill"}
            </button>
            {bfResult && (
              <div className="message" style={{ marginTop: 12 }}>
                <strong>{bfResult.message}</strong>
                <div style={{ marginTop: 6 }}>
                  Role: {bfResult.role} | Count: {bfResult.count}
                </div>
                {/* Intentionally show only the first 5 to avoid clutter; secrets are one-time */}
                {Array.isArray(bfResult.results) && bfResult.results.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 600 }}>Sample:</div>
                    <pre style={{ whiteSpace: "pre-wrap" }}>
{JSON.stringify(bfResult.results.slice(0, 5), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfileAdminV2;
