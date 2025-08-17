import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: null,
  successMessage: null,
  client: null,
  livreur: null,
  admin: null,
  store: null,
  wallet: null,
  payments: [],
  stats: null,
};

const profileV2Slice = createSlice({
  name: "profileV2",
  initialState,
  reducers: {
    fetchStart(state) {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    },
    fetchFailure(state, action) {
      state.loading = false;
      state.error = action.payload || "Unknown error";
    },
    clearError(state) {
      state.error = null;
    },
    setSuccessMessage(state, action) {
      state.loading = false;
      state.successMessage = action.payload;
    },
    clearMessage(state) {
      state.successMessage = null;
    },

    // bulk set from profile payload
    setProfile(state, action) {
      const { client, livreur, admin, store, wallet, paymentMethods, stats } = action.payload || {};
      state.loading = false;
      state.client = client || null;
      state.livreur = livreur || null;
      state.admin = admin || null;
      state.store = store || null;
      state.wallet = wallet || null;
      state.payments = paymentMethods || [];
      state.stats = stats || null;
    },

    // granular setters
    setClient(state, action) {
      state.loading = false;
      state.client = action.payload || null;
    },
    setLivreur(state, action) {
      state.loading = false;
      state.livreur = action.payload || null;
    },
    setAdmin(state, action) {
      state.loading = false;
      state.admin = action.payload || null;
    },
    setStore(state, action) {
      state.loading = false;
      state.store = action.payload || null;
    },
    setWallet(state, action) {
      state.loading = false;
      state.wallet = action.payload || null;
    },
    setPayments(state, action) {
      state.loading = false;
      state.payments = Array.isArray(action.payload) ? action.payload : [];
    },
    addPayment(state, action) {
      state.loading = false;
      state.payments = [action.payload, ...state.payments];
    },
    updatePayment(state, action) {
      state.loading = false;
      state.payments = state.payments.map((p) =>
        p._id === action.payload._id ? action.payload : p
      );
    },
    removePayment(state, action) {
      state.loading = false;
      state.payments = state.payments.filter((p) => p._id !== action.payload);
    },
    setStats(state, action) {
      state.stats = action.payload || null;
    },
  },
});

export const profileV2Reducer = profileV2Slice.reducer;
export const profileV2Actions = profileV2Slice.actions;
