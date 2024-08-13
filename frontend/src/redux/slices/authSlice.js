import { createSlice } from "@reduxjs/toolkit"


const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
        stores : [] ,
        selectedStore: localStorage.getItem("selectedStore") ? JSON.parse(localStorage.getItem("selectedStore")) : null,
    },
    reducers: {
        login(state, action) {
            state.user = action.payload;
        },
        logout(state) {
            state.user = null;
            state.selectedStore = null;
            localStorage.removeItem("selectedStore");
        },
        setStores(state , action){
            state.stores = action.payload
        },
        selectStore(state, action) {
            state.selectedStore = action.payload;
            localStorage.setItem("selectedStore", JSON.stringify(action.payload));
        }
    }
});

const authReducer = authSlice.reducer;
const authActions = authSlice.actions

export { authActions , authReducer}