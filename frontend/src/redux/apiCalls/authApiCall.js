import { authActions } from "../slices/authSlice"
import axios from "axios";
import {toast} from 'react-toastify';
// login User 
export function loginUser(user ) {
    return async (dispatch) => {
        try {

            const {data} = await axios.post(`http://localhost:8084//api/auth/login/client` , user)
            dispatch(authActions.login(data));
            localStorage.setItem("user" , JSON.stringify(data))
            toast.success(data.message)
        

        } catch (error) {
            toast.error(error.response.data.message)
            console.log(error);
        }
    };
}