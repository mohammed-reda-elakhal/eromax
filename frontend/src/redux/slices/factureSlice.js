import { createSlice } from "@reduxjs/toolkit";

const factureSlice = createSlice({
    name: "facture",
    initialState: {
        facture: [],
        detailFacture: [],
    },
    reducers: {
        setFacture(state, action) {
            state.facture = action.payload;
        },
        setFactureDetail(state, action) {
            state.detailFacture = action.payload;
        },
        addFacture(state, action) {
            state.facture.push(action.payload);
        },
        updateFacture(state, action) {
            const index = state.facture.findIndex(facture => facture.id === action.payload.id);
            if (index !== -1) {
                state.facture[index] = action.payload;
            }
        },
        removeFacture(state, action) {
            state.facture = state.facture.filter(facture => facture.id !== action.payload);
        },
        // New reducer to update 'etat' for a specific facture
        setFactureEtat(state, action) {
            const index = state.facture.findIndex(facture => facture.id === action.payload.id);
            if (index !== -1) {
                state.facture[index].etat = action.payload.etat;
            }
        },
    },
});

const factureReducer = factureSlice.reducer;
const factureActions = factureSlice.actions;

export { factureActions, factureReducer };
