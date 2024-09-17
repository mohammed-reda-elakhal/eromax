import { toast } from "react-toastify";
import request from "../../utils/request";
import { authActions } from "../slices/authSlice";
import Cookies from "js-cookie";
// login function
export function loginUser(user, role, navigate) {
    return async (dispatch) => {
        try {
            const { data } = await request.post(`/api/auth/login/${role}`, user);
            dispatch(authActions.login(data.user));
            Cookies.set("user", JSON.stringify(data.user),{ expires: 30 });// expand expiration time 
            Cookies.set("token", data.token);

            
            if (data.user.role === "client") {
                dispatch(authActions.setStore(data.store));
                Cookies.set("store", JSON.stringify(data.store),{ expires: 30 });
            }

            toast.success(data.message);
            navigate("/dashboard/home");
            
        } catch (error) {
            if (error.response && error.response.data) {
                console.error("Server responded with:", error.response.data);
                toast.error(error.response.data.message || "Login failed");
            } else {
                console.error("Login error:", error);
                toast.error("An error occurred during login");
            }
        }
    };
}

// create user
export function registerUser(role , user){
    return async (dispatch ) =>{
        try {
            const {data} = await request.post(`/api/auth/register/${role}` , user);
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || "Failed to create USer");
            console.log(error.message);
            
        }
    }
}

// logout function
export function logoutUser(navigate) {
    Cookies.remove("user");
    Cookies.remove("store");
    Cookies.remove("token");
}
