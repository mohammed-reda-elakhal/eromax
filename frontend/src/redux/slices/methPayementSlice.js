import { createSlice } from "@reduxjs/toolkit";

const meth_payementSlice = createSlice({
    name: 'meth_payement',
    initialState: {
      meth_payement: [],
      isFetching: false,
      error: false,
    },
    reducers: {
      setMeth_payement(state, action) {
        state.meth_payement = action.payload;
      },
      addMeth_payement(state, action) {
        state.meth_payement.push(action.payload);
      },
      removeMeth_payement(state, action) {
        state.meth_payement = state.meth_payement.filter(
          (method) => method._id !== action.payload
        ); // Filter out the deleted method
      },
      setError(state, action) {
        state.error = action.payload;
      },
    },
  });
  
  export const meth_payementReducer = meth_payementSlice.reducer;
  export const meth_payementActions = meth_payementSlice.actions;
  