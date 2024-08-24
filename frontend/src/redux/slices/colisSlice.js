import { createSlice } from "@reduxjs/toolkit";

const colisSlice = createSlice({
    name: "colis",
    initialState: {
        colis:[]
        
    },
    reducers: {
        setColis(state,action){
            state.colis= action.payload
        }
    },
});

const colisReducer = colisSlice.reducer;
const colisActions = colisSlice.actions;

export { colisActions, colisReducer };
