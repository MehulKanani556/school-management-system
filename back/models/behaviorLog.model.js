const mongoose = require('mongoose');

const behaviorLogSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  type: { type: String, enum: ['Positive', 'Negative', 'Warning'], required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  actionTaken: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('BehaviorLog', behaviorLogSchema);
