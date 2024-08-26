import { createSlice } from "@reduxjs/toolkit";

const colisSlice = createSlice({
    name: "colis",
    initialState: {
        colisList:[],
        loading: false,
      error: null,
        
    },
    reducers: {
        setColis(state,action){
            state.colisList= action.payload
        },
        addColis(state, action) {
            state.colisList.push(action.payload); // Add the new colis to the list
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

export { colisActions, colisReducer };
