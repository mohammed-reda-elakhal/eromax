import { toast } from "react-toastify";
import request from "../../utils/request";
import { profileActions } from "../slices/profileSlice";
import Cookies from "js-cookie";




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

// get list users 
export function getProfileList(role) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/${role}`);
            dispatch(profileActions.setProfileList(data));
        } catch (error) {
            console.error('Fetch error:', error); // Log the error for debugging
            toast.error(error.message || "Failed to fetch profile List");
        }
    };
}


// create user
export function createProfile(role , user){
    return async (dispatch ) =>{
        try {
            const {data} = await request.post(`/api/${role}` , user);
            getProfileList(role)
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || "Failed to create profile");
            console.log(error.message);
            
        }
    }
}


// update Profile function
export function updateProfile(userId, role, user) {
    return async (dispatch, getState) => {
        try {
            // Get the token from localStorage
            const token = Cookies.get('token');
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

// delete user
export function deleteProfile(role , userId){
    return async (dispatch ) =>{
        try {
            const {data} = await request.delete(`/api/${role}/${userId}` );
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || "Failed to create profile");
            console.log(error.message); 
        }
    }
}