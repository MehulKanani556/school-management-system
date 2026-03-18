const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    admissionNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    guardianName: { type: String },
    guardianContact: { type: String },
    parentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    address: { type: String },
    photo: { type: String },
    currentAdmissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studentSchema.index({ tenantId: 1, admissionNumber: 1 }, { unique: true });
studentSchema.index({ firstName: 'text', lastName: 'text', admissionNumber: 'text' });

module.exports = mongoose.model('Student', studentSchema);
