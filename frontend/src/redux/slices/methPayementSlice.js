import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    meth_payement: [],
    isFetching: false,
    error: null,
    selectedMethod: null
};

const meth_payementSlice = createSlice({
    name: 'meth_payement',
    initialState,
    reducers: {
        setMeth_payement(state, action) {
            state.meth_payement = action.payload;
            state.error = null;
        },
        addMeth_payement(state, action) {
            state.meth_payement.unshift(action.payload);
            state.error = null;
        },
        removeMeth_payement(state, action) {
            state.meth_payement = state.meth_payement.filter(
                (method) => method._id !== action.payload
            );
            state.error = null;
        },
        updateMeth_payement(state, action) {
            state.meth_payement = state.meth_payement.map((method) =>
                method._id === action.payload._id ? action.payload : method
            );
            state.error = null;
        },
        setSelectedMethod(state, action) {
            state.selectedMethod = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
        setFetching(state, action) {
            state.isFetching = action.payload;
        },
        clearError(state) {
            state.error = null;
        }
    },
});

export const {
    setMeth_payement,
    addMeth_payement,
    removeMeth_payement,
    updateMeth_payement,
    setSelectedMethod,
    setError,
    setFetching,
    clearError
} = meth_payementSlice.actions;

export const meth_payementReducer = meth_payementSlice.reducer;
