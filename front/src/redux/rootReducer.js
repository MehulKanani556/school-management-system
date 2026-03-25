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
import superAdminReducer from './slice/superAdmin.slice';
import accountantReducer from './slice/accountant.slice';
import librarianReducer from './slice/librarian.slice';
import transportReducer from './slice/transport.slice';
import verificationReducer from "./slice/verification.slice";
import uiReducer from './slice/ui.slice';


const rootReducer = combineReducers({
    auth: authReducer,
    schoolAdmin: schoolAdminReducer,
    school: schoolReducer,
    user: userReducer,
    teacher: teacherReducer,
    student: studentReducer,
    notifications: notificationReducer,
    communication: communicationReducer,
    parent: parentReducer,
    superAdmin: superAdminReducer,
    accountant: accountantReducer,
    librarian: librarianReducer,
    transport: transportReducer,
    verification: verificationReducer,
    ui: uiReducer,
});

export default rootReducer;