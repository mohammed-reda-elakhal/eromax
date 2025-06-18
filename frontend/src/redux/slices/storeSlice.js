// storeSlice.js

import { createSlice } from "@reduxjs/toolkit";

const storeSlice = createSlice({
  name: "store",
  initialState: {
    stores: [],           // List of stores (for getStoreList)
    storeDetails: null,   // Single store with wallet, payments, colisStats (for getStoreById)
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
      // Check if the payload is an array (getStoreList) or object (getStoreById)
      if (Array.isArray(action.payload)) {
        state.stores = action.payload;
        state.storeDetails = null;
      } else {
        // For getStoreById, store the entire response object
        state.storeDetails = action.payload;
        state.stores = [action.payload.store]; // Keep stores array for compatibility
      }
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
      // Also update storeDetails if it exists
      if (state.storeDetails && state.storeDetails.store._id === updatedStore._id) {
        state.storeDetails.store = updatedStore;
      }
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
      // Also clear storeDetails if it's the deleted store
      if (state.storeDetails && state.storeDetails.store._id === storeId) {
        state.storeDetails = null;
      }
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
      // Also update storeDetails if it exists
      if (state.storeDetails && state.storeDetails.store._id === storeId) {
        state.storeDetails.store.auto_DR = auto_DR;
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
