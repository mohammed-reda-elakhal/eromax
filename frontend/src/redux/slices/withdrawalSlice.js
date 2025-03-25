import { createSlice } from "@reduxjs/toolkit";

const withdrawalSlice = createSlice({
  name: "withdrawal",
  initialState: {
    withdrawals: [],         // Array for storing all withdrawals
    selectedWithdrawal: null, // Object for storing a single withdrawal by ID
    loading: false,
    error: null,
  },
  reducers: {
    fetchWithdrawalsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchWithdrawalsSuccess(state, action) {
      state.withdrawals = action.payload.withdrawals || [];
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