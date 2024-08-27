import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        profile: null, // Initial state for profile
    },
    reducers: {
        setProfile(state, action) {
            state.profile = action.payload; // Update profile data
        },
        updateProfile(state , action){
            state.profile = action.payload;
        }
    },
});

const profileReducer = profileSlice.reducer;
const profileActions = profileSlice.actions;

export { profileActions, profileReducer };
