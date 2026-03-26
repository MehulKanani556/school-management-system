const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  admissionNumber: { type: String },
  rollNumber: { type: String },
  schoolAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  guardianName: { type: String },
  guardianContact: { type: String },
  guardianEmail: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String },
  address: { type: String },
  photo: { type: String },
  standard: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard' },
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' },
  scholarshipPercentage: { type: Number, default: 0 },
  password: { type: String },
  transportStatus: {
    type: String,
    enum: ['None', 'Applied', 'Approved', 'Active'],
    default: 'None'
  },
  transportRouteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for uniqueness per school
studentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true });

studentSchema.virtual('role').get(function () {
  return 'Student';
});

// Auto-generate admissionNumber in format: ADM-SCHOOLNAME-2024-001
studentSchema.pre('save', async function (next) {
  if (this.admissionNumber) return next();

  try {
    const School = mongoose.model('School');
    const school = await School.findById(this.schoolId);
    
    // Normalize school name: uppercase, alpha-numeric only, first 4 chars
    const schoolNameStr = school ? school.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4) : 'SCHL';

    const year = new Date().getFullYear();
    const prefix = `ADM-${year}-${schoolNameStr}-`;

    const last = await this.constructor
      .findOne({ schoolId: this.schoolId, admissionNumber: new RegExp(`^${prefix}`) }, { admissionNumber: 1 })
      .sort({ admissionNumber: -1 })
      .lean();

    let nextNum = 1;
    if (last?.admissionNumber) {
      const parts = last.admissionNumber.split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }

    this.admissionNumber = `${prefix}${String(nextNum).padStart(3, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Student', studentSchema);
