import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
        store: JSON.parse(localStorage.getItem("store")) || [],  // Ensure stores is an array
        token: localStorage.getItem("token") || null,
       
    },
    reducers: {
        login(state, action) {
            state.user = action.payload;
        },
        logout(state) {
            state.user = null;
            state.selectedStore = null;
            localStorage.removeItem("store");
        },
        setStore(state, action) {
            state.stores = action.payload;
        },
    }
});

const authReducer = authSlice.reducer;
const authActions = authSlice.actions;

export { authActions, authReducer };
