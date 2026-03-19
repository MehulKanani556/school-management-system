import { combineReducers } from "redux";
import authReducer from "./slice/auth.slice.js";
import schoolAdminReducer from "./slice/schoolAdmin.slice.js";
import schoolReducer from './slice/school.slice';
import userReducer from './slice/user.slice';
import teacherReducer from './slice/teacher.slice';
import studentReducer from './slice/student.slice';

const rootReducer = combineReducers({
    auth: authReducer,
    schoolAdmin: schoolAdminReducer,
    school: schoolReducer,
    user: userReducer,
    teacher: teacherReducer,
    student: studentReducer
});

export default rootReducer;