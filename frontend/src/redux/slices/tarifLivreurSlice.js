// tarifLivreurSlice.js
import { createSlice } from "@reduxjs/toolkit";

const tarifLivreurSlice = createSlice({
  name: "tarifLivreur",
  initialState: {
    tarifLivreurs: [],
    selectedTarifLivreur: null,
    tarifLivreursByLivreur: [],
    tarifLivreursByVille: [],
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
      state.tarifLivreurs.push(action.payload);
      state.loading = false;
    },
    updateTarifLivreurSuccess(state, action) {
      const index = state.tarifLivreurs.findIndex(
        (tarif) => tarif._id === action.payload._id
      );
      if (index !== -1) {
        state.tarifLivreurs[index] = action.payload;
      }
      state.loading = false;
    },
    deleteTarifLivreurSuccess(state, action) {
      state.tarifLivreurs = state.tarifLivreurs.filter(
        (tarif) => tarif._id !== action.payload
      );
      state.loading = false;
    },
    fetchTarifLivreurByLivreurSuccess(state, action) {
      state.tarifLivreurs = action.payload;
      state.loading = false;
    },
    fetchTarifLivreurByVilleSuccess(state, action) {
      state.tarifLivreurs = action.payload;
      state.loading = false;
    },
  },
});

const tarifLivreurReducer = tarifLivreurSlice.reducer;
const tarifLivreurActions = tarifLivreurSlice.actions;

export { tarifLivreurActions, tarifLivreurReducer };
