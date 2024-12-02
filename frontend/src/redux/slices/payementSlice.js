// src/redux/slices/payementSlice.js

import { createSlice } from "@reduxjs/toolkit";

const payementSlice = createSlice({
  name: "payement",
  initialState: {
    payements: [], // List of all payments
    isFetching: false, // Loading state for async operations
    error: null, // Error message for operations
    selectedPayement: null, // The specific payment (for fetching by ID)
  },
  reducers: {
    setPayements(state, action) {
      // **Ensure payements is always an array**
      state.payements = Array.isArray(action.payload) ? action.payload : [];
    },
    addPayement(state, action) {
      state.payements.push(action.payload); // Add a new payment
    },
    updatePayement(state, action) {
      const index = state.payements.findIndex(payement => payement._id === action.payload._id);
      if (index !== -1) {
        state.payements[index] = action.payload; // Update the payment
      }
    },
    removePayement(state, action) {
      state.payements = state.payements.filter(payement => payement._id !== action.payload); // Remove payment
    },
    setSelectedPayement(state, action) {
      state.selectedPayement = action.payload; // Set the selected payment for detailed view
    },
    setFetching(state, action) {
      state.isFetching = action.payload; // Set loading state
    },
    setError(state, action) {
      state.error = action.payload; // Set error message
    },
  },
});

export const {
  setPayements,
  addPayement,
  updatePayement,
  removePayement,
  setSelectedPayement,
  setFetching,
  setError,
} = payementSlice.actions;
export const payementReducer = payementSlice.reducer;
