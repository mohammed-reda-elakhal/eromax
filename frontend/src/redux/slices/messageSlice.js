import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name: "message",
    initialState: {
        message: '',
    },
    reducers: {
        // Set the message from the server
        setMessage(state, action) {
            state.message = action.payload;
        },
    },
});

const messageReducer = messageSlice.reducer;
const messageActions = messageSlice.actions;

export { messageActions, messageReducer };
