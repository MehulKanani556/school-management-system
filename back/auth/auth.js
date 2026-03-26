const User = require('../models/user.model');
const Student = require('../models/student.model');
const SystemSetting = require('../models/systemSetting.model');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const generateToken = async (id, role = 'User') => {
    const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    if (role !== 'Student') {
        const user = await User.findById(id);
        if (user) {
            user.refreshToken = refreshToken;
            await user.save();
        }
    }
    return { accessToken, refreshToken };
}

exports.generateNewToken = async (req, res) => {
    try {
        let token = req?.cookies?.refreshToken || req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }

        let currentUser;
        if (decoded.role === 'Student') {
            currentUser = await Student.findById(decoded.id);
        } else {
            currentUser = await User.findById(decoded.id);
        }

        if (!currentUser) {
            return res.status(404).json({ message: 'Identity not found' });
        }

        const { accessToken, refreshToken } = await generateToken(currentUser._id, decoded.role);
        return res
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 7 * 60 * 60 * 1000, sameSite: "Strict" })
            .status(200).json({ user: currentUser, accessToken, refreshToken });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.createUser = async (req, res) => {
    try {
        // GLOBAL_REGISTRATION Check
        const regSetting = await SystemSetting.findOne({ key: 'GLOBAL_REGISTRATION' });
        const canRegister = regSetting ? regSetting.value === true || regSetting.value === 'true' : true;
        
        // If reg is disabled, only allow Super Admin to create users
        if (!canRegister) {
            const authHeader = req.header("Authorization");
            let isSuper = false;
            if (authHeader) {
                try {
                    const token = authHeader.split(' ')[1];
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    if (decoded.role === 'Super_Admin') isSuper = true;
                } catch(e) {}
            }
            if (!isSuper) {
                return res.status(403).json({ success: false, message: "PUBLIC REGISTRATION CLOSED: Platform registration is currently restricted to system administrators." });
            }
        }

        const { firstName, lastName, email, password, role } = req.body;
        const photo = req.file?.location || '';
        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ firstName, lastName, email, password: hashPassword, role, photo });
        let { accessToken, refreshToken } = await generateToken(user._id, user.role);

        return res
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 7 * 60 * 60 * 1000, sameSite: "Strict" })
            .status(201).json({ user, message: 'User created successfully', accessToken, refreshToken });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.studentLogin = async (req, res) => {
    try {
        const { admissionNumber, password } = req.body;
        const normalizedID = (admissionNumber || "").trim().toUpperCase();

        // Find ALL students matching this ID (case-normalized)
        const students = await Student.find({ admissionNumber: normalizedID })
            .populate({ path: 'classSection', populate: { path: 'standardId' } })
            .populate('schoolId');

        if (!students || students.length === 0) {
            return res.status(404).json({ message: "Student record not found" });
        }

        let authenticatedStudent = null;

        // Verify password against each potential match across schools
        for (const student of students) {
            const isMatch = await bcrypt.compare(password, student.password);
            if (isMatch) {
                authenticatedStudent = student;
                break;
            }
        }

        if (!authenticatedStudent) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = await generateToken(authenticatedStudent._id, 'Student');
        const studentUser = { ...authenticatedStudent._doc, role: 'Student', _id: authenticatedStudent._id };

        return res
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 7 * 60 * 60 * 1000, sameSite: "Strict" })
            .status(200).json({ user: studentUser, message: "Student logged in successfully", token: accessToken });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const checkUser = await User.findOne({ email });
        if (!checkUser) return res.status(404).json({ message: "User not found" });

        // AUTO_LOCK_ACCOUNTS Check
        const lockSetting = await SystemSetting.findOne({ key: 'AUTO_LOCK_ACCOUNTS' });
        const lockEnabled = lockSetting ? lockSetting.value === true || lockSetting.value === 'true' : true;

        if (lockEnabled && checkUser.lockUntil && checkUser.lockUntil > Date.now()) {
            return res.status(423).json({ success: false, message: "SECURITY LOCK ACTIVE: This account is temporarily locked due to multiple failed login attempts." });
        }

        let comparePass = await bcrypt.compare(password, checkUser.password);
        if (!comparePass) {
            if (lockEnabled) {
                checkUser.failedLoginAttempts = (checkUser.failedLoginAttempts || 0) + 1;
                if (checkUser.failedLoginAttempts >= 5) {
                    checkUser.lockUntil = Date.now() + 30 * 60 * 1000; // 30 min lock
                    checkUser.failedLoginAttempts = 0;
                }
                await checkUser.save();
            }
            return res.status(401).json({ message: "Password Not Match" });
        }

        // Reset failed attempts on success
        if (lockEnabled) {
            checkUser.failedLoginAttempts = 0;
            checkUser.lockUntil = undefined;
            await checkUser.save();
        }

        const { accessToken, refreshToken } = await generateToken(checkUser._id, checkUser.role);
        return res
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 7 * 60 * 60 * 1000, sameSite: "Strict" })
            .status(200).json({ user: checkUser, message: "Login successfully", token: accessToken });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        let checkEmail = await User.findOne({ email });
        if (!checkEmail) return res.status(404).json({ status: 404, message: "Email Not Found" });

        const transport = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        let otp = Math.floor(1000 + Math.random() * 9000);
        const mailOptions = { from: process.env.EMAIL_USER, to: email, subject: "Reset Password", text: `Your code is: ${otp} ` }
        checkEmail.otp = otp;
        await checkEmail.save();

        transport.sendMail(mailOptions, (error) => {
            if (error) return res.status(500).json({ status: 500, success: false, message: error.message });
            return res.status(200).json({ status: 200, success: true, message: "Email Sent SuccessFully..." });
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body;
        let chekcEmail = await User.findOne({ email });
        if (!chekcEmail) return res.status(404).json({ status: 404, message: "Email Not Found" });
        if (chekcEmail.otp != otp) return res.status(404).json({ status: 404, message: "Invalid Otp" });

        chekcEmail.otp = undefined;
        await chekcEmail.save();
        return res.status(200).json({ status: 200, message: "Otp Verify SuccessFully...", user: chekcEmail });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
}

exports.changePassword = async (req, res) => {
    try {
        let { newPassword, email } = req.body;
        let userId = await User.findOne({ email });
        if (!userId) return res.status(404).json({ status: 404, message: "User Not Found" });

        let salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(newPassword, salt);
        await User.findByIdAndUpdate(userId._id, { password: hashPassword }, { new: true });
        return res.json({ status: 200, message: "Password Changed SuccessFully..." });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
}