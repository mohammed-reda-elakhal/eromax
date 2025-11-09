import { createSlice } from "@reduxjs/toolkit";

const colisTrashSlice = createSlice({
  name: "colisTrash",
  initialState: {
    trashedColis: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    statistics: {
      totalTrashed: 0,
      byStatus: [],
      recentTrashed: 0
    },
    loading: false,
    error: null
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    getTrashedColisSuccess: (state, action) => {
      state.trashedColis = action.payload.colis || [];
      state.total = action.payload.total || 0;
      state.page = action.payload.page || 1;
      state.limit = action.payload.limit || 20;
      state.totalPages = action.payload.totalPages || 0;
      state.loading = false;
      state.error = null;
    },
    setStatistics: (state, action) => {
      state.statistics = action.payload;
    },
    clearTrash: (state) => {
      state.trashedColis = [];
      state.total = 0;
      state.totalPages = 0;
    },
    resetTrashState: (state) => {
      state.trashedColis = [];
      state.total = 0;
      state.page = 1;
      state.limit = 20;
      state.totalPages = 0;
      state.statistics = {
        totalTrashed: 0,
        byStatus: [],
        recentTrashed: 0
      };
      state.loading = false;
      state.error = null;
    }
  }
});

export const colisTrashActions = colisTrashSlice.actions;
export default colisTrashSlice.reducer;

