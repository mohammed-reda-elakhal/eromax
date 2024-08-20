import request from "../../utils/request";
import { authActions } from "../slices/authSlice";


// login function
export function loginUser(user, role, navigate) {
    return async (dispatch) => {
        try {
            const { data } = await request.post(`/api/auth/login/${role}`, user);
            dispatch(authActions.login(data.user));
        } catch (error) {
            if (error.response) {
                console.error("Server responded with:", error.response.data);
            } else {
                console.error("Login error:", error);
            }
        }
    };
}
