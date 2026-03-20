import { combineReducers } from "redux";
import authReducer from "./slice/auth.slice.js";
import schoolAdminReducer from "./slice/schoolAdmin.slice.js";
import schoolReducer from './slice/school.slice';
import userReducer from './slice/user.slice';
import teacherReducer from './slice/teacher.slice';
import studentReducer from './slice/student.slice';
import notificationReducer from './slice/notification.slice';

import communicationReducer from './slice/communication.slice';
import parentReducer from './slice/parent.slice';

const rootReducer = combineReducers({
    auth: authReducer,
    schoolAdmin: schoolAdminReducer,
    school: schoolReducer,
    user: userReducer,
    teacher: teacherReducer,
    student: studentReducer,
    notifications: notificationReducer,
    communication: communicationReducer,
    parent: parentReducer
});

export default rootReducer;