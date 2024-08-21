import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        profile: null, // Corrected key to 'profile'
    },
    reducers: {
        setProfile(state, action) {
            state.profile = action.payload; // Corrected key to 'profile'
        },
    },
});

const profileReducer = profileSlice.reducer;
const profileActions = profileSlice.actions;

export { profileActions, profileReducer };
