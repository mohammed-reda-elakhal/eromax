import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
        store: JSON.parse(localStorage.getItem("store")) || null,  // Ensure store is initialized correctly
        token: localStorage.getItem("token") || null,
    },
    reducers: {
        login(state, action) {
            state.user = action.payload;
            state.store = action.payload.store || null;
        },
        logout(state) {
            state.user = null;
            //state.store = null;  // Clear store on logout
            state.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('store');
            localStorage.removeItem('token');
        },
        setStore(state, action) {  // Ensure this action is used for setting store
            state.store = action.payload;
        },
    }
});

const authReducer = authSlice.reducer;
const authActions = authSlice.actions;

export { authActions, authReducer };
