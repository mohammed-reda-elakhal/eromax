// tarifLivreurSlice.js
import { createSlice } from "@reduxjs/toolkit";

const tarifLivreurSlice = createSlice({
  name: "tarifLivreur",
  initialState: {
    tarifLivreurs: [],        // Array to store all TarifLivreur
    selectedTarifLivreur: null, // Object for storing a single TarifLivreur
    tarifLivreursByLivreur: [],  // Array for TarifLivreur by Livreur
    tarifLivreursByVille: [],  // Array for TarifLivreur by Ville
    loading: false,
    error: null,
  },
  reducers: {
    fetchTarifLivreursStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTarifLivreursSuccess(state, action) {
      state.tarifLivreurs = action.payload;
      state.loading = false;
    },
    fetchTarifLivreursFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchTarifLivreurByIdSuccess(state, action) {
      state.selectedTarifLivreur = action.payload;
      state.loading = false;
    },
    createTarifLivreurSuccess(state, action) {
      state.tarifLivreurs.push(action.payload); // Add the new TarifLivreur to the array
      state.loading = false;
    },
    updateTarifLivreurSuccess(state, action) {
      const index = state.tarifLivreurs.findIndex(
        (tarif) => tarif._id === action.payload._id
      );
      if (index !== -1) {
        state.tarifLivreurs[index] = action.payload; // Update the TarifLivreur in the array
      }
      state.loading = false;
    },
    deleteTarifLivreurSuccess(state, action) {
      state.tarifLivreurs = state.tarifLivreurs.filter(
        (tarif) => tarif._id !== action.payload
      ); // Remove the deleted TarifLivreur from the array
      state.loading = false;
    },
    fetchTarifLivreurByLivreurSuccess(state, action) {
      state.tarifLivreursByLivreur = action.payload;
      state.loading = false;
    },
    fetchTarifLivreurByVilleSuccess(state, action) {
      state.tarifLivreursByVille = action.payload;
      state.loading = false;
    },
  },
});

const tarifLivreurReducer = tarifLivreurSlice.reducer;
const tarifLivreurActions = tarifLivreurSlice.actions;

export { tarifLivreurActions, tarifLivreurReducer };
