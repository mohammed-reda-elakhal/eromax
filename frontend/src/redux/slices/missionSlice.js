import { createSlice } from "@reduxjs/toolkit";

const missionSlice = createSlice({
    name: "mission",
    initialState: {
        demandeRetrait: [],
        reclamations: [],
        colis: [],
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
    },
});

const missionReducer = missionSlice.reducer;
const missionActions = missionSlice.actions;

export { missionActions, missionReducer };
