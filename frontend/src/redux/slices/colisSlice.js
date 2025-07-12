// redux/slices/colisSlice.js

import { createSlice } from "@reduxjs/toolkit";

const colisSlice = createSlice({
  name: "colis",
  initialState: {
    colis: [],
    // Holds the CRBT data fetched from /api/colis/crbt
    crbtData: [],
    // Count of the CRBT items returned from the API
    count: 0,
    // A single selected Colis CRBT detail (by id or code_suivi)
    selectedCrbt: null,
    selectedColis: null,  // Selected Colis for update
    loading: false,
    error: null,
    searchResults: [], // To store search results for old colis
    isLoadingSearch: false, // Loading state for search
    dateRange: 'last_month', // Default date range is last month
    customDateRange: {
      startDate: null,
      endDate: null
    },
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
    // Add new state for tarif_ajouter
    selectedTarifAjouter: null,
    tarifAjouterLoading: false,
    tarifAjouterError: null,
    // Add new state for colis ramassée grouped by region
    colisRamasseList: {
      total: 0,
      groupedColis: [],
      loading: false,
      error: null,
    },
    // New state for Nouveau Colis
    nouveauColisList: {
      total: 0,
      colis: [],
      loading: false,
      error: null,
    },
    // New state for Attente de Ramassage Colis
    attenteRamassageColisList: {
      total: 0,
      colis: [],
      loading: false,
      error: null,
    },
    // New state for paginated, filtered colis
    colisPaginatedList: {
      total: 0,
      page: 1,
      limit: 20,
      data: [],
      loading: false,
      error: null,
    },
  },
  reducers: {
    setColis: (state, action) => {
      state.colis = action.payload.colis;
      state.total = action.payload.total;
      state.loading = false;
      state.error = null;
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
        state.error = "Invalid data format for adding colis.";
      }
    },
    addMultipleColis(state, action) {
      if (Array.isArray(action.payload)) {
        state.colis.push(...action.payload);
        state.error = null;
      } else {
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
        const index = state.colis.findIndex((colis) => colis._id === updatedColis._id);
        if (index !== -1) {
          state.colis[index] = updatedColis; // Update the specific colis in the array
        }
        if (state.selectedColis && state.selectedColis._id === updatedColis._id) {
          state.selectedColis = updatedColis; // Update selectedColis if applicable
        }
        // Also update the selected CRBT if it matches
        if (state.selectedCrbt && state.selectedCrbt._id === updatedColis._id) {
          state.selectedCrbt = updatedColis;
        }
      } else {
        state.error = "Invalid data format for updating Colis.";
      }
    },
    // Sets the list of CRBT info and the total count
    setCrbtData: (state, action) => {
      state.crbtData = action.payload.crbtData;
      state.count = action.payload.count;
      state.loading = false;
      state.error = null;
    },
    // Sets a single selected CRBT detail
    setSelectedCrbt: (state, action) => {
      state.selectedCrbt = action.payload;
      state.loading = false;
      state.error = null;
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
    // New reducers for tarif_ajouter
    setTarifAjouterLoading: (state, action) => {
      state.tarifAjouterLoading = action.payload;
    },
    setTarifAjouterError: (state, action) => {
      state.tarifAjouterError = action.payload;
      state.tarifAjouterLoading = false;
    },
    setSelectedTarifAjouter: (state, action) => {
      state.selectedTarifAjouter = action.payload;
      state.tarifAjouterLoading = false;
      state.tarifAjouterError = null;
    },
    // Date range reducers
    setDateRange(state, action) {
      state.dateRange = action.payload;
      // Reset custom date range when selecting a predefined range
      if (action.payload !== 'custom') {
        state.customDateRange = {
          startDate: null,
          endDate: null
        };
      }
    },
    setCustomDateRange(state, action) {
      state.customDateRange = action.payload;
      // Set dateRange to 'custom' when setting custom dates
      state.dateRange = 'custom';
    },
    updateTarifAjouter: (state, action) => {
      const updatedColis = action.payload;
      // Update in colis array
      const index = state.colis.findIndex((colis) => colis._id === updatedColis._id);
      if (index !== -1) {
        state.colis[index] = {
          ...state.colis[index],
          tarif_ajouter: updatedColis.tarif_ajouter
        };
      }
      // Update in selectedColis if it matches
      if (state.selectedColis && state.selectedColis._id === updatedColis._id) {
        state.selectedColis = {
          ...state.selectedColis,
          tarif_ajouter: updatedColis.tarif_ajouter
        };
      }
      // Update selectedTarifAjouter
      state.selectedTarifAjouter = updatedColis.tarif_ajouter;
    },
    // New reducers for colis ramassée grouped by region
    setColisRamasseLoading: (state, action) => {
      state.colisRamasseList.loading = action.payload;
    },
    setColisRamasseError: (state, action) => {
      state.colisRamasseList.error = action.payload;
      state.colisRamasseList.loading = false;
    },
    setColisRamasseData: (state, action) => {
      state.colisRamasseList.total = action.payload.total;
      state.colisRamasseList.groupedColis = action.payload.groupedColis;
      state.colisRamasseList.loading = false;
      state.colisRamasseList.error = null;
    },
    // New reducers for Nouveau Colis
    setNouveauColisLoading: (state, action) => {
      state.nouveauColisList.loading = action.payload;
    },
    setNouveauColisError: (state, action) => {
      state.nouveauColisList.error = action.payload;
      state.nouveauColisList.loading = false;
    },
    setNouveauColisData: (state, action) => {
      state.nouveauColisList.total = action.payload.total;
      state.nouveauColisList.colis = action.payload.colis;
      state.nouveauColisList.loading = false;
      state.nouveauColisList.error = null;
    },
    // New reducers for Attente de Ramassage Colis
    setAttenteRamassageColisLoading: (state, action) => {
      state.attenteRamassageColisList.loading = action.payload;
    },
    setAttenteRamassageColisError: (state, action) => {
      state.attenteRamassageColisList.error = action.payload;
      state.attenteRamassageColisList.loading = false;
    },
    setAttenteRamassageColisData: (state, action) => {
      state.attenteRamassageColisList.total = action.payload.total;
      state.attenteRamassageColisList.colis = action.payload.colis;
      state.attenteRamassageColisList.loading = false;
      state.attenteRamassageColisList.error = null;
    },
    // New reducers for paginated colis
    setColisPaginatedLoading: (state, action) => {
      state.colisPaginatedList.loading = action.payload;
    },
    setColisPaginatedError: (state, action) => {
      state.colisPaginatedList.error = action.payload;
      state.colisPaginatedList.loading = false;
    },
    setColisPaginatedData: (state, action) => {
      state.colisPaginatedList.total = action.payload.total;
      state.colisPaginatedList.page = action.payload.page;
      state.colisPaginatedList.limit = action.payload.limit;
      state.colisPaginatedList.data = action.payload.data;
      state.colisPaginatedList.loading = false;
      state.colisPaginatedList.error = null;
    },
  },
});

const colisReducer = colisSlice.reducer;
const colisActions = colisSlice.actions;

export { colisActions, colisReducer };
