import { combineReducers } from "redux";
import authReducer from "./slice/auth.slice.js";
import schoolAdminReducer from "./slice/schoolAdmin.slice.js";

export const rootReducer = combineReducers({
    auth: authReducer,
    schoolAdmin: schoolAdminReducer,
});