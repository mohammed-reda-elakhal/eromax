import { createSlice } from "@reduxjs/toolkit";

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    wallets: [],
    selectedWallet: null,
    loading: false,
    error: null,
  },
  reducers: {
    setWallet(state, action) {
      state.wallets = action.payload;
    },
    fetchWalletsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchWalletsSuccess(state, action) {
      state.wallets = action.payload;
      state.loading = false;
    },
    fetchWalletsFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchWalletByIdSuccess(state, action) {
      state.selectedWallet = action.payload;
      state.loading = false;
    },
    createWalletSuccess(state, action) {
      state.wallets.push(action.payload);
      state.loading = false;
    },
    updateWalletSuccess(state, action) {
      const updatedWallet = action.payload;
      // Update in wallets array
      const index = state.wallets.findIndex((wallet) => wallet._id === updatedWallet._id);
      if (index !== -1) {
        state.wallets[index] = updatedWallet;
      }
      // Update selectedWallet if it matches
      if (state.selectedWallet?._id === updatedWallet._id) {
        state.selectedWallet = updatedWallet;
      }
      state.loading = false;
    },
    deleteWalletSuccess(state, action) {
      state.wallets = state.wallets.filter((wallet) => wallet._id !== action.payload);
      if (state.selectedWallet && state.selectedWallet._id === action.payload) {
        state.selectedWallet = null;
      }
      state.loading = false;
    },
    resetWalletState(state) {
      state.selectedWallet = null;
    }
  },
});

const walletReducer = walletSlice.reducer;
const walletActions = walletSlice.actions;

export { walletActions, walletReducer }; 