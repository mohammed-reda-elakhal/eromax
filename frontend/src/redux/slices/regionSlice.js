import { createSlice } from '@reduxjs/toolkit';

const regionSlice = createSlice({
  name: 'region',
  initialState: {
    regions: [],
    selectedRegion: null,
    loading: false,
    error: null,
  },
  reducers: {
    fetchRegionsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchRegionsSuccess(state, action) {
      state.regions = action.payload;
      state.loading = false;
    },
    fetchRegionsFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchRegionByIdSuccess(state, action) {
      state.selectedRegion = action.payload;
      state.loading = false;
    },
    addRegionSuccess(state, action) {
      state.regions.push(action.payload);
      state.loading = false;
    },
    updateRegionSuccess(state, action) {
      const index = state.regions.findIndex((region) => region._id === action.payload._id);
      if (index !== -1) {
        state.regions[index] = action.payload;
      }
      state.loading = false;
    },
    deleteRegionSuccess(state, action) {
      state.regions = state.regions.filter((region) => region._id !== action.payload);
      state.loading = false;
    },
  },
});

const regionReducer = regionSlice.reducer;
const regionActions = regionSlice.actions;

export { regionActions, regionReducer }; 