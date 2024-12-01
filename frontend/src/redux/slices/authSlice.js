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
        user: safeParse(Cookies.get("user")),
        store: safeParse(localStorage.getItem("store")),
        token:safeParse(Cookies.get("token")),
    },
   
    reducers: {
        login(state, action) {
            state.user = action.payload;
        },
        setStore(state, action) {
            state.store = action.payload;
        }
    }
});

const authReducer = authSlice.reducer;
const authActions = authSlice.actions;

export { authActions, authReducer };
