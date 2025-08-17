import { toast } from "react-toastify";
import request from "../../utils/request";
import { profileV2Actions } from "../slices/profileV2Slice";

// Fetch complete client profile (client + store + wallet + payments + stats)
export function fetchClientProfile(userId) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.get(`/api/profile/client/${userId}`);
      dispatch(profileV2Actions.setProfile(data.data));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to load profile";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

// Generate API Secret (Client)
export function generateClientApiSecretV2(userId) {
  return async (dispatch) => {
    try {
      const { data } = await request.post(`/api/profile/client/${userId}/api-secret`);
      toast.success(data.message || 'API secret generated');
      // Do not store secret in Redux; return for one-time UI display
      return data.data; // { keyId, apiKey, status, secret, fingerprint }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate API secret';
      toast.error(errorMessage);
      throw error;
    }
  };
}

// Generate API Secret (Livreur)
export function generateLivreurApiSecretV2(userId) {
  return async (dispatch) => {
    try {
      const { data } = await request.post(`/api/profile/livreur/${userId}/api-secret`);
      toast.success(data.message || 'API secret generated');
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate API secret';
      toast.error(errorMessage);
      throw error;
    }
  };
}

// Fetch livreur profile (+ stats if provided by API)
export function fetchLivreurProfile(userId) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.get(`/api/profile/livreur/${userId}`);
      dispatch(profileV2Actions.setProfile(data.data));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to load livreur profile";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

// Update client personal info
export function updateClientProfileV2(userId, updateData) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.put(`/api/profile/client/${userId}`, updateData);
      dispatch(profileV2Actions.setClient(data.data));
      toast.success(data.message || "Profile updated successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

// Update livreur personal info
export function updateLivreurProfileV2(userId, updateData) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.put(`/api/profile/livreur/${userId}`, updateData);
      dispatch(profileV2Actions.setLivreur(data.data));
      toast.success(data.message || "Livreur profile updated successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update livreur profile";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

// Update client password
export function updateClientPasswordV2(userId, passwordData) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.put(`/api/profile/client/${userId}/password`, passwordData);
      dispatch(profileV2Actions.setSuccessMessage(data.message || "Password updated successfully"));
      toast.success(data.message || "Password updated successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update password";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

// Update livreur password
export function updateLivreurPasswordV2(userId, passwordData) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.put(`/api/profile/livreur/${userId}/password`, passwordData);
      dispatch(profileV2Actions.setSuccessMessage(data.message || "Password updated successfully"));
      toast.success(data.message || "Password updated successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update password";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

// Create/update store
export function updateClientStoreV2(userId, storeData) {
  return async (dispatch) => {

    try {

       // Get token and user data from cookies
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      // Check for token and user data
      if (!token || !user) {
        throw new Error('Missing authentication token or user information.');
      }

      // Set up headers with the token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.put(`/api/profile/client/${userId}/store`, storeData , config);
      dispatch(profileV2Actions.setStore(data.data));
      toast.success(data.message || "Store updated successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update store";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

// Wallet
export function fetchClientWalletV2(userId) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.get(`/api/profile/client/${userId}/wallet`);
      dispatch(profileV2Actions.setWallet(data.data.wallet));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to load wallet";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

// Payments
export function fetchClientPaymentsV2(userId) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.get(`/api/profile/client/${userId}/payments`);
      dispatch(profileV2Actions.setPayments(data.data));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to load payment methods";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

export function addClientPaymentV2(userId, paymentData) {
  return async (dispatch) => {
    try {
      console.log('addClientPaymentV2 - received userId:', userId, 'type:', typeof userId);
      console.log('addClientPaymentV2 - received paymentData:', paymentData, 'type:', typeof paymentData);
      console.log('addClientPaymentV2 - constructing URL with userId:', userId);
      
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.post(`/api/profile/client/${userId}/payments`, paymentData);
      dispatch(profileV2Actions.addPayment(data.data));
      toast.success(data.message || "Payment method added");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to add payment method";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

export function updateClientPaymentV2(userId, paymentId, updateData) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.put(`/api/profile/client/${userId}/payments/${paymentId}`, updateData);
      dispatch(profileV2Actions.updatePayment(data.data));
      toast.success(data.message || "Payment method updated");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update payment method";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

export function deleteClientPaymentV2(userId, paymentId) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.delete(`/api/profile/client/${userId}/payments/${paymentId}`);
      dispatch(profileV2Actions.removePayment(paymentId));
      toast.success(data.message || "Payment method deleted");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete payment method";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

// Stats
export function fetchClientStatsV2(userId) {
  return async (dispatch) => {
    try {
      const { data } = await request.get(`/api/profile/client/${userId}/stats`);
      dispatch(profileV2Actions.setStats(data.data));
    } catch (error) {
      // stats are optional; don't toast here
      console.error(error);
    }
  };
}

// Admin profile
export function fetchAdminProfile(userId) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.get(`/api/profile/admin/${userId}`);
      dispatch(profileV2Actions.setProfile(data.data));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to load admin profile";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

export function updateAdminProfileV2(userId, updateData) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.put(`/api/profile/admin/${userId}`, updateData);
      dispatch(profileV2Actions.setAdmin(data.data));
      toast.success(data.message || "Admin profile updated successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update admin profile";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

export function updateAdminPasswordV2(userId, passwordData) {
  return async (dispatch) => {
    try {
      dispatch(profileV2Actions.fetchStart());
      const { data } = await request.put(`/api/profile/admin/${userId}/password`, passwordData);
      dispatch(profileV2Actions.setSuccessMessage(data.message || "Password updated successfully"));
      toast.success(data.message || "Password updated successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update password";
      dispatch(profileV2Actions.fetchFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}
