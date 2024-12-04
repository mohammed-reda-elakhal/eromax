// redux/slices/docSlices.js

import { createSlice } from '@reduxjs/toolkit';

const fileSlice = createSlice({
  name: 'file',
  initialState: {
    files: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Action to handle file upload
    uploadFiles: (state, action) => {
      state.files.push(action.payload); // Add the new file to the files array
    },
    // Action to handle fetching files
    getFiles: (state, action) => {
      state.files = action.payload; // Replace the files array with fetched documents
    },
    // Optional: Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Optional: Set error state
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

const docReducer = fileSlice.reducer;
const docActions = fileSlice.actions;

export { docActions, docReducer };
