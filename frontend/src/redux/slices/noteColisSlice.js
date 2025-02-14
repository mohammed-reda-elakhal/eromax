import { createSlice } from "@reduxjs/toolkit";

const noteColisSlice = createSlice({
  name: "noteColis",
  initialState: {
    noteColis: [],         // List of all NoteColis documents
    selectedNoteColis: null, // A single NoteColis (e.g., for a specific colis)
    loading: false,
    error: null,
  },
  reducers: {
    fetchNoteColisStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchNoteColisSuccess(state, action) {
      state.noteColis = action.payload;
      state.loading = false;
    },
    fetchNoteColisFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchNoteColisByIdSuccess(state, action) {
      state.selectedNoteColis = action.payload;
      state.loading = false;
    },
    createNoteColisSuccess(state, action) {
      state.noteColis.push(action.payload);
      state.loading = false;
    },
    updateNoteColisSuccess(state, action) {
      const updated = action.payload;
      const index = state.noteColis.findIndex(n => n._id === updated._id);
      if (index !== -1) {
        state.noteColis[index] = updated;
      }
      // Also update the selectedNoteColis if applicable
      state.selectedNoteColis = updated;
      state.loading = false;
    },
    // NEW: Reducer to clear the selected note colis
    clearSelectedNoteColis(state) {
      state.selectedNoteColis = null;
    },
  },
});

export const noteColisActions = noteColisSlice.actions;
export const noteColisReducer = noteColisSlice.reducer;
export default noteColisSlice.reducer;
