const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
        enum: ['Super_Admin', 'School_Admin', 'Teacher', 'Student', 'Parent', 'Accountant', 'Librarian', 'Transport_Manager', 'Driver'],
        required: true,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: function() { return this.role !== 'Super_Admin'; } // Super Admin doesn't belong to a specific school
    },
    phoneNumber: {
        type: String,
    },
    employeeId: {
        type: String,
        sparse: true,
        set: v => v === '' ? undefined : v
    },
    baseSalary: {
        type: Number,
        default: 0,
    },
    otp: {
        type: String,
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

userSchema.index({ schoolId: 1, employeeId: 1 }, { 
    unique: true, 
    partialFilterExpression: { employeeId: { $type: "string" } } 
});

userSchema.virtual('driverInfo', {
    ref: 'Driver',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);
