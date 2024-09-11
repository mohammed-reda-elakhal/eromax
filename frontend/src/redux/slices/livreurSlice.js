import { createSlice } from "@reduxjs/toolkit";

const livreurSlice = createSlice({
    name: "livreur",
    initialState: {
        livreur: null, // Initial state for profile
        livreurList : []
    },
    reducers: {
        setLivreur(state, action) {
          state.livreur = action.payload; // Update profile data
        },
        setLivreurList(state , action){
            state.livreurList = action.payload;
        },
        updateLivreur(state , action){
            state.livreur = action.payload;
        }
    },
});

const livreurReducer = livreurSlice.reducer;
const livreurActions = livreurSlice.actions;

export { livreurActions, livreurReducer };
