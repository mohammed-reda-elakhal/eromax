
import { authActions } from "../slices/authSlice";
import request from "../../utils/request";
import { toast } from "react-toastify";

// login user
export function loginUser(user, role, navigate) {
    return async (dispatch) => {
        try {
            const { data } = await request.post(`/api/auth/login/${role}`, user);
            dispatch(authActions.login(data.user));
            localStorage.setItem("user", JSON.stringify(data.user));
            if(data.user.role === "client"){
                dispatch(authActions.setStore(data.store));
                localStorage.setItem("store", JSON.stringify(data.store))
            }           
            localStorage.setItem("token",data.token)
            toast.success(data.message)
            navigate("/dashboard/home")
        } catch (error) {
            toast.error(error.response.data.message);
            console.log(error);
        }
    };
}



// logout user
export function logoutUser() {
    return (dispatch) => {
        dispatch(authActions.logout());
        localStorage.removeItem("user");
        localStorage.removeItem("store");
        localStorage.removeItem("token");
    };
}
