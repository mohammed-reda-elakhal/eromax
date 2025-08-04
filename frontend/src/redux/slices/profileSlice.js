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
            state.loading = false;
            state.error = null;
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
            state.loading = false;
            state.error = null;
            state.profileList = action.payload;
        },

        // Delete Profile (if needed)
        deleteProfileStart(state) {
            state.loading = true;
            state.error = null;
        },
        deleteProfileSuccess(state, action) {
            state.loading = false;
            state.profileList = state.profileList.filter(profile => profile._id !== action.payload);
        },
        deleteProfileFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },

        // Toggle Active Client
        toggleActiveClientStart(state) {
            state.loading = true;
            state.error = null;
        },
        toggleActiveClient(state, action) {
            state.loading = false;
            state.profileList = state.profileList.map(profile => {
                if (profile._id === action.payload._id) {
                    return { ...profile, active: action.payload.active };
                }
                return profile;
            });

            if (state.profile && state.profile._id === action.payload._id) {
                state.profile.active = action.payload.active;
            }
        },
        toggleActiveClientFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        verifyClientStart(state) {
            state.loading = true;
            state.error = null;
        },
        verifyClientSuccess(state, action) {
            state.loading = false;
            // Update the specific client in profileList
            state.profileList = state.profileList.map(profile => 
                profile._id === action.payload._id ? action.payload : profile
            );
            // If profile is being viewed individually, update it too
            if (state.profile && state.profile._id === action.payload._id) {
                state.profile = action.payload;
            }
        },
        verifyClientFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

const profileReducer = profileSlice.reducer;
const profileActions = profileSlice.actions;

export { profileActions, profileReducer };
