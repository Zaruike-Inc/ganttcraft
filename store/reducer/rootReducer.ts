import {combineReducers} from "redux";
import userReducer from "./userReducer";
import projectsReducer from "./projectsReducer";

const reducers = {
    user: userReducer,
    projects: projectsReducer
}

const rootReducer = combineReducers(reducers);

export default rootReducer;
