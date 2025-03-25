import { transferActions } from "../slices/transferSlice";
import { toast } from "react-toastify";
import request from "../../utils/request";

// Create new transfer
export function createTransfer(transferData) {
  return async (dispatch) => {
    dispatch(transferActions.fetchTransfersStart());
    try {
      const { data } = await request.post(`/api/transfer`, transferData);
      dispatch(transferActions.createTransferSuccess(data.transfer));
      toast.success(data.message);
    } catch (error) {
      dispatch(transferActions.fetchTransfersFailure(error.message || "Failed to create transfer"));
      toast.error(error.message || "Failed to create transfer");
    }
  };
}

// Get all transfers
export function getAllTransfers(searchParams = {}) {
  return async (dispatch) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: searchParams // Add search parameters to the request
    };

    dispatch(transferActions.fetchTransfersStart());
    try {
      const { data } = await request.get(`/api/transfer`, config);
      dispatch(transferActions.fetchTransfersSuccess(data));
    } catch (error) {
      dispatch(transferActions.fetchTransfersFailure(error.message || "Failed to fetch transfers"));
      toast.error(error.message || "Failed to fetch transfers");
    }
  };
}

// Get transfer by ID
export function getTransferById(id) {
  return async (dispatch) => {
    dispatch(transferActions.fetchTransfersStart());
    try {
      const { data } = await request.get(`/api/transfer/${id}`);
      dispatch(transferActions.fetchTransferByIdSuccess(data));
    } catch (error) {
      dispatch(transferActions.fetchTransfersFailure(error.message || "Failed to fetch transfer"));
      toast.error(error.message || "Failed to fetch transfer");
    }
  };
}

// Get transfers by wallet
export function getTransfersByWallet(walletId) {
  return async (dispatch) => {
    dispatch(transferActions.fetchTransfersStart());
    try {
      const { data } = await request.get(`/api/transfer/wallet/${walletId}`);
      dispatch(transferActions.fetchTransfersSuccess(data));
    } catch (error) {
      dispatch(transferActions.fetchTransfersFailure(error.message || "Failed to fetch wallet transfers"));
      toast.error(error.message || "Failed to fetch wallet transfers");
    }
  };
}

// Get transfers by colis
export function getTransfersByColis(colisId) {
  return async (dispatch) => {
    dispatch(transferActions.fetchTransfersStart());
    try {
      const { data } = await request.get(`/api/transfer/colis/${colisId}`);
      dispatch(transferActions.fetchTransfersSuccess(data));
    } catch (error) {
      dispatch(transferActions.fetchTransfersFailure(error.message || "Failed to fetch colis transfers"));
      toast.error(error.message || "Failed to fetch colis transfers");
    }
  };
}

// Delete transfer
export function deleteTransfer(id) {
  return async (dispatch) => {
    dispatch(transferActions.fetchTransfersStart());
    try {
      const { data } = await request.delete(`/api/transfer/${id}`);
      dispatch(transferActions.deleteTransferSuccess(id));
      toast.success(data.message);
    } catch (error) {
      dispatch(transferActions.fetchTransfersFailure(error.message || "Failed to delete transfer"));
      toast.error(error.message || "Failed to delete transfer");
    }
  };
}

// Cancel transfer
export function cancelTransfer(transferId) {
  return async (dispatch) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }

    dispatch(transferActions.fetchTransfersStart());
    try {
      const { data } = await request.put(`/api/transfer/cancel/${transferId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      dispatch(transferActions.updateTransferSuccess(data.transfer));
      toast.success(data.message);
    } catch (error) {
      dispatch(transferActions.fetchTransfersFailure(error.response?.data?.message || "Failed to cancel transfer"));
      toast.error(error.response?.data?.message || "Failed to cancel transfer");
    }
  };
}

// Validate transfer
export function validateTransfer(transferId) {
  return async (dispatch) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }

    dispatch(transferActions.fetchTransfersStart());
    try {
      const { data } = await request.put(`/api/transfer/validate/${transferId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      dispatch(transferActions.updateTransferSuccess(data.transfer));
      toast.success(data.message);
    } catch (error) {
      dispatch(transferActions.fetchTransfersFailure(error.response?.data?.message || "Failed to validate transfer"));
      toast.error(error.response?.data?.message || "Failed to validate transfer");
    }
  };
}

// Correct transfer
export function correctTransfer(transferId, correctionData) {
  return async (dispatch) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }

    dispatch(transferActions.fetchTransfersStart());
    try {
      const { data } = await request.put(`/api/transfer/correct/${transferId}`, correctionData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      dispatch(transferActions.updateTransferSuccess(data.transfer));
      toast.success(data.message);
    } catch (error) {
      dispatch(transferActions.fetchTransfersFailure(error.response?.data?.message || "Failed to correct transfer"));
      toast.error(error.response?.data?.message || "Failed to correct transfer");
    }
  };
}

// Reset transfer state
export function resetTransferState() {
  return (dispatch) => {
    dispatch(transferActions.resetTransferState());
  };
} 