const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admissionNumber: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  guardianName: { type: String },
  guardianContact: { type: String },
  address: { type: String },
  photo: { type: String },
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
