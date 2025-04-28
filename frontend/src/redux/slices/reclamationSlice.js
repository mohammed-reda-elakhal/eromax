// src/redux/slices/reclamationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const reclamationSlice = createSlice({
    name: "reclamation",
    initialState: {
        reclamations: [],
        currentReclamation: null,
        loading: false,
        error: null
    },
    reducers: {
        // Request started
        apiRequestStart(state) {
            state.loading = true;
            state.error = null;
        },
        // Request failed
        apiRequestFail(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        // Get all reclamations
        getReclamationsSuccess(state, action) {
            state.loading = false;
            state.reclamations = action.payload;
        },
        // Get single reclamation
        getReclamationSuccess(state, action) {
            state.loading = false;
            state.currentReclamation = action.payload;
        },
        // Create reclamation
        createReclamationSuccess(state, action) {
            state.loading = false;
            state.reclamations.unshift(action.payload.reclamation); // Add to beginning of array
        },
        // Update reclamation status
        updateReclamationStatusSuccess(state, action) {
            state.loading = false;
            const updatedReclamation = action.payload.reclamation;

            // Update in reclamations array
            const index = state.reclamations.findIndex(r => r._id === updatedReclamation._id);
            if (index !== -1) {
                state.reclamations[index] = updatedReclamation;
            }

            // Update current reclamation if it's the same one
            if (state.currentReclamation && state.currentReclamation._id === updatedReclamation._id) {
                state.currentReclamation = updatedReclamation;
            }
        },
        // Reopen reclamation
        reopenReclamationSuccess(state, action) {
            state.loading = false;
            const updatedReclamation = action.payload.reclamation;

            // Update in reclamations array
            const index = state.reclamations.findIndex(r => r._id === updatedReclamation._id);
            if (index !== -1) {
                state.reclamations[index] = updatedReclamation;
            }

            // Update current reclamation if it's the same one
            if (state.currentReclamation && state.currentReclamation._id === updatedReclamation._id) {
                state.currentReclamation = updatedReclamation;
            }
        },
        // Add message to reclamation
        addMessageSuccess(state, action) {
            state.loading = false;
            const updatedReclamation = action.payload.reclamation;

            // Update in reclamations array
            const index = state.reclamations.findIndex(r => r._id === updatedReclamation._id);
            if (index !== -1) {
                state.reclamations[index] = updatedReclamation;
            }

            // Update current reclamation if it's the same one
            if (state.currentReclamation && state.currentReclamation._id === updatedReclamation._id) {
                state.currentReclamation = updatedReclamation;
            }
        },
        // Delete message from reclamation
        deleteMessageSuccess(state, action) {
            state.loading = false;
            const updatedReclamation = action.payload.reclamation;

            // Update in reclamations array
            const index = state.reclamations.findIndex(r => r._id === updatedReclamation._id);
            if (index !== -1) {
                state.reclamations[index] = updatedReclamation;
            }

            // Update current reclamation if it's the same one
            if (state.currentReclamation && state.currentReclamation._id === updatedReclamation._id) {
                state.currentReclamation = updatedReclamation;
            }
        },
        // Mark message as read
        markMessageAsReadSuccess(state, action) {
            state.loading = false;
            const updatedReclamation = action.payload.reclamation;

            // Update in reclamations array
            const index = state.reclamations.findIndex(r => r._id === updatedReclamation._id);
            if (index !== -1) {
                state.reclamations[index] = updatedReclamation;
            }

            // Update current reclamation if it's the same one
            if (state.currentReclamation && state.currentReclamation._id === updatedReclamation._id) {
                state.currentReclamation = updatedReclamation;
            }
        },
        // Delete reclamation
        deleteReclamationSuccess(state, action) {
            state.loading = false;
            state.reclamations = state.reclamations.filter(r => r._id !== action.payload);
            if (state.currentReclamation && state.currentReclamation._id === action.payload) {
                state.currentReclamation = null;
            }
        },
        // Clear current reclamation
        clearCurrentReclamation(state) {
            state.currentReclamation = null;
        }
    },
});

const reclamationReducer = reclamationSlice.reducer;
const reclamationActions = reclamationSlice.actions;

export { reclamationActions, reclamationReducer };
