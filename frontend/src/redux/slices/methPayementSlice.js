import { createSlice } from "@reduxjs/toolkit";

const meth_payementSlice = createSlice({
  name: 'meth_payement',
  initialState: {
    meth_payement: [], // List of payment methods
    isFetching: false,
    error: null,
  },
  reducers: {
    setMeth_payement(state, action) {
      state.meth_payement = action.payload;
    },
    addMeth_payement(state, action) {
      state.meth_payement.unshift(action.payload); // Add to the beginning for better UX
    },
    removeMeth_payement(state, action) {
      state.meth_payement = state.meth_payement.filter(
        (method) => method._id !== action.payload
      ); // Filter out the deleted method
    },
    updateMeth_payement(state, action) {
      state.meth_payement = state.meth_payement.map((method) =>
        method._id === action.payload._id ? action.payload : method
      ); // Update the specific method
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setFetching(state, action) {
      state.isFetching = action.payload;
    },
  },
});

export const meth_payementReducer = meth_payementSlice.reducer;
export const meth_payementActions = meth_payementSlice.actions;
