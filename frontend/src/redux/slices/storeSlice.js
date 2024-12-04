// storeSlice.js

import { createSlice } from "@reduxjs/toolkit";

const storeSlice = createSlice({
  name: "store",
  initialState: {
    stores: [],           // List of stores
    selectedStore: null,  // Currently selected store for viewing/editing
    loading: false,       // Loading state
    error: null,          // Error messages
  },
  reducers: {
    // Fetch Stores
    fetchStoresStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchStoresSuccess(state, action) {
      state.stores = action.payload;
      state.loading = false;
    },
    fetchStoresFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },

    // Update Store
    updateStoreStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateStoreSuccess(state, action) {
      const updatedStore = action.payload;
      state.stores = state.stores.map(store =>
        store._id === updatedStore._id ? updatedStore : store
      );
      state.loading = false;
    },
    updateStoreFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },

    // Delete Store
    deleteStoreStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteStoreSuccess(state, action) {
      const storeId = action.payload;
      state.stores = state.stores.filter(store => store._id !== storeId);
      state.loading = false;
    },
    deleteStoreFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },

    toggleAutoDRStart(state) {
      state.loading = true;
      state.error = null;
    },
    toggleAutoDRSuccess(state, action) {
      const { auto_DR, storeId } = action.payload;
      const storeIndex = state.stores.findIndex(store => store._id === storeId);
      if (storeIndex !== -1) {
        state.stores[storeIndex].auto_DR = auto_DR;
      }
      state.loading = false;
    },
    toggleAutoDRFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

const storeReducer = storeSlice.reducer;
const storeActions = storeSlice.actions;

export { storeActions, storeReducer };
