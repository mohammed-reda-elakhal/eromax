import { createSlice } from "@reduxjs/toolkit";

const villeSlice = createSlice({
  name: "ville",
  initialState: {
    villes: [],         // Array for storing all villes
    selectedVille: null, // Object for storing a single ville by ID
    loading: false,
    error: null,
  },
  reducers: {
    setVille(state, action) {
      state.villes = action.payload;
    },
    fetchVillesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchVillesSuccess(state, action) {
      state.villes = action.payload;
      state.loading = false;
    },
    fetchVillesFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchVilleByIdSuccess(state, action) { 
      state.selectedVille = action.payload;
      state.loading = false;
    },
    addVilleSuccess(state, action) {
      state.villes.push(action.payload); // Add new ville to the list
      state.loading = false;
    },
    updateVilleSuccess(state, action) {
      const index = state.villes.findIndex((ville) => ville._id === action.payload._id);
      if (index !== -1) {
        state.villes[index] = action.payload; // Update ville in the list
      }
      state.loading = false;
    },
    deleteVilleSuccess(state, action) {
      state.villes = state.villes.filter((ville) => ville._id !== action.payload); // Remove ville by ID
      state.loading = false;
    },
  },
});

const villeReducer = villeSlice.reducer;
const villeActions = villeSlice.actions;

export { villeActions, villeReducer };
