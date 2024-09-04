import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        profile: null, // Initial state for profile
        profileList : []
    },
    reducers: {
        setProfile(state, action) {
          state.profile = action.payload; // Update profile data
        },
        setProfileList(state , action){
            state.profileList = action.payload;
        },
        updateProfile(state , action){
            state.profile = action.payload;
        }
    },
});

const profileReducer = profileSlice.reducer;
const profileActions = profileSlice.actions;

export { profileActions, profileReducer };
