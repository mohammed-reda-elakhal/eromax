// src/redux/apiCalls/profileApiCalls.js

import { toast } from "react-toastify";
import request from "../../utils/request";
import { profileActions } from "../slices/profileSlice";
import Cookies from "js-cookie";

// Fetch Profile
export function getProfile(userId, role) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/${role}/${userId}`);
            dispatch(profileActions.fetchProfileSuccess(data));
        } catch (error) {
            console.error('Fetch profile error:', error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch profile";
            dispatch(profileActions.fetchProfileFailure(errorMessage));
            toast.error(errorMessage);
        }
    };
}

// Fetch Profile List
export function getProfileList(role) {
    return async (dispatch) => {
        dispatch(profileActions.fetchProfileStart());
        try {
            const { data } = await request.get(`/api/${role}`);
            dispatch(profileActions.setProfileList(data));
        } catch (error) {
            console.error('Fetch profile list error:', error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch profile list";
            dispatch(profileActions.fetchProfileFailure(errorMessage));
            toast.error(errorMessage);
        }
    };
}

// Fetch Store Data
export function getStoreById(id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/store/${id}`);
            dispatch(profileActions.setStore(data));
        } catch (error) {
            console.error('Fetch store error:', error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch store data";
            toast.error(errorMessage);
        }
    };
}

// Create Profile
export function createProfile(role, user) {
    return async (dispatch) => {
        try {
            const { data } = await request.post(`/api/${role}`, user);
            dispatch(getProfileList(role)); // Refresh the profile list
            toast.success(data.message);
        } catch (error) {
            console.error('Create profile error:', error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to create profile";
            toast.error(errorMessage);
        }
    };
}

// Update Profile
export function updateProfile(userId, role, user) {
    return async (dispatch) => {
        dispatch(profileActions.updateProfileStart());
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const { data } = await request.put(`/api/${role}/${userId}`, user, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            dispatch(profileActions.updateProfileSuccess(data.client)); // Adjust based on API response
            toast.success(data.message);
        } catch (error) {
            console.error("Update profile error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";
            dispatch(profileActions.updateProfileFailure(errorMessage));
            toast.error(errorMessage);
        }
    };
}

// Update Profile Image
export function updateProfileImageOld(userId, formData) {
    return async (dispatch) => {
        dispatch(profileActions.updateProfileImageStart());
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const { data } = await request.put(`/api/profile/${userId}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            dispatch(profileActions.updateProfileImageSuccess(data.image)); // Assuming API returns the updated image URL
            toast.success(data.message || "Profile image updated successfully");
        } catch (error) {
            console.error("Update profile image error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to update profile image";
            dispatch(profileActions.updateProfileImageFailure(errorMessage));
            toast.error(errorMessage);
        }
    };
}

// Delete Profile
export function deleteProfile(role, userId) {
    return async (dispatch) => {
        try {
            const { data } = await request.delete(`/api/${role}/${userId}`);
            dispatch(profileActions.deleteProfileSuccess(userId));
            toast.success(data.message);
        } catch (error) {
            console.error('Delete profile error:', error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete profile";
            toast.error(errorMessage);
        }
    };
}




export function updateProfileImage(userId, role, formData) {
    return async (dispatch) => {
        dispatch(profileActions.updateProfileImageStart());
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const { data } = await request.post(`/api/images/upload/${role}/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            dispatch(profileActions.updateProfileImageSuccess(data.image));
            toast.success(data.message || "Profile image updated successfully");
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to update profile image";
            dispatch(profileActions.updateProfileImageFailure(errorMessage));
            toast.error(errorMessage);
        }
    };
}

// Toggle Active/Inactive Client Account
export function toggleActiveClient(clientId) {
    return async (dispatch) => {
      try {
        const { data } = await request.patch(`/api/client/active/${clientId}`);
   
        dispatch(profileActions.toggleActiveClient(data.client));
        toast.success(data.message);
      } catch (error) {
        console.error('Toggle active client error:', error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to toggle client account status";
        toast.error(errorMessage);
      }
    };
   }


   // Verify Client
export function verifyClient(clientId) {
    return async (dispatch) => {
        dispatch(profileActions.verifyClientStart());
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const { data } = await request.patch(`/api/client/verify/${clientId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            dispatch(profileActions.verifyClientSuccess(data.client));
            toast.success(data.message || "Client verified successfully");
        } catch (error) {
            console.error('Verify client error:', error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to verify client";
            dispatch(profileActions.verifyClientFailure(errorMessage));
            toast.error(errorMessage);
        }
    };
}
