const mongoose = require('mongoose');

const studentEnrollmentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    standardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard', required: true },
    classSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: false },
    rollNumber: { type: String },
    status: { type: String, enum: ['Active', 'Withdrawn', 'Graduated', 'Transferred'], default: 'Active' },
    isPromoted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure a student can only have one enrollment record per academic year
studentEnrollmentSchema.index({ studentId: 1, academicYearId: 1 }, { unique: true });

module.exports = mongoose.model('StudentEnrollment', studentEnrollmentSchema);
