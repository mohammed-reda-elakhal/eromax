import { createSlice } from "@reduxjs/toolkit";
import {createSelector} from 'reselect'
const colisSlice = createSlice({
    name: "colis",
    initialState: {
        colis:[],
        loading: false,
      error: null,
        
    },
    reducers: {
        setColis(state,action){
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
            
                state.colis.push(action.payload); // Add the new colis to the list
            
          },
        setLoading(state, action) {
            state.loading = action.payload;  // Manage loading state
        },
        setError(state, action) {
            state.error = action.payload;  // Manage error state
        },
    },
});

const colisReducer = colisSlice.reducer;
const colisActions = colisSlice.actions;
// Selecteur pour obtenir les colis avec le statut "reçu"

const selectColis = (state) => state.colis.colis;

const selectColisRecu = createSelector(
  [selectColis],
  (colis) => colis.filter((colis) => colis.statut === "R")
);

export { colisActions, colisReducer,selectColisRecu };
