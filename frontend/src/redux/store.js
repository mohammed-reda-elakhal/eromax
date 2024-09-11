import {configureStore} from "@reduxjs/toolkit"
import { authReducer } from "./slices/authSlice"
import { profileReducer } from "./slices/profileSlice"
import { colisReducer } from "./slices/colisSlice"
import { livreurReducer } from "./slices/livreurSlice"

const store = configureStore({
    reducer : {
        auth: authReducer,
        profile : profileReducer,
        colis:colisReducer,
        produit:profileReducer,
        livreur:livreurReducer
    }
})

export default store