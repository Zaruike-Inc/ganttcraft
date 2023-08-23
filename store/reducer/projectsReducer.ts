import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {IGroupOrProject} from "#types/gateway/ITransformer";

const initialState: IGroupOrProject[] = [];
const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        fetchProjects(_state, action: PayloadAction<{ projects: IGroupOrProject[] }>) {
            return [...action.payload.projects]
        }
    }
})
export const {fetchProjects} = projectsSlice.actions;

export default projectsSlice.reducer;
