const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  admissionNumber: { type: String, unique: true },
  rollNumber: { type: String },
  schoolAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  guardianName: { type: String },
  guardianContact: { type: String },
  address: { type: String },
  photo: { type: String },
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' },
  password: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate admissionNumber in format: ADM-2024-001
studentSchema.pre('save', async function (next) {
  if (this.admissionNumber) return next();

  const year = new Date().getFullYear();
  const prefix = `ADM-${year}-`;

  const last = await this.constructor
    .findOne({ schoolId: this.schoolId, admissionNumber: new RegExp(`^${prefix}`) }, { admissionNumber: 1 })
    .sort({ admissionNumber: -1 })
    .lean();

  let nextNum = 1;
  if (last?.admissionNumber) {
    const parts = last.admissionNumber.split('-');
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  this.admissionNumber = `${prefix}${String(nextNum).padStart(3, '0')}`;
  next();
});

module.exports = mongoose.model('Student', studentSchema);
