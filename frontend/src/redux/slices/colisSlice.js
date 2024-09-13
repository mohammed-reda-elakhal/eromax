import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from 'reselect';

const colisSlice = createSlice({
    name: "colis",
    initialState: {
        colis: [],
        loading: false,
        error: null,
    },
    reducers: {
        setColis(state, action) {
            if (Array.isArray(action.payload)) {
                state.colis = action.payload; // Set data if it's an array
                state.error = null;
            } else {
                console.error("Invalid payload format:", action.payload);
                state.error = "Invalid data format received from server.";
            }
            state.loading = false;
        },
        addColis(state, action) {
            if (action.payload && typeof action.payload === 'object') {
                state.colis.push(action.payload); // Add the new colis to the list
            } else {
                console.error("Invalid payload format for addColis:", action.payload);
                state.error = "Invalid data format for adding colis.";
            }
        },
        setLoading(state, action) {
            state.loading = action.payload;  // Manage loading state
        },
        setError(state, action) {
            state.error = action.payload;  // Manage error state
        },
        updateColis(state, action) {
            if (Array.isArray(action.payload)) {
                state.colis = action.payload;
            } else {
                console.error("Invalid payload format for updateColis:", action.payload);
                state.error = "Invalid data format for updating colis.";
            }
        }
    },
});

const colisReducer = colisSlice.reducer;
const colisActions = colisSlice.actions;

// Selectors
const selectColis = (state) => state.colis.colis;

const selectColisRecu = createSelector(
    [selectColis],
    (colis) => Array.isArray(colis) ? colis.filter((c) => c.statut === "Reçu") : []
);

const selectColisMiseDistrubution = createSelector(
    [selectColis],
    (colis) => Array.isArray(colis) ? colis.filter((c) => c.statut === "Mise en Distribution") : []
);

const selectColisExpedié = createSelector(
    [selectColis],
    (colis) => Array.isArray(colis) ? colis.filter((c) => c.statut === "Expediée") : []
);

const selectColisLivre = createSelector(
    [selectColis],
    (colis) => Array.isArray(colis) ? colis.filter((c) => c.statut === "Livrée") : []
);

const selectColisPourRamassage = createSelector(
    [selectColis],
    (colis) => Array.isArray(colis) ? colis.filter((c) => c.statut === "attente de ramassage") : []
);

const selectColisRamasse = createSelector(
    [selectColis],
    (colis) => Array.isArray(colis) ? colis.filter((c) => c.statut === "Ramassée") : []
);

export { colisActions, colisReducer, selectColisRecu, selectColisMiseDistrubution, selectColisExpedié, selectColisLivre, selectColisPourRamassage, selectColisRamasse };
