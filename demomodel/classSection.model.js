const mongoose = require('mongoose');

const classSectionSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    gradeLevel: { type: Number, required: true, min: 1, max: 12 },
    sectionLabel: { type: String, required: true },
    classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClassSection', classSectionSchema);
