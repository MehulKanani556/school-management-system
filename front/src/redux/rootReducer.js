import { combineReducers } from "redux";
import authReducer from "./slice/auth.slice.js";
import schoolAdminReducer from "./slice/schoolAdmin.slice.js";
import schoolReducer from './slice/school.slice';
import userReducer from './slice/user.slice';

const rootReducer = combineReducers({
    auth: authReducer,
    schoolAdmin: schoolAdminReducer,
    school: schoolReducer,
    user: userReducer
});

export default rootReducer;