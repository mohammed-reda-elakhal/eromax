import { createSlice } from "@reduxjs/toolkit";

const missionSlice = createSlice({
    name: "mission",
    initialState: {
        demandeRetrait: [],
        reclamations: [],
        colis: [],
        colisExp : [],
        colisPret : [],
    },
    reducers: {
        // Set DemandeRetrait data
        setDemandeRetrait(state, action) {
            state.demandeRetrait = action.payload;
        },
        // Set Reclamation data
        setReclamation(state, action) {
            state.reclamations = action.payload;
        },
        // Set Colis data
        setColis(state, action) {
            state.colis = action.payload;
        },
        // Set Colis expidée data
        setColisExp(state, action) {
            state.colisExp = action.payload;
        },
        // Set Colis pret de livrée data
        setColisPret(state, action) {
            state.colisPret = action.payload;
        },
    },
});

const missionReducer = missionSlice.reducer;
const missionActions = missionSlice.actions;

export { missionActions, missionReducer };
