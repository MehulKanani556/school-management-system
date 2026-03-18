const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

markSchema.index({ examId: 1, studentId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('Mark', markSchema);
