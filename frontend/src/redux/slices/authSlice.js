import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user : localStorage.getItem("user") ?
        JSON.parse(localStorage.getItem("user")) : null ,

        store : localStorage.getItem("store") ?
        JSON.parse(localStorage.getItem("store")) : null ,
    },
    reducers: {
        login(state, action) {
            state.user = action.payload;
        },
        setStore(state, action) {
            state.store = action.payload;
        }
    }
})

const authReducer = authSlice.reducer;
const authActions = authSlice.actions;

export { authActions, authReducer };
