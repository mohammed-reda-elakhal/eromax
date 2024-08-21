import { toast } from "react-toastify";
import request from "../../utils/request";
import { authActions } from "../slices/authSlice";

// login function
export function loginUser(user, role, navigate) {
    return async (dispatch) => {
        try {
            const { data } = await request.post(`/api/auth/login/${role}`, user);
            dispatch(authActions.login(data.user));
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", JSON.stringify(data.token));
            
            if (data.user.role === "client") {
                dispatch(authActions.setStore(data.store));
                localStorage.setItem("store", JSON.stringify(data.store));
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

// logout function
export function logoutUser(navigate) {
    localStorage.removeItem("user");
    localStorage.removeItem("store");
    localStorage.removeItem("token");
    navigate("/login");
}
