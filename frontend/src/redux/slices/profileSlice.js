// src/redux/slices/profileSlice.js

import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        profile: null, // Current user's profile
        profileList: [], // List of profiles (e.g., for admin views)
        store: null, // Store data if applicable
        loading: false, // Loading state for async operations
        error: null, // Error state for async operations
    },
    reducers: {
        // Fetch Profile
        fetchProfileStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchProfileSuccess(state, action) {
            state.profile = action.payload;
        },
        fetchProfileFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },

        // Update Profile
        updateProfileStart(state) {
            state.loading = true;
            state.error = null;
        },
        updateProfileSuccess(state, action) {
        state.loading = false;
            state.profile = action.payload;
        },
        updateProfileFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },

        // Update Profile Image
        updateProfileImageStart(state) {
            state.loading = true;
            state.error = null;
        },
        updateProfileImageSuccess(state, action) {
            state.loading = false;
            if (state.profile) {
                state.profile.image = action.payload; // Assuming payload contains the updated image URL
            }
        },        
        updateProfileImageFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },

        // Set Store
        setStore(state, action) {
            state.store = action.payload;
        },

        // Set Profile List
        setProfileList(state, action) {
            state.profileList = action.payload;
        },

        // Delete Profile (if needed)
        deleteProfileSuccess(state, action) {
            state.profileList = state.profileList.filter(profile => profile._id !== action.payload);
        },
        toggleActiveClient(state, action) {
            state.profileList = state.profileList.map(profile => {
                if (profile._id === action.payload._id) {
                    return { ...profile, active: action.payload.active };
                }
                return profile;
            });
        
            if (state.profile && state.profile._id === action.payload._id) {
                state.profile.active = action.payload.active;
            }
        }
    },
});

const profileReducer = profileSlice.reducer;
const profileActions = profileSlice.actions;

export { profileActions, profileReducer };
