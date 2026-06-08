const User = require("../models/user.model")
const jwt = require('jsonwebtoken')
const Student = require('../models/student.model');

exports.auth = async (req, res, next) => {
    try {
        let authHeader = req.header("Authorization");
        let token;
        
        if (authHeader) {
            token = authHeader.split(' ')[1];
        } else if (req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({ status: 401, message: "Token Is Required" })
        }

        jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Token invalid"
                });
            }

            let currentUser;
            if (decoded.role === 'Student') {
                currentUser = await Student.findOne({ _id: decoded.id }).populate('schoolId');
            } else {
                currentUser = await User.findOne({ _id: decoded.id });
            }

            if (!currentUser) {
                return res.status(404).json({
                    success: false,
                    message: "Identity not found..!!"
                });
            }

            // For students, ensure we have a role field for roleCheck middleware
            if (decoded.role === 'Student' && !currentUser.role) {
                currentUser = { ...currentUser._doc, role: 'Student' };
            }

            // Normalize schoolId for students — flatten the populated School object to just the ObjectId
            // This prevents bugs in controllers that do `schoolId: req.user.schoolId` expecting an ObjectId
            if (decoded.role === 'Student' && currentUser.schoolId && typeof currentUser.schoolId === 'object' && currentUser.schoolId._id) {
                const schoolDoc = currentUser.schoolId;
                if (currentUser._doc) {
                    currentUser = { ...currentUser._doc, role: 'Student', schoolId: schoolDoc._id, _schoolDoc: schoolDoc };
                } else {
                    currentUser = { ...currentUser, schoolId: schoolDoc._id, _schoolDoc: schoolDoc };
                }
            }

            req.user = currentUser;
            next();
        });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Super_Admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied. Super Admin only." });
    }
};

exports.isSchoolAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'School_Admin' || req.user.role === 'Super_Admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied. School Admin or Super Admin only." });
    }
};