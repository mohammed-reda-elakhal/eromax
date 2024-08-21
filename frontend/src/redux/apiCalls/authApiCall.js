import { authActions } from "../slices/authSlice";
import request from "../../utils/request";
import { toast } from "react-toastify";

// login user
export function loginUser(user, role, navigate) {
    return async (dispatch) => {
        try {
            console.log('Requesting login with', { user, role });

            const response = await request.post(`/api/auth/login/${role}`, user);

            console.log('API response:', response);

            if (response && response.data) {
                const { data } = response;
                dispatch(authActions.login(data.user));
                localStorage.setItem("user", JSON.stringify(data.user));

                if (data.user.role === "client") {
                    dispatch(authActions.setStore(data.store));
                    localStorage.setItem("store", JSON.stringify(data.store));
                }

                localStorage.setItem("token", data.token);
                toast.success(data.message);
                navigate("/dashboard/home");
            } else {
                throw new Error("Unexpected response format");
            }
        } catch (error) {
            console.error("Login error:", error);

            const errorMessage = error.response?.data?.message || error.message || "Login failed";
            toast.error(errorMessage);
        }
    };
}

// logout user
export function logoutUser() {
    return (dispatch) => {
        dispatch(authActions.logout());

        // Remove client-specific data from local storage
        localStorage.removeItem("user");
        localStorage.removeItem("store");
        localStorage.removeItem("token");
    };
}
