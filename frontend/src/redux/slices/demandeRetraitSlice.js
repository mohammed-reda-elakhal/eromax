import { createSlice } from "@reduxjs/toolkit";

const demandeRetraitSlice = createSlice({
    name: "demandeRetrait",
    initialState: {
        demandesRetraits: [],
    },
    reducers: {
        setdemandeRetrait(state, action) {
            state.demandesRetraits = action.payload;
        },
        addDemandeRetrait(state, action) {
            state.demandesRetraits.push(action.payload);
        },
        deletedemandeRetrait(state, action) {
          
            state.demandesRetraits = state.demandesRetraits.filter(demandeRetrait => demandeRetrait._id !== action.payload);
        },
        updateDemandeRetrait(state, action) {
            const updatedDemande = action.payload;
            state.demandesRetraits = state.demandesRetraits.map((demande) =>
              demande._id === updatedDemande._id ? updatedDemande : demande
            );
          },
    },
});

const demandeRetraitReducer = demandeRetraitSlice.reducer;
const demandeRetraitActions = demandeRetraitSlice.actions;

export { demandeRetraitReducer, demandeRetraitActions };
