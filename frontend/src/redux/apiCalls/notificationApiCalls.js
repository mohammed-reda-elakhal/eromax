import { toast } from "react-toastify";
import request from "../../utils/request";
import { notificationActions } from "../slices/notificationSlice";
import Cookies from "js-cookie";




// get data user 
// Get notifications with optional visibility filter
export function getNotification(visibility) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/notification`, {
                params: { visibility } // Include visibility as a query parameter
            });
            dispatch(notificationActions.setNotification(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch notifications");
        }
    };
}



// Create a new notification
export function createNotification(notificationData) {
    return async (dispatch) => {
        try {
            const { data } = await request.post(`/api/notification`, notificationData);
            dispatch(notificationActions.addNotification(data.notification));
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || "Failed to create notification");
        }
    };
}

// Update an existing notification
export function updateNotification(id, notificationData) {
    return async (dispatch) => {
        try {
            console.log(id);
            
            const { data } = await request.put(`/api/notification/${id}`, notificationData);
            dispatch(notificationActions.updateNotification(data.updatedNotification));
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || "Failed to update notification");
        }
    };
}

// Delete a notification
export function deleteNotification(id) {
    return async (dispatch) => {
        try {
            const { data } = await request.delete(`/api/notification/${id}`);
            dispatch(notificationActions.removeNotification(id));
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || "Failed to delete notification");
        }
    };
}