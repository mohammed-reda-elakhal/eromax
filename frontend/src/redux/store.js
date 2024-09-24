import {configureStore} from "@reduxjs/toolkit"
import { authReducer } from "./slices/authSlice"
import { profileReducer } from "./slices/profileSlice"
import { colisReducer } from "./slices/colisSlice"
import { livreurReducer } from "./slices/livreurSlice"
import { notificationReducer } from "./slices/notificationSlice"
import { reclamationReducer } from "./slices/reclamationSlice"

const store = configureStore({
    reducer : {
        auth: authReducer,
        profile : profileReducer,
        colis:colisReducer,
        produit:profileReducer,
        livreur:livreurReducer,
        notification:notificationReducer,
        reclamation : reclamationReducer
    }
})

export default store