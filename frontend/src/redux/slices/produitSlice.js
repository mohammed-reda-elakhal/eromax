import { createSlice } from "@reduxjs/toolkit";

const produitSlice = createSlice({
    name: "produit",
    initialState: {
        produits:[],

        
    },
    reducers: {
        setProduits(state,action){
         
                state.colis = action.payload; // Set data if it's an array
                state.error = null;

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

const produitReducer = produitSlice.reducer;
const produitActions = produitSlice.actions;

export { produitActions, produitReducer };
