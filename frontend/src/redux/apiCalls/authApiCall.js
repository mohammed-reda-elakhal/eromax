import { authActions, authReducer } from "../slices/authSlice";
import request from "../../utils/request";
import { toast } from "react-toastify";




// login user
export function loginUser(user , role, navigate) {
    return async (dispatch) => {
        try {

            const {data} = await request.post(`/api/auth/login/${role}` , user)
            dispatch(authActions.login(data));
            localStorage.setItem("user", JSON.stringify(data));

            if(role === "client"){
                if (data.stores.length === 1) {
                    // Automatically select the store if there's only one
                    dispatch(authActions.selectStore(data.stores[0]));
                    navigate('/dashboard/home');
                } else {
                    dispatch(authActions.setStores(data.stores));
                    localStorage.setItem("store", JSON.stringify(data.stores));
                    navigate('/dashboard/select-store');
                }
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.log(error);
        }
    };
}


// logout user
export function logoutUser() {
    return (dispatch)=>{
        dispatch(authActions.logout());
        localStorage.removeItem("user")
        localStorage.removeItem("user")
    }
}