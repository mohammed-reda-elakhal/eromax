import { createSlice } from "@reduxjs/toolkit";

const withdrawalSlice = createSlice({
  name: "withdrawal",
  initialState: {
    withdrawals: [],         // Array for storing all withdrawals
    selectedWithdrawal: null, // Object for storing a single withdrawal by ID
    loading: false,
    error: null,
    pagination: {            // Add pagination metadata
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  },
  reducers: {
    fetchWithdrawalsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchWithdrawalsSuccess(state, action) {
      // Handle both old format (array) and new format (object with withdrawals and pagination)
      if (Array.isArray(action.payload)) {
        state.withdrawals = action.payload;
        state.pagination = {
          total: action.payload.length,
          page: 1,
          limit: action.payload.length,
          totalPages: 1
        };
      } else {
        state.withdrawals = action.payload.withdrawals || [];
        state.pagination = action.payload.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        };
      }
      state.loading = false;
    },
    fetchWithdrawalsFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchWithdrawalByIdSuccess(state, action) {
      state.selectedWithdrawal = action.payload;
      state.loading = false;
    },
    createWithdrawalSuccess(state, action) {
      state.withdrawals.push(action.payload);
      state.loading = false;
    },
    updateWithdrawalStatusSuccess(state, action) {
      const index = state.withdrawals.findIndex((withdrawal) => withdrawal._id === action.payload._id);
      if (index !== -1) {
        state.withdrawals[index] = action.payload;
      }
      if (state.selectedWithdrawal?._id === action.payload._id) {
        state.selectedWithdrawal = action.payload;
      }
      state.loading = false;
    },
    resetWithdrawal(state) {
      state.selectedWithdrawal = null;
    },
    uploadVermentPreuveStart(state) {
      state.loading = true;
      state.error = null;
    },
    uploadVermentPreuveSuccess(state, action) {
      const index = state.withdrawals.findIndex((withdrawal) => withdrawal._id === action.payload.id);
      if (index !== -1) {
        state.withdrawals[index].verment_preuve = action.payload.verment_preuve;
      }
      if (state.selectedWithdrawal?._id === action.payload.id) {
        state.selectedWithdrawal.verment_preuve = action.payload.verment_preuve;
      }
      state.loading = false;
    },
    uploadVermentPreuveFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

const withdrawalReducer = withdrawalSlice.reducer;
const withdrawalActions = withdrawalSlice.actions;

export { withdrawalActions, withdrawalReducer };