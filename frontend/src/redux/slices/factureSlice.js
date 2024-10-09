import { createSlice } from "@reduxjs/toolkit";

const factureSlice = createSlice({
    name: "facture",
    initialState: {
        facture: [],
        detailFacture:[],
    },
    reducers: {
        setFacture(state, action) {
            state.facture = action.payload; // Set data if it's an array
        },
        setFactureDetail(state, action) {
            state.detailFacture = action.payload; // Set data if it's an array
        },
        addFacture(state, action) {
            state.facture.push(action.payload); // Add new notification
        },
        updateFacture(state, action) {
            const index = state.facture.findIndex(facture => facture.id === action.payload.id);
            if (index !== -1) {
                state.facture[index] = action.payload; // Update existing notification
            }
        },
        removeFacture(state, action) {
            state.facture = state.facture.filter(facture => facture.id !== action.payload); // Remove notification
        },
    },
});

const factureReducer = factureSlice.reducer;
const factureActions = factureSlice.actions;

export { factureActions, factureReducer };
