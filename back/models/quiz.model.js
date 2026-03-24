const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' }, // If null, open to all sections of that standard? Actually section-specific is better for control.
  standardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  duration: { type: Number, default: 30 }, // in minutes
  passingScore: { type: Number, default: 40 }, // percentage
  isPublished: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
