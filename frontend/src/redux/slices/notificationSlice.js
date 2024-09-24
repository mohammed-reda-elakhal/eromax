import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        notification: [],
    },
    reducers: {
        setNotification(state, action) {
            state.notification = action.payload; // Set data if it's an array
        },
        addNotification(state, action) {
            state.notification.push(action.payload); // Add new notification
        },
        updateNotification(state, action) {
            const index = state.notification.findIndex(notification => notification.id === action.payload.id);
            if (index !== -1) {
                state.notification[index] = action.payload; // Update existing notification
            }
        },
        removeNotification(state, action) {
            state.notification = state.notification.filter(notification => notification.id !== action.payload); // Remove notification
        },
    },
});

const notificationReducer = notificationSlice.reducer;
const notificationActions = notificationSlice.actions;

export { notificationActions, notificationReducer };
