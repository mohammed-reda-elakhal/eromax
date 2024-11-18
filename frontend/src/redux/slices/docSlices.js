import { createSlice } from '@reduxjs/toolkit';

const fileSlice = createSlice({
    name: 'file',
    initialState: {
      files: [],
    },
    reducers: {
        // Action pour démarrer le téléchargement (en cours)
    uploadFiles: (state,action) => {
        
        state.files=action.payload


      },
    },
   
    },
  );

  const docReducer = fileSlice.reducer;
  const docActions = fileSlice.actions;
  
  export { docActions, docReducer };