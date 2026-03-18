const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        default: null,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Super_Admin', 'School_Admin', 'Teacher', 'Student', 'Parent', 'Accountant', 'Librarian', 'Transport_Manager'],
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    refreshToken: {
        type: String,
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
    },
    otp: {
        type: String,
    },
    customPermissions: {
        type: Object,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);
