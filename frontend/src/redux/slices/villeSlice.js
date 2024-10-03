import { createSlice } from "@reduxjs/toolkit";

const villeSlice = createSlice({
  name: "ville",
  initialState: {
    villes: [],  // Ensure this is initialized as an empty array
    loading: false,
    error: null,
  },
  reducers: {
    setVille(state, action) {
      state.villes = action.payload;
    },
    fetchVillesStart(state) {
      state.loading = true;
    },
    fetchVillesSuccess(state, action) {
      state.villes = action.payload;
      state.loading = false;
    },
    fetchVillesFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

const villeReducer = villeSlice.reducer;
const villeActions = villeSlice.actions;

export { villeActions, villeReducer };
