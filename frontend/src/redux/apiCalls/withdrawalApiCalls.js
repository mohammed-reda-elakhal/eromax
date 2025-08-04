import { withdrawalActions } from "../slices/withdrawalSlice";
import { toast } from "react-toastify";
import request from "../../utils/request";
import { message} from 'antd';


// Fetch all withdrawals (admin only)
export function getAllWithdrawals(params = {}) {
  return async (dispatch) => {
    dispatch(withdrawalActions.fetchWithdrawalsStart());
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Add token to request headers
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Build query string from params
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/withdrawal${queryString ? `?${queryString}` : ''}`;

      const { data } = await request.get(url, { headers });
      dispatch(withdrawalActions.fetchWithdrawalsSuccess(data));
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to fetch withdrawals";
      dispatch(withdrawalActions.fetchWithdrawalsFailure(errorMessage));
      toast.error(errorMessage);
      throw error;
    }
  };
}

// Fetch a single withdrawal by ID
export function getWithdrawalById(id) {
  return async (dispatch) => {
    dispatch(withdrawalActions.fetchWithdrawalsStart());
    try {
      const { data } = await request.get(`/api/withdrawal/${id}`);
      dispatch(withdrawalActions.fetchWithdrawalByIdSuccess(data));
    } catch (error) {
      dispatch(withdrawalActions.fetchWithdrawalsFailure(error.message || "Failed to fetch withdrawal"));
      toast.error(error.message || "Failed to fetch withdrawal");
    }
  };
}

// Reset selected withdrawal
export function resetWithdrawal() {
  return async (dispatch) => {
    dispatch(withdrawalActions.fetchWithdrawalByIdSuccess(null));
  };
}

// Create a new withdrawal
export function createWithdrawal(withdrawalData) {
  return async (dispatch) => {
    dispatch(withdrawalActions.fetchWithdrawalsStart());
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Add token to request headers
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const { data } = await request.post('/api/withdrawal', withdrawalData, { headers });
      dispatch(withdrawalActions.createWithdrawalSuccess(data));
      toast.success("Withdrawal request created successfully");
    } catch (error) {
      dispatch(withdrawalActions.fetchWithdrawalsFailure(error.message || "Failed to create withdrawal"));
      toast.error(error.message || "Failed to create withdrawal");
    }
  };
}

// Admin create withdrawal on behalf of user
export function createAdminWithdrawal(withdrawalData) {
  return async (dispatch) => {
    dispatch(withdrawalActions.fetchWithdrawalsStart());
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Add token to request headers
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const { data } = await request.post('/api/withdrawal/admin', withdrawalData, { headers });
      dispatch(withdrawalActions.createWithdrawalSuccess(data.withdrawal));
      toast.success("Admin withdrawal created successfully");
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to create admin withdrawal";
      dispatch(withdrawalActions.fetchWithdrawalsFailure(errorMessage));
      toast.error(errorMessage);
      throw error;
    }
  };
}

// Update withdrawal status (admin only)
export function updateWithdrawalStatus(id, statusData, file) {
  return async (dispatch) => {
    dispatch(withdrawalActions.fetchWithdrawalsStart());
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append('status', statusData.status);
      if (statusData.note) formData.append('note', statusData.note);
      if (file) formData.append('verment_preuve', file);

      console.log('Uploading file to backend...');
      const { data } = await request.patch(`/api/withdrawal/${id}/status`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('File upload response:', data);

      dispatch(withdrawalActions.updateWithdrawalStatusSuccess(data));
      toast.success("Withdrawal status updated successfully");
    } catch (error) {
      console.error('Error in updateWithdrawalStatus:', error);
      dispatch(withdrawalActions.fetchWithdrawalsFailure(error.message || "Failed to update withdrawal status"));
      toast.error(error.message || "Failed to update withdrawal status");
    }
  };
}

// Get withdrawals by status
export function getWithdrawalsByStatus(status) {
  return async (dispatch) => {
    dispatch(withdrawalActions.fetchWithdrawalsStart());
    try {
      const { data } = await request.get(`/api/withdrawal/status/${status}`);
      dispatch(withdrawalActions.fetchWithdrawalsSuccess(data));
    } catch (error) {
      dispatch(withdrawalActions.fetchWithdrawalsFailure(error.message || "Failed to fetch withdrawals by status"));
      toast.error(error.message || "Failed to fetch withdrawals by status");
    }
  };
}

// Get withdrawals by wallet ID
export function getWithdrawalsByWalletId(walletId) {
  return async (dispatch) => {
    dispatch(withdrawalActions.fetchWithdrawalsStart());
    try {
      const { data } = await request.get(`/api/withdrawal/wallet/${walletId}`);
      dispatch(withdrawalActions.fetchWithdrawalsSuccess(data));
    } catch (error) {
      dispatch(withdrawalActions.fetchWithdrawalsFailure(error.message || "Failed to fetch withdrawals by wallet"));
      toast.error(error.message || "Failed to fetch withdrawals by wallet");
    }
  };
}

// Fetch withdrawals by wallet key (client only)
export function getWithdrawalsByWalletKey(walletKey, params = {}) {
  return async (dispatch) => {
    dispatch(withdrawalActions.fetchWithdrawalsStart());
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Add token to request headers
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Build query string from params
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/withdrawal/wallet/${walletKey}${queryString ? `?${queryString}` : ''}`;

      const { data } = await request.get(url, { headers });
      dispatch(withdrawalActions.fetchWithdrawalsSuccess(data));
    } catch (error) {
      dispatch(withdrawalActions.fetchWithdrawalsFailure(error.message || "Failed to fetch withdrawals"));
      toast.error(error.message || "Failed to fetch withdrawals");
    }
  };
}

// Get withdrawals by store ID
export function getWithdrawalsByStoreId(storeId) {
  return async (dispatch) => {
    dispatch(withdrawalActions.fetchWithdrawalsStart());
    try {
      const { data } = await request.get(`/api/withdrawal/store/${storeId}`);
      dispatch(withdrawalActions.fetchWithdrawalsSuccess(data));
    } catch (error) {
      dispatch(withdrawalActions.fetchWithdrawalsFailure(error.message || "Failed to fetch withdrawals by store"));
      toast.error(error.message || "Failed to fetch withdrawals by store");
    }
  };
}

// Upload verment preuve
export function uploadVermentPreuve(id, file) {
  return async (dispatch) => {
    dispatch(withdrawalActions.uploadVermentPreuveStart());
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('verment_preuve', file);

      console.log('Uploading file to backend...', file);
      const { data } = await request.post(`/api/withdrawal/${id}/verment-preuve`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('File upload response:', data);

      dispatch(withdrawalActions.uploadVermentPreuveSuccess({ 
        id, 
        verment_preuve: data.verment_preuve 
      }));

      message.success({
        content: 'Proof of payment uploaded successfully',
        className: 'custom-message-success',
        style: {
          marginTop: '20vh',
        },
      });

      return data;
    } catch (error) {
      console.error('Error in uploadVermentPreuve:', error);
      const errorMessage = error.response?.data?.error || error.message;
      dispatch(withdrawalActions.uploadVermentPreuveFailure(errorMessage));
      
      message.error({
        content: 'Failed to upload proof of payment',
        className: 'custom-message-error',
        style: {
          marginTop: '20vh',
        },
      });
      
      throw error;
    }
  };
}