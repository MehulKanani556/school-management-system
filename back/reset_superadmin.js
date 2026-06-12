// reset_superadmin.js - Unlock superadmin account and reset password
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function resetSuperAdmin() {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected to MongoDB');

    const User = require('./models/user.model');
    
    const admin = await User.findOne({ email: 'superadmin@edumanage.in' });
    if (!admin) {
        console.log('Super admin not found!');
        process.exit(1);
    }

    console.log('Found admin:', admin.firstName, admin.lastName);
    console.log('Lock status:', admin.lockUntil, 'Failed attempts:', admin.failedLoginAttempts);

    // Unlock and reset password to Password@123
    const hashed = await bcrypt.hash('Password@123', 10);
    admin.password = hashed;
    admin.failedLoginAttempts = 0;
    admin.lockUntil = undefined;
    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    console.log('Super admin unlocked and password reset to Password@123');
    process.exit(0);
}

resetSuperAdmin().catch(err => { console.error(err); process.exit(1); });
