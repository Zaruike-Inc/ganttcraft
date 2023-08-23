import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {IGitlabUser} from "#types/gateway/IGitlabGateway";

const initialState = {} as IGitlabUser;

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        authenticateUser(state, action: PayloadAction<IGitlabUser>) {
            return {
                ...state,
                ...action.payload
            }
        }
    }
})
export const {authenticateUser} = userSlice.actions;
export default userSlice.reducer;
