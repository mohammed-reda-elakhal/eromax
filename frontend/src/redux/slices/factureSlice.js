import { createSlice } from "@reduxjs/toolkit";

const factureSlice = createSlice({
    name: "facture",
    initialState: {
        facture: [],
        factureGroupe: [],
        factureRamasser: [],
        factureRetour: [],
        detailFacture: [],
        promotionFacture : [],
        detailFactureRamasser: [],
        detailFactureRetour: [],
        dateRange: 'last_week', // Default date range is last week
        customDateRange: {
            startDate: null,
            endDate: null
        },
    },
    reducers: {
        setFacture(state, action) {
            state.facture = action.payload;
        },
        setDateRange(state, action) {
            state.dateRange = action.payload;
            // Reset custom date range when selecting a predefined range
            if (action.payload !== 'custom') {
                state.customDateRange = {
                    startDate: null,
                    endDate: null
                };
            }
        },
        setCustomDateRange(state, action) {
            state.customDateRange = action.payload;
            // Set dateRange to 'custom' when setting custom dates
            state.dateRange = 'custom';
        },
        setFactureGroupe(state, action) {
            state.factureGroupe = action.payload;
        },
        setFactureRamasser(state, action) {
            state.factureRamasser = action.payload;
        },
        setFactureRetour(state, action) {
            state.factureRetour = action.payload;
        },
        setFactureDetail(state, action) {
            state.detailFacture = action.payload;
        },
        setPromotion(state, action) {
            state.promotionFacture = action.payload;
        },
        setFactureDetailRamasser(state, action) {
            state.detailFactureRamasser = action.payload;
        },
        setFactureDetailRetour(state, action) {
            state.detailFactureRetour = action.payload;
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
        // Reducer to update 'etat' for a specific facture
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
