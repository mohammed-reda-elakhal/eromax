import { createSlice } from "@reduxjs/toolkit";

const villeSlice = createSlice({
  name: "ville",
  initialState: {
    villes: [],       // Array for storing all villes
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
    fetchVilleByIdSuccess(state, action) { // New reducer for single ville
      state.selectedVille = action.payload;
      state.loading = false;
    },
  },
});

const villeReducer = villeSlice.reducer;
const villeActions = villeSlice.actions;

export { villeActions, villeReducer };
