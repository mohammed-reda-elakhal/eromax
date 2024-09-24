// src/store/slices/reclamationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const reclamationSlice = createSlice({
    name: "reclamation",
    initialState: {
        reclamations: [],
    },
    reducers: {
        setReclamation(state, action) {
            state.reclamations = action.payload;
        },
        addReclamation(state, action) {
            state.reclamations.push(action.payload);
        },
        updateReclamation(state, action) {
            const index = state.reclamations.findIndex(reclamation => reclamation._id === action.payload._id);
            if (index !== -1) {
                state.reclamations[index] = action.payload;
            }
        },
        deleteReclamation(state, action) {
            state.reclamations = state.reclamations.filter(reclamation => reclamation._id !== action.payload);
        },
        updateReclamationStatus(state, action) {
            const { id, resoudre } = action.payload;
            const index = state.reclamations.findIndex(reclamation => reclamation._id === id);
            if (index !== -1) {
                state.reclamations[index].resoudre = resoudre;
            }
        },
    },
});

const reclamationReducer = reclamationSlice.reducer;
const reclamationActions = reclamationSlice.actions;

export { reclamationActions, reclamationReducer };
