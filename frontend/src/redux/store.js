import {configureStore} from "@reduxjs/toolkit"
import { authReducer } from "./slices/authSlice"
import { profileReducer } from "./slices/profileSlice"
import { colisReducer } from "./slices/colisSlice"

const store = configureStore({
    reducer : {
        auth: authReducer,
        profile : profileReducer,
        colis:colisReducer
    }
})

export default store