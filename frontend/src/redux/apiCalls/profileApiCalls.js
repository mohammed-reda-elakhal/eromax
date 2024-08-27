import { toast } from "react-toastify";
import request from "../../utils/request";
import { profileActions } from "../slices/profileSlice";




// get data user 
export function getProfile(userId , role){
    return async (dispatch)=>{
        try {
            const { data } = await request.get(`/api/${role}/${userId}`);
            dispatch(profileActions.setProfile(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch profile");
        }
    }
}
// update user data
// updateProfile function
export function updateProfile(userId, role, user) {
    return async (dispatch, getState) => {
        try {
            // Get the token from localStorage
            const token = JSON.parse(localStorage.getItem('token'));
            if (!token) {
                throw new Error('No token found in localStorage');
            }

            // Send the request with the token in the Authorization header
            const { data } = await request.put(`/api/${role}/${userId}`, user, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // Dispatch update action and show success message
            dispatch(profileActions.updateProfile(data.client));
            toast.success(data.message);
        } catch (error) {
            console.error("Profile update error:", error);  // Log for debugging
            toast.error(error.message || "Failed to update profile");
        }
    };
}
export function getProfileAdmin(userId) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/client/${userId}`);
            dispatch(profileActions.setProfile(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch profile");
        }
    };
}