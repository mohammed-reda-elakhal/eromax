import { createSlice } from "@reduxjs/toolkit";

const missionSlice = createSlice({
    name: "mission",
    initialState: {
        demandeRetrait: [],
        client: [],
        reclamations: [],
        openReclamationsCount: 0,
        colis: [],
        colisR: [],
        colisExp : [],
        colisPret : [],
        incompleteWithdrawals: 0,
        colisNouveau: [],
    },
    reducers: {
        // Set DemandeRetrait data
        setDemandeRetrait(state, action) {
            state.demandeRetrait = action.payload;
        },
        // Set new client data
        setNouveauClient(state, action) {
            state.client = action.payload;
        },
        // Set Reclamation data
        setReclamation(state, action) {
            state.reclamations = action.payload;
        },
        // Set Open Reclamations Count
        setOpenReclamationsCount(state, action) {
            state.openReclamationsCount = action.payload;
        },
        // Set Colis data
        setColis(state, action) {
            state.colis = action.payload;
        },
        // Set Colis Ramasse data
        setColisR(state, action) {
            state.colisR = action.payload;
        },
        // Set Colis expidée data
        setColisExp(state, action) {
            state.colisExp = action.payload;
        },
        // Set Colis pret de livrée data
        setColisPret(state, action) {
            state.colisPret = action.payload;
        },
        setIncompleteWithdrawals(state, action) {
            state.incompleteWithdrawals = action.payload;
        },
        // Set Colis Nouveau data
        setColisNouveau(state, action) {
            state.colisNouveau = action.payload;
        },
    },
});

const missionReducer = missionSlice.reducer;
const missionActions = missionSlice.actions;

export { missionActions, missionReducer };
