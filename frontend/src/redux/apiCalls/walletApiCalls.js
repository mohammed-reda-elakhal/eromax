import { walletActions } from "../slices/walletSlice";
import { toast } from "react-toastify";
import request from "../../utils/request";
import { message } from "antd";

// Get all wallets
export function getAllWallets() {
  return async (dispatch) => {
    dispatch(walletActions.fetchWalletsStart());
    try {
      const { data } = await request.get(`/api/wallet`);
      dispatch(walletActions.fetchWalletsSuccess(data));
    } catch (error) {
      dispatch(walletActions.fetchWalletsFailure(error.message || "Failed to fetch wallets"));
      toast.error(error.message || "Failed to fetch wallets");
    }
  };
}

// Get wallet by ID or key
export function getWalletByIdentifier(identifier) {
  return async (dispatch) => {
    dispatch(walletActions.fetchWalletsStart());
    try {
      const { data } = await request.get(`/api/wallet/${identifier}`);
      dispatch(walletActions.fetchWalletByIdSuccess(data));
    } catch (error) {
      dispatch(walletActions.fetchWalletsFailure(error.message || "Failed to fetch wallet"));
      toast.error(error.message || "Failed to fetch wallet");
    }
  };
}

// Get wallet by store ID
export function getWalletByStore(storeId) {
  return async (dispatch) => {
    dispatch(walletActions.fetchWalletsStart());
    try {
      // Ensure storeId is valid and convert to string if needed
      if (!storeId) {
        throw new Error("Invalid store ID");
      }
      const id = typeof storeId === 'object' ? storeId._id : String(storeId);
      
      const { data } = await request.get(`/api/wallet/store/${id}`);
      dispatch(walletActions.fetchWalletByIdSuccess(data));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch store wallet";
      dispatch(walletActions.fetchWalletsFailure(errorMessage));
      message.error(errorMessage);
    }
  };
}

// Create wallets for stores
export function createWalletsForStores() {
  return async (dispatch) => {
    dispatch(walletActions.fetchWalletsStart());
    try {
      const { data } = await request.post(`/api/wallet/create`);
      dispatch(walletActions.createWalletSuccess(data));
      toast.success("Wallets created successfully!");
    } catch (error) {
      dispatch(walletActions.fetchWalletsFailure(error.message || "Failed to create wallets"));
      toast.error(error.message || "Failed to create wallets");
    }
  };
}

// Toggle wallet activation
export function toggleWalletActivation(walletId) {
  return async (dispatch) => {
    dispatch(walletActions.fetchWalletsStart());
    try {
      const { data } = await request.patch(`/api/wallet/active/${walletId}`);
      dispatch(walletActions.updateWalletSuccess(data.wallet || data));
      message.success(data.message || "Wallet status updated successfully");
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to toggle wallet activation";
      dispatch(walletActions.fetchWalletsFailure(errorMessage));
      message.error(errorMessage);
      return false;
    }
  };
}

// Deposit money to wallet
export function depositMoney(identifier, amount) {
  return async (dispatch) => {
    dispatch(walletActions.fetchWalletsStart());
    try {
      const { data } = await request.post(`/api/wallet/deposit/${identifier}`, { amount });
      dispatch(walletActions.updateWalletSuccess(data.wallet));
      toast.success("Deposit successful!");
    } catch (error) {
      dispatch(walletActions.fetchWalletsFailure(error.message || "Failed to deposit money"));
      toast.error(error.message || "Failed to deposit money");
    }
  };
}

// Withdraw money from wallet
export function withdrawMoney(identifier, amount) {
  return async (dispatch) => {
    dispatch(walletActions.fetchWalletsStart());
    try {
      const { data } = await request.post(`/api/wallet/withdraw/${identifier}`, { amount });
      dispatch(walletActions.updateWalletSuccess(data.wallet));
      toast.success("Withdrawal successful!");
    } catch (error) {
      dispatch(walletActions.fetchWalletsFailure(error.message || "Failed to withdraw money"));
      toast.error(error.message || "Failed to withdraw money");
    }
  };
}

// Reset wallet
export function resetWallet(identifier) {
  return async (dispatch) => {
    dispatch(walletActions.fetchWalletsStart());
    try {
      const { data } = await request.post(`/api/wallet/reset/${identifier}`);
      dispatch(walletActions.updateWalletSuccess(data.wallet));
      toast.success("Wallet reset successfully!");
    } catch (error) {
      dispatch(walletActions.fetchWalletsFailure(error.message || "Failed to reset wallet"));
      toast.error(error.message || "Failed to reset wallet");
    }
  };
}

// Reset selected wallet state
export function resetWalletState() {
  return (dispatch) => {
    dispatch(walletActions.resetWalletState());
  };
} 