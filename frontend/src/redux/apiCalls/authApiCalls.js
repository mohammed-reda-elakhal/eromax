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
            
            // Set data in LocalStorage instead of cookies
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);
            
            if (data.user.role === "client") {
                dispatch(authActions.setStore(data.store));
                localStorage.setItem("store", JSON.stringify(data.store));
            }

            // toast.success(data.message);
            navigate("/dashboard/list-colis");
            
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
export function registerUser(role, user) {
    return async (dispatch) => {
        try {
            console.log(`user : ${user}`);
            
            const { data } = await request.post(`/api/auth/register/${role}`, user);
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || "Failed to create User");
            console.log(error.message);
        }
    };
}
export const logoutUser = (navigate) => {
    return (dispatch) => {
        // Remove cookies first
        dispatch(authActions.logout());

        localStorage.removeItem('user');
        localStorage.removeItem('store');
        localStorage.removeItem('token');
    };
};
export function resetUserPassword(userId, newPassword, role) {
    return async (dispatch) => {
        try {
            const { data } = await request.put(`/api/auth/${role}/reset-password`, { userId, newPassword });
            
            // Optionally, you can update some state or inform the user about the success
            toast.success(data.message);  // Show success message
            //dispatch(authActions.setPasswordUpdated(true));--------test

        } catch (error) {
            if (error.response && error.response.data) {
                console.error("Server responded with:", error.response.data);
                toast.error(error.response.data.message || "Password reset failed");
            } else {
                console.error("Password reset error:", error);
                toast.error("An error occurred while resetting the password");
            }
        }
    };
}
export function resetOwnPassword(newPassword) {
    return async (dispatch) => {
        try {
            const { data } = await request.put(`/api/auth/reset-password`, { newPassword });
            
            // Optionally update state if necessary
            toast.success(data.message); // Show success message
        } catch (error) {
            if (error.response && error.response.data) {
                console.error("Server responded with:", error.response.data);
                toast.error(error.response.data.message || "Failed to reset password");
                //dispatch(authActions.setOwnPasswordUpdated(true));---test

            } else {
                console.error("Password reset error:", error);
                toast.error("An error occurred while resetting your password");
            }
        }
    };
}

