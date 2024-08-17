import { authActions } from "../slices/authSlice";
import request from "../../utils/request";
import { toast } from "react-toastify";

// login user
export function loginUser(user, role, navigate) {
    return async (dispatch) => {
        try {
            const { data } = await request.post(`/api/auth/login/${role}`, user);
            dispatch(authActions.login(data));

            if (role === "client") {
                if (data.store) {
                    // Automatically select the store if there's only one
                    dispatch(authActions.selectStore(data.store));
                    dispatch(authActions.setStores(data.store));
                    localStorage.setItem("token", JSON.stringify(data.token));
                    localStorage.setItem("user", JSON.stringify(data.user));
                    localStorage.setItem("selectedStore", JSON.stringify(data.store));
                    localStorage.setItem("stores", JSON.stringify(data.store));  // Use correct key
                    toast.success(data.message)
                    navigate('/dashboard/home');
                } else {
                    // Navigate to select store page
                    localStorage.setItem("user", JSON.stringify(data.user));
                    localStorage.setItem("stores", JSON.stringify(data.stores));  // Use correct key
                    dispatch(authActions.setStores(data.stores));
                    toast.success(data.message)
                    navigate('/dashboard/select-store');
                }
            } else {
                // Handle other roles
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", JSON.stringify(data.token));
                toast.success(data.message)
                navigate('/dashboard/home'); // Adjust the redirect as needed
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.log(error);
        }
    };
}

// select store function with query parameters
export function selectStoreClient(userId, storeId, navigate) {
    return async (dispatch) => {
        try {
            // Send data as query parameters
            const { data } = await request.get('/api/auth/selectStore', {
                params: {
                    userId,
                    storeId
                }
            });

            dispatch(authActions.selectStore(data.store)); // Updated to match reducer
            localStorage.setItem("token", JSON.stringify(data.token));
            localStorage.setItem("selectedStore", JSON.stringify(data.store));
            navigate('/dashboard/home'); // Adjust the redirect as needed
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
        localStorage.removeItem("selectedStore");
        localStorage.removeItem("store");
        localStorage.removeItem("token");
    };
}
