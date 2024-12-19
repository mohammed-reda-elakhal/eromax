import { createSlice } from "@reduxjs/toolkit";


const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        notification: [],
        notification_user : [], // User-specific notifications
    },
    reducers: {
        setNotification(state, action) {
            state.notification = action.payload;
        },
        setNotificationUser(state, action) {
            state.notification_user = action.payload;
        },
        addNotification(state, action) {
            state.notification.push(action.payload);
        },
        updateNotification(state, action) {
            const index = state.notification.findIndex(notification => notification.id === action.payload.id);
            if (index !== -1) {
                state.notification[index] = action.payload;
            }
        },
        removeNotification(state, action) {
            state.notification = state.notification.filter(notification => notification.id !== action.payload);
        },
        removeNotificationUser(state, action) {
            state.notification_user = state.notification_user.filter(notification => notification._id !== action.payload);
        },
        removeAllNotificationsUser(state) {
            state.notification_user = [];
        }
        
    },
});

const notificationReducer = notificationSlice.reducer;
const notificationActions = notificationSlice.actions;

export { notificationActions, notificationReducer };
