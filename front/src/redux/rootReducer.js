import { combineReducers } from "redux";
import authReducer from "./slice/auth.slice.js";

export const rootReducer = combineReducers({
    auth: authReducer,
});