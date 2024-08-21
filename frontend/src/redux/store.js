import {configureStore} from "@reduxjs/toolkit"
import { authReducer } from "./slices/authSlice"
import { profileReducer } from "./slices/profileSlice"

const store = configureStore({
    reducer : {
        auth: authReducer,
        Profile : profileReducer,
    }
})

export default store