import {createSlice} from '@reduxjs/toolkit';


const authSlice = createSlice({

    name:"auth",
    initialState:{ //initial State
        user:null,
    },

    reducers:{//actions or functions who could change the state
        login(state,action){
            state.user=action.payload;
        }
    }

});

const authReducer = authSlice.reducer;
const authActions = authSlice.actions;

export{authActions,authReducer}
