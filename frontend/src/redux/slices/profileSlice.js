import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        profile: null, // Initial state for profile
        profileList : [],
        store : null
    },
    reducers: {
        setProfile(state, action) {
          state.profile = action.payload; // Update profile data
        },
        setStore(state , action){
            state.store = action.payload
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
