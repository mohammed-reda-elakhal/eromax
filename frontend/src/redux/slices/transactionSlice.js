import { createSlice } from "@reduxjs/toolkit";

const transactionSlice = createSlice({
    name: "transaction",
    initialState: {
        transactions: [],
    },
    reducers: {
        setTransaction(state, action) {
            state.transactions = action.payload;
        },
        addTransaction(state, action) {
            state.transactions.push(action.payload);
        },
        deleteTransaction(state, action) {
            // Correction ici : utiliser `state.transactions`
            state.transactions = state.transactions.filter(transaction => transaction._id !== action.payload);
        },
    },
});

const transactionReducer = transactionSlice.reducer;
const transactionActions = transactionSlice.actions;

export { transactionReducer, transactionActions };
