const mongoose = require('mongoose');

const examSubjectSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    maxMarks: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const examSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['unit_test', 'midterm', 'final'], required: true },
    classSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' }],
    subjects: [examSubjectSchema],
    date: { type: Date, required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);
