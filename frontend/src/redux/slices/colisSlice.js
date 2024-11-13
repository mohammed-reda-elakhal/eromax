// redux/slices/colisSlice.js

import { createSlice } from "@reduxjs/toolkit";

const colisSlice = createSlice({
  name: "colis",
  initialState: {
    colis: [],
    selectedColis: null,  // Selected Colis for update
    loading: false,
    error: null,
    searchResults: [], // To store search results for old colis
    isLoadingSearch: false, // Loading state for search
    villes: {
      data: [],
      loading: false,
      error: null,
    },
    stores: {
      data: [],
      loading: false,
      error: null,
    },
    livreurs: {
      data: [],
      loading: false,
      error: null,
    },
    produits: {
      data: [],
      loading: false,
      error: null,
    },
  },
  reducers: {
    setColis(state, action) {
      if (Array.isArray(action.payload)) {
        state.colis = action.payload;
        state.error = null;
      } else {
        console.error("Invalid payload format:", action.payload);
        state.error = "Invalid data format received from server.";
      }
      state.loading = false;
    },
    setSelectedColis(state, action) {
      state.selectedColis = action.payload;
      state.loading = false;
      state.error = null;
    },
    addColis(state, action) {
      if (action.payload && typeof action.payload === 'object' && !Array.isArray(action.payload)) {
        state.colis.push(action.payload);
      } else {
        console.error("Invalid payload format for addColis:", action.payload);
        state.error = "Invalid data format for adding colis.";
      }
    },
    addMultipleColis(state, action) {
      if (Array.isArray(action.payload)) {
        state.colis.push(...action.payload);
        state.error = null;
      } else {
        console.error("Invalid payload format for addMultipleColis:", action.payload);
        state.error = "Invalid data format for adding multiple colis.";
      }
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    updateColis(state, action) {
      const updatedColis = action.payload;
      if (updatedColis && updatedColis._id) {
        const index = state.colis.findIndex(colis => colis._id === updatedColis._id);
        if (index !== -1) {
          state.colis[index] = updatedColis;
        }
        // Also update selectedColis if it's the one being updated
        if (state.selectedColis && state.selectedColis._id === updatedColis._id) {
          state.selectedColis = updatedColis;
        }
      } else {
        console.error("Invalid payload format for updateColis:", action.payload);
        state.error = "Invalid data format for updating colis.";
      }
    },
    // New reducers for search functionality
    setSearchResults(state, action) {
      if (Array.isArray(action.payload)) {
        state.searchResults = action.payload;
      } else {
        state.searchResults = [];
      }
      state.isLoadingSearch = false;
    },
    setSearchLoading(state, action) {
      state.isLoadingSearch = action.payload;
    },
    // Additional reducers for fetching options
    fetchVillesStart(state) {
      state.villes.loading = true;
      state.villes.error = null;
    },
    fetchVillesSuccess(state, action) {
      state.villes.data = action.payload;
      state.villes.loading = false;
    },
    fetchVillesFailure(state, action) {
      state.villes.error = action.payload;
      state.villes.loading = false;
    },
    fetchStoresStart(state) {
      state.stores.loading = true;
      state.stores.error = null;
    },
    fetchStoresSuccess(state, action) {
      state.stores.data = action.payload;
      state.stores.loading = false;
    },
    fetchStoresFailure(state, action) {
      state.stores.error = action.payload;
      state.stores.loading = false;
    },
    fetchLivreursStart(state) {
      state.livreurs.loading = true;
      state.livreurs.error = null;
    },
    fetchLivreursSuccess(state, action) {
      state.livreurs.data = action.payload;
      state.livreurs.loading = false;
    },
    fetchLivreursFailure(state, action) {
      state.livreurs.error = action.payload;
      state.livreurs.loading = false;
    },
    fetchProduitsStart(state) {
      state.produits.loading = true;
      state.produits.error = null;
    },
    fetchProduitsSuccess(state, action) {
      state.produits.data = action.payload;
      state.produits.loading = false;
    },
    fetchProduitsFailure(state, action) {
      state.produits.error = action.payload;
      state.produits.loading = false;
    },
  },
});

const colisReducer = colisSlice.reducer;
const colisActions = colisSlice.actions;

export { colisActions, colisReducer };
