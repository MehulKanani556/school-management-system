const mongoose = require('mongoose');

const subjectAssignmentSchema = new mongoose.Schema(
  {
    classSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employeeId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    qualifications: [{ type: String }],
    joiningDate: { type: Date },
    isActive: { type: Boolean, default: true },
    subjectAssignments: [subjectAssignmentSchema],
  },
  { timestamps: true }
);

teacherSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('Teacher', teacherSchema);
