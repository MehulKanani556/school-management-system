// get_otp.js - Get the current OTP for superadmin from DB
require('dotenv').config();
const mongoose = require('mongoose');

async function getOTP() {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected to MongoDB');

    const User = require('./models/user.model');
    
    const admin = await User.findOne({ email: 'superadmin@edumanage.in' }).select('+otp +otpExpires');
    if (!admin) {
        console.log('Super admin not found!');
        process.exit(1);
    }

    console.log('Admin:', admin.firstName, admin.lastName);
    console.log('Current OTP:', admin.otp || 'NONE');
    console.log('OTP Expires:', admin.otpExpires || 'N/A');
    console.log('Lock Until:', admin.lockUntil || 'NOT LOCKED');
    
    process.exit(0);
}

getOTP().catch(err => { console.error(err); process.exit(1); });
