const mongoose = require('mongoose');

const admissionEnquirySchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentName: { type: String, required: true },
    parentName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String },
    standardApplied: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard', required: true },
    previousSchool: { type: String },
    source: { 
      type: String, 
      enum: ['Direct', 'Referral', 'Online', 'Social Media', 'Advertisement'], 
      default: 'Direct' 
    },
    status: { 
      type: String, 
      enum: ['Enquired', 'Follow-up', 'Admitted', 'Rejected', 'Withdrawn'], 
      default: 'Enquired' 
    },
    notes: { type: String },
    followUpDate: { type: Date },
    admissionAssignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdmissionEnquiry', admissionEnquirySchema);
