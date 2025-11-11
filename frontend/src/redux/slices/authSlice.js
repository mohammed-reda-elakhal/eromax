import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
// Safe JSON parsing function
function safeParse(item) {
    try {
        return JSON.parse(item);
    } catch (error) {
        //console.error("Error parsing JSON from localStorage:", error);
        return null;
    }
}

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: safeParse(localStorage.getItem("user")),
        store: safeParse(localStorage.getItem("store")),
        token: localStorage.getItem("token"), // No need to parse token, it's a string
    },
   
    reducers: {
        login(state, action) {
            state.user = action.payload;
        },
        setStore(state, action) {
            state.store = action.payload;
        }
        ,
        logout(state) {
            state.user = null;
            state.store = null;
            state.token = null;
        },
        setPasswordUpdated(state, action) { // New action
            state.passwordUpdated = action.payload;
        },
        setOwnPasswordUpdated(state, action) { // New action
            state.passwordUpdated = action.payload;
        },
        updateUserAccess(state, action) { // Update features_access in real-time
            if (state.user) {
                state.user.features_access = action.payload.features_access;
                state.user.stock_config = action.payload.stock_config;
                // Update localStorage too
                localStorage.setItem("user", JSON.stringify(state.user));
            }
        },
    }
});

const authReducer = authSlice.reducer;
const authActions = authSlice.actions;

export { authActions, authReducer };
