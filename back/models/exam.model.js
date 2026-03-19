const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['unit_test', 'midterm', 'final'], required: true },
  standardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard', required: true },
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  maxMarks: { type: Number, default: 100 },
  date: { type: Date, required: true },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
