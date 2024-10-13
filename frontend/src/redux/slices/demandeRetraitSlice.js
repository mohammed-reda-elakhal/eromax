import { createSlice } from "@reduxjs/toolkit";

const demandeRetraitSlice = createSlice({
    name: "demandeRetrait",
    initialState: {
        demandeRetraits: [],
    },
    reducers: {
        setdemandeRetrait(state, action) {
            state.demandeRetraits = action.payload;
        },
        adddemandeRetrait(state, action) {
            state.demandeRetraits.push(action.payload);
        },
        deletedemandeRetrait(state, action) {
            // Correction ici : utiliser `state.demandeRetraits`
            state.demandeRetraits = state.demandeRetraits.filter(demandeRetrait => demandeRetrait._id !== action.payload);
        },
    },
});

const demandeRetraitReducer = demandeRetraitSlice.reducer;
const demandeRetraitActions = demandeRetraitSlice.actions;

export { demandeRetraitReducer, demandeRetraitActions };
